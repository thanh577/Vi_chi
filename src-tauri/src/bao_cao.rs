//! Vi Chi - Xử lý nghiệp vụ báo cáo

use crate::{
  database::create_connection,
  models::*,
  utils::{dinh_dang_tien, dinh_dang_tien_khong_ky_tu},
  Result, ViChiError,
};
use chrono::{Datelike, Local, NaiveDate};
use rusqlite::params;
use tauri::AppHandle;

/// Lấy dữ liệu tổng quan cho dashboard
#[tauri::command]
pub fn lay_tong_quan(app: AppHandle, thang: String) -> Result<TongQuan> {
  NaiveDate::parse_from_str(&format!("{}-01", thang), "%Y-%m-%d")
    .map_err(|_| ViChiError::Validation("Tháng không hợp lệ (định dạng YYYY-MM)".to_string()))?;

  let conn = create_connection(&app)?;

  // Tổng thu
  let tong_thu: i64 = conn.query_row(
    "SELECT COALESCE(SUM(amount), 0) FROM transactions
     WHERE type = 'income' AND strftime('%Y-%m', transaction_date) = ?",
    params![thang],
    |row| row.get(0),
  )?;

  // Tổng chi
  let tong_chi: i64 = conn.query_row(
    "SELECT COALESCE(SUM(amount), 0) FROM transactions
     WHERE type = 'expense' AND strftime('%Y-%m', transaction_date) = ?",
    params![thang],
    |row| row.get(0),
  )?;

  // Tổng ngân sách tháng
  let tong_ngan_sach: i64 = conn.query_row(
    "SELECT COALESCE(SUM(limit_amount), 0) FROM budgets WHERE month = ?",
    params![thang],
    |row| row.get(0),
  )?;

  // Đã sử dụng ngân sách (chỉ tính chi tiêu có ngân sách)
  let da_su_dung_ngan_sach: i64 = conn.query_row(
    "SELECT COALESCE(SUM(t.amount), 0)
     FROM transactions t
     JOIN budgets b ON t.category_id = b.category_id AND b.month = ?
     WHERE t.type = 'expense' AND strftime('%Y-%m', t.transaction_date) = ?",
    params![thang, thang],
    |row| row.get(0),
  )?;

  let chenh_lech = tong_thu - tong_chi;
  let ty_le_su_dung = if tong_ngan_sach > 0 {
    (da_su_dung_ngan_sach as f64 / tong_ngan_sach as f64) * 100.0
  } else {
    0.0
  };

  Ok(TongQuan {
    tong_thu,
    tong_chi,
    chenh_lech,
    tong_ngan_sach,
    da_su_dung_ngan_sach,
    ty_le_su_dung,
  })
}

/// Lấy báo cáo theo tháng
#[tauri::command]
pub fn lay_bao_cao_thang(app: AppHandle, nam: i32) -> Result<Vec<DuLieuBieuDoThuChi>> {
  let conn = create_connection(&app)?;

  let mut stmt = conn.prepare(
    "SELECT
       strftime('%Y-%m', transaction_date) as thang,
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) as tong_thu,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) as tong_chi
     FROM transactions
     WHERE strftime('%Y', transaction_date) = ?
     GROUP BY strftime('%Y-%m', transaction_date)
     ORDER BY thang",
  )?;

  let rows = stmt.query_map(params![nam.to_string()], |row| {
    Ok(DuLieuBieuDoThuChi {
      thang: row.get(0)?,
      tong_thu: row.get(1)?,
      tong_chi: row.get(2)?,
    })
  })?;

  let mut ket_qua = Vec::new();
  for row in rows {
    ket_qua.push(row?);
  }

  // Đảm bảo có đủ 12 tháng
  let mut map: std::collections::HashMap<String, DuLieuBieuDoThuChi> =
    ket_qua.into_iter().map(|d| (d.thang.clone(), d)).collect();

  let mut result = Vec::new();
  for thang in 1..=12 {
    let key = format!("{:04}-{:02}", nam, thang);
    result.push(
      map.remove(&key).unwrap_or(DuLieuBieuDoThuChi {
        thang: key,
        tong_thu: 0,
        tong_chi: 0,
      }),
    );
  }

  Ok(result)
}

