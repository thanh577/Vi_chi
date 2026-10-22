// Vi Chi - Component Thẻ thống kê

import { useDinhDang } from '../hooks';

interface TheThongKeProps {
  tieuDe: string;
  giaTri: number;
  bieuTuong: React.ReactNode;
  mauBieuTuong: string;
  mauChu?: string;
  hienThiDau?: boolean;
  phanTram?: number;
  phanTramLabel?: string;
}

export function TheThongKe({
  tieuDe,
  giaTri,
  bieuTuong,
  mauBieuTuong,
  mauChu,
  hienThiDau = false,
  phanTram,
  phanTramLabel,
}: TheThongKeProps) {
  const { tien, tienCoDau } = useDinhDang();

  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{
          backgroundColor: `${mauBieuTuong}15`,
          color: mauBieuTuong,
        }}
      >
        {bieuTuong}
      </div>
      <div className="stat-content">
        <div className="stat-label">{tieuDe}</div>
        <div
          className="stat-value"
          style={{ color: mauChu || 'var(--text-primary)' }}
        >
          {hienThiDau ? tienCoDau(giaTri) : tien(giaTri)}
        </div>
        {phanTram !== undefined && phanTramLabel && (
          <div
            className="stat-change"
            style={{
              color:
                phanTram > 0
                  ? 'var(--color-danger)'
                  : phanTram < 0
                  ? 'var(--color-primary)'
                  : 'var(--text-tertiary)',
            }}
          >
            <span>{phanTram > 0 ? '▲' : phanTram < 0 ? '▼' : '●'}</span>
            <span>{Math.abs(phanTram).toFixed(1)}%</span>
            <span>{phanTramLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}