//! Vi Chi - Xử lý sao lưu và khôi phục dữ liệu

use crate::{
  database::{create_connection, get_database_path},
  models::*,
  Result, ViChiError,
};
use chrono::{DateTime, Local};
use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

/// Sao lưu dữ liệu
#[tauri::command]
pub fn sao_luu_du_lieu(app: AppHandle) -> Result<ThongTinSaoLuu> {
  let db_path = get_database_path(&app)?;
  let backup_dir = db_path.parent().unwrap().join("backups");

  // Tạo thư mục backup nếu chưa có
  fs::create_dir_all(&backup_dir).map_err(|e| {
    ViChiError::Business(format!("Không thể tạo thư mục sao lưu: {}", e))
  })?;

  // Tạo tên tệp backup với timestamp
  let timestamp = Local::now().format("%Y%m%d_%H%M%S");
  let backup_filename = format!("vi-chi_backup_{}.db", timestamp);
  let backup_path = backup_dir.join(&backup_filename);

  // Sao chép tệp cơ sở dữ liệu
  fs::copy(&db_path, &backup_path).map_err(|e| {
    ViChiError::Business(format!("Không thể sao chép cơ sở dữ liệu: {}", e))
  })?;

  // Lấy thông tin thống kê
  let conn = create_connection(&app)?;
  let so_luong_giao_dich: i64 = conn.query_row("SELECT COUNT(*) FROM transactions", [], |row| row.get(0))?;
  let so_luong_danh_muc: i64 = conn.query_row("SELECT COUNT(*) FROM categories WHERE is_active = 1", [], |row| row.get(0))?;
  let so_luong_ngan_sach: i64 = conn.query_row("SELECT COUNT(*) FROM budgets", [], |row| row.get(0))?;

  let kich_thuoc = fs::metadata(&backup_path).map_err(|e| {
    ViChiError::Business(format!("Không thể đọc thông tin tệp: {}", e))
  })?.len();

  Ok(ThongTinSaoLuu {
    ten_tep: backup_filename,
    kich_thuoc,
    ngay_tao: Local::now().to_rfc3339(),
    so_luong_giao_dich: so_luong_giao_dich as usize,
    so_luong_danh_muc: so_luong_danh_muc as usize,
    so_luong_ngan_sach: so_luong_ngan_sach as usize,
  })
}

/// Khôi phục dữ liệu từ bản sao lưu
#[tauri::command]
pub fn khoi_phuc_du_lieu(app: AppHandle, ten_tep: String) -> Result<bool> {
  let db_path = get_database_path(&app)?;
  let backup_dir = db_path.parent().unwrap().join("backups");
  let backup_path = backup_dir.join(&ten_tep);

  // Kiểm tra tệp backup tồn tại
  if !backup_path.exists() {
    return Err(ViChiError::NotFound(format!("Không tìm thấy tệp sao lưu: {}", ten_tep)));
  }

  // Kiểm tra tính hợp lệ của tệp backup (thử mở và truy vấn)
  let backup_conn = Connection::open(&backup_path).map_err(|e| {
    ViChiError::Business(format!("Tệp sao lưu không hợp lệ: {}", e))
  })?;

  // Kiểm tra các bảng cần thiết
  let tables: Vec<String> = backup_conn
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")?
    .query_map([], |row| row.get(0))?
    .collect::<std::result::Result<Vec<_>, _>>()?;

  let required_tables = ["transactions", "categories", "budgets", "settings"];
  for table in required_tables {
    if !tables.iter().any(|t| t == table) {
      return Err(ViChiError::Business(format!("Tệp sao lưu thiếu bảng: {}", table)));
    }
  }

  // Đóng kết nối backup
  drop(backup_conn);

  // Tạo bản sao lưu của DB hiện tại trước khi khôi phục (để an toàn)
  let current_backup = db_path.with_extension("db.pre_restore");
  fs::copy(&db_path, &current_backup).map_err(|e| {
    ViChiError::Business(format!("Không thể tạo bản sao lưu tạm thời: {}", e))
  })?;

  // Thay thế DB hiện tại bằng backup
  fs::copy(&backup_path, &db_path).map_err(|e| {
    // Thử khôi phục lại DB cũ nếu có lỗi
    let _ = fs::copy(&current_backup, &db_path);
    ViChiError::Business(format!("Không thể khôi phục dữ liệu: {}", e))
  })?;

  // Xóa bản sao lưu tạm
  let _ = fs::remove_file(&current_backup);

  Ok(true)
}

