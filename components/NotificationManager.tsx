
import React, { useEffect } from 'react';

export const sendLocalNotification = (title: string, body: string, icon?: string) => {
  const isEnabledStr = localStorage.getItem('app_notifications_enabled');
  const isEnabled = isEnabledStr !== null ? JSON.parse(isEnabledStr) : true;
  
  if (!isEnabled) return;

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: icon || 'https://cdn-icons-png.flaticon.com/512/564/564619.png'
    });
  }
};

const NotificationManager: React.FC = () => {
  useEffect(() => {
    // Check and request permission on mount if supported
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  return null;
};

export default NotificationManager;
