//! Vi Chi - Xử lý nghiệp vụ danh mục

use crate::{
  database::create_connection,
  models::*,
  Result, ViChiError,
};
use chrono::Local;
use rusqlite::params;
use tauri::AppHandle;

/// Lấy danh sách danh mục
#[tauri::command]
pub fn lay_danh_muc(app: AppHandle, loai: Option<LoaiGiaoDich>) -> Result<Vec<DanhMuc>> {
  let conn = create_connection(&app)?;

  let (sql, params_vec): (String, Vec<Box<dyn rusqlite::ToSql>>) = if let Some(loai) = loai {
    (
      "SELECT id, name, type, icon, color, is_default, is_active FROM categories WHERE type = ? AND is_active = 1 ORDER BY is_default DESC, name".to_string(),
      vec![Box::new(loai.to_str().to_string())],
    )
  } else {
    (
      "SELECT id, name, type, icon, color, is_default, is_active FROM categories WHERE is_active = 1 ORDER BY type, is_default DESC, name".to_string(),
      vec![],
    )
  };

  let mut stmt = conn.prepare(&sql)?;
  let rows = stmt.query_map(
    rusqlite::params_from_iter(params_vec.iter().map(|p| p.as_ref())),
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

  let mut danh_muc = Vec::new();
  for row in rows {
    danh_muc.push(row?);
  }

  Ok(danh_muc)
}

/// Tạo danh mục mới
#[tauri::command]
pub fn them_danh_muc(app: AppHandle, yeu_cau: YeuCauDanhMuc) -> Result<DanhMuc> {
  kiem_tra_du_lieu_danh_muc(&yeu_cau)?;

  let conn = create_connection(&app)?;
  let now = Local::now().to_rfc3339();

  conn.execute(
    "INSERT INTO categories (name, type, icon, color, is_default, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, 1, ?, ?)",
    params![
      yeu_cau.ten.trim(),
      yeu_cau.loai.to_str(),
      yeu_cau.bieu_tuong,
      yeu_cau.mau_sac,
      now,
      now
    ],
  )?;

  let id = conn.last_insert_rowid();

  Ok(DanhMuc {
    id,
    ten: yeu_cau.ten.trim().to_string(),
    loai: yeu_cau.loai,
    bieu_tuong: yeu_cau.bieu_tuong,
    mau_sac: yeu_cau.mau_sac,
    la_mac_dinh: false,
    kich_hoat: true,
  })
}

/// Cập nhật danh mục
#[tauri::command]
pub fn cap_nhat_danh_muc(
  app: AppHandle,
  id: i64,
  yeu_cau: YeuCauDanhMuc,
) -> Result<DanhMuc> {
  kiem_tra_du_lieu_danh_muc(&yeu_cau)?;

  let conn = create_connection(&app)?;
  let now = Local::now().to_rfc3339();

  // Kiểm tra danh mục tồn tại và không phải mặc định
  let la_mac_dinh: bool = conn.query_row(
    "SELECT is_default FROM categories WHERE id = ?",
    params![id],
    |row| row.get(0),
  )?;

  if la_mac_dinh {
    return Err(ViChiError::Validation("Không thể sửa danh mục mặc định".to_string()));
  }

  let rows_affected = conn.execute(
    "UPDATE categories SET name = ?, type = ?, icon = ?, color = ?, updated_at = ?
     WHERE id = ? AND is_default = 0",
    params![
      yeu_cau.ten.trim(),
      yeu_cau.loai.to_str(),
      yeu_cau.bieu_tuong,
      yeu_cau.mau_sac,
      now,
      id
    ],
  )?;

  if rows_affected == 0 {
    return Err(ViChiError::NotFound("Danh mục không tìm thấy".to_string()));
  }

  Ok(DanhMuc {
    id,
    ten: yeu_cau.ten.trim().to_string(),
    loai: yeu_cau.loai,
    bieu_tuong: yeu_cau.bieu_tuong,
    mau_sac: yeu_cau.mau_sac,
    la_mac_dinh: false,
    kich_hoat: true,
  })
}

/// Xóa danh mục (vô hiệu hóa thay vì xóa vật lý)
#[tauri::command]
pub fn xoa_danh_muc(app: AppHandle, id: i64) -> Result<bool> {
  let conn = create_connection(&app)?;

  // Kiểm tra danh mục mặc định
  let la_mac_dinh: bool = conn.query_row(
    "SELECT is_default FROM categories WHERE id = ?",
    params![id],
    |row| row.get(0),
  )?;

  if la_mac_dinh {
    return Err(ViChiError::Validation("Không thể xóa danh mục mặc định".to_string()));
  }

  // Kiểm tra xem danh mục có đang được sử dụng không
  let count: i64 = conn.query_row(
    "SELECT COUNT(*) FROM transactions WHERE category_id = ?",
    params![id],
    |row| row.get(0),
  )?;

  if count > 0 {
    // Vô hiệu hóa thay vì xóa
    conn.execute(
      "UPDATE categories SET is_active = 0, updated_at = ? WHERE id = ?",
      params![Local::now().to_rfc3339(), id],
    )?;
    return Ok(true);
  }

  // Nếu chưa được sử dụng thì xóa vật lý
  let rows_affected = conn.execute("DELETE FROM categories WHERE id = ?", params![id])?;

  Ok(rows_affected > 0)
}

/// Khởi tạo danh mục mặc định
#[tauri::command]
pub fn khoi_tao_danh_muc_mac_dinh(app: AppHandle) -> Result<usize> {
  let conn = create_connection(&app)?;
  let now = Local::now().to_rfc3339();

  let danh_muc_mac_dinh = vec![
    // Chi tiêu
    ("Ăn uống", LoaiGiaoDich::Expense, "utensils", "#ef4444"),
    ("Đi lại", LoaiGiaoDich::Expense, "car", "#f97316"),
    ("Nhà ở", LoaiGiaoDich::Expense, "home", "#eab308"),
    ("Điện nước", LoaiGiaoDich::Expense, "zap", "#22c55e"),
    ("Mua sắm", LoaiGiaoDich::Expense, "shopping-bag", "#06b6d4"),
    ("Sức khỏe", LoaiGiaoDich::Expense, "heart-pulse", "#3b82f6"),
    ("Giáo dục", LoaiGiaoDich::Expense, "graduation-cap", "#8b5cf6"),
    ("Giải trí", LoaiGiaoDich::Expense, "gamepad2", "#ec4899"),
    ("Hóa đơn", LoaiGiaoDich::Expense, "file-text", "#64748b"),
    ("Gia đình", LoaiGiaoDich::Expense, "users", "#14b8a6"),
    ("Du lịch", LoaiGiaoDich::Expense, "plane", "#f43f5e"),
    ("Khác", LoaiGiaoDich::Expense, "more-horizontal", "#94a3b8"),
    // Thu nhập
    ("Lương", LoaiGiaoDich::Income, "briefcase", "#16a34a"),
    ("Thưởng", LoaiGiaoDich::Income, "gift", "#15803d"),
    ("Làm thêm", LoaiGiaoDich::Income, "clock", "#166534"),
    ("Kinh doanh", LoaiGiaoDich::Income, "store", "#14532d"),
    ("Đầu tư", LoaiGiaoDich::Income, "trending-up", "#052e16"),
    ("Thu nhập khác", LoaiGiaoDich::Income, "plus-circle", "#166534"),
  ];

  let mut dem = 0;

  for (ten, loai, bieu_tuong, mau_sac) in danh_muc_mac_dinh {
    // Kiểm tra xem đã tồn tại chưa
    let count: i64 = conn.query_row(
      "SELECT COUNT(*) FROM categories WHERE name = ? AND type = ? AND is_default = 1",
      params![ten, loai.to_str()],
      |row| row.get(0),
    )?;

    if count == 0 {
      conn.execute(
        "INSERT INTO categories (name, type, icon, color, is_default, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, 1, ?, ?)",
        params![ten, loai.to_str(), bieu_tuong, mau_sac, now, now],
      )?;
      dem += 1;
    }
  }

  Ok(dem)
}

/// Kiểm tra dữ liệu danh mục
fn kiem_tra_du_lieu_danh_muc(yeu_cau: &YeuCauDanhMuc) -> Result<()> {
  if yeu_cau.ten.trim().is_empty() {
    return Err(ViChiError::Validation("Tên danh mục không được để trống".to_string()));
  }

  if yeu_cau.ten.trim().len() > 50 {
    return Err(ViChiError::Validation("Tên danh mục không được quá 50 ký tự".to_string()));
  }

  if yeu_cau.bieu_tuong.trim().is_empty() {
    return Err(ViChiError::Validation("Biểu tượng không được để trống".to_string()));
  }

  if yeu_cau.mau_sac.trim().is_empty() {
    return Err(ViChiError::Validation("Màu sắc không được để trống".to_string()));
  }

  // Kiểm tra định dạng màu hex
  if !yeu_cau.mau_sac.starts_with('#') || yeu_cau.mau_sac.len() != 7 {
    return Err(ViChiError::Validation("Màu sắc phải ở định dạng hex (ví dụ: #ef4444)".to_string()));
  }

  Ok(())
}