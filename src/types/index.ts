// Vi Chi - TypeScript types shared with backend

export type LoaiGiaoDich = 'income' | 'expense';

export type TrangThaiNganSach = 'binh_thuong' | 'sap_het' | 'vuot_ngan_sach';

export interface GiaoDich {
  id: number;
  loai: LoaiGiaoDich;
  so_tien: number;
  danh_muc_id: number;
  ngay_giao_dich: string; // YYYY-MM-DD
  mo_ta: string;
  ghi_chu?: string;
  created_at: string;
  updated_at: string;
}

export interface DanhMuc {
  id: number;
  ten: string;
  loai: LoaiGiaoDich;
  bieu_tuong: string;
  mau_sac: string;
  la_mac_dinh: boolean;
  kich_hoat: boolean;
}

export interface NganSach {
  id: number;
  danh_muc_id: number;
  thang: string; // YYYY-MM
  han_muc: number;
  created_at: string;
  updated_at: string;
}

export interface NganSachDayDu {
  ngan_sach: NganSach;
  danh_muc: DanhMuc;
  da_chi: number;
  con_lai: number;
  ty_le: number;
  trang_thai: TrangThaiNganSach;
}

export interface TongQuan {
  tong_thu: number;
  tong_chi: number;
  chenh_lech: number;
  tong_ngan_sach: number;
  da_su_dung_ngan_sach: number;
  ty_le_su_dung: number;
}

export interface DuLieuBieuDoThuChi {
  thang: string; // YYYY-MM
  tong_thu: number;
  tong_chi: number;
}

export interface DuLieuBieuDoDanhMuc {
  danh_muc_id: number;
  ten_danh_muc: string;
  mau_sac: string;
  tong_chi: number;
  ty_le: number;
}

export interface GiaoDichGanDay {
  id: number;
  loai: LoaiGiaoDich;
  so_tien: number;
  ten_danh_muc: string;
  bieu_tuong_danh_muc: string;
  mau_sac_danh_muc: string;
  ngay_giao_dich: string;
  mo_ta: string;
}

export interface BoLocGiaoDich {
  loai?: LoaiGiaoDich;
  danh_muc_id?: number;
  tu_ngay?: string;
  den_ngay?: string;
  tu_khoa?: string;
  trang: number;
  kich_thuoc_trang: number;
}

export interface KetQuaPhanTrang<T> {
  du_lieu: T[];
  tong_so: number;
  trang_hien_tai: number;
  tong_trang: number;
}

export interface YeuCauThemGiaoDich {
  loai: LoaiGiaoDich;
  so_tien: number;
  danh_muc_id: number;
  ngay_giao_dich: string;
  mo_ta: string;
  ghi_chu?: string;
}

export interface YeuCauCapNhatGiaoDich {
  id: number;
  loai?: LoaiGiaoDich;
  so_tien?: number;
  danh_muc_id?: number;
  ngay_giao_dich?: string;
  mo_ta?: string;
  ghi_chu?: string;
}

export interface YeuCauDanhMuc {
  ten: string;
  loai: LoaiGiaoDich;
  bieu_tuong: string;
  mau_sac: string;
}

export interface YeuCauNganSach {
  danh_muc_id: number;
  thang: string; // YYYY-MM
  han_muc: number;
}

export interface DuLieuXuatCSV {
  tieu_de: string[];
  hang_du_lieu: string[][];
}

export interface ThongTinSaoLuu {
  ten_tep: string;
  kich_thuoc: number;
  ngay_tao: string;
  so_luong_giao_dich: number;
  so_luong_danh_muc: number;
  so_luong_ngan_sach: number;
}

export interface ThongBao {
  id: string;
  loai: 'success' | 'danger' | 'warning' | 'info';
  tieuDe: string;
  noiDung: string;
}