// Vi Chi - Service báo cáo

import { invoke } from '@tauri-apps/api/core';
import type {
  TongQuan,
  DuLieuBieuDoThuChi,
  DuLieuBieuDoDanhMuc,
  DuLieuXuatCSV,
} from '../types';

export async function layTongQuan(thang: string): Promise<TongQuan> {
  return await invoke('lay_tong_quan', { thang });
}

export async function layBaoCaoThang(nam: number): Promise<DuLieuBieuDoThuChi[]> {
  return await invoke('lay_bao_cao_thang', { nam });
}

export async function layBaoCaoNam(tuNam: number, denNam: number): Promise<DuLieuBieuDoThuChi[]> {
  return await invoke('lay_bao_cao_nam', { tuNam, denNam });
}

export async function layChiTieuTheoDanhMuc(thang: string): Promise<DuLieuBieuDoDanhMuc[]> {
  return await invoke('lay_chi_tieu_theo_danh_muc', { thang });
}

export async function xuatCSV(
  loaiBaoCao: string,
  thang?: string,
  nam?: number
): Promise<DuLieuXuatCSV> {
  return await invoke('xuat_csv', { loaiBaoCao, thang, nam });
}