/// Lấy báo cáo theo năm
#[tauri::command]
pub fn lay_bao_cao_nam(app: AppHandle, tu_nam: i32, den_nam: i32) -> Result<Vec<DuLieuBieuDoThuChi>> {
  let conn = create_connection(&app)?;

  let mut stmt = conn.prepare(
    "SELECT
       strftime('%Y', transaction_date) as nam,
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) as tong_thu,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) as tong_chi
     FROM transactions
     WHERE CAST(strftime('%Y', transaction_date) AS INTEGER) BETWEEN ? AND ?
     GROUP BY strftime('%Y', transaction_date)
     ORDER BY nam",
  )?;

  let rows = stmt.query_map(params![tu_nam, den_nam], |row| {
    Ok(DuLieuBieuDoThuChi {
      thang: row.get(0)?, // ở đây dùng thang để lưu năm
      tong_thu: row.get(1)?,
      tong_chi: row.get(2)?,
    })
  })?;

  let mut ket_qua = Vec::new();
  for row in rows {
    ket_qua.push(row?);
  }

  Ok(ket_qua)
}

/// Lấy chi tiêu theo danh mục
#[tauri::command]
pub fn lay_chi_tieu_theo_danh_muc(
  app: AppHandle,
  thang: String,
) -> Result<Vec<DuLieuBieuDoDanhMuc>> {
  NaiveDate::parse_from_str(&format!("{}-01", thang), "%Y-%m-%d")
    .map_err(|_| ViChiError::Validation("Tháng không hợp lệ (định dạng YYYY-MM)".to_string()))?;

  let conn = create_connection(&app)?;

  // Lấy tổng chi tiêu trong tháng
  let tong_chi_thang: i64 = conn.query_row(
    "SELECT COALESCE(SUM(amount), 0) FROM transactions
     WHERE type = 'expense' AND strftime('%Y-%m', transaction_date) = ?",
    params![thang],
    |row| row.get(0),
  )?;

  let mut stmt = conn.prepare(
    "SELECT
       c.id,
       c.name,
       c.color,
       COALESCE(SUM(t.amount), 0) as tong_chi
     FROM categories c
     LEFT JOIN transactions t ON t.category_id = c.id
       AND t.type = 'expense'
       AND strftime('%Y-%m', t.transaction_date) = ?
     WHERE c.type = 'expense' AND c.is_active = 1
     GROUP BY c.id, c.name, c.color
     HAVING tong_chi > 0
     ORDER BY tong_chi DESC",
  )?;

  let rows = stmt.query_map(params![thang], |row| {
    let tong_chi: i64 = row.get(3)?;
    let ty_le = if tong_chi_thang > 0 {
      (tong_chi as f64 / tong_chi_thang as f64) * 100.0
    } else {
      0.0
    };

    Ok(DuLieuBieuDoDanhMuc {
      danh_muc_id: row.get(0)?,
      ten_danh_muc: row.get(1)?,
      mau_sac: row.get(2)?,
      tong_chi,
      ty_le,
    })
  })?;

  let mut ket_qua = Vec::new();
  for row in rows {
    ket_qua.push(row?);
  }

  Ok(ket_qua)
}

/// Xuất báo cáo CSV
#[tauri::command]
pub fn xuat_csv(
  app: AppHandle,
  loai_bao_cao: String,
  thang: Option<String>,
  nam: Option<i32>,
) -> Result<DuLieuXuatCSV> {
  let conn = create_connection(&app)?;

  match loai_bao_cao.as_str() {
    "giao_dich" => xuat_giao_dich_csv(&conn, thang),
    "chi_tieu_danh_muc" => xuat_chi_tieu_danh_muc_csv(&conn, thang),
    "ngan_sach" => xuat_ngan_sach_csv(&conn, thang),
    "tong_hop_nam" => xuat_tong_hop_nam_csv(&conn, nam),
    _ => Err(ViChiError::Validation("Loại báo cáo không hợp lệ".to_string())),
  }
}

