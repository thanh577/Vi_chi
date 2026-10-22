// Vi Chi - Service giao dịch

import { invoke } from '@tauri-apps/api/core';
import type {
  GiaoDich,
  BoLocGiaoDich,
  KetQuaPhanTrang,
  YeuCauThemGiaoDich,
  YeuCauCapNhatGiaoDich,
} from '../types';

export async function layGiaoDich(boLoc: BoLocGiaoDich): Promise<KetQuaPhanTrang<GiaoDich>> {
  return await invoke('lay_giao_dich', { boLoc });
}

export async function themGiaoDich(yeuCau: YeuCauThemGiaoDich): Promise<GiaoDich> {
  return await invoke('them_giao_dich', { yeuCau });
}

export async function capNhatGiaoDich(yeuCau: YeuCauCapNhatGiaoDich): Promise<GiaoDich> {
  return await invoke('cap_nhat_giao_dich', { yeuCau });
}

export async function xoaGiaoDich(id: number): Promise<boolean> {
  return await invoke('xoa_giao_dich', { id });
}