// Vi Chi - Kiểm tra dữ liệu đầu vào

import type { LoaiGiaoDich, YeuCauThemGiaoDich, YeuCauDanhMuc, YeuCauNganSach } from '../types';

export interface KetQuaKiemTra {
  hopLe: boolean;
  loi?: string;
}

/**
 * Kiểm tra số tiền
 */
export function kiemTraSoTien(soTien: number): KetQuaKiemTra {
  if (!Number.isInteger(soTien)) {
    return { hopLe: false, loi: 'Số tiền phải là số nguyên' };
  }

  if (soTien <= 0) {
    return { hopLe: false, loi: 'Số tiền phải lớn hơn 0' };
  }

  if (soTien > 999999999999) {
    return { hopLe: false, loi: 'Số tiền quá lớn' };
  }

  return { hopLe: true };
}

/**
 * Kiểm tra nội dung giao dịch
 */
export function kiemTraMoTa(moTa: string): KetQuaKiemTra {
  const moTaTrim = moTa.trim();

  if (!moTaTrim) {
    return { hopLe: false, loi: 'Nội dung không được để trống' };
  }

  if (moTaTrim.length > 200) {
    return { hopLe: false, loi: 'Nội dung không được quá 200 ký tự' };
  }

  return { hopLe: true };
}

/**
 * Kiểm tra ghi chú
 */
export function kiemTraGhiChu(ghiChu?: string): KetQuaKiemTra {
  if (ghiChu && ghiChu.length > 500) {
    return { hopLe: false, loi: 'Ghi chú không được quá 500 ký tự' };
  }

  return { hopLe: true };
}

/**
 * Kiểm tra ngày giao dịch
 */
export function kiemTraNgayGiaoDich(ngay: string): KetQuaKiemTra {
  // Kiểm tra định dạng YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(ngay)) {
    return { hopLe: false, loi: 'Ngày không đúng định dạng (YYYY-MM-DD)' };
  }

  const date = new Date(ngay);
  if (isNaN(date.getTime())) {
    return { hopLe: false, loi: 'Ngày không hợp lệ' };
  }

  // Kiểm tra ngày không được trong tương lai xa (ví dụ: > 1 năm)
  const homNay = new Date();
  homNay.setHours(0, 0, 0, 0);
  const motNamSau = new Date(homNay);
  motNamSau.setFullYear(homNay.getFullYear() + 1);

  if (date > motNamSau) {
    return { hopLe: false, loi: 'Ngày giao dịch không được quá xa trong tương lai' };
  }

  return { hopLe: true };
}

/**
 * Kiểm tra tháng (YYYY-MM)
 */
export function kiemTraThang(thang: string): KetQuaKiemTra {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(thang)) {
    return { hopLe: false, loi: 'Tháng không đúng định dạng (YYYY-MM)' };
  }

  const [nam, th] = thang.split('-').map(Number);
  if (th < 1 || th > 12) {
    return { hopLe: false, loi: 'Tháng không hợp lệ (1-12)' };
  }

  if (nam < 2000 || nam > 2100) {
    return { hopLe: false, loi: 'Năm không hợp lệ' };
  }

  return { hopLe: true };
}

/**
 * Kiểm tra loại giao dịch
 */
export function kiemTraLoaiGiaoDich(loai: string): loai is LoaiGiaoDich {
  return loai === 'income' || loai === 'expense';
}

/**
 * Kiểm tra màu hex
 */
export function kiemTraMauHex(mau: string): KetQuaKiemTra {
  const regex = /^#[0-9A-Fa-f]{6}$/;
  if (!regex.test(mau)) {
    return { hopLe: false, loi: 'Màu sắc phải ở định dạng hex (ví dụ: #ef4444)' };
  }
  return { hopLe: true };
}

/**
 * Kiểm tra biểu tượng (icon name)
 */
export function kiemTraBieuTuong(bieuTuong: string): KetQuaKiemTra {
  if (!bieuTuong.trim()) {
    return { hopLe: false, loi: 'Biểu tượng không được để trống' };
  }

  if (bieuTuong.length > 50) {
    return { hopLe: false, loi: 'Tên biểu tượng quá dài' };
  }

  return { hopLe: true };
}

