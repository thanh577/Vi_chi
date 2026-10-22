//! Vi Chi - Ứng dụng quản lý chi tiêu cá nhân
//! Entry point chính của ứng dụng Tauri

#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use vi_chi::{
  database,
  models::*,
  giao_dich,
  danh_muc,
  ngan_sach,
  bao_cao,
  sao_luu,
};

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let handle = app.handle().clone();
      // Chạy migration khi ứng dụng khởi động
      database::run_migrations(&handle).expect("Không thể chạy migration");
      // Khởi tạo danh mục mặc định
      danh_muc::khoi_tao_danh_muc_mac_dinh(handle).expect("Không thể khởi tạo danh mục mặc định");
      Ok(())
    })
    .plugin(tauri_plugin_sql::Builder::default().build())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![
      // Giao dịch
      giao_dich::lay_giao_dich,
      giao_dich::them_giao_dich,
      giao_dich::cap_nhat_giao_dich,
      giao_dich::xoa_giao_dich,
      // Danh mục
      danh_muc::lay_danh_muc,
      danh_muc::them_danh_muc,
      danh_muc::cap_nhat_danh_muc,
      danh_muc::xoa_danh_muc,
      danh_muc::khoi_tao_danh_muc_mac_dinh,
      // Ngân sách
      ngan_sach::lay_ngan_sach,
      ngan_sach::luu_ngan_sach,
      ngan_sach::xoa_ngan_sach,
      // Báo cáo
      bao_cao::lay_tong_quan,
      bao_cao::lay_bao_cao_thang,
      bao_cao::lay_bao_cao_nam,
      bao_cao::lay_chi_tieu_theo_danh_muc,
      bao_cao::xuat_csv,
      // Sao lưu
      sao_luu::sao_luu_du_lieu,
      sao_luu::khoi_phuc_du_lieu,
    ])
    .run(tauri::generate_context!())
    .expect("Lỗi khi chạy ứng dụng Vi Chi");
}