// Vi Chi - Component Biểu đồ chi tiêu theo danh mục

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { DuLieuBieuDoDanhMuc } from '../types';

interface BieuDoDanhMucProps {
  duLieu: DuLieuBieuDoDanhMuc[];
  chieuCao?: number;
  loai?: 'tron' | 'cot';
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

export function BieuDoDanhMuc({ duLieu, chieuCao = 300, loai = 'tron' }: BieuDoDanhMucProps) {
  if (duLieu.length === 0) {
    return (
      <div className="card" style={{ height: chieuCao }}>
        <div className="card-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3 className="empty-state-title">Chưa có dữ liệu biểu đồ</h3>
            <p className="empty-state-message">Thêm giao dịch chi tiêu để xem phân bổ theo danh mục</p>
          </div>
        </div>
      </div>
    );
  }

  // Giới hạn 8 danh mục đầu tiên, gộp phần còn lại thành "Khác"
  const topData = duLieu.slice(0, 8);
  const otherData = duLieu.slice(8);
  const otherSum = otherData.reduce((sum, item) => sum + item.tong_chi, 0);

  const chartData = [
    ...topData.map((item) => ({
      name: item.ten_danh_muc,
      value: item.tong_chi,
      color: item.mau_sac,
      ty_le: item.ty_le,
    })),
    ...(otherSum > 0
      ? [{
          name: 'Khác',
          value: otherSum,
          color: '#94a3b8',
          ty_le: (otherSum / duLieu.reduce((s, i) => s + i.tong_chi, 0)) * 100,
        }]
      : []),
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string; payload: { ty_le: number } }> }) => {
    if (!active || !payload || !payload[0]) return null;
    const item = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <p style={{ margin: 0, fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
          {payload[0].name}
        </p>
        <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--text-secondary)' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(payload[0].value)}
        </p>
        <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          {item.ty_le.toFixed(1)}% tổng chi tiêu
        </p>
      </div>
    );
  };

  if (loai === 'cot') {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Chi tiêu theo danh mục</h3>
        </div>
        <div className="card-content" style={{ height: chieuCao }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={dinhDangTienNgan}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border-light)' }}
                tickLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                }}
                formatter={(value: number) => [
                  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value),
                  'Chi tiêu',
                ]}
              />
              <Bar dataKey="value">
                {chartData.map((item, index) => (
                  <Cell key={`cell-${index}`} fill={item.color} radius={4} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Phân bổ chi tiêu</h3>
      </div>
      <div className="card-content" style={{ height: chieuCao }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, ty_le }) => `${name} ${ty_le.toFixed(1)}%`}
              labelLine={false}
            >
              {chartData.map((item, index) => (
                <Cell key={`cell-${index}`} fill={item.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              formatter={(value) => value}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}