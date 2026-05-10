import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../services/db';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markMultipleAsRead: (ids: string[]) => Promise<void>;
  removeMultipleNotifications: (ids: string[]) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const fetchNotifications = async () => {
    if (!profile?.id) {
      setNotifications([]);
      return;
    }
    
    setLoading(true);
    const { data, error } = await getNotifications(profile.id);
    if (!error) {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, [profile?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    const success = await markNotificationAsRead(id);
    if (success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markMultipleAsRead = async (ids: string[]) => {
    await Promise.all(ids.map(id => markNotificationAsRead(id)));
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
  };

  const removeNotification = async (id: string) => {
    const { success } = await deleteNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const removeMultipleNotifications = async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteNotification(id)));
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
  };

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loading, 
      fetchNotifications, 
      markAsRead, 
      removeNotification,
      markAllAsRead,
      markMultipleAsRead,
      removeMultipleNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
