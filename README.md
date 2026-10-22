# Vi Chi - Ứng Dụng Quản Lý Chi Tiêu Cá Nhân

Ứng dụng desktop quản lý thu chi, ngân sách, thống kê và báo cáo tài chính cá nhân cho Ubuntu Linux.

## Tính năng chính

- 📊 **Tổng quan tài chính**: Thu nhập, chi tiêu, chênh lệch, ngân sách
- 💳 **Quản lý giao dịch**: Thêm, sửa, xóa, tìm kiếm, lọc giao dịch
- 💰 **Ngân sách**: Thiết lập hạn mức theo danh mục/tháng, cảnh báo
- 📈 **Báo cáo & Biểu đồ**: Theo tháng, năm, theo danh mục, xuất CSV
- 🏷️ **Danh mục**: Tùy chỉnh danh mục thu/chi với biểu tượng, màu sắc
- 💾 **Sao lưu & Khôi phục**: Tự động sao lưu, khôi phục dữ liệu
- 🌙 **Giao diện tiếng Việt 100%**: Tiền VNĐ, ngày dd/MM/yyyy

## Công nghệ

- **Frontend**: React 18, TypeScript, Vite
- **Desktop**: Tauri 2 (Rust)
- **Database**: SQLite (qua tauri-plugin-sql)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: CSS Variables (Light theme)

## Yêu cầu hệ thống

- Ubuntu 22.04+ (hoặc tương thích)
- Node.js 18+ LTS
- Rust 1.70+
- Các thư viện hệ thống: `libwebkit2gtk-4.1-0`, `libgtk-3-0`, `libayatana-appindicator3-1`, `librsvg2-common`

## Cài đặt phát triển

```bash
# Clone repository
cd vi-chi

# Cài đặt dependencies
npm install

# Chạy development mode
npm run tauri dev
```

## Build production

```bash
# Build ứng dụng
npm run tauri build

# File output sẽ ở: src-tauri/target/release/bundle/
```

## Cấu trúc thư mục

```
vi-chi/
├── src/                    # Frontend React
│   ├── components/         # UI Components
│   ├── pages/              # Page Components
│   ├── services/           # Tauri API calls
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── i18n/               # Translations (Vietnamese)
│   └── styles/             # CSS styles
├── src-tauri/              # Backend Rust
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── lib.rs          # Library root
│   │   ├── database.rs     # DB connection
│   │   ├── models.rs       # Data models
│   │   ├── giao_dich.rs    # Transaction logic
│   │   ├── danh_muc.rs     # Category logic
│   │   ├── ngan_sach.rs    # Budget logic
│   │   ├── bao_cao.rs      # Report logic
│   │   └── sao_luu.rs      # Backup logic
│   ├── migrations/
│   │   └── 001_khoi_tao.sql
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## Lệnh Tauri

| Lệnh | Mô tả |
|------|-------|
| `lay_giao_dich` | Lấy danh sách giao dịch |
| `them_giao_dich` | Thêm giao dịch mới |
| `cap_nhat_giao_dich` | Cập nhật giao dịch |
| `xoa_giao_dich` | Xóa giao dịch |
| `lay_danh_muc` | Lấy danh mục |
| `them_danh_muc` | Thêm danh mục |
| `cap_nhat_danh_muc` | Cập nhật danh mục |
| `xoa_danh_muc` | Xóa/Vô hiệu hóa danh mục |
| `lay_ngan_sach` | Lấy ngân sách tháng |
| `luu_ngan_sach` | Tạo/Cập nhật ngân sách |
| `lay_tong_quan` | Dữ liệu dashboard |
| `lay_bao_cao_thang` | Báo cáo theo tháng |
| `lay_bao_cao_nam` | Báo cáo theo năm |
| `lay_chi_tieu_theo_danh_muc` | Chi tiêu theo danh mục |
| `xuat_csv` | Xuất báo cáo CSV |
| `sao_luu_du_lieu` | Tạo bản sao lưu |
| `khoi_phuc_du_lieu` | Khôi phục từ sao lưu |

## License

MIT