// Vi Chi - Trang Hướng dẫn sử dụng

import { BookOpen, HelpCircle, Download, Upload, Keyboard, AlertTriangle, Database } from 'lucide-react';

const mucLuc = [
  { id: 'gioi-thieu', tieuDe: '1. Vi Chi là gì?' },
  { id: 'cai-dat', tieuDe: '2. Cài đặt và khởi động' },
  { id: 'giao-dien', tieuDe: '3. Giao diện chính' },
  { id: 'giao-dich', tieuDe: '4. Thêm giao dịch mới' },
  { id: 'danh-muc', tieuDe: '5. Quản lý danh mục' },
  { id: 'ngan-sach', tieuDe: '6. Thiết lập ngân sách' },
  { id: 'bao-cao', tieuDe: '7. Tổng quan và báo cáo' },
  { id: 'sao-luu', tieuDe: '8. Sao lưu và khôi phục' },
  { id: 'phim-tat', tieuDe: '9. Phím tắt' },
  { id: 'loi', tieuDe: '10. Xử lý lỗi thường gặp' },
  { id: 'du-lieu', tieuDe: '11. Lưu ý về dữ liệu' },
];

function Muc({ id, tieuDe, children }: { id: string; tieuDe: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 'var(--space-8)' }}>
      <h2
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-4)',
          paddingBottom: 'var(--space-2)',
          borderBottom: '2px solid var(--color-primary-light)',
        }}
      >
        {tieuDe}
      </h2>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

