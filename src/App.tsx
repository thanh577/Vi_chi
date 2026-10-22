// Vi Chi - Main App Component

import { useState, useEffect } from 'react';
import { Toaster } from './components/ThongBao';
import { ToastProvider } from './hooks/useToast';
import { ModalProvider } from './hooks/useModal';
import { SidebarProvider } from './hooks/useSidebar';
import { BoDieuHuong } from './components/BoDieuHuong';
import { TongQuan } from './pages/TongQuan';
import { GiaoDich } from './pages/GiaoDich';
import { NganSach } from './pages/NganSach';
import { BaoCao } from './pages/BaoCao';
import { DanhMuc } from './pages/DanhMuc';
import { CaiDat } from './pages/CaiDat';
import { HuongDan } from './pages/HuongDan';
import { Wallet, LayoutDashboard, CreditCard, Wallet as WalletIcon, BarChart2, Tag, Settings, HelpCircle } from 'lucide-react';
import './styles/global.css';
import './styles/components.css';

type Trang = 'tong-quan' | 'giao-dich' | 'ngan-sach' | 'bao-cao' | 'danh-muc' | 'cai-dat' | 'huong-dan';

const TRANG_MAP: Record<Trang, { component: React.ComponentType; icon: React.ReactNode; label: string }> = {
  'tong-quan': { component: TongQuan, icon: <LayoutDashboard size={20} />, label: 'Tổng quan' },
  'giao-dich': { component: GiaoDich, icon: <CreditCard size={20} />, label: 'Giao dịch' },
  'ngan-sach': { component: NganSach, icon: <WalletIcon size={20} />, label: 'Ngân sách' },
  'bao-cao': { component: BaoCao, icon: <BarChart2 size={20} />, label: 'Báo cáo' },
  'danh-muc': { component: DanhMuc, icon: <Tag size={20} />, label: 'Danh mục' },
  'cai-dat': { component: CaiDat, icon: <Settings size={20} />, label: 'Cài đặt' },
  'huong-dan': { component: HuongDan, icon: <HelpCircle size={20} />, label: 'Hướng dẫn' },
};

function AppContent() {
  const [activeTab, setActiveTab] = useState<Trang>('tong-quan');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + number keys for navigation
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        const tabs: Trang[] = ['tong-quan', 'giao-dich', 'ngan-sach', 'bao-cao', 'danh-muc', 'cai-dat'];
        const index = parseInt(e.key) - 1;
        if (tabs[index]) {
          setActiveTab(tabs[index]);
          setSidebarOpen(false);
        }
      }
      // Escape to close sidebar on mobile
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 'var(--z-fixed)',
            display: 'block',
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <BoDieuHuong
        activeItem={activeTab}
        onItemClick={(id) => {
          setActiveTab(id as Trang);
          setSidebarOpen(false);
        }}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header
          style={{
            height: 'var(--header-height)',
            backgroundColor: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-6)',
            position: 'sticky',
            top: 0,
            zIndex: 'var(--z-sticky)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu"
              style={{ display: 'none' }}
            >
              <LayoutDashboard size={24} />
            </button>
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
          </div>

          {/* Tab navigation on header for desktop */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }} aria-label="Điều hướng chính">
            {Object.entries(TRANG_MAP).map(([id, { icon, label }]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as Trang)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  color: activeTab === id ? 'var(--color-primary)' : 'var(--text-secondary)',
                  backgroundColor: activeTab === id ? 'var(--color-primary-light)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: activeTab === id ? 'var(--font-semibold)' : 'var(--font-medium)',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
                aria-current={activeTab === id ? 'page' : undefined}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Current month display */}
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', fontWeight: 'var(--font-medium)' }}>
            Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          {(() => {
            const ActiveComponent = TRANG_MAP[activeTab].component;
            return <ActiveComponent />;
          })()}
        </main>
      </div>

      {/* Mobile sidebar toggle button */}
      <button
        className="btn btn-primary"
        onClick={() => setSidebarOpen(true)}
        style={{
          position: 'fixed',
          bottom: 'var(--space-6)',
          right: 'var(--space-6)',
          zIndex: 'var(--z-fixed)',
          display: 'none',
          boxShadow: 'var(--shadow-xl)',
        }}
        aria-label="Mở menu"
      >
        <LayoutDashboard size={24} />
      </button>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ModalProvider>
        <SidebarProvider>
          <AppContent />
        </SidebarProvider>
      </ModalProvider>
    </ToastProvider>
  );
}