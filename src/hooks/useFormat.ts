// Vi Chi - Hook định dạng tiền và ngày

import { useMemo } from 'react';
import { dinhDangTien, dinhDangTienCoDau, dinhDangNgay, dinhDangThang, dinhDangThangDayDu } from '../utils';

export function useDinhDang() {
  const formatTien = useMemo(() => dinhDangTien, []);
  const formatTienCoDau = useMemo(() => dinhDangTienCoDau, []);
  const formatNgay = useMemo(() => dinhDangNgay, []);
  const formatThang = useMemo(() => dinhDangThang, []);
  const formatThangDayDu = useMemo(() => dinhDangThangDayDu, []);
  const formatNam = useMemo(() => () => new Date().getFullYear(), []);

  return {
    tien: formatTien,
    tienCoDau: formatTienCoDau,
    ngay: formatNgay,
    thang: formatThang,
    thangDayDu: formatThangDayDu,
    nam: formatNam,
  };
}