//! Vi Chi - Xử lý nghiệp vụ giao dịch

use crate::{
  database::create_connection,
  models::*,
  utils::{dinh_dang_tien, dinh_dang_tien_khong_ky_tu},
  Result, ViChiError,
};
use chrono::Local;
use rusqlite::params;
use tauri::AppHandle;

/// Lấy danh sách giao dịch với bộ lọc và phân trang
#[tauri::command]
pub fn lay_giao_dich(
  app: AppHandle,
  bo_loc: BoLocGiaoDich,
) -> std::result::Result<KetQuaPhanTrang<GiaoDich>, String> {
  let conn = create_connection(&app).map_err(|e| e.to_string())?;
  let offset = (bo_loc.trang - 1) * bo_loc.kich_thuoc_trang;

  // Xây dựng câu truy vấn động
  let mut where_clauses = Vec::new();
  let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

  if let Some(loai) = &bo_loc.loai {
    where_clauses.push("type = ?");
    params_vec.push(Box::new(loai.to_str().to_string()));
  }

  if let Some(danh_muc_id) = &bo_loc.danh_muc_id {
    where_clauses.push("category_id = ?");
    params_vec.push(Box::new(*danh_muc_id));
  }

  if let Some(tu_ngay) = &bo_loc.tu_ngay {
    where_clauses.push("transaction_date >= ?");
    params_vec.push(Box::new(tu_ngay.clone()));
  }

  if let Some(den_ngay) = &bo_loc.den_ngay {
    where_clauses.push("transaction_date <= ?");
    params_vec.push(Box::new(den_ngay.clone()));
  }

  if let Some(tu_khoa) = &bo_loc.tu_khoa {
    where_clauses.push("(description LIKE ? OR notes LIKE ?)");
    let keyword = format!("%{}%", tu_khoa);
    params_vec.push(Box::new(keyword.clone()));
    params_vec.push(Box::new(keyword));
  }

  let where_sql = if where_clauses.is_empty() {
    String::new()
  } else {
    format!("WHERE {}", where_clauses.join(" AND "))
  };

  // Đếm tổng số
  let count_sql = format!("SELECT COUNT(*) FROM transactions {}", where_sql);
  let mut count_stmt = conn.prepare(&count_sql).map_err(|e| e.to_string())?;
  let tong_so: i64 = count_stmt.query_row(
    rusqlite::params_from_iter(params_vec.iter().map(|p| p.as_ref())),
    |row| row.get(0),
  ).map_err(|e| e.to_string())?;

  // Truy vấn dữ liệu
  let data_sql = format!(
    "SELECT id, type, amount, category_id, transaction_date, description, notes, created_at, updated_at
     FROM transactions
     {}
     ORDER BY transaction_date DESC, id DESC
     LIMIT ? OFFSET ?",
    where_sql
  );

  params_vec.push(Box::new(bo_loc.kich_thuoc_trang as i64));
  params_vec.push(Box::new(offset as i64));

  let mut stmt = conn.prepare(&data_sql).map_err(|e| e.to_string())?;
  let rows = stmt.query_map(
    rusqlite::params_from_iter(params_vec.iter().map(|p| p.as_ref())),
    |row| {
      let loai_str: String = row.get(1)?;
      let loai = LoaiGiaoDich::from_str(&loai_str).map_err(|e| rusqlite::Error::FromSqlConversionFailure(1, rusqlite::types::Type::Text, Box::new(e)))?;
      Ok(GiaoDich {
        id: row.get(0)?,
        loai,
        so_tien: row.get(2)?,
        danh_muc_id: row.get(3)?,
        ngay_giao_dich: row.get(4)?,
        mo_ta: row.get(5)?,
        ghi_chu: row.get(6)?,
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
      })
    },
  ).map_err(|e| e.to_string())?;

  let mut du_lieu = Vec::new();
  for row in rows {
    du_lieu.push(row.map_err(|e| e.to_string())?);
  }

  let tong_trang = if tong_so == 0 {
    1
  } else {
    ((tong_so as f64) / (bo_loc.kich_thuoc_trang as f64)).ceil() as usize
  };

  Ok(KetQuaPhanTrang {
    du_lieu,
    tong_so: tong_so as usize,
    trang_hien_tai: bo_loc.trang,
    tong_trang,
  })
}

/// Thêm giao dịch mới
#[tauri::command]
pub fn them_giao_dich(
  app: AppHandle,
  yeu_cau: YeuCauThemGiaoDich,
) -> std::result::Result<GiaoDich, String> {
  // Kiểm tra dữ liệu đầu vào
  kiem_tra_du_lieu_giao_dich(&app, &yeu_cau).map_err(|e| e.to_string())?;

  let conn = create_connection(&app).map_err(|e| e.to_string())?;
  let now = Local::now().to_rfc3339();

  conn.execute(
    "INSERT INTO transactions (type, amount, category_id, transaction_date, description, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    params![
      yeu_cau.loai.to_str(),
      yeu_cau.so_tien,
      yeu_cau.danh_muc_id,
      yeu_cau.ngay_giao_dich,
      yeu_cau.mo_ta,
      yeu_cau.ghi_chu,
      now,
      now
    ],
  ).map_err(|e| e.to_string())?;

  let id = conn.last_insert_rowid();

  Ok(GiaoDich {
    id,
    loai: yeu_cau.loai,
    so_tien: yeu_cau.so_tien,
    danh_muc_id: yeu_cau.danh_muc_id,
    ngay_giao_dich: yeu_cau.ngay_giao_dich,
    mo_ta: yeu_cau.mo_ta,
    ghi_chu: yeu_cau.ghi_chu,
    created_at: now.clone(),
    updated_at: now,
  })
}

