// Vi Chi - Component Biểu đồ thu chi

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DuLieuBieuDoThuChi } from '../types';

interface BieuDoThuChiProps {
  duLieu: DuLieuBieuDoThuChi[];
  chieuCao?: number;
}

const dinhDangTienNgan = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}tr`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toString();
};

export function BieuDoThuChi({ duLieu, chieuCao = 300 }: BieuDoThuChiProps) {
  if (duLieu.length === 0) {
    return (
      <div className="card" style={{ height: chieuCao }}>
        <div className="card-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3 className="empty-state-title">Chưa có dữ liệu biểu đồ</h3>
            <p className="empty-state-message">Thêm giao dịch để xem biểu đồ thu chi</p>
          </div>
        </div>
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = duLieu.map((item) => ({
    thang: item.thang.slice(5), // Chỉ lấy MM
    thu: item.tong_thu,
    chi: item.tong_chi,
  }));

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Thu chi theo tháng</h3>
      </div>
      <div className="card-content" style={{ height: chieuCao }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis
              dataKey="thang"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-light)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={dinhDangTienNgan}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
              }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value),
                name === 'thu' ? 'Thu nhập' : 'Chi tiêu',
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: 'var(--space-2)' }}
              formatter={(value) => value === 'thu' ? 'Thu nhập' : 'Chi tiêu'}
            />
            <Line
              type="monotone"
              dataKey="thu"
              name="Thu nhập"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="chi"
              name="Chi tiêu"
              stroke="var(--color-danger)"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}