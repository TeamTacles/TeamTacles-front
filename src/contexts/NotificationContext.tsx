import React, { createContext, useContext, useRef, ReactNode } from 'react';
import NotificationPopup, { NotificationPopupRef } from '../components/common/NotificationPopup';

interface NotificationContextType {
  showNotification: (options: { type: 'success' | 'error'; message: string }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}


export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const notificationRef = useRef<NotificationPopupRef>(null);

 
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


export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
};
