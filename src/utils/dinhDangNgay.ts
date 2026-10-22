// Vi Chi - Định dạng ngày tháng

/**
 * Định dạng ngày theo chuẩn Việt Nam (dd/MM/yyyy)
 * Ví dụ: "2026-10-20" -> "20/10/2026"
 */
export function dinhDangNgay(ngay: string | Date): string {
  const date = typeof ngay === 'string' ? new Date(ngay) : ngay;

  if (isNaN(date.getTime())) {
    return 'Ngày không hợp lệ';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Định dạng ngày tháng năm đầy đủ
 * Ví dụ: "2026-10-20" -> "Thứ 3, 20/10/2026"
 */
export function dinhDangNgayDayDu(ngay: string | Date): string {
  const date = typeof ngay === 'string' ? new Date(ngay) : ngay;

  if (isNaN(date.getTime())) {
    return 'Ngày không hợp lệ';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Định dạng tháng năm (MM/yyyy)
 * Ví dụ: "2026-10" -> "10/2026"
 */
export function dinhDangThang(thang: string): string {
  // Input format: YYYY-MM
  const [nam, th] = thang.split('-');
  if (!nam || !th) return thang;

  const date = new Date(parseInt(nam), parseInt(th) - 1, 1);
  if (isNaN(date.getTime())) return thang;

  return new Intl.DateTimeFormat('vi-VN', {
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Định dạng tháng năm đầy đủ
 * Ví dụ: "2026-10" -> "Tháng 10 năm 2026"
 */
export function dinhDangThangDayDu(thang: string): string {
  const [nam, th] = thang.split('-');
  if (!nam || !th) return thang;

  return `Tháng ${parseInt(th, 10)} năm ${nam}`;
}

/**
 * Parse chuỗi ngày dd/MM/yyyy về Date
 */
export function parseNgayVN(chuoi: string): Date | null {
  const parts = chuoi.split('/');
  if (parts.length !== 3) return null;

  const ngay = parseInt(parts[0], 10);
  const thang = parseInt(parts[1], 10);
  const nam = parseInt(parts[2], 10);

  if (isNaN(ngay) || isNaN(thang) || isNaN(nam)) return null;

  const date = new Date(nam, thang - 1, ngay);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Lấy chuỗi YYYY-MM-DD từ Date
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Lấy chuỗi YYYY-MM từ Date
 */
export function toISOMonthString(date: Date): string {
  return date.toISOString().slice(0, 7);
}

/**
 * Lấy ngày đầu tháng
 */
export function ngayDauThang(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Lấy ngày cuối tháng
 */
export function ngayCuoiThang(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Kiểm tra ngày hợp lệ
 */
export function laNgayHopLe(ngay: string | Date): boolean {
  const date = typeof ngay === 'string' ? new Date(ngay) : ngay;
  return !isNaN(date.getTime());
}

/**
 * So sánh 2 ngày (chỉ so sánh ngày, không so sánh giờ)
 */
export function soSanhNgay(ngay1: Date, ngay2: Date): number {
  const d1 = new Date(ngay1.getFullYear(), ngay1.getMonth(), ngay1.getDate());
  const d2 = new Date(ngay2.getFullYear(), ngay2.getMonth(), ngay2.getDate());
  return d1.getTime() - d2.getTime();
}

/**
 * Lấy ngày hôm nay ở định dạng YYYY-MM-DD
 */
export function homNay(): string {
  return toISODateString(new Date());
}

/**
 * Lấy tháng hiện tại ở định dạng YYYY-MM
 */
export function thangHienTai(): string {
  return toISOMonthString(new Date());
}

/**
 * Cộng/trừ tháng
 */
export function congTruThang(thang: string, soThang: number): string {
  const [nam, th] = thang.split('-').map(Number);
  const date = new Date(nam, th - 1 + soThang, 1);
  return toISOMonthString(date);
}

/**
 * Lấy danh sách các tháng trong năm
 */
export function layDanhSachThangTrongNam(nam: number): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    const thang = i + 1;
    return `${nam}-${thang.toString().padStart(2, '0')}`;
  });
}