/// Cập nhật giao dịch
#[tauri::command]
pub fn cap_nhat_giao_dich(
  app: AppHandle,
  yeu_cau: YeuCauCapNhatGiaoDich,
) -> std::result::Result<GiaoDich, String> {
  let conn = create_connection(&app).map_err(|e| e.to_string())?;
  let now = Local::now().to_rfc3339();

  // Lấy giao dịch hiện tại
  let mut current: GiaoDich = conn.query_row(
    "SELECT id, type, amount, category_id, transaction_date, description, notes, created_at, updated_at
     FROM transactions WHERE id = ?",
    params![yeu_cau.id],
    |row| {
      let loai_str: String = row.get(1)?;
      let loai = LoaiGiaoDich::from_str(&loai_str).map_err(|e| rusqlite::Error::FromSqlConversionFailure(1, rusqlite::types::Type::Text, Box::new(e)))?;
      Ok(GiaoDich {
        id: row.get(0)?,
        loai,
        so_tien: row.get(2)?,
        danh_muc_id: row.get(3)?,
        ngay_giao_dich: row.get(4)?,
        mo_ta: row.get(5)?,
        ghi_chu: row.get(6)?,
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
      })
    },
  ).map_err(|e| e.to_string())?;

  // Cập nhật các trường được cung cấp
  if let Some(loai) = yeu_cau.loai {
    current.loai = loai;
  }
  if let Some(so_tien) = yeu_cau.so_tien {
    if so_tien <= 0 {
      return Err("Số tiền phải lớn hơn 0".to_string());
    }
    current.so_tien = so_tien;
  }
  if let Some(danh_muc_id) = yeu_cau.danh_muc_id {
    current.danh_muc_id = danh_muc_id;
  }
  if let Some(ngay_giao_dich) = yeu_cau.ngay_giao_dich {
    current.ngay_giao_dich = ngay_giao_dich;
  }
  if let Some(mo_ta) = yeu_cau.mo_ta {
    current.mo_ta = mo_ta;
  }
  if yeu_cau.ghi_chu.is_some() {
    current.ghi_chu = yeu_cau.ghi_chu;
  }
  current.updated_at = now.clone();

  conn.execute(
    "UPDATE transactions SET type = ?, amount = ?, category_id = ?, transaction_date = ?, description = ?, notes = ?, updated_at = ?
     WHERE id = ?",
    params![
      current.loai.to_str(),
      current.so_tien,
      current.danh_muc_id,
      current.ngay_giao_dich,
      current.mo_ta,
      current.ghi_chu,
      now,
      current.id
    ],
  ).map_err(|e| e.to_string())?;

  Ok(current)
}

/// Xóa giao dịch
#[tauri::command]
pub fn xoa_giao_dich(app: AppHandle, id: i64) -> std::result::Result<bool, String> {
  let conn = create_connection(&app).map_err(|e| e.to_string())?;

  let rows_affected = conn.execute("DELETE FROM transactions WHERE id = ?", params![id]).map_err(|e| e.to_string())?;

  Ok(rows_affected > 0)
}

/// Kiểm tra dữ liệu giao dịch
fn kiem_tra_du_lieu_giao_dich(app: &AppHandle, yeu_cau: &YeuCauThemGiaoDich) -> Result<()> {
  if yeu_cau.so_tien <= 0 {
    return Err(ViChiError::Validation("Số tiền phải lớn hơn 0".to_string()));
  }

  if yeu_cau.mo_ta.trim().is_empty() {
    return Err(ViChiError::Validation("Nội dung giao dịch không được để trống".to_string()));
  }

  // Kiểm tra định dạng ngày
  chrono::NaiveDate::parse_from_str(&yeu_cau.ngay_giao_dich, "%Y-%m-%d")
    .map_err(|_| ViChiError::Validation("Ngày giao dịch không hợp lệ (định dạng YYYY-MM-DD)".to_string()))?;

  // Kiểm tra danh mục tồn tại
  let conn = create_connection(app)?;
  let count: i64 = conn.query_row(
    "SELECT COUNT(*) FROM categories WHERE id = ? AND is_active = 1",
    params![yeu_cau.danh_muc_id],
    |row| row.get(0),
  )?;

  if count == 0 {
    return Err(ViChiError::Validation("Danh mục không tồn tại hoặc đã bị vô hiệu hóa".to_string()));
  }

  Ok(())
}