fn xuat_giao_dich_csv(conn: &rusqlite::Connection, thang: Option<String>) -> Result<DuLieuXuatCSV> {
  let mut sql = String::from(
    "SELECT
       t.id,
       t.type,
       t.amount,
       c.name as danh_muc,
       t.transaction_date,
       t.description,
       t.notes,
       t.created_at
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE 1=1
   ",
  );

  let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

  if let Some(thang) = thang {
    sql.push_str(" AND strftime('%Y-%m', t.transaction_date) = ?");
    params_vec.push(Box::new(thang));
  }

  sql.push_str(" ORDER BY t.transaction_date DESC, t.id DESC");

  let mut stmt = conn.prepare(&sql)?;
  let rows = stmt.query_map(
    rusqlite::params_from_iter(params_vec.iter().map(|p| p.as_ref())),
    |row| {
      let loai_str: String = row.get(1)?;
      let loai = if loai_str == "income" { "Thu nhập" } else { "Chi tiêu" };
      let so_tien: i64 = row.get(2)?;
      let so_tien_str = dinh_dang_tien_khong_ky_tu(so_tien);

      Ok(vec![
        row.get::<_, i64>(0)?.to_string(),
        loai.to_string(),
        so_tien_str,
        row.get::<_, String>(3)?,
        row.get::<_, String>(4)?,
        row.get::<_, String>(5)?,
        row.get::<_, Option<String>>(6)?.unwrap_or_default(),
        row.get::<_, String>(7)?,
      ])
    },
  )?;

  let mut hang_du_lieu = Vec::new();
  for row in rows {
    hang_du_lieu.push(row?);
  }

  Ok(DuLieuXuatCSV {
    tieu_de: vec![
      "ID".to_string(),
      "Loại".to_string(),
      "Số tiền".to_string(),
      "Danh mục".to_string(),
      "Ngày".to_string(),
      "Nội dung".to_string(),
      "Ghi chú".to_string(),
      "Ngày tạo".to_string(),
    ],
    hang_du_lieu,
  })
}

fn xuat_chi_tieu_danh_muc_csv(
  conn: &rusqlite::Connection,
  thang: Option<String>,
) -> Result<DuLieuXuatCSV> {
  let mut sql = String::from(
    "SELECT
       c.name as danh_muc,
       c.icon,
       COALESCE(SUM(t.amount), 0) as tong_chi
     FROM categories c
     LEFT JOIN transactions t ON t.category_id = c.id AND t.type = 'expense'
   ",
  );

  let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

  if let Some(thang) = thang {
    sql.push_str(" AND strftime('%Y-%m', t.transaction_date) = ?");
    params_vec.push(Box::new(thang));
  }

  sql.push_str(" WHERE c.type = 'expense' AND c.is_active = 1 GROUP BY c.id, c.name, c.icon ORDER BY tong_chi DESC");

  let mut stmt = conn.prepare(&sql)?;
  let rows = stmt.query_map(
    rusqlite::params_from_iter(params_vec.iter().map(|p| p.as_ref())),
    |row| {
      let tong_chi: i64 = row.get(2)?;
      Ok(vec![
        row.get::<_, String>(0)?,
        row.get::<_, String>(1)?,
        dinh_dang_tien_khong_ky_tu(tong_chi),
      ])
    },
  )?;

  let mut hang_du_lieu = Vec::new();
  for row in rows {
    hang_du_lieu.push(row?);
  }

  Ok(DuLieuXuatCSV {
    tieu_de: vec![
      "Danh mục".to_string(),
      "Biểu tượng".to_string(),
      "Tổng chi tiêu".to_string(),
    ],
    hang_du_lieu,
  })
}

