// Vi Chi - Component Thanh ngân sách

import { useDinhDang } from '../hooks';
import type { NganSachDayDu } from '../types';

interface ThanhNganSachProps {
  nganSach: NganSachDayDu;
  hienThiChiTiet?: boolean;
}

export function ThanhNganSach({ nganSach, hienThiChiTiet = true }: ThanhNganSachProps) {
  const { tien } = useDinhDang();

  const { ngan_sach, da_chi, con_lai, ty_le, trang_thai, danh_muc } = nganSach;
  const { han_muc } = ngan_sach;

  const getProgressColor = () => {
    switch (trang_thai) {
      case 'vuot_ngan_sach':
        return 'var(--color-danger)';
      case 'sap_het':
        return 'var(--color-warning)';
      default:
        return 'var(--color-primary)';
    }
  };

  const getProgressWidth = () => {
    return Math.min(ty_le, 100);
  };

  return (
    <div className="card" style={{ transition: 'box-shadow var(--transition-fast)' }}>
      <div className="card-content" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              className="icon-wrapper-sm"
              style={{
                backgroundColor: `${danh_muc.mau_sac}20`,
                color: danh_muc.mau_sac,
              }}
            >
              {danh_muc.bieu_tuong}
            </div>
            <div>
              <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                {danh_muc.ten}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {trang_thai === 'binh_thuong' && 'Bình thường'}
                {trang_thai === 'sap_het' && 'Sắp hết ngân sách'}
                {trang_thai === 'vuot_ngan_sach' && 'Vượt ngân sách'}
              </div>
            </div>
          </div>
          {hienThiChiTiet && (
            <div style={{ textAlign: 'right', minWidth: '100px' }}>
              <div style={{ fontWeight: 'var(--font-semibold)', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {tien(da_chi)} / {tien(han_muc)}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {ty_le.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        <div className="progress" style={{ height: '10px' }}>
          <div
            className="progress-bar"
            style={{
              width: `${getProgressWidth()}%`,
              backgroundColor: getProgressColor(),
            }}
          />
        </div>

        {hienThiChiTiet && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>
              Hạn mức: {tien(han_muc)}
            </span>
            <span style={{ color: con_lai >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
              Còn lại: {tien(Math.abs(con_lai))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}