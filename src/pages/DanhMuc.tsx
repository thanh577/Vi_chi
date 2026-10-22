// Vi Chi - Trang Danh mục

import { useState, useEffect, useCallback } from 'react';
import { Plus, Tag, Trash2, Edit, Eye } from 'lucide-react';
import { useThongBao } from '../hooks/useToast';
import { layDanhMuc, themDanhMuc, capNhatDanhMuc, xoaDanhMuc, khoiTaoDanhMucMacDinh } from '../services/danhMuc';
import type { DanhMuc, YeuCauDanhMuc, LoaiGiaoDich } from '../types';
import { HopThoaiXacNhan } from '../components/HopThoaiXacNhan';

const BIEU_TUONG_MAC_DINH = [
  'utensils', 'car', 'home', 'zap', 'shopping-bag', 'heart-pulse',
  'graduation-cap', 'gamepad2', 'file-text', 'users', 'plane', 'more-horizontal',
  'briefcase', 'gift', 'clock', 'store', 'trending-up', 'plus-circle',
];

const MAU_SAC_MAC_DINH = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#ec4899', '#64748b', '#14b8a6', '#f43f5e', '#94a3b8',
  '#16a34a', '#15803d', '#166534', '#14532d', '#052e16', '#166534',
];

export function DanhMuc() {
  const { thongBaoThanhCong, thongBaoLoi } = useThongBao();
  const [tab, setTab] = useState<LoaiGiaoDich>('expense');
  const [dangTai, setDangTai] = useState(true);
  const [danhMucList, setDanhMucList] = useState<DanhMuc[]>([]);

  const [hienThiForm, setHienThiForm] = useState(false);
  const [dangChinhSua, setDangChinhSua] = useState<DanhMuc | null>(null);
  const [formData, setFormData] = useState<YeuCauDanhMuc>({
    ten: '',
    loai: 'expense',
    bieu_tuong: BIEU_TUONG_MAC_DINH[0],
    mau_sac: MAU_SAC_MAC_DINH[0],
  });
  const [loiForm, setLoiForm] = useState<string | null>(null);
  const [dangLuu, setDangLuu] = useState(false);

  const [xoaId, setXoaId] = useState<number | null>(null);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const dm = await layDanhMuc(tab);
      setDanhMucList(dm);
    } catch (error) {
      thongBaoLoi('Không thể tải danh mục');
    } finally {
      setDangTai(false);
    }
  }, [tab, thongBaoLoi]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  const handleTabThayDoi = (newTab: LoaiGiaoDich) => {
    setTab(newTab);
    setHienThiForm(false);
  };

  const handleMoFormThem = () => {
    setDangChinhSua(null);
    setFormData({
      ten: '',
      loai: tab,
      bieu_tuong: BIEU_TUONG_MAC_DINH[0],
      mau_sac: MAU_SAC_MAC_DINH[0],
    });
    setLoiForm(null);
    setHienThiForm(true);
  };

  const handleMoFormSua = (dm: DanhMuc) => {
    setDangChinhSua(dm);
    setFormData({
      ten: dm.ten,
      loai: dm.loai,
      bieu_tuong: dm.bieu_tuong,
      mau_sac: dm.mau_sac,
    });
    setLoiForm(null);
    setHienThiForm(true);
  };

  const handleDongForm = () => {
    setHienThiForm(false);
    setDangChinhSua(null);
  };

  const handleLuu = async () => {
    if (!formData.ten.trim()) {
      setLoiForm('Tên danh mục không được để trống');
      return;
    }
    if (!formData.bieu_tuong.trim()) {
      setLoiForm('Biểu tượng không được để trống');
      return;
    }
    if (!formData.mau_sac || !/^#[0-9A-Fa-f]{6}$/.test(formData.mau_sac)) {
      setLoiForm('Màu sắc không hợp lệ');
      return;
    }

    setDangLuu(true);
    try {
      if (dangChinhSua) {
        await capNhatDanhMuc(dangChinhSua.id, formData);
        thongBaoThanhCong('Đã cập nhật danh mục');
      } else {
        await themDanhMuc(formData);
        thongBaoThanhCong('Đã thêm danh mục');
      }
      handleDongForm();
      taiDuLieu();
    } catch (error) {
      thongBaoLoi(dangChinhSua ? 'Không thể cập nhật' : 'Không thể thêm danh mục');
    } finally {
      setDangLuu(false);
    }
  };

  const handleXoa = async (id: number) => {
    try {
      await xoaDanhMuc(id);
      thongBaoThanhCong('Đã xóa/vô hiệu hóa danh mục');
      taiDuLieu();
    } catch (error) {
      thongBaoLoi('Không thể xóa danh mục');
    }
  };

  const handleKhoiTaoMacDinh = async () => {
    try {
      const count = await khoiTaoDanhMucMacDinh();
      thongBaoThanhCong(`Đã khởi tạo ${count} danh mục mặc định`);
      taiDuLieu();
    } catch (error) {
      thongBaoLoi('Không thể khởi tạo danh mục mặc định');
    }
  };

  return (
    <div className="page-container" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            Danh mục
          </h1>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            Quản lý danh mục thu nhập và chi tiêu
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" onClick={handleKhoiTaoMacDinh} disabled={dangTai}>
            Khởi tạo mặc định
          </button>
          <button className="btn btn-primary" onClick={handleMoFormThem}>
            <Plus size={18} /> Thêm danh mục
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        <button
          className={`tab ${tab === 'expense' ? 'tab-active' : ''}`}
          onClick={() => handleTabThayDoi('expense')}
        >
          <Tag size={18} style={{ marginRight: 'var(--space-2)', color: 'var(--color-danger)' }} />
          Chi tiêu
        </button>
        <button
          className={`tab ${tab === 'income' ? 'tab-active' : ''}`}
          onClick={() => handleTabThayDoi('income')}
        >
          <Tag size={18} style={{ marginRight: 'var(--space-2)', color: 'var(--color-primary)' }} />
          Thu nhập
        </button>
      </div>

      {/* List */}
      <div className="card">
        <div className="card-content" style={{ padding: 0 }}>
          {dangTai ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
              <div className="spinner spinner-lg" />
            </div>
          ) : danhMucList.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
              <div className="empty-state-icon">🏷️</div>
              <h3 className="empty-state-title">Chưa có danh mục nào</h3>
              <p className="empty-state-message">Thêm danh mục để phân loại giao dịch</p>
              <button className="btn btn-primary" onClick={handleMoFormThem} style={{ marginTop: 'var(--space-4)' }}>
                <Plus size={18} /> Thêm danh mục đầu tiên
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {danhMucList.map((dm) => (
                <div
                  key={dm.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--space-4)',
                    borderBottom: '1px solid var(--border-light)',
                    gap: 'var(--space-4)',
                  }}
                >
                  <div
                    className="icon-wrapper"
                    style={{
                      backgroundColor: `${dm.mau_sac}20`,
                      color: dm.mau_sac,
                    }}
                  >
                    {dm.bieu_tuong}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                      {dm.ten}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: dm.loai === 'income' ? 'var(--color-primary-light)' : 'var(--color-danger-light)',
                          color: dm.loai === 'income' ? 'var(--color-primary)' : 'var(--color-danger)',
                        }}
                      >
                        {dm.loai === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                      </span>
                      {dm.la_mac_dinh && (
                        <span style={{ padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-tertiary)' }}>
                          Mặc định
                        </span>
                      )}
                      {!dm.kich_hoat && (
                        <span style={{ padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                          Đã vô hiệu hóa
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {!dm.la_mac_dinh && (
                      <>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => handleMoFormSua(dm)}
                          aria-label="Chỉnh sửa"
                          disabled={dangTai}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => setXoaId(dm.id)}
                          aria-label={dm.kich_hoat ? 'Xóa/Vô hiệu hóa' : 'Khôi phục'}
                          disabled={dangTai}
                        >
                          {dm.kich_hoat ? <Trash2 size={18} /> : <Eye size={18} />}
                        </button>
                      </>
                    )}
                    {dm.la_mac_dinh && (
                      <span style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-2)', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                        Không thể sửa/xóa
                      </span>
                    )}
                  </div>
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
              <h3 className="modal-title">{dangChinhSua ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}</h3>
              <button className="modal-close" onClick={handleDongForm}><Plus size={20} /></button>
            </div>
            <div className="modal-body">
              {loiForm && <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-3)', padding: 'var(--space-2)', backgroundColor: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)' }}>{loiForm}</div>}

              <div className="input-wrapper">
                <label className="input-label">Tên danh mục <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="Nhập tên danh mục"
                  value={formData.ten}
                  onChange={(e) => setFormData((p) => ({ ...p, ten: e.target.value }))}
                  maxLength={50}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Loại <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, padding: 'var(--space-3)', border: '1px solid', borderColor: formData.loai === 'income' ? 'var(--color-primary)' : 'var(--border-medium)', borderRadius: 'var(--radius-md)', backgroundColor: formData.loai === 'income' ? 'var(--color-primary-light)' : 'transparent', cursor: 'pointer' }}>
                    <input type="radio" name="loai" value="income" checked={formData.loai === 'income'} onChange={() => setFormData((p) => ({ ...p, loai: 'income' }))} style={{ accentColor: 'var(--color-primary)' }} />
                    <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-medium)' }}>Thu nhập</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, padding: 'var(--space-3)', border: '1px solid', borderColor: formData.loai === 'expense' ? 'var(--color-danger)' : 'var(--border-medium)', borderRadius: 'var(--radius-md)', backgroundColor: formData.loai === 'expense' ? 'var(--color-danger-light)' : 'transparent', cursor: 'pointer' }}>
                    <input type="radio" name="loai" value="expense" checked={formData.loai === 'expense'} onChange={() => setFormData((p) => ({ ...p, loai: 'expense' }))} style={{ accentColor: 'var(--color-danger)' }} />
                    <span style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-medium)' }}>Chi tiêu</span>
                  </label>
                </div>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Biểu tượng <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="Tên biểu tượng (ví dụ: utensils)"
                  value={formData.bieu_tuong}
                  onChange={(e) => setFormData((p) => ({ ...p, bieu_tuong: e.target.value }))}
                  maxLength={50}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                  {BIEU_TUONG_MAC_DINH.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`btn btn-sm ${formData.bieu_tuong === icon ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setFormData((p) => ({ ...p, bieu_tuong: icon }))}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Màu sắc <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <input
                    type="color"
                    className="input"
                    style={{ width: '60px', height: '40px', padding: 0, border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                    value={formData.mau_sac}
                    onChange={(e) => setFormData((p) => ({ ...p, mau_sac: e.target.value }))}
                  />
                  <input
                    type="text"
                    className="input"
                    style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                    placeholder="#ef4444"
                    value={formData.mau_sac}
                    onChange={(e) => setFormData((p) => ({ ...p, mau_sac: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                  {MAU_SAC_MAC_DINH.map((color) => (
                    <button
                      key={color}
                      type="button"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: color,
                        border: formData.mau_sac === color ? '2px solid var(--text-primary)' : '1px solid var(--border-medium)',
                        cursor: 'pointer',
                        transition: 'transform var(--transition-fast)',
                      }}
                      onClick={() => setFormData((p) => ({ ...p, mau_sac: color }))}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ))}
                </div>
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
        tieuDe={xoaId !== null ? 'Xác nhận' : ''}
        noiDung={
          xoaId !== null
            ? danhMucList.find((d) => d.id === xoaId)?.kich_hoat
              ? 'Bạn có chắc chắn muốn xóa/vô hiệu hóa danh mục này? Nếu đang được sử dụng, nó sẽ chỉ bị vô hiệu hóa.'
              : 'Bạn có chắc chắn muốn khôi phục danh mục này?'
            : ''
        }
        nutXacNhan={
          xoaId !== null
            ? danhMucList.find((d) => d.id === xoaId)?.kich_hoat
              ? 'Xóa/Vô hiệu hóa'
              : 'Khôi phục'
            : ''
        }
        loaiNutXacNhan={
          xoaId !== null && danhMucList.find((d) => d.id === xoaId)?.kich_hoat ? 'danger' : 'primary'
        }
        onXacNhan={() => { handleXoa(xoaId!); setXoaId(null); }}
        onHuy={() => setXoaId(null)}
      />
    </div>
  );
}