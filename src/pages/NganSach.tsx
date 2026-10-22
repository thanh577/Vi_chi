// Vi Chi - Trang Ngân sách

import { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDinhDang } from '../hooks';
import { useThongBao } from '../hooks/useToast';
import { ThanhNganSach } from '../components';
import { layNganSach, luuNganSach, xoaNganSach } from '../services/nganSach';
import { layDanhMuc } from '../services/danhMuc';
import type { NganSachDayDu, DanhMuc, YeuCauNganSach } from '../types';
import { HopThoaiXacNhan } from '../components/HopThoaiXacNhan';
import { thangHienTai } from '../utils/dinhDangNgay';

export function NganSach() {
  const { tien, thangDayDu } = useDinhDang();
  const { thongBaoThanhCong, thongBaoLoi } = useThongBao();
  const [thang, setThang] = useState(thangHienTai());
  const [dangTai, setDangTai] = useState(true);
  const [nganSachList, setNganSachList] = useState<NganSachDayDu[]>([]);
  const [danhMucList, setDanhMucList] = useState<DanhMuc[]>([]);

  const [hienThiForm, setHienThiForm] = useState(false);
  const [dangChinhSua, setDangChinhSua] = useState<NganSachDayDu | null>(null);
  const [formData, setFormData] = useState<YeuCauNganSach>({
    danh_muc_id: 0,
    thang: thangHienTai(),
    han_muc: 0,
  });
  const [loiForm, setLoiForm] = useState<string | null>(null);
  const [dangLuu, setDangLuu] = useState(false);

  const [xoaId, setXoaId] = useState<number | null>(null);

  const taiDanhMuc = useCallback(async () => {
    try {
      const dm = await layDanhMuc('expense');
      setDanhMucList(dm.filter((d) => d.kich_hoat));
    } catch (error) {
      thongBaoLoi('Không thể tải danh mục');
    }
  }, [thongBaoLoi]);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const ns = await layNganSach(thang);
      setNganSachList(ns);
    } catch (error) {
      thongBaoLoi('Không thể tải ngân sách');
    } finally {
      setDangTai(false);
    }
  }, [thang, thongBaoLoi]);

  useEffect(() => {
    taiDanhMuc();
  }, [taiDanhMuc]);

  useEffect(() => {
    setFormData((p) => ({ ...p, thang }));
    taiDuLieu();
  }, [thang, taiDuLieu]);

  const handleThayDoiThang = (delta: number) => {
    const [nam, th] = thang.split('-').map(Number);
    const date = new Date(nam, th - 1 + delta, 1);
    const newThang = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    setThang(newThang);
  };

  const handleMoFormThem = () => {
    setDangChinhSua(null);
    setFormData({ danh_muc_id: 0, thang, han_muc: 0 });
    setLoiForm(null);
    setHienThiForm(true);
  };

  const handleDongForm = () => {
    setHienThiForm(false);
    setDangChinhSua(null);
  };

  const handleLuu = async () => {
    if (!formData.danh_muc_id) {
      setLoiForm('Vui lòng chọn danh mục');
      return;
    }
    if (formData.han_muc < 0) {
      setLoiForm('Hạn mức không được âm');
      return;
    }

    // Kiểm tra trùng lặp
    const tonTai = nganSachList.find(
      (ns) => ns.ngan_sach.danh_muc_id === formData.danh_muc_id && ns.ngan_sach.id !== dangChinhSua?.ngan_sach.id
    );
    if (tonTai && !dangChinhSua) {
      setLoiForm('Danh mục này đã có ngân sách cho tháng này');
      return;
    }

    setDangLuu(true);
    try {
      await luuNganSach(formData);
      thongBaoThanhCong(dangChinhSua ? 'Đã cập nhật ngân sách' : 'Đã thêm ngân sách');
      handleDongForm();
      taiDuLieu();
    } catch (error) {
      thongBaoLoi(dangChinhSua ? 'Không thể cập nhật' : 'Không thể thêm ngân sách');
    } finally {
      setDangLuu(false);
    }
  };

  const handleXoa = async (id: number) => {
    try {
      await xoaNganSach(id);
      thongBaoThanhCong('Đã xóa ngân sách');
      taiDuLieu();
    } catch (error) {
      thongBaoLoi('Không thể xóa ngân sách');
    }
  };

  const tongNganSach = nganSachList.reduce((sum, ns) => sum + ns.ngan_sach.han_muc, 0);
  const tongDaChi = nganSachList.reduce((sum, ns) => sum + ns.da_chi, 0);
  const tongConLai = tongNganSach - tongDaChi;

  return (
    <div className="page-container" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            Ngân sách
          </h1>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            Theo dõi hạn mức chi tiêu theo danh mục
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" onClick={() => handleThayDoiThang(-1)} aria-label="Tháng trước">
            <Calendar size={18} />
          </button>
          <span style={{ fontWeight: 'var(--font-semibold)', minWidth: '120px', textAlign: 'center' }}>
            {thangDayDu(thang)}
          </span>
          <button className="btn btn-secondary" onClick={() => handleThayDoiThang(1)} aria-label="Tháng sau">
            <Calendar size={18} />
          </button>
          <button className="btn btn-primary" onClick={handleMoFormThem}>
            <Plus size={18} /> Thêm ngân sách
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Tổng ngân sách</div>
            <div className="stat-value">{tien(tongNganSach)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Đã chi tiêu</div>
            <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{tien(tongDaChi)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Còn lại</div>
            <div className="stat-value" style={{ color: tongConLai >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
              {tien(Math.abs(tongConLai))}
            </div>
            <div className="stat-change" style={{ color: tongConLai >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
              {tongNganSach > 0 ? ((tongDaChi / tongNganSach) * 100).toFixed(1) : 0}% đã sử dụng
            </div>
          </div>
        </div>
      </div>

      {/* Budget list */}
      <div className="card">
        <div className="card-content" style={{ padding: 0 }}>
          {dangTai ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
              <div className="spinner spinner-lg" />
            </div>
          ) : nganSachList.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
              <div className="empty-state-icon">💰</div>
              <h3 className="empty-state-title">Chưa có ngân sách nào</h3>
              <p className="empty-state-message">Thiết lập ngân sách cho các danh mục chi tiêu để theo dõi tốt hơn</p>
              <button className="btn btn-primary" onClick={handleMoFormThem} style={{ marginTop: 'var(--space-4)' }}>
                <Plus size={18} /> Thiết lập ngân sách đầu tiên
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {nganSachList.map((ns) => (
                <div key={ns.ngan_sach.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <ThanhNganSach nganSach={ns} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form modal */}
      {hienThiForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleDongForm()}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{dangChinhSua ? 'Chỉnh sửa ngân sách' : 'Thêm ngân sách'}</h3>
              <button className="modal-close" onClick={handleDongForm}><Plus size={20} /></button>
            </div>
            <div className="modal-body">
              {loiForm && <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-3)', padding: 'var(--space-2)', backgroundColor: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)' }}>{loiForm}</div>}

              <div className="input-wrapper">
                <label className="input-label">Tháng <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input type="month" className="input" value={formData.thang} onChange={(e) => setFormData((p) => ({ ...p, thang: e.target.value }))} />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Danh mục <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <select className="select" value={formData.danh_muc_id} onChange={(e) => setFormData((p) => ({ ...p, danh_muc_id: parseInt(e.target.value) || 0 }))}>
                  <option value="0">Chọn danh mục</option>
                  {danhMucList.map((dm) => (
                    <option key={dm.id} value={dm.id}>
                      {dm.ten}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Hạn mức <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input
                  type="number"
                  className="input"
                  placeholder="Nhập hạn mức ngân sách"
                  value={formData.han_muc}
                  onChange={(e) => setFormData((p) => ({ ...p, han_muc: parseInt(e.target.value) || 0 }))}
                  min="0"
                  step="100000"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleDongForm} disabled={dangLuu}>Hủy</button>
              <button className="btn btn-primary" onClick={handleLuu} disabled={dangLuu}>
                {dangLuu ? 'Đang lưu...' : dangChinhSua ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      <HopThoaiXacNhan
        mo={xoaId !== null}
        tieuDe="Xác nhận xóa"
        noiDung="Bạn có chắc chắn muốn xóa ngân sách này?"
        nutXacNhan="Xóa"
        loaiNutXacNhan="danger"
        onXacNhan={() => { handleXoa(xoaId!); setXoaId(null); }}
        onHuy={() => setXoaId(null)}
      />
    </div>
  );
}