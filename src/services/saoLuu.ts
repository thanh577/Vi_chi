// Vi Chi - Service sao lưu

import { invoke } from '@tauri-apps/api/core';
import type { ThongTinSaoLuu } from '../types';

export async function saoLuuDuLieu(): Promise<ThongTinSaoLuu> {
  return await invoke('sao_luu_du_lieu');
}

export async function khoiPhucDuLieu(tenTep: string): Promise<boolean> {
  return await invoke('khoi_phuc_du_lieu', { tenTep });
}

export async function layDanhSachSaoLuu(): Promise<ThongTinSaoLuu[]> {
  return await invoke('lay_danh_sach_sao_luu');
}

export async function xoaSaoLuu(tenTep: string): Promise<boolean> {
  return await invoke('xoa_sao_luu', { tenTep });
}