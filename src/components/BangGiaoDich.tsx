// Vi Chi - Component Bảng giao dịch

import { useDinhDang } from '../hooks';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import type { GiaoDich, DanhMuc, LoaiGiaoDich } from '../types';
import { HopThoaiXacNhan } from './HopThoaiXacNhan';
import { useState } from 'react';

interface BangGiaoDichProps {
  duLieu: GiaoDich[];
  danhMucMap: Map<number, DanhMuc>;
  dangTai?: boolean;
  onSua: (giaoDich: GiaoDich) => void;
  onXoa: (id: number) => void;
  onXemChiTiet?: (giaoDich: GiaoDich) => void;
}

function getLoaiLabel(loai: LoaiGiaoDich) {
  return loai === 'income' ? 'Thu nhập' : 'Chi tiêu';
}

function getLoaiClass(loai: LoaiGiaoDich) {
  return loai === 'income' ? 'badge-success' : 'badge-danger';
}

export function BangGiaoDich({
  duLieu,
  danhMucMap,
  dangTai = false,
  onSua,
  onXoa,
  onXemChiTiet,
}: BangGiaoDichProps) {
  const { tien, ngay } = useDinhDang();
  const [xoaId, setXoaId] = useState<number | null>(null);

  if (dangTai) {
    return (
      <div className="table-wrapper">
        <table className="table" role="table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Loại</th>
              <th>Danh mục</th>
              <th>Số tiền</th>
              <th>Nội dung</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td><div className="skeleton skeleton-text" style={{ width: '80px' }} /></td>
                <td><div className="skeleton skeleton-text" style={{ width: '60px' }} /></td>
                <td><div className="skeleton skeleton-text" style={{ width: '100px' }} /></td>
                <td><div className="skeleton skeleton-text" style={{ width: '90px' }} /></td>
                <td><div className="skeleton skeleton-text" style={{ width: '150px' }} /></td>
                <td><div className="skeleton skeleton-text" style={{ width: '80px' }} /></td>
                <td><div className="skeleton skeleton-text" style={{ width: '80px' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (duLieu.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.3 }}>
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="empty-state-title">Chưa có giao dịch</h3>
        <p className="empty-state-message">Hãy thêm giao dịch đầu tiên để bắt đầu theo dõi chi tiêu</p>
      </div>
    );
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="table" role="table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Loại</th>
              <th>Danh mục</th>
              <th className="text-right">Số tiền</th>
              <th>Nội dung</th>
              <th>Ghi chú</th>
              <th style={{ width: '80px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {duLieu.map((gd) => {
              const dm = danhMucMap.get(gd.danh_muc_id);
              return (
                <tr key={gd.id} onClick={() => onXemChiTiet?.(gd)} style={{ cursor: onXemChiTiet ? 'pointer' : 'default' }}>
                  <td>{ngay(gd.ngay_giao_dich)}</td>
                  <td>
                    <span className={`badge ${getLoaiClass(gd.loai)}`}>
                      {getLoaiLabel(gd.loai)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {dm && (
                        <span
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: `${dm.mau_sac}20`,
                            color: dm.mau_sac,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--text-sm)',
                          }}
                        >
                          {dm.bieu_tuong}
                        </span>
                      )}
                      <span>{dm?.ten || 'Không xác định'}</span>
                    </div>
                  </td>
                  <td className="text-right" style={{ fontWeight: 'var(--font-medium)', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: gd.loai === 'income' ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                      {gd.loai === 'income' ? '+' : '-'}{tien(gd.so_tien)}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {gd.mo_ta}
                  </td>
                  <td style={{ maxWidth: '150px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>
                    {gd.ghi_chu || '—'}
                  </td>
                  <td>
                    <div className="dropdown">
                      <button
                        className="btn btn-ghost btn-icon"
                        aria-label="Tùy chọn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      <div className="dropdown-menu">
                        <button
                          className="dropdown-item"
                          onClick={(e) => { e.stopPropagation(); onSua(gd); }}
                        >
                          <Edit size={16} /> Chỉnh sửa
                        </button>
                        <button
                          className="dropdown-item dropdown-item-danger"
                          onClick={(e) => { e.stopPropagation(); setXoaId(gd.id); }}
                        >
                          <Trash2 size={16} /> Xóa
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <HopThoaiXacNhan
        mo={xoaId !== null}
        tieuDe="Xác nhận xóa"
        noiDung="Bạn có chắc chắn muốn xóa giao dịch này? Hành động này không thể hoàn tác."
        nutXacNhan="Xóa"
        loaiNutXacNhan="danger"
        onXacNhan={() => { onXoa(xoaId!); setXoaId(null); }}
        onHuy={() => setXoaId(null)}
      />
    </>
  );
}