// Vi Chi - Component Bộ điều hướng (Sidebar)

import { useSidebar } from '../hooks';
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  BarChart2,
  Tag,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { id: 'tong-quan', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
  { id: 'giao-dich', label: 'Giao dịch', icon: <CreditCard size={20} /> },
  { id: 'ngan-sach', label: 'Ngân sách', icon: <Wallet size={20} /> },
  { id: 'bao-cao', label: 'Báo cáo', icon: <BarChart2 size={20} /> },
  { id: 'danh-muc', label: 'Danh mục', icon: <Tag size={20} /> },
  { id: 'cai-dat', label: 'Cài đặt', icon: <Settings size={20} /> },
  { id: 'huong-dan', label: 'Hướng dẫn', icon: <HelpCircle size={20} /> },
];

interface BoDieuHuongProps {
  activeItem: string;
  onItemClick: (id: string) => void;
}

export function BoDieuHuong({ activeItem, onItemClick }: BoDieuHuongProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className="sidebar"
      style={{
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        height: 'calc(100vh - var(--header-height))',
        position: 'sticky',
        top: 'var(--header-height)',
        backgroundColor: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
        overflow: 'hidden',
        zIndex: 'var(--z-sticky)',
      }}
      aria-label="Menu điều hướng"
    >
      {/* Logo */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '60px',
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              className="icon-wrapper"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              <Wallet size={24} />
            </div>
            <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
              Vi Chi
            </span>
          </div>
        )}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          style={{ flexShrink: 0 }}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu items */}
      <nav style={{ flex: 1, padding: 'var(--space-3)', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {MENU_ITEMS.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => onItemClick(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                  {!isCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderTop: '1px solid var(--border-light)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
          textAlign: 'center',
        }}
      >
        {!isCollapsed && 'Vi Chi v1.0.0'}
      </div>
    </aside>
  );
}