// Vi Chi - Hook quản lý toast/thông báo

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ThongBao } from '../types';

interface ToastContextType {
  thongBaos: ThongBao[];
  themThongBao: (thongBao: Omit<ThongBao, 'id'>) => void;
  xoaThongBao: (id: string) => void;
  xoaTatCa: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [thongBaos, setThongBaos] = useState<ThongBao[]>([]);

  const themThongBao = useCallback((thongBao: Omit<ThongBao, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 9);
    const newThongBao = { ...thongBao, id };
    setThongBaos((prev) => [...prev, newThongBao]);

    // Tự động xóa sau 5 giây
    setTimeout(() => {
      xoaThongBao(id);
    }, 5000);
  }, []);

  const xoaThongBao = useCallback((id: string) => {
    setThongBaos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const xoaTatCa = useCallback(() => {
    setThongBaos([]);
  }, []);

  return (
    <ToastContext.Provider value={{ thongBaos, themThongBao, xoaThongBao, xoaTatCa }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng trong ToastProvider');
  }
  return context;
}

// Convenience hooks
export function useThongBao() {
  const { themThongBao } = useToast();

  const thongBaoThanhCong = useCallback(
    (tieuDe: string, noiDung?: string) => {
      themThongBao({ loai: 'success', tieuDe, noiDung: noiDung || '' });
    },
    [themThongBao]
  );

  const thongBaoLoi = useCallback(
    (tieuDe: string, noiDung?: string) => {
      themThongBao({ loai: 'danger', tieuDe, noiDung: noiDung || '' });
    },
    [themThongBao]
  );

  const thongBaoCanhBao = useCallback(
    (tieuDe: string, noiDung?: string) => {
      themThongBao({ loai: 'warning', tieuDe, noiDung: noiDung || '' });
    },
    [themThongBao]
  );

  const thongBaoThongTin = useCallback(
    (tieuDe: string, noiDung?: string) => {
      themThongBao({ loai: 'info', tieuDe, noiDung: noiDung || '' });
    },
    [themThongBao]
  );

  return { thongBaoThanhCong, thongBaoLoi, thongBaoCanhBao, thongBaoThongTin };
}