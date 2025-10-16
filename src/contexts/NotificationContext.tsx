// src/contexts/NotificationContext.tsx
// Contexto global para gerenciar notificações em toda a aplicação

import React, { createContext, useContext, useRef, ReactNode } from 'react';
import NotificationPopup, { NotificationPopupRef } from '../components/common/NotificationPopup';

interface NotificationContextType {
  showNotification: (options: { type: 'success' | 'error'; message: string }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Provider que disponibiliza o sistema de notificação global
 * Renderiza o componente NotificationPopup uma única vez no topo da árvore de componentes
 */
export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const notificationRef = useRef<NotificationPopupRef>(null);

  /**
   * Exibe uma notificação global
   */
  const showNotification = (options: { type: 'success' | 'error'; message: string }) => {
    notificationRef.current?.show(options);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationPopup ref={notificationRef} />
    </NotificationContext.Provider>
  );
};

/**
 * Hook para usar o sistema de notificação global
 * @returns {showNotification} Função para exibir notificações
 * @example
 * const { showNotification } = useNotification();
 * showNotification({ type: 'success', message: 'Operação realizada com sucesso!' });
 */
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
};
