//! Vi Chi - Xử lý nghiệp vụ ngân sách

use crate::{
  database::create_connection,
  models::*,
  Result, ViChiError,
};
use chrono::{Local, NaiveDate};
use rusqlite::params;
use tauri::AppHandle;

/// Lấy ngân sách cho một tháng
#[tauri::command]
pub fn lay_ngan_sach(app: AppHandle, thang: String) -> Result<Vec<NganSachDayDu>> {
  // Kiểm tra định dạng tháng
  NaiveDate::parse_from_str(&format!("{}-01", thang), "%Y-%m-%d")
    .map_err(|_| ViChiError::Validation("Tháng không hợp lệ (định dạng YYYY-MM)".to_string()))?;

  let conn = create_connection(&app)?;

  let sql = r#"
    SELECT
      b.id, b.category_id, b.month, b.limit_amount, b.created_at, b.updated_at,
      c.id, c.name, c.type, c.icon, c.color, c.is_default, c.is_active,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as da_chi
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
    let loai_str: String = row.get(8)?;
    let loai = LoaiGiaoDich::from_str(&loai_str).map_err(|e| rusqlite::Error::FromSqlConversionFailure(8, rusqlite::types::Type::Text, Box::new(e)))?;
    let ngan_sach = NganSach {
      id: row.get(0)?,
      danh_muc_id: row.get(1)?,
      thang: row.get(2)?,
      han_muc: row.get(3)?,
      created_at: row.get(4)?,
      updated_at: row.get(5)?,
    };

    let danh_muc = DanhMuc {
      id: row.get(6)?,
      ten: row.get(7)?,
      loai,
      bieu_tuong: row.get(9)?,
      mau_sac: row.get(10)?,
      la_mac_dinh: row.get(11)?,
      kich_hoat: row.get(12)?,
    };

    let da_chi: i64 = row.get(13)?;
    let con_lai = ngan_sach.han_muc - da_chi;
    let ty_le = if ngan_sach.han_muc > 0 {
      (da_chi as f64 / ngan_sach.han_muc as f64) * 100.0
    } else {
      0.0
    };
    let trang_thai = TrangThaiNganSach::tu_ty_le(ty_le);

    Ok(NganSachDayDu {
      ngan_sach,
      danh_muc,
      da_chi,
      con_lai,
      ty_le,
      trang_thai,
    })
  })?;

  let mut ket_qua = Vec::new();
  for row in rows {
    ket_qua.push(row?);
  }

  Ok(ket_qua)
}

/// Lưu (tạo hoặc cập nhật) ngân sách
#[tauri::command]
pub fn luu_ngan_sach(app: AppHandle, yeu_cau: YeuCauNganSach) -> Result<NganSach> {
  kiem_tra_du_lieu_ngan_sach(&app, &yeu_cau)?;

  let conn = create_connection(&app)?;
  let now = Local::now().to_rfc3339();

  // Kiểm tra xem đã tồn tại ngân sách cho danh mục và tháng này chưa
  let count: i64 = conn.query_row(
    "SELECT COUNT(*) FROM budgets WHERE category_id = ? AND month = ?",
    params![yeu_cau.danh_muc_id, yeu_cau.thang],
    |row| row.get(0),
  )?;

  if count > 0 {
    // Cập nhật
    conn.execute(
      "UPDATE budgets SET limit_amount = ?, updated_at = ? WHERE category_id = ? AND month = ?",
      params![yeu_cau.han_muc, now, yeu_cau.danh_muc_id, yeu_cau.thang],
    )?;
  } else {
    // Thêm mới
    conn.execute(
      "INSERT INTO budgets (category_id, month, limit_amount, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)",
      params![yeu_cau.danh_muc_id, yeu_cau.thang, yeu_cau.han_muc, now, now],
    )?;
  }

  // Lấy ngân sách vừa lưu
  let ngan_sach: NganSach = conn.query_row(
    "SELECT id, category_id, month, limit_amount, created_at, updated_at
     FROM budgets WHERE category_id = ? AND month = ?",
    params![yeu_cau.danh_muc_id, yeu_cau.thang],
    |row| {
      Ok(NganSach {
        id: row.get(0)?,
        danh_muc_id: row.get(1)?,
        thang: row.get(2)?,
        han_muc: row.get(3)?,
        created_at: row.get(4)?,
        updated_at: row.get(5)?,
      })
    },
  )?;

  Ok(ngan_sach)
}

/// Xóa ngân sách
#[tauri::command]
pub fn xoa_ngan_sach(app: AppHandle, id: i64) -> Result<bool> {
  let conn = create_connection(&app)?;

  let rows_affected = conn.execute("DELETE FROM budgets WHERE id = ?", params![id])?;

  Ok(rows_affected > 0)
}

/// Kiểm tra dữ liệu ngân sách
fn kiem_tra_du_lieu_ngan_sach(app: &AppHandle, yeu_cau: &YeuCauNganSach) -> Result<()> {
  if yeu_cau.han_muc < 0 {
    return Err(ViChiError::Validation("Hạn mức ngân sách không được âm".to_string()));
  }

  // Kiểm tra định dạng tháng
  NaiveDate::parse_from_str(&format!("{}-01", yeu_cau.thang), "%Y-%m-%d")
    .map_err(|_| ViChiError::Validation("Tháng không hợp lệ (định dạng YYYY-MM)".to_string()))?;

  // Kiểm tra danh mục tồn tại và là loại chi tiêu
  let conn = create_connection(app)?;
  let danh_muc: DanhMuc = conn.query_row(
    "SELECT id, name, type, icon, color, is_default, is_active FROM categories WHERE id = ? AND is_active = 1",
    params![yeu_cau.danh_muc_id],
    |row| {
      let loai_str: String = row.get(2)?;
      let loai = LoaiGiaoDich::from_str(&loai_str).map_err(|e| rusqlite::Error::FromSqlConversionFailure(2, rusqlite::types::Type::Text, Box::new(e)))?;
      Ok(DanhMuc {
        id: row.get(0)?,
        ten: row.get(1)?,
        loai,
        bieu_tuong: row.get(3)?,
        mau_sac: row.get(4)?,
        la_mac_dinh: row.get(5)?,
        kich_hoat: row.get(6)?,
      })
    },
  )?;

  if danh_muc.loai != LoaiGiaoDich::Expense {
    return Err(ViChiError::Validation("Chỉ có thể đặt ngân sách cho danh mục chi tiêu".to_string()));
  }

  Ok(())
}