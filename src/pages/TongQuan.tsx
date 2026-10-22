// Vi Chi - Trang Tổng quan

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Target, Calendar, Plus } from 'lucide-react';
import { useDinhDang } from '../hooks';
import { useThongBao } from '../hooks/useToast';
import {
  TheThongKe,
  BieuDoThuChi,
  BieuDoDanhMuc,
  BangGiaoDich,
  ThanhNganSach,
} from '../components';
import { layTongQuan, layChiTieuTheoDanhMuc, layBaoCaoThang } from '../services/baoCao';
import { layGiaoDich } from '../services/giaoDich';
import { layDanhMuc } from '../services/danhMuc';
import { layNganSach } from '../services/nganSach';
import type { TongQuan, GiaoDich, DanhMuc, NganSachDayDu, DuLieuBieuDoThuChi, DuLieuBieuDoDanhMuc } from '../types';
import { thangHienTai } from '../utils/dinhDangNgay';

export function TongQuan() {
  const { thangDayDu } = useDinhDang();
  const { thongBaoLoi } = useThongBao();
  const [thang, setThang] = useState(thangHienTai());
  const [dangTai, setDangTai] = useState(true);
  const [tongQuan, setTongQuan] = useState<TongQuan | null>(null);
  const [bieuDoThuChi, setBieuDoThuChi] = useState<DuLieuBieuDoThuChi[]>([]);
  const [bieuDoDanhMuc, setBieuDoDanhMuc] = useState<DuLieuBieuDoDanhMuc[]>([]);
  const [giaoDichGanDay, setGiaoDichGanDay] = useState<GiaoDich[]>([]);
  const [danhMucMap, setDanhMucMap] = useState<Map<number, DanhMuc>>(new Map());
  const [nganSachList, setNganSachList] = useState<NganSachDayDu[]>([]);

  const taiDuLieu = async () => {
    setDangTai(true);
    try {
      const [tq, bdtc, bddm, gd, dm, ns] = await Promise.all([
        layTongQuan(thang),
        layBaoCaoThang(new Date(thang.split('-')[0]).getFullYear()),
        layChiTieuTheoDanhMuc(thang),
        layGiaoDich({ trang: 1, kich_thuoc_trang: 5 }),
        layDanhMuc(),
        layNganSach(thang),
      ]);
      setTongQuan(tq);
      setBieuDoThuChi(bdtc);
      setBieuDoDanhMuc(bddm);
      setGiaoDichGanDay(gd.du_lieu);
      setDanhMucMap(new Map(dm.map((d) => [d.id, d])));
      setNganSachList(ns);
    } catch (error) {
      thongBaoLoi('Không thể tải dữ liệu', 'Vui lòng thử lại sau');
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, [thang]);

  const handleThayDoiThang = (delta: number) => {
    const [nam, th] = thang.split('-').map(Number);
    const date = new Date(nam, th - 1 + delta, 1);
    const newThang = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    setThang(newThang);
  };

  if (dangTai && !tongQuan) {
    return (
      <div className="page-container" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
          <div className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            Tổng quan tài chính
          </h1>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            {thangDayDu(thang)}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleThayDoiThang(-1)}
            aria-label="Tháng trước"
          >
            <Calendar size={18} />
          </button>
          <span style={{ fontWeight: 'var(--font-semibold)', minWidth: '120px', textAlign: 'center' }}>
            {thangDayDu(thang)}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => handleThayDoiThang(1)}
            aria-label="Tháng sau"
          >
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <TheThongKe
          tieuDe="Tổng thu nhập"
          giaTri={tongQuan?.tong_thu || 0}
          bieuTuong={<TrendingUp size={24} />}
          mauBieuTuong="var(--color-primary)"
          mauChu="var(--color-primary)"
        />
        <TheThongKe
          tieuDe="Tổng chi tiêu"
          giaTri={tongQuan?.tong_chi || 0}
          bieuTuong={<TrendingDown size={24} />}
          mauBieuTuong="var(--color-danger)"
          mauChu="var(--color-danger)"
        />
        <TheThongKe
          tieuDe="Chênh lệch thu chi"
          giaTri={tongQuan?.chenh_lech || 0}
          bieuTuong={<Wallet size={24} />}
          mauBieuTuong={tongQuan && tongQuan.chenh_lech >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'}
          mauChu={tongQuan && tongQuan.chenh_lech >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'}
          hienThiDau
        />
        <TheThongKe
          tieuDe="Ngân sách đã dùng"
          giaTri={tongQuan?.ty_le_su_dung || 0}
          bieuTuong={<Target size={24} />}
          mauBieuTuong="var(--color-warning)"
          mauChu="var(--color-warning)"
          phanTram={tongQuan?.ty_le_su_dung || 0}
          phanTramLabel="của ngân sách"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <BieuDoThuChi duLieu={bieuDoThuChi} chieuCao={350} />
        <BieuDoDanhMuc duLieu={bieuDoDanhMuc} chieuCao={350} loai="tron" />
      </div>

      {/* Budget alerts + Recent transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Budget alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Cảnh báo ngân sách</h3>
          </div>
          <div className="card-content">
            {nganSachList.filter((n) => n.trang_thai !== 'binh_thuong').length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                <div className="empty-state-icon">✓</div>
                <h3 className="empty-state-title">Tất cả ngân sách đều bình thường</h3>
                <p className="empty-state-message">Không có danh mục nào sắp hết hoặc vượt ngân sách</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {nganSachList
                  .filter((n) => n.trang_thai !== 'binh_thuong')
                  .map((ns) => (
                    <ThanhNganSach key={ns.ngan_sach.id} nganSach={ns} hienThiChiTiet={false} />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="card">
          <div className="card-header flex-between">
            <h3 className="card-title">Giao dịch gần đây</h3>
            <button className="btn btn-primary btn-sm" onClick={() => { /* navigate to transactions */ }}>
              <Plus size={16} /> Thêm giao dịch
            </button>
          </div>
          <div className="card-content" style={{ padding: 0 }}>
            <BangGiaoDich
              duLieu={giaoDichGanDay}
              danhMucMap={danhMucMap}
              dangTai={dangTai}
              onSua={() => { /* handle edit */ }}
              onXoa={() => { /* handle delete */ }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}