/// Lấy danh sách các bản sao lưu
#[tauri::command]
pub fn lay_danh_sach_sao_luu(app: AppHandle) -> Result<Vec<ThongTinSaoLuu>> {
  let db_path = get_database_path(&app)?;
  let backup_dir = db_path.parent().unwrap().join("backups");

  if !backup_dir.exists() {
    return Ok(Vec::new());
  }

  let mut backups = Vec::new();

  for entry in fs::read_dir(&backup_dir).map_err(|e| {
    ViChiError::Business(format!("Không thể đọc thư mục sao lưu: {}", e))
  })? {
    let entry = entry.map_err(|e| {
      ViChiError::Business(format!("Lỗi đọc mục: {}", e))
    })?;

    let path = entry.path();
    if path.extension().and_then(|s| s.to_str()) == Some("db") {
      if let Some(filename) = path.file_name().and_then(|s| s.to_str()) {
        let metadata = fs::metadata(&path).map_err(|e| {
          ViChiError::Business(format!("Không thể đọc thông tin tệp: {}", e))
        })?;

        // Thử đọc thông tin từ tệp backup
        let conn = Connection::open(&path).ok();
        let (so_luong_giao_dich, so_luong_danh_muc, so_luong_ngan_sach) = if let Some(conn) = conn {
          let gd = conn.query_row("SELECT COUNT(*) FROM transactions", [], |row| row.get(0)).unwrap_or(0);
          let dm = conn.query_row("SELECT COUNT(*) FROM categories WHERE is_active = 1", [], |row| row.get(0)).unwrap_or(0);
          let ns = conn.query_row("SELECT COUNT(*) FROM budgets", [], |row| row.get(0)).unwrap_or(0);
          (gd, dm, ns)
        } else {
          (0, 0, 0)
        };

        // Chuyển đổi modified time sang RFC3339
        let ngay_tao = metadata
          .modified()
          .ok()
          .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
          .map(|d| {
            let secs = d.as_secs() as i64;
            DateTime::from_timestamp(secs, 0)
              .map(|dt| dt.to_rfc3339())
              .unwrap_or_else(|| Local::now().to_rfc3339())
          })
          .unwrap_or_else(|| Local::now().to_rfc3339());

        backups.push(ThongTinSaoLuu {
          ten_tep: filename.to_string(),
          kich_thuoc: metadata.len(),
          ngay_tao,
          so_luong_giao_dich,
          so_luong_danh_muc,
          so_luong_ngan_sach,
        });
      }
    }
  }

  // Sắp xếp theo ngày mới nhất trước
  backups.sort_by(|a, b| b.ngay_tao.cmp(&a.ngay_tao));

  Ok(backups)
}

/// Xóa bản sao lưu
#[tauri::command]
pub fn xoa_sao_luu(app: AppHandle, ten_tep: String) -> Result<bool> {
  let db_path = get_database_path(&app)?;
  let backup_dir = db_path.parent().unwrap().join("backups");
  let backup_path = backup_dir.join(&ten_tep);

  if !backup_path.exists() {
    return Err(ViChiError::NotFound(format!("Không tìm thấy tệp sao lưu: {}", ten_tep)));
  }

  fs::remove_file(&backup_path).map_err(|e| {
    ViChiError::Business(format!("Không thể xóa tệp sao lưu: {}", e))
  })?;

  Ok(true)
}