/**
 * Kiểm tra tên danh mục
 */
export function kiemTraTenDanhMuc(ten: string): KetQuaKiemTra {
  const tenTrim = ten.trim();

  if (!tenTrim) {
    return { hopLe: false, loi: 'Tên danh mục không được để trống' };
  }

  if (tenTrim.length > 50) {
    return { hopLe: false, loi: 'Tên danh mục không được quá 50 ký tự' };
  }

  return { hopLe: true };
}

/**
 * Kiểm tra toàn bộ giao dịch
 */
export function kiemTraGiaoDich(yeuCau: YeuCauThemGiaoDich): KetQuaKiemTra {
  if (!kiemTraLoaiGiaoDich(yeuCau.loai)) {
    return { hopLe: false, loi: 'Loại giao dịch không hợp lệ' };
  }

  const kiemTraSoTienKQ = kiemTraSoTien(yeuCau.so_tien);
  if (!kiemTraSoTienKQ.hopLe) return kiemTraSoTienKQ;

  const kiemTraMoTaKQ = kiemTraMoTa(yeuCau.mo_ta);
  if (!kiemTraMoTaKQ.hopLe) return kiemTraMoTaKQ;

  const kiemTraGhiChuKQ = kiemTraGhiChu(yeuCau.ghi_chu);
  if (!kiemTraGhiChuKQ.hopLe) return kiemTraGhiChuKQ;

  const kiemTraNgayKQ = kiemTraNgayGiaoDich(yeuCau.ngay_giao_dich);
  if (!kiemTraNgayKQ.hopLe) return kiemTraNgayKQ;

  if (!Number.isInteger(yeuCau.danh_muc_id) || yeuCau.danh_muc_id <= 0) {
    return { hopLe: false, loi: 'Danh mục không hợp lệ' };
  }

  return { hopLe: true };
}

/**
 * Kiểm tra danh mục
 */
export function kiemTraDanhMuc(yeuCau: YeuCauDanhMuc): KetQuaKiemTra {
  if (!kiemTraLoaiGiaoDich(yeuCau.loai)) {
    return { hopLe: false, loi: 'Loại danh mục không hợp lệ' };
  }

  const kiemTraTenKQ = kiemTraTenDanhMuc(yeuCau.ten);
  if (!kiemTraTenKQ.hopLe) return kiemTraTenKQ;

  const kiemTraBieuTuongKQ = kiemTraBieuTuong(yeuCau.bieu_tuong);
  if (!kiemTraBieuTuongKQ.hopLe) return kiemTraBieuTuongKQ;

  const kiemTraMauKQ = kiemTraMauHex(yeuCau.mau_sac);
  if (!kiemTraMauKQ.hopLe) return kiemTraMauKQ;

  return { hopLe: true };
}

/**
 * Kiểm tra ngân sách
 */
export function kiemTraNganSach(yeuCau: YeuCauNganSach): KetQuaKiemTra {
  if (!Number.isInteger(yeuCau.danh_muc_id) || yeuCau.danh_muc_id <= 0) {
    return { hopLe: false, loi: 'Danh mục không hợp lệ' };
  }

  const kiemTraThangKQ = kiemTraThang(yeuCau.thang);
  if (!kiemTraThangKQ.hopLe) return kiemTraThangKQ;

  if (!Number.isInteger(yeuCau.han_muc) || yeuCau.han_muc < 0) {
    return { hopLe: false, loi: 'Hạn mức ngân sách không được âm' };
  }

  if (yeuCau.han_muc > 999999999999) {
    return { hopLe: false, loi: 'Hạn mức ngân sách quá lớn' };
  }

  return { hopLe: true };
}

/**
 * Kiểm tra email (dành cho tương lai)
 */
export function kiemTraEmail(email: string): KetQuaKiemTra {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { hopLe: false, loi: 'Email không hợp lệ' };
  }
  return { hopLe: true };
}

/**
 * Kiểm tra số điện thoại Việt Nam
 */
export function kiemTraSoDienThoaiVN(soDienThoai: string): KetQuaKiemTra {
  const regex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
  if (!regex.test(soDienThoai)) {
    return { hopLe: false, loi: 'Số điện thoại không hợp lệ' };
  }
  return { hopLe: true };
}