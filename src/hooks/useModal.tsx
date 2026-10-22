// Vi Chi - Hook quản lý modal/dialog

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ModalContextType {
  modals: Array<{
    id: string;
    component: ReactNode;
    props?: Record<string, unknown>;
  }>;
  moModal: (component: ReactNode, props?: Record<string, unknown>) => string;
  dongModal: (id: string) => void;
  dongTatCa: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalContextType['modals']>([]);

  const moModal = useCallback((component: ReactNode, props?: Record<string, unknown>) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 9);
    setModals((prev) => [...prev, { id, component, props }]);
    return id;
  }, []);

  const dongModal = useCallback((id: string) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const dongTatCa = useCallback(() => {
    setModals([]);
  }, []);

  return (
    <ModalContext.Provider value={{ modals, moModal, dongModal, dongTatCa }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal phải được sử dụng trong ModalProvider');
  }
  return context;
}