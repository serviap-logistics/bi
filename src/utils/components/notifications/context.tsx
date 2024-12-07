import { createContext, useContext, useState } from 'react';
import { alert } from './alert';

export type notification = alert & { id: string };

const NotificationContext = createContext<{
  notifications: notification[];
  addNotification: (data: alert) => string;
  removeNotification: (id: string) => any;
}>({
  notifications: [],
  addNotification: () => '',
  removeNotification: () => null,
});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState<notification[]>([]);

  const addNotification = (data: alert) => {
    const id = new Date().toISOString();
    setNotifications((prevNotifications) => [
      { id, label: data.label, status: data.status },
      ...prevNotifications,
    ]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id),
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