fn xuat_ngan_sach_csv(conn: &rusqlite::Connection, thang: Option<String>) -> Result<DuLieuXuatCSV> {
  let thang = thang.ok_or_else(|| ViChiError::Validation("Tháng là bắt buộc cho báo cáo ngân sách".to_string()))?;

  let sql = r#"
    SELECT
      c.name as danh_muc,
      b.limit_amount,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) as da_chi
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    LEFT JOIN transactions t ON t.category_id = c.id
      AND t.type = 'expense'
      AND strftime('%Y-%m', t.transaction_date) = b.month
    WHERE b.month = ? AND c.is_active = 1
    GROUP BY b.id, c.id
    ORDER BY c.name
  "#;

  let mut stmt = conn.prepare(sql)?;
  let rows = stmt.query_map(params![thang], |row| {
    let han_muc: i64 = row.get(1)?;
    let da_chi: i64 = row.get(2)?;
    let con_lai = han_muc - da_chi;
    let ty_le = if han_muc > 0 { (da_chi as f64 / han_muc as f64) * 100.0 } else { 0.0 };
    let trang_thai = TrangThaiNganSach::tu_ty_le(ty_le);

    Ok(vec![
      row.get::<_, String>(0)?,
      dinh_dang_tien_khong_ky_tu(han_muc),
      dinh_dang_tien_khong_ky_tu(da_chi),
      dinh_dang_tien_khong_ky_tu(con_lai),
      format!("{:.1}%", ty_le),
      trang_thai.ten_hien_thi().to_string(),
    ])
  })?;

  let mut hang_du_lieu = Vec::new();
  for row in rows {
    hang_du_lieu.push(row?);
  }

  Ok(DuLieuXuatCSV {
    tieu_de: vec![
      "Danh mục".to_string(),
      "Hạn mức".to_string(),
      "Đã chi".to_string(),
      "Còn lại".to_string(),
      "Tỷ lệ".to_string(),
      "Trạng thái".to_string(),
    ],
    hang_du_lieu,
  })
}

fn xuat_tong_hop_nam_csv(conn: &rusqlite::Connection, nam: Option<i32>) -> Result<DuLieuXuatCSV> {
  let nam = nam.unwrap_or_else(|| Local::now().year());

  let sql = "
    SELECT
      strftime('%Y-%m', transaction_date) as thang,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) as tong_thu,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) as tong_chi
    FROM transactions
    WHERE strftime('%Y', transaction_date) = ?
    GROUP BY strftime('%Y-%m', transaction_date)
    ORDER BY thang
  ";

  let mut stmt = conn.prepare(sql)?;
  let rows = stmt.query_map(params![nam.to_string()], |row| {
    let tong_thu: i64 = row.get(1)?;
    let tong_chi: i64 = row.get(2)?;
    let chenh_lech = tong_thu - tong_chi;

    Ok(vec![
      row.get::<_, String>(0)?,
      dinh_dang_tien_khong_ky_tu(tong_thu),
      dinh_dang_tien_khong_ky_tu(tong_chi),
      dinh_dang_tien_khong_ky_tu(chenh_lech),
    ])
  })?;

  let mut hang_du_lieu = Vec::new();
  for row in rows {
    hang_du_lieu.push(row?);
  }

  // Thêm hàng tổng cộng
  let tong_thu: i64 = hang_du_lieu.iter().map(|r| r[1].replace('.', "").replace(" ₫", "").parse::<i64>().unwrap_or(0)).sum();
  let tong_chi: i64 = hang_du_lieu.iter().map(|r| r[2].replace('.', "").replace(" ₫", "").parse::<i64>().unwrap_or(0)).sum();
  hang_du_lieu.push(vec![
    "TỔNG CỘNG".to_string(),
    dinh_dang_tien_khong_ky_tu(tong_thu),
    dinh_dang_tien_khong_ky_tu(tong_chi),
    dinh_dang_tien_khong_ky_tu(tong_thu - tong_chi),
  ]);

  Ok(DuLieuXuatCSV {
    tieu_de: vec![
      "Tháng".to_string(),
      "Tổng thu".to_string(),
      "Tổng chi".to_string(),
      "Chênh lệch".to_string(),
    ],
    hang_du_lieu,
  })
}