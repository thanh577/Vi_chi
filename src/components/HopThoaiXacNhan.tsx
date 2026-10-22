// Vi Chi - Component Hộp thoại xác nhận

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HopThoaiXacNhanProps {
  mo: boolean;
  tieuDe: string;
  noiDung: string;
  nutXacNhan: string;
  nutHuy?: string;
  loaiNutXacNhan?: 'danger' | 'primary';
  onXacNhan: () => void | Promise<void>;
  onHuy: () => void;
  dangXuLy?: boolean;
}

export function HopThoaiXacNhan({
  mo,
  tieuDe,
  noiDung,
  nutXacNhan,
  nutHuy = 'Hủy',
  loaiNutXacNhan = 'danger',
  onXacNhan,
  onHuy,
  dangXuLy = false,
}: HopThoaiXacNhanProps) {
  const [hienThi, setHienThi] = useState(mo);

  useEffect(() => {
    setHienThi(mo);
  }, [mo]);

  if (!hienThi) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onHuy();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onHuy();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">{tieuDe}</h3>
          <button className="modal-close" onClick={onHuy} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{noiDung}</p>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onHuy}
            disabled={dangXuLy}
          >
            {nutHuy}
          </button>
          <button
            className={`btn ${loaiNutXacNhan === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onXacNhan}
            disabled={dangXuLy}
          >
            {dangXuLy ? 'Đang xử lý...' : nutXacNhan}
          </button>
        </div>
      </div>
    </div>
  );
}