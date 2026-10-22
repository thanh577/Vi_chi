// Vi Chi - Component Thông báo (Toast)

import { useToast } from '../hooks';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { ThongBao } from '../types';

function ToastItem({ thongBao, onClose }: { thongBao: ThongBao; onClose: () => void }) {
  const iconMap = {
    success: CheckCircle,
    danger: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colorMap = {
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  };

  const Icon = iconMap[thongBao.loai];

  return (
    <div className={`toast toast-${thongBao.loai} animate-slide-in-right`} role="alert">
      <Icon className={`toast-icon ${colorMap[thongBao.loai]}`} size={20} />
      <div className="toast-content">
        {thongBao.tieuDe && <div className="toast-title">{thongBao.tieuDe}</div>}
        {thongBao.noiDung && <p className="toast-message">{thongBao.noiDung}</p>}
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Đóng thông báo">
        <X size={16} />
      </button>
    </div>
  );
}

export function Toaster() {
  const { thongBaos, xoaThongBao } = useToast();

  if (thongBaos.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {thongBaos.map((thongBao) => (
        <ToastItem key={thongBao.id} thongBao={thongBao} onClose={() => xoaThongBao(thongBao.id)} />
      ))}
    </div>
  );
}