// Vi Chi - Trang Giao dịch

import { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useThongBao } from '../hooks/useToast';
import { BangGiaoDich } from '../components';
import { layGiaoDich, themGiaoDich, capNhatGiaoDich, xoaGiaoDich } from '../services/giaoDich';
import { layDanhMuc } from '../services/danhMuc';
import type { GiaoDich, DanhMuc, BoLocGiaoDich, LoaiGiaoDich, YeuCauThemGiaoDich } from '../types';
import { HopThoaiXacNhan } from '../components/HopThoaiXacNhan';
import { homNay } from '../utils/dinhDangNgay';

export function GiaoDich() {
  const { thongBaoThanhCong, thongBaoLoi } = useThongBao();
  const [dangTai, setDangTai] = useState(true);
  const [duLieu, setDuLieu] = useState<GiaoDich[]>([]);
  const [danhMucMap, setDanhMucMap] = useState<Map<number, DanhMuc>>(new Map());
  const [tongSo, setTongSo] = useState(0);
  const [trang, setTrang] = useState(1);
  const [tongTrang, setTongTrang] = useState(1);

  const [boLoc, setBoLoc] = useState<BoLocGiaoDich>({
    trang: 1,
    kich_thuoc_trang: 20,
  });

  const [hienThiForm, setHienThiForm] = useState(false);
  const [dangChinhSua, setDangChinhSua] = useState<GiaoDich | null>(null);
  const [formData, setFormData] = useState<YeuCauThemGiaoDich>({
    loai: 'expense',
    so_tien: 0,
    danh_muc_id: 0,
    ngay_giao_dich: homNay(),
    mo_ta: '',
    ghi_chu: '',
  });
  const [loiForm, setLoiForm] = useState<string | null>(null);
  const [dangLuu, setDangLuu] = useState(false);

  const [xoaId, setXoaId] = useState<number | null>(null);

  const taiDanhMuc = useCallback(async () => {
    try {
      const dm = await layDanhMuc();
      setDanhMucMap(new Map(dm.map((d) => [d.id, d])));
    } catch (error) {
      thongBaoLoi('Không thể tải danh mục');
    }
  }, [thongBaoLoi]);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const ketQua = await layGiaoDich({ ...boLoc, trang });
      setDuLieu(ketQua.du_lieu);
      setTongSo(ketQua.tong_so);
      setTongTrang(ketQua.tong_trang);
    } catch (error) {
      thongBaoLoi('Không thể tải giao dịch');
    } finally {
      setDangTai(false);
    }
  }, [boLoc, trang, layGiaoDich, thongBaoLoi]);

  useEffect(() => {
    taiDanhMuc();
  }, [taiDanhMuc]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  const handleLocThayDoi = (newLoc: Partial<BoLocGiaoDich>) => {
    setBoLoc((prev) => ({ ...prev, ...newLoc, trang: 1 }));
    setTrang(1);
  };

  const handleMoFormThem = () => {
    setDangChinhSua(null);
    setFormData({
      loai: 'expense',
      so_tien: 0,
      danh_muc_id: 0,
      ngay_giao_dich: homNay(),
      mo_ta: '',
      ghi_chu: '',
    });
    setLoiForm(null);
    setHienThiForm(true);
  };

  const handleMoFormSua = (gd: GiaoDich) => {
    setDangChinhSua(gd);
    setFormData({
      loai: gd.loai,
      so_tien: gd.so_tien,
      danh_muc_id: gd.danh_muc_id,
      ngay_giao_dich: gd.ngay_giao_dich,
      mo_ta: gd.mo_ta,
      ghi_chu: gd.ghi_chu || '',
    });
    setLoiForm(null);
    setHienThiForm(true);
  };

  const handleDongForm = () => {
    setHienThiForm(false);
    setDangChinhSua(null);
  };

  const handleLuu = async () => {
    if (!formData.so_tien || formData.so_tien <= 0) {
      setLoiForm('Số tiền phải lớn hơn 0');
      return;
    }
    if (!formData.danh_muc_id) {
      setLoiForm('Vui lòng chọn danh mục');
      return;
    }
    if (!formData.mo_ta.trim()) {
      setLoiForm('Vui lòng nhập nội dung');
      return;
    }

    setDangLuu(true);
    try {
      if (dangChinhSua) {
        await capNhatGiaoDich({ id: dangChinhSua.id, ...formData });
        thongBaoThanhCong('Đã cập nhật giao dịch');
      } else {
        await themGiaoDich(formData);
        thongBaoThanhCong('Đã thêm giao dịch');
      }
      handleDongForm();
      taiDuLieu();
    } catch (error) {
      thongBaoLoi(dangChinhSua ? 'Không thể cập nhật' : 'Không thể thêm giao dịch');
    } finally {
      setDangLuu(false);
    }
  };

  const handleXoa = async (id: number) => {
    try {
      await xoaGiaoDich(id);
      thongBaoThanhCong('Đã xóa giao dịch');
      taiDuLieu();
    } catch (error) {
      thongBaoLoi('Không thể xóa giao dịch');
    }
  };

  const danhMucChiTieu = Array.from(danhMucMap.values()).filter((d) => d.loai === 'expense' && d.kich_hoat);
  const danhMucThuNhap = Array.from(danhMucMap.values()).filter((d) => d.loai === 'income' && d.kich_hoat);

  return (
    <div className="page-container" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            Giao dịch
          </h1>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            Quản lý thu nhập và chi tiêu
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleMoFormThem}>
          <Plus size={18} /> Thêm giao dịch
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card-content" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="input-label">Tìm kiếm</label>
              <input
                type="text"
                className="input"
                placeholder="Tìm kiếm theo nội dung..."
                value={boLoc.tu_khoa || ''}
                onChange={(e) => handleLocThayDoi({ tu_khoa: e.target.value })}
              />
            </div>
            <div style={{ minWidth: '150px' }}>
              <label className="input-label">Loại</label>
              <select className="select" value={boLoc.loai || ''} onChange={(e) => handleLocThayDoi({ loai: e.target.value as LoaiGiaoDich || undefined })}>
                <option value="">Tất cả</option>
                <option value="income">Thu nhập</option>
                <option value="expense">Chi tiêu</option>
              </select>
            </div>
            <div style={{ minWidth: '180px' }}>
              <label className="input-label">Danh mục</label>
              <select className="select" value={boLoc.danh_muc_id?.toString() || ''} onChange={(e) => handleLocThayDoi({ danh_muc_id: e.target.value ? parseInt(e.target.value) : undefined })}>
                <option value="">Tất cả danh mục</option>
                {Array.from(danhMucMap.values()).map((dm) => (
                  <option key={dm.id} value={dm.id}>{dm.ten}</option>
                ))}
              </select>
            </div>
            <div style={{ minWidth: '150px' }}>
              <label className="input-label">Từ ngày</label>
              <input type="date" className="input" value={boLoc.tu_ngay || ''} onChange={(e) => handleLocThayDoi({ tu_ngay: e.target.value || undefined })} />
            </div>
            <div style={{ minWidth: '150px' }}>
              <label className="input-label">Đến ngày</label>
              <input type="date" className="input" value={boLoc.den_ngay || ''} onChange={(e) => handleLocThayDoi({ den_ngay: e.target.value || undefined })} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-content" style={{ padding: 0 }}>
          <BangGiaoDich
            duLieu={duLieu}
            danhMucMap={danhMucMap}
            dangTai={dangTai}
            onSua={handleMoFormSua}
            onXoa={(id) => setXoaId(id)}
            onXemChiTiet={handleMoFormSua}
          />
        </div>

        {/* Pagination */}
        {tongTrang > 1 && (
          <div className="card-footer" style={{ justifyContent: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setTrang((p) => Math.max(1, p - 1))}
              disabled={trang === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 var(--space-4)', color: 'var(--text-secondary)' }}>
              Trang {trang} / {tongTrang} (Tổng {tongSo} giao dịch)
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setTrang((p) => Math.min(tongTrang, p + 1))}
              disabled={trang === tongTrang}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Form modal */}
      {hienThiForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleDongForm()}>
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{dangChinhSua ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch'}</h3>
              <button className="modal-close" onClick={handleDongForm}><ChevronLeft size={20} /></button>
            </div>
            <div className="modal-body">
              {loiForm && <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-3)', padding: 'var(--space-2)', backgroundColor: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)' }}>{loiForm}</div>}

              <div className="input-wrapper">
                <label className="input-label">Loại giao dịch</label>
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
                <label className="input-label">Số tiền <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input
                  type="number"
                  className="input"
                  placeholder="Nhập số tiền"
                  value={formData.so_tien}
                  onChange={(e) => setFormData((p) => ({ ...p, so_tien: parseInt(e.target.value) || 0 }))}
                  min="1"
                  step="1000"
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Danh mục <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <select
                  className="select"
                  value={formData.danh_muc_id}
                  onChange={(e) => setFormData((p) => ({ ...p, danh_muc_id: parseInt(e.target.value) || 0 }))}
                >
                  <option value="0">Chọn danh mục</option>
                  {(formData.loai === 'expense' ? danhMucChiTieu : danhMucThuNhap).map((dm) => (
                    <option key={dm.id} value={dm.id}>{dm.ten}</option>
                  ))}
                </select>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Ngày giao dịch <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input
                  type="date"
                  className="input"
                  value={formData.ngay_giao_dich}
                  onChange={(e) => setFormData((p) => ({ ...p, ngay_giao_dich: e.target.value }))}
                  max={homNay()}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Nội dung <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="Nhập nội dung giao dịch"
                  value={formData.mo_ta}
                  onChange={(e) => setFormData((p) => ({ ...p, mo_ta: e.target.value }))}
                  maxLength={200}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Ghi chú</label>
                <textarea
                  className="input"
                  placeholder="Nhập ghi chú (tùy chọn)"
                  value={formData.ghi_chu}
                  onChange={(e) => setFormData((p) => ({ ...p, ghi_chu: e.target.value }))}
                  rows={3}
                  maxLength={500}
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
        noiDung="Bạn có chắc chắn muốn xóa giao dịch này? Hành động này không thể hoàn tác."
        nutXacNhan="Xóa"
        loaiNutXacNhan="danger"
        onXacNhan={() => { handleXoa(xoaId!); setXoaId(null); }}
        onHuy={() => setXoaId(null)}
      />
    </div>
  );
}