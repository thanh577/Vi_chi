// Vi Chi - Hook quản lý trạng thái sidebar

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, openSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar phải được sử dụng trong SidebarProvider');
  }
  return context;
}