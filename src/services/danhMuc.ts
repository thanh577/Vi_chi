// Vi Chi - Service danh mục

import { invoke } from '@tauri-apps/api/core';
import type { DanhMuc, YeuCauDanhMuc, LoaiGiaoDich } from '../types';

export async function layDanhMuc(loai?: LoaiGiaoDich): Promise<DanhMuc[]> {
  return await invoke('lay_danh_muc', { loai });
}

export async function themDanhMuc(yeuCau: YeuCauDanhMuc): Promise<DanhMuc> {
  return await invoke('them_danh_muc', { yeuCau });
}

export async function capNhatDanhMuc(id: number, yeuCau: YeuCauDanhMuc): Promise<DanhMuc> {
  return await invoke('cap_nhat_danh_muc', { id, yeuCau });
}

export async function xoaDanhMuc(id: number): Promise<boolean> {
  return await invoke('xoa_danh_muc', { id });
}

export async function khoiTaoDanhMucMacDinh(): Promise<number> {
  return await invoke('khoi_tao_danh_muc_mac_dinh');
}