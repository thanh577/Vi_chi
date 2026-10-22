//! Vi Chi - Các mô hình dữ liệu

use crate::Result;
use serde::{Deserialize, Serialize};

/// Loại giao dịch
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LoaiGiaoDich {
  Income,
  Expense,
}

impl LoaiGiaoDich {
  pub fn from_str(s: &str) -> Result<Self> {
    match s.to_lowercase().as_str() {
      "income" | "thu" | "thu_nhap" => Ok(LoaiGiaoDich::Income),
      "expense" | "chi" | "chi_tieu" => Ok(LoaiGiaoDich::Expense),
      _ => Err(crate::ViChiError::Validation(format!(
        "Loại giao dịch không hợp lệ: {}",
        s
      ))),
    }
  }

  pub fn to_str(&self) -> &'static str {
    match self {
      LoaiGiaoDich::Income => "income",
      LoaiGiaoDich::Expense => "expense",
    }
  }

  pub fn ten_hien_thi(&self) -> &'static str {
    match self {
      LoaiGiaoDich::Income => "Thu nhập",
      LoaiGiaoDich::Expense => "Chi tiêu",
    }
  }

  pub fn mau_sac(&self) -> &'static str {
    match self {
      LoaiGiaoDich::Income => "#16a34a", // xanh lá
      LoaiGiaoDich::Expense => "#dc2626", // đỏ
    }
  }
}

/// Trạng thái ngân sách
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TrangThaiNganSach {
  BinhThuong,
  SapHet,
  VuotNganSach,
}

impl TrangThaiNganSach {
  pub fn tu_ty_le(ty_le: f64) -> Self {
    if ty_le >= 100.0 {
      TrangThaiNganSach::VuotNganSach
    } else if ty_le >= 80.0 {
      TrangThaiNganSach::SapHet
    } else {
      TrangThaiNganSach::BinhThuong
    }
  }

  pub fn ten_hien_thi(&self) -> &'static str {
    match self {
      TrangThaiNganSach::BinhThuong => "Bình thường",
      TrangThaiNganSach::SapHet => "Sắp hết ngân sách",
      TrangThaiNganSach::VuotNganSach => "Vượt ngân sách",
    }
  }

  pub fn mau_sac(&self) -> &'static str {
    match self {
      TrangThaiNganSach::BinhThuong => "#16a34a",
      TrangThaiNganSach::SapHet => "#f59e0b",
      TrangThaiNganSach::VuotNganSach => "#dc2626",
    }
  }
}

/// Giao dịch
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GiaoDich {
  pub id: i64,
  pub loai: LoaiGiaoDich,
  pub so_tien: i64, // VNĐ nguyên
  pub danh_muc_id: i64,
  pub ngay_giao_dich: String, // YYYY-MM-DD
  pub mo_ta: String,
  pub ghi_chu: Option<String>,
  pub created_at: String,
  pub updated_at: String,
}

/// Danh mục
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DanhMuc {
  pub id: i64,
  pub ten: String,
  pub loai: LoaiGiaoDich,
  pub bieu_tuong: String,
  pub mau_sac: String,
  pub la_mac_dinh: bool,
  pub kich_hoat: bool,
}

/// Ngân sách
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NganSach {
  pub id: i64,
  pub danh_muc_id: i64,
  pub thang: String, // YYYY-MM
  pub han_muc: i64,  // VNĐ nguyên
  pub created_at: String,
  pub updated_at: String,
}

/// Ngân sách với thông tin danh mục
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NganSachDayDu {
  pub ngan_sach: NganSach,
  pub danh_muc: DanhMuc,
  pub da_chi: i64,
  pub con_lai: i64,
  pub ty_le: f64,
  pub trang_thai: TrangThaiNganSach,
}

/// Tổng quan tài chính
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TongQuan {
  pub tong_thu: i64,
  pub tong_chi: i64,
  pub chenh_lech: i64,
  pub tong_ngan_sach: i64,
  pub da_su_dung_ngan_sach: i64,
  pub ty_le_su_dung: f64,
}

/// Dữ liệu biểu đồ thu chi theo thời gian
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuLieuBieuDoThuChi {
  pub thang: String, // YYYY-MM
  pub tong_thu: i64,
  pub tong_chi: i64,
}

/// Dữ liệu biểu đồ chi tiêu theo danh mục
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuLieuBieuDoDanhMuc {
  pub danh_muc_id: i64,
  pub ten_danh_muc: String,
  pub mau_sac: String,
  pub tong_chi: i64,
  pub ty_le: f64,
}

/// Giao dịch gần đây cho dashboard
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GiaoDichGanDay {
  pub id: i64,
  pub loai: LoaiGiaoDich,
  pub so_tien: i64,
  pub ten_danh_muc: String,
  pub bieu_tuong_danh_muc: String,
  pub mau_sac_danh_muc: String,
  pub ngay_giao_dich: String,
  pub mo_ta: String,
}

/// Cài đặt ứng dụng
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaiDat {
  pub khoa: String,
  pub gia_tri: String,
}

/// Tham số lọc giao dịch
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BoLocGiaoDich {
  pub loai: Option<LoaiGiaoDich>,
  pub danh_muc_id: Option<i64>,
  pub tu_ngay: Option<String>, // YYYY-MM-DD
  pub den_ngay: Option<String>, // YYYY-MM-DD
  pub tu_khoa: Option<String>,
  pub trang: usize,
  pub kich_thuoc_trang: usize,
}

/// Kết quả phân trang
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KetQuaPhanTrang<T> {
  pub du_lieu: Vec<T>,
  pub tong_so: usize,
  pub trang_hien_tai: usize,
  pub tong_trang: usize,
}

/// Dữ liệu xuất CSV
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuLieuXuatCSV {
  pub tieu_de: Vec<String>,
  pub hang_du_lieu: Vec<Vec<String>>,
}

/// Thông tin sao lưu
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThongTinSaoLuu {
  pub ten_tep: String,
  pub kich_thuoc: u64,
  pub ngay_tao: String,
  pub so_luong_giao_dich: usize,
  pub so_luong_danh_muc: usize,
  pub so_luong_ngan_sach: usize,
}

/// Yêu cầu thêm giao dịch
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YeuCauThemGiaoDich {
  pub loai: LoaiGiaoDich,
  pub so_tien: i64,
  pub danh_muc_id: i64,
  pub ngay_giao_dich: String,
  pub mo_ta: String,
  pub ghi_chu: Option<String>,
}

/// Yêu cầu cập nhật giao dịch
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YeuCauCapNhatGiaoDich {
  pub id: i64,
  pub loai: Option<LoaiGiaoDich>,
  pub so_tien: Option<i64>,
  pub danh_muc_id: Option<i64>,
  pub ngay_giao_dich: Option<String>,
  pub mo_ta: Option<String>,
  pub ghi_chu: Option<String>,
}

/// Yêu cầu thêm/cập nhật danh mục
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YeuCauDanhMuc {
  pub ten: String,
  pub loai: LoaiGiaoDich,
  pub bieu_tuong: String,
  pub mau_sac: String,
}

/// Yêu cầu ngân sách
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YeuCauNganSach {
  pub danh_muc_id: i64,
  pub thang: String, // YYYY-MM
  pub han_muc: i64,
}