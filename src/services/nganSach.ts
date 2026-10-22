// Vi Chi - Service ngân sách

import { invoke } from '@tauri-apps/api/core';
import type { NganSachDayDu, YeuCauNganSach, NganSach } from '../types';

export async function layNganSach(thang: string): Promise<NganSachDayDu[]> {
  return await invoke('lay_ngan_sach', { thang });
}

export async function luuNganSach(yeuCau: YeuCauNganSach): Promise<NganSach> {
  return await invoke('luu_ngan_sach', { yeuCau });
}

export async function xoaNganSach(id: number): Promise<boolean> {
  return await invoke('xoa_ngan_sach', { id });
}