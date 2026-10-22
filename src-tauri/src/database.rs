//! Vi Chi - Quản lý kết nối cơ sở dữ liệu SQLite

use crate::{Result, ViChiError};
use rusqlite::{Connection, OpenFlags};
use std::path::PathBuf;
use tauri::Manager;

/// Lấy đường dẫn thư mục dữ liệu ứng dụng
fn get_app_data_dir(app: &tauri::AppHandle) -> Result<PathBuf> {
  let dir = app
    .path()
    .app_data_dir()
    .map_err(|e| ViChiError::Business(format!("Không thể lấy thư mục dữ liệu: {}", e)))?;

  // Tạo thư mục nếu chưa tồn tại
  std::fs::create_dir_all(&dir).map_err(|e| {
    ViChiError::Business(format!("Không thể tạo thư mục dữ liệu: {}", e))
  })?;

  Ok(dir)
}

/// Lấy đường dẫn tệp cơ sở dữ liệu
pub fn get_database_path(app: &tauri::AppHandle) -> Result<PathBuf> {
  let dir = get_app_data_dir(app)?;
  Ok(dir.join("vi-chi.db"))
}

/// Tạo kết nối đến cơ sở dữ liệu
pub fn create_connection(app: &tauri::AppHandle) -> Result<Connection> {
  let path = get_database_path(app)?;

  let conn = Connection::open_with_flags(
    &path,
    OpenFlags::SQLITE_OPEN_READ_WRITE
      | OpenFlags::SQLITE_OPEN_CREATE
      | OpenFlags::SQLITE_OPEN_NO_MUTEX
      | OpenFlags::SQLITE_OPEN_URI,
  )?;

  // Bật khóa ngoại
  conn.execute_batch("PRAGMA foreign_keys = ON;")?;

  // Cấu hình WAL mode để hiệu năng tốt hơn
  conn.execute_batch("PRAGMA journal_mode = WAL;")?;

  // Cấu hình synchronous = NORMAL để cân bằng an toàn và tốc độ
  conn.execute_batch("PRAGMA synchronous = NORMAL;")?;

  Ok(conn)
}

/// Khởi tạo cơ sở dữ liệu - chạy migration
pub fn initialize() -> Result<()> {
  // Trong Tauri 2, chúng ta dùng plugin SQL nên initialization
  // sẽ được xử lý qua migrations
  Ok(())
}

/// Chạy migration từ tệp SQL
pub fn run_migrations(app: &tauri::AppHandle) -> Result<()> {
  let conn = create_connection(app)?;

  // Đọc và chạy migration 001
  let migration_sql = include_str!("../migrations/001_khoi_tao.sql");

  conn.execute_batch(migration_sql)?;

  Ok(())
}

/// Kiểm tra xem cơ sở dữ liệu đã được khởi tạo chưa
pub fn is_initialized(app: &tauri::AppHandle) -> Result<bool> {
  let conn = create_connection(app)?;

  let count: i64 = conn.query_row(
    "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='transactions'",
    [],
    |row| row.get(0),
  )?;

  Ok(count > 0)
}