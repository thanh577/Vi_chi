// Vi Chi - Trang Báo cáo

import { useState, useEffect, useCallback } from 'react';
import { Download, BarChart2, PieChart } from 'lucide-react';
import { useDinhDang } from '../hooks';
import { useThongBao } from '../hooks/useToast';
import { BieuDoThuChi, BieuDoDanhMuc } from '../components';
import { layBaoCaoThang, layBaoCaoNam, layChiTieuTheoDanhMuc, xuatCSV } from '../services/baoCao';
import type { DuLieuBieuDoThuChi, DuLieuBieuDoDanhMuc } from '../types';
import { thangHienTai } from '../utils/dinhDangNgay';

export function BaoCao() {
  const { tien, thangDayDu } = useDinhDang();
  const { thongBaoThanhCong, thongBaoLoi } = useThongBao();
  const [tab, setTab] = useState<'thang' | 'nam' | 'danh_muc'>('thang');
  const [thang, setThang] = useState(thangHienTai());
  const [namBaoCao, setNamBaoCao] = useState(new Date().getFullYear());
  const [_dangTai, setDangTai] = useState(false);
  const [dangXuat, setDangXuat] = useState(false);

  const [bieuDoThang, setBieuDoThang] = useState<DuLieuBieuDoThuChi[]>([]);
  const [bieuDoNam, setBieuDoNam] = useState<DuLieuBieuDoThuChi[]>([]);
  const [bieuDoDanhMuc, setBieuDoDanhMuc] = useState<DuLieuBieuDoDanhMuc[]>([]);

  const taiDuLieuThang = useCallback(async () => {
    setDangTai(true);
    try {
      const [bt, bdm] = await Promise.all([
        layBaoCaoThang(new Date(thang.split('-')[0]).getFullYear()),
        layChiTieuTheoDanhMuc(thang),
      ]);
      setBieuDoThang(bt);
      setBieuDoDanhMuc(bdm);
    } catch (error) {
      thongBaoLoi('Không thể tải báo cáo tháng');
    } finally {
      setDangTai(false);
    }
  }, [thang, thongBaoLoi]);

  const taiDuLieuNam = useCallback(async () => {
    setDangTai(true);
    try {
      const bn = await layBaoCaoNam(namBaoCao - 2, namBaoCao);
      setBieuDoNam(bn);
    } catch (error) {
      thongBaoLoi('Không thể tải báo cáo năm');
    } finally {
      setDangTai(false);
    }
  }, [namBaoCao, thongBaoLoi]);

  const taiDuLieuDanhMuc = useCallback(async () => {
    setDangTai(true);
    try {
      const bdm = await layChiTieuTheoDanhMuc(thang);
      setBieuDoDanhMuc(bdm);
    } catch (error) {
      thongBaoLoi('Không thể tải báo cáo danh mục');
    } finally {
      setDangTai(false);
    }
  }, [thang, thongBaoLoi]);

  useEffect(() => {
    if (tab === 'thang') taiDuLieuThang();
    else if (tab === 'nam') taiDuLieuNam();
    else taiDuLieuDanhMuc();
  }, [tab, taiDuLieuThang, taiDuLieuNam, taiDuLieuDanhMuc]);

  const handleXuatCSV = async (loai: 'giao_dich' | 'chi_tieu_danh_muc' | 'ngan_sach' | 'tong_hop_nam') => {
    setDangXuat(true);
    try {
      const csv = await xuatCSV(loai, loai !== 'tong_hop_nam' ? thang : undefined, loai === 'tong_hop_nam' ? namBaoCao : undefined);

      // Tạo và tải file
      const header = csv.tieu_de.join(',');
      const rows = csv.hang_du_lieu.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
      const content = '\uFEFF' + header + '\n' + rows; // UTF-8 BOM

      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `vi-chi-${loai}-${loai !== 'tong_hop_nam' ? thang : namBaoCao}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      thongBaoThanhCong('Đã xuất báo cáo CSV');
    } catch (error) {
      thongBaoLoi('Không thể xuất báo cáo');
    } finally {
      setDangXuat(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            Báo cáo
          </h1>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            Phân tích tình hình tài chính
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" onClick={() => handleXuatCSV('giao_dich')} disabled={dangXuat}>
            <Download size={18} /> Xuất giao dịch
          </button>
          <button className="btn btn-secondary" onClick={() => handleXuatCSV('chi_tieu_danh_muc')} disabled={dangXuat}>
            <Download size={18} /> Xuất theo danh mục
          </button>
          <button className="btn btn-secondary" onClick={() => handleXuatCSV('tong_hop_nam')} disabled={dangXuat}>
            <Download size={18} /> Xuất tổng hợp năm
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        <button
          className={`tab ${tab === 'thang' ? 'tab-active' : ''}`}
          onClick={() => setTab('thang')}
        >
          <BarChart2 size={18} style={{ marginRight: 'var(--space-2)' }} />
          Báo cáo tháng
        </button>
        <button
          className={`tab ${tab === 'nam' ? 'tab-active' : ''}`}
          onClick={() => setTab('nam')}
        >
          <BarChart2 size={18} style={{ marginRight: 'var(--space-2)' }} />
          Báo cáo năm
        </button>
        <button
          className={`tab ${tab === 'danh_muc' ? 'tab-active' : ''}`}
          onClick={() => setTab('danh_muc')}
        >
          <PieChart size={18} style={{ marginRight: 'var(--space-2)' }} />
          Theo danh mục
        </button>
      </div>

      {/* Tab content */}
      {tab === 'thang' && (
        <div>
          {/* Month selector */}
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 'var(--font-medium)' }}>
                Tháng:
                <input type="month" className="input" style={{ width: 'auto' }} value={thang} onChange={(e) => setThang(e.target.value)} />
              </label>
              <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
                {thangDayDu(thang)}
              </span>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-4)' }}>
            <BieuDoThuChi duLieu={bieuDoThang} chieuCao={350} />
            <BieuDoDanhMuc duLieu={bieuDoDanhMuc} chieuCao={350} loai="tron" />
          </div>

          {/* Monthly stats table */}
          <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <div className="card-header">
              <h3 className="card-title">Chi tiết các tháng</h3>
            </div>
            <div className="card-content" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tháng</th>
                      <th className="text-right">Tổng thu</th>
                      <th className="text-right">Tổng chi</th>
                      <th className="text-right">Chênh lệch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bieuDoThang.map((item) => (
                      <tr key={item.thang}>
                        <td>{thangDayDu(item.thang)}</td>
                        <td className="text-right" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-medium)' }}>+{tien(item.tong_thu)}</td>
                        <td className="text-right" style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-medium)' }}>-{tien(item.tong_chi)}</td>
                        <td className="text-right" style={{ fontWeight: 'var(--font-semibold)', color: item.tong_thu - item.tong_chi >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                          {tien(item.tong_thu - item.tong_chi)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'nam' && (
        <div>
          {/* Year selector */}
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 'var(--font-medium)' }}>
                Năm:
                <select className="input" style={{ width: 'auto' }} value={namBaoCao} onChange={(e) => setNamBaoCao(parseInt(e.target.value))}>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Yearly chart */}
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-header">
              <h3 className="card-title">Tổng quan năm {namBaoCao}</h3>
            </div>
            <div className="card-content" style={{ height: 350 }}>
              <BieuDoThuChi duLieu={bieuDoNam} chieuCao={350} />
            </div>
          </div>

          {/* Yearly stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Chi tiết năm</h3>
            </div>
            <div className="card-content" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Năm</th>
                      <th className="text-right">Tổng thu</th>
                      <th className="text-right">Tổng chi</th>
                      <th className="text-right">Chênh lệch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bieuDoNam.map((item) => (
                      <tr key={item.thang}>
                        <td>Năm {item.thang}</td>
                        <td className="text-right" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-medium)' }}>+{tien(item.tong_thu)}</td>
                        <td className="text-right" style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-medium)' }}>-{tien(item.tong_chi)}</td>
                        <td className="text-right" style={{ fontWeight: 'var(--font-semibold)', color: item.tong_thu - item.tong_chi >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                          {tien(item.tong_thu - item.tong_chi)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'danh_muc' && (
        <div>
          {/* Month selector */}
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-content" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 'var(--font-medium)' }}>
                Tháng:
                <input type="month" className="input" style={{ width: 'auto' }} value={thang} onChange={(e) => setThang(e.target.value)} />
              </label>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-4)' }}>
            <BieuDoDanhMuc duLieu={bieuDoDanhMuc} chieuCao={350} loai="tron" />
            <BieuDoDanhMuc duLieu={bieuDoDanhMuc} chieuCao={350} loai="cot" />
          </div>

          {/* Category table */}
          <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <div className="card-header">
              <h3 className="card-title">Chi tiết chi tiêu theo danh mục</h3>
            </div>
            <div className="card-content" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Danh mục</th>
                      <th className="text-right">Số tiền</th>
                      <th className="text-right">Tỷ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bieuDoDanhMuc.map((item) => (
                      <tr key={item.danh_muc_id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: `${item.mau_sac}20`,
                                color: item.mau_sac,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {item.ten_danh_muc.charAt(0)}
                            </span>
                            {item.ten_danh_muc}
                          </div>
                        </td>
                        <td className="text-right" style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-danger)' }}>
                          {tien(item.tong_chi)}
                        </td>
                        <td className="text-right" style={{ color: 'var(--text-secondary)' }}>
                          {item.ty_le.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}