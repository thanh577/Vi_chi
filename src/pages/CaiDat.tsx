// Vi Chi - Trang Cài đặt

import { useState, useCallback } from 'react';
import { Download, Upload, Database, Shield, Info, Trash2, AlertTriangle } from 'lucide-react';
import { useThongBao } from '../hooks/useToast';
import { saoLuuDuLieu, khoiPhucDuLieu, layDanhSachSaoLuu, xoaSaoLuu } from '../services/saoLuu';
import type { ThongTinSaoLuu } from '../types';
import { HopThoaiXacNhan } from '../components/HopThoaiXacNhan';
import { dinhDangNgay } from '../utils';

export function CaiDat() {
  const { thongBaoThanhCong, thongBaoLoi, thongBaoCanhBao, thongBaoThongTin } = useThongBao();
  const [tab, setTab] = useState<'chung' | 'sao_luu' | 'thong_tin'>('chung');
  const [dangTai, _setDangTai] = useState(false);
  const [dangSaoLuu, setDangSaoLuu] = useState(false);
  const [dangKhoiPhuc, setDangKhoiPhuc] = useState(false);
  const [danhSachSaoLuu, setDanhSachSaoLuu] = useState<ThongTinSaoLuu[]>([]);
  const [hienThiDanhSachSaoLuu, setHienThiDanhSachSaoLuu] = useState(false);

  const [xoaSaoLuuId, setXoaSaoLuuId] = useState<string | null>(null);
  const [khoiPhucFile, setKhoiPhucFile] = useState<string | null>(null);

  const taiDanhSachSaoLuu = useCallback(async () => {
    try {
      const ds = await layDanhSachSaoLuu();
      setDanhSachSaoLuu(ds);
    } catch (error) {
      thongBaoLoi('Không thể tải danh sách sao lưu');
    }
  }, [thongBaoLoi]);

  const handleSaoLuu = async () => {
    setDangSaoLuu(true);
    try {
      const info = await saoLuuDuLieu();
      thongBaoThanhCong('Đã sao lưu thành công', `Tệp: ${info.ten_tep} (${(info.kich_thuoc / 1024).toFixed(1)} KB)`);
      taiDanhSachSaoLuu();
    } catch (error) {
      thongBaoLoi('Không thể sao lưu dữ liệu');
    } finally {
      setDangSaoLuu(false);
    }
  };

  const handleKhoiPhuc = async (tenTep: string) => {
    setDangKhoiPhuc(true);
    try {
      await khoiPhucDuLieu(tenTep);
      thongBaoThanhCong('Đã khôi phục dữ liệu', 'Ứng dụng sẽ tải lại dữ liệu');
      // Reload page data would be needed here
    } catch (error) {
      thongBaoLoi('Không thể khôi phục dữ liệu');
    } finally {
      setDangKhoiPhuc(false);
      setKhoiPhucFile(null);
    }
  };

  const handleXoaSaoLuu = async (tenTep: string) => {
    try {
      await xoaSaoLuu(tenTep);
      thongBaoThanhCong('Đã xóa bản sao lưu');
      taiDanhSachSaoLuu();
    } catch (error) {
      thongBaoLoi('Không thể xóa bản sao lưu');
    }
  };

  const handleXuatDuLieu = async () => {
    // This would trigger the export from the BaoCao service
    thongBaoThongTin('Tính năng xuất dữ liệu', 'Vui lòng sử dụng trang Báo cáo để xuất dữ liệu CSV');
  };

  return (
    <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
          Cài đặt
        </h1>
        <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
          Tùy chỉnh ứng dụng và quản lý dữ liệu
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        <button className={`tab ${tab === 'chung' ? 'tab-active' : ''}`} onClick={() => setTab('chung')}>
          <Shield size={18} style={{ marginRight: 'var(--space-2)' }} />
          Chung
        </button>
        <button className={`tab ${tab === 'sao_luu' ? 'tab-active' : ''}`} onClick={() => setTab('sao_luu')}>
          <Database size={18} style={{ marginRight: 'var(--space-2)' }} />
          Sao lưu & Khôi phục
        </button>
        <button className={`tab ${tab === 'thong_tin' ? 'tab-active' : ''}`} onClick={() => setTab('thong_tin')}>
          <Info size={18} style={{ marginRight: 'var(--space-2)' }} />
          Thông tin
        </button>
      </div>

      {/* Tab content */}
      {tab === 'chung' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Language & Currency */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ngôn ngữ & Tiền tệ</h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
                <div className="input-wrapper">
                  <label className="input-label">Ngôn ngữ</label>
                  <select className="select" disabled>
                    <option value="vi">Tiếng Việt</option>
                  </select>
                  <p className="input-hint">Phiên bản hiện tại chỉ hỗ trợ tiếng Việt</p>
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Đơn vị tiền tệ</label>
                  <select className="select" disabled>
                    <option value="VND">VNĐ (Việt Nam Đồng)</option>
                  </select>
                  <p className="input-hint">Định dạng: 50.000 ₫</p>
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Ngày bắt đầu tháng ngân sách</label>
                  <select className="select" defaultValue="1">
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d.toString()}>Ngày {d}</option>
                    ))}
                  </select>
                  <p className="input-hint">Tháng ngân sách bắt đầu từ ngày này</p>
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Giao diện</label>
                  <select className="select" defaultValue="light">
                    <option value="light">Sáng (Light)</option>
                    <option value="dark">Tối (Dark) - Sắp có</option>
                  </select>
                  <p className="input-hint">Chế độ tối sẽ được cập nhật sau</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alert thresholds */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ngưỡng cảnh báo ngân sách</h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                <div className="input-wrapper">
                  <label className="input-label">Cảnh báo sắp hết (%)</label>
                  <input type="number" className="input" defaultValue={80} min={50} max={99} step={1} />
                  <p className="input-hint">Mặc định: 80%</p>
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Cảnh báo vượt ngân sách (%)</label>
                  <input type="number" className="input" defaultValue={100} min={100} max={200} step={1} />
                  <p className="input-hint">Mặc định: 100%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data management */}
          <div className="card" style={{ borderColor: 'var(--color-warning)', borderWidth: '2px' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
                Quản lý dữ liệu nguy hiểm
              </h3>
            </div>
            <div className="card-content">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Các thao tác dưới đây không thể hoàn tác. Hãy chắc chắn trước khi thực hiện.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <button className="btn btn-danger" onClick={() => thongBaoCanhBao('Tính năng phát triển', 'Xóa tất cả dữ liệu chưa được triển khai')}>
                  <Trash2 size={18} style={{ marginRight: 'var(--space-2)' }} />
                  Xóa tất cả dữ liệu
                </button>
                <button className="btn btn-secondary" onClick={handleXuatDuLieu}>
                  <Download size={18} style={{ marginRight: 'var(--space-2)' }} />
                  Xuất tất cả dữ liệu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'sao_luu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Create backup */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Tạo bản sao lưu mới</h3>
            </div>
            <div className="card-content">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Tạo bản sao lưu đầy đủ của cơ sở dữ liệu bao gồm tất cả giao dịch, danh mục và ngân sách.
              </p>
              <button
                className="btn btn-primary"
                onClick={handleSaoLuu}
                disabled={dangSaoLuu}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                {dangSaoLuu ? <span className="spinner spinner-sm" /> : <> <Download size={18} /> Tạo bản sao lưu </>}
              </button>
            </div>
          </div>

          {/* Backup list */}
          <div className="card">
            <div className="card-header flex-between">
              <h3 className="card-title">Danh sách bản sao lưu</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setHienThiDanhSachSaoLuu(!hienThiDanhSachSaoLuu); taiDanhSachSaoLuu(); }}
              >
                {hienThiDanhSachSaoLuu ? 'Ẩn' : 'Hiển thị'} danh sách
              </button>
            </div>
            {hienThiDanhSachSaoLuu && (
              <div className="card-content" style={{ paddingTop: 0 }}>
                {dangTai ? (
                  <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                    <div className="spinner" />
                  </div>
                ) : danhSachSaoLuu.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                    <div className="empty-state-icon">💾</div>
                    <h3 className="empty-state-title">Chưa có bản sao lưu nào</h3>
                    <p className="empty-state-message">Nhấn "Tạo bản sao lưu" để tạo bản sao lưu đầu tiên</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {danhSachSaoLuu.map((backup) => (
                      <div
                        key={backup.ten_tep}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-3) var(--space-4)',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <Database size={24} style={{ color: 'var(--color-primary)' }} />
                          <div>
                            <div style={{ fontWeight: 'var(--font-medium)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
                              {backup.ten_tep}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                              {dinhDangNgay(backup.ngay_tao)} • {(backup.kich_thuoc / 1024).toFixed(1)} KB •
                              {backup.so_luong_giao_dich} giao dịch, {backup.so_luong_danh_muc} danh mục, {backup.so_luong_ngan_sach} ngân sách
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setKhoiPhucFile(backup.ten_tep)}
                            disabled={dangKhoiPhuc}
                          >
                            Khôi phục
                          </button>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => setXoaSaoLuuId(backup.ten_tep)}
                            disabled={dangKhoiPhuc}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Restore from file */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Khôi phục từ tệp</h3>
            </div>
            <div className="card-content">
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Chọn tệp sao lưu (.db) từ máy tính để khôi phục dữ liệu.
              </p>
              <input
                type="file"
                accept=".db"
                className="input"
                style={{ marginBottom: 'var(--space-3)' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setKhoiPhucFile(file.name);
                }}
              />
              <button className="btn btn-secondary" disabled={!khoiPhucFile || dangKhoiPhuc}>
                <Upload size={18} style={{ marginRight: 'var(--space-2)' }} />
                Khôi phục từ tệp đã chọn
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'thong_tin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Thông tin ứng dụng</h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Tên ứng dụng</div>
                  <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-xl)' }}>Vi Chi</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Phiên bản</div>
                  <div style={{ fontWeight: 'var(--font-semibold)' }}>1.0.0</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Công nghệ</div>
                  <div style={{ fontWeight: 'var(--font-semibold)' }}>Tauri 2 + React + TypeScript</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Cơ sở dữ liệu</div>
                  <div style={{ fontWeight: 'var(--font-semibold)' }}>SQLite</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quyền riêng tư & An toàn</h3>
            </div>
            <div className="card-content">
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <Shield size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)' }}>Dữ liệu hoàn toàn cục bộ</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Không gửi dữ liệu tài chính lên máy chủ bên ngoài</div>
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <Shield size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)' }}>Không theo dõi người dùng</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Không có quảng cáo, không theo dõi hành vi</div>
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <Shield size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)' }}>Hoạt động ngoại tuyến</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Không cần kết nối internet để sử dụng</div>
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <Shield size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)' }}>Tự chủ động sao lưu</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Bạn có toàn quyền kiểm soát dữ liệu của mình</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Cảm ơn các thư viện mã nguồn mở</h3>
            </div>
            <div className="card-content">
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <li>Tauri - Framework ứng dụng desktop</li>
                <li>React & TypeScript - Giao diện người dùng</li>
                <li>Vite - Công cụ xây dựng</li>
                <li>SQLite - Cơ sở dữ liệu</li>
                <li>Recharts - Biểu đồ</li>
                <li>Lucide React - Biểu tượng</li>
                <li>date-fns - Xử lý ngày tháng (nếu dùng)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Confirm restore */}
      {khoiPhucFile && (
        <HopThoaiXacNhan
          mo={true}
          tieuDe="Xác nhận khôi phục"
          noiDung={`Bạn có chắc chắn muốn khôi phục dữ liệu từ "${khoiPhucFile}"? Dữ liệu hiện tại sẽ bị ghi đè và không thể hoàn tác.`}
          nutXacNhan="Khôi phục"
          loaiNutXacNhan="danger"
          onXacNhan={() => handleKhoiPhuc(khoiPhucFile!)}
          onHuy={() => setKhoiPhucFile(null)}
          dangXuLy={dangKhoiPhuc}
        />
      )}

      {/* Confirm delete backup */}
      {xoaSaoLuuId && (
        <HopThoaiXacNhan
          mo={true}
          tieuDe="Xác nhận xóa"
          noiDung={`Bạn có chắc chắn muốn xóa bản sao lưu "${xoaSaoLuuId}"?`}
          nutXacNhan="Xóa"
          loaiNutXacNhan="danger"
          onXacNhan={() => handleXoaSaoLuu(xoaSaoLuuId!)}
          onHuy={() => setXoaSaoLuuId(null)}
        />
      )}
    </div>
  );
}