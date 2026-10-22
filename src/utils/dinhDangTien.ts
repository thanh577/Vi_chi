// Vi Chi - Định dạng tiền tệ VNĐ

/**
 * Định dạng số tiền thành chuỗi VNĐ
 * Ví dụ: 50000 -> "50.000 ₫"
 */
export function dinhDangTien(soTien: number): string {
  if (soTien === 0) return '0 ₫';

  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(soTien);
}

/**
 * Định dạng số tiền ngắn gọn (cho biểu đồ, tooltip)
 * Ví dụ: 1500000 -> "1.500.000 ₫"
 */
export function dinhDangTienNganGon(soTien: number): string {
  return dinhDangTien(soTien);
}

/**
 * Parse chuỗi tiền tệ về số nguyên
 * Ví dụ: "50.000 ₫" -> 50000
 */
export function parseTien(chuoiTien: string): number {
  // Loại bỏ ký tự ₫, dấu chấm, khoảng trắng
  const so = chuoiTien.replace(/[₫\s.]/g, '');
  const ketQua = parseInt(so, 10);
  return isNaN(ketQua) ? 0 : ketQua;
}

/**
 * Định dạng số tiền cho input (chỉ số, không có ký tự ₫)
 * Ví dụ: 50000 -> "50.000"
 */
export function dinhDangTienInput(soTien: number): string {
  if (soTien === 0) return '';

  return new Intl.NumberFormat('vi-VN').format(soTien);
}

/**
 * Parse giá trị input tiền tệ về số nguyên
 * Ví dụ: "50.000" -> 50000
 */
export function parseTienInput(giaTri: string): number {
  const so = giaTri.replace(/\./g, '');
  const ketQua = parseInt(so, 10);
  return isNaN(ketQua) ? 0 : ketQua;
}

/**
 * Định dạng số tiền có dấu (dùng cho chênh lệch)
 * Ví dụ: 50000 -> "+50.000 ₫", -50000 -> "-50.000 ₫"
 */
export function dinhDangTienCoDau(soTien: number): string {
  const dau = soTien >= 0 ? '+' : '';
  return `${dau}${dinhDangTien(Math.abs(soTien))}`;
}