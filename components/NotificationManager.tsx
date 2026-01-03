
import React, { useEffect } from 'react';

export const sendLocalNotification = (title: string, body: string, icon?: string) => {
  const isEnabledStr = localStorage.getItem('app_notifications_enabled');
  const isEnabled = isEnabledStr !== null ? JSON.parse(isEnabledStr) : true;
  
  if (!isEnabled) return;

  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission === "granted") {
    try {
      const n = new Notification(title, {
        body,
        icon: icon || 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
        tag: 'bestro-alert' // Prevents duplicate notifications
      });
      
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) {
      console.error("Notification error:", e);
    }
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
};

const NotificationManager: React.FC = () => {
  useEffect(() => {
    // Initial check and request
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            console.log("Notification access granted.");
          }
        });
      }
    }
  }, []);

  return null;
};

export default NotificationManager;
