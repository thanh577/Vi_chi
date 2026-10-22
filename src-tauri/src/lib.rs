//! Vi Chi - Thư viện chính
//! Chứa các module cho ứng dụng quản lý chi tiêu

pub mod database;
pub mod models;
pub mod giao_dich;
pub mod danh_muc;
pub mod ngan_sach;
pub mod bao_cao;
pub mod sao_luu;
pub mod utils;

use thiserror::Error;

/// Lỗi chung của ứng dụng Vi Chi
#[derive(Error, Debug)]
pub enum ViChiError {
  #[error("Lỗi cơ sở dữ liệu: {0}")]
  Database(#[from] rusqlite::Error),

  #[error("Lỗi serde: {0}")]
  Serde(#[from] serde_json::Error),

  #[error("Lỗi IO: {0}")]
  Io(#[from] std::io::Error),

  #[error("Lỗi UUID: {0}")]
  Uuid(#[from] uuid::Error),

  #[error("Lỗi thời gian: {0}")]
  Chrono(#[from] chrono::ParseError),

  #[error("Lỗi nghiệp vụ: {0}")]
  Business(String),

  #[error("Lỗi không tìm thấy: {0}")]
  NotFound(String),

  #[error("Lỗi xác thực: {0}")]
  Validation(String),
}

/// Kết quả chung của ứng dụng
pub type Result<T> = std::result::Result<T, ViChiError>;

/// Chuyển đổi ViChiError thành String để Tauri có thể serialize
impl From<ViChiError> for String {
  fn from(err: ViChiError) -> Self {
    err.to_string()
  }
}

/// Chuyển đổi ViChiError thành tauri::Error
impl From<ViChiError> for tauri::Error {
  fn from(err: ViChiError) -> Self {
    tauri::Error::Anyhow(err.into())
  }
}

/// Chuyển đổi ViChiError thành tauri::ipc::InvokeError
impl From<ViChiError> for tauri::ipc::InvokeError {
  fn from(err: ViChiError) -> Self {
    tauri::Error::Anyhow(err.into()).into()
  }
}