function DanhSach({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}

export function HuongDan() {
  return (
    <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <div className="icon-wrapper" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
            <BookOpen size={24} />
          </div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            Hướng dẫn sử dụng Vi Chi
          </h1>
        </div>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Dành cho người mới bắt đầu — quản lý chi tiêu cá nhân đơn giản và an toàn.
        </p>
      </div>

      {/* Mục lục */}
      <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card-header">
          <h3 className="card-title">Mục lục</h3>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-2)' }}>
            {mucLuc.map((m) => (
              <a
                key={m.id}
                href={`#${m.id}`}
                style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}
              >
                {m.tieuDe}
              </a>
            ))}
          </div>
        </div>
      </div>

      <Muc id="gioi-thieu" tieuDe="1. Vi Chi là gì?">
        <p>
          Vi Chi là ứng dụng desktop quản lý chi tiêu cá nhân, giúp bạn ghi lại khoản thu/chi, phân loại theo danh mục,
          theo dõi ngân sách, xem báo cáo/biểu đồ và sao lưu dữ liệu. Dữ liệu lưu trên máy của bạn, không gửi lên Internet.
        </p>
      </Muc>

      <Muc id="cai-dat" tieuDe="2. Cài đặt và khởi động">
        <DanhSach
          items={[
            'Cài từ file .deb: sudo apt install ./quan_ly_chi_tieu_1.0.0_amd64.deb',
            'Chạy từ .AppImage: chmod +x ... && ./quan_ly_chi_tieu_1.0.0_amd64.AppImage',
            'Bản phát triển: cd vi-chi && npm install && npm run tauri dev',
          ]}
        />
        <p style={{ marginTop: 'var(--space-3)' }}>
          Sau khi cài xong, mở ứng dụng từ menu hệ thống (tìm "Vi Chi" hoặc "Quản Lý Chi Tiêu").
        </p>
      </Muc>

      <Muc id="giao-dien" tieuDe="3. Giao diện chính">
        <DanhSach
          items={[
            'Thanh điều hướng bên trái: Tổng quan, Giao dịch, Ngân sách, Báo cáo, Danh mục, Cài đặt.',
            'Khu vực chính: nội dung của mục đang chọn.',
            'Header: tên ứng dụng và tháng hiện tại.',
          ]}
        />
      </Muc>

      <Muc id="giao-dich" tieuDe="4. Thêm giao dịch mới">
        <DanhSach
          items={[
            'Vào mục Giao dịch.',
            'Nhấn Thêm giao dịch.',
            'Chọn loại: Thu nhập hoặc Chi tiêu.',
            'Nhập số tiền, danh mục, ngày giao dịch, mô tả (bắt buộc), ghi chú (tùy chọn).',
            'Nhấn Lưu.',
          ]}
        />
        <p style={{ marginTop: 'var(--space-3)' }}>
          Giao dịch sẽ xuất hiện trong danh sách và ảnh hưởng đến tổng quan/báo cáo.
        </p>
      </Muc>

      <Muc id="danh-muc" tieuDe="5. Quản lý danh mục">
        <DanhSach
          items={[
            'Vào mục Danh mục để xem các danh mục mặc định.',
            'Nhấn Thêm danh mục để tạo mới (tên, loại, biểu tượng, màu sắc).',
            'Có thể sửa/xóa danh mục do bạn tạo; danh mục mặc định không thể sửa/xóa.',
          ]}
        />
      </Muc>

      <Muc id="ngan-sach" tieuDe="6. Thiết lập ngân sách">
        <DanhSach
          items={[
            'Vào mục Ngân sách, chọn tháng cần thiết lập.',
            'Nhập hạn mức (VNĐ) cho từng danh mục chi tiêu.',
            'Nhấn Lưu.',
            'Cảnh báo khi đạt 80% (cảnh báo) hoặc 100% (vượt ngân sách).',
          ]}
        />
      </Muc>

      <Muc id="bao-cao" tieuDe="7. Tổng quan và báo cáo">
        <DanhSach
          items={[
            'Tổng quan: tổng thu, tổng chi, chênh lệch, tỷ lệ dùng ngân sách trong tháng.',
            'Báo cáo: biểu đồ theo tháng/năm và chi tiêu theo danh mục.',
            'Có thể xuất báo cáo CSV từ mục Báo cáo.',
          ]}
        />
      </Muc>

      <Muc id="sao-luu" tieuDe="8. Sao lưu và khôi phục">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Download size={18} />
          <strong>Sao lưu:</strong>
        </div>
        <DanhSach items={['Vào chức năng sao lưu.', 'Nhấn Tạo bản sao lưu.', 'File backup lưu trong thư mục dữ liệu ứng dụng.']} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 'var(--space-3) 0 var(--space-2)' }}>
          <Upload size={18} />
          <strong>Khôi phục:</strong>
        </div>
        <DanhSach items={['Chọn file backup hợp lệ.', 'Nhấn Khôi phục.', 'Dữ liệu hiện tại sẽ được thay thế bằng dữ liệu backup.']} />
        <p style={{ marginTop: 'var(--space-3)' }}>
          Khuyến nghị: tạo bản sao lưu định kỳ để tránh mất dữ liệu.
        </p>
      </Muc>

      <Muc id="phim-tat" tieuDe="9. Phím tắt">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Keyboard size={18} />
        </div>
        <DanhSach items={['Ctrl + 1..6: chuyển nhanh giữa các mục chính.', 'Esc: đóng sidebar (trên mobile).']} />
      </Muc>

      <Muc id="loi" tieuDe="10. Xử lý lỗi thường gặp">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <AlertTriangle size={18} />
        </div>
        <DanhSach
          items={[
            'Ứng dụng không mở cửa sổ: kiểm tra cài đặt, thử chạy từ terminal để xem lỗi.',
            'Không tải được dữ liệu: đảm bảo file DB không bị khóa, khởi động lại ứng dụng.',
            'Lỗi font/tiếng Việt: đảm bảo hệ thống có font tiếng Việt (thường có sẵn trên Ubuntu).',
          ]}
        />
      </Muc>

      <Muc id="du-lieu" tieuDe="11. Lưu ý về dữ liệu">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Database size={18} />
        </div>
        <DanhSach
          items={[
            'Dữ liệu lưu cục bộ trên máy, không đồng bộ đám mây.',
            'Xóa ứng dụng có thể xóa dữ liệu nếu không sao lưu trước.',
            'File cơ sở dữ liệu: ~/.local/share/com.thanhnv.vi-chi/vi-chi.db',
          ]}
        />
      </Muc>

      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
        <HelpCircle size={32} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>
          Chúc bạn sử dụng Vi Chi hiệu quả! Nếu cần thêm trợ giúp, hãy xem file HUONG_DAN_SU_DUNG.md trong thư mục dự án.
        </p>
      </div>
    </div>
  );
}
