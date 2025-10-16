import React, { createContext, useContext, useState } from 'react';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import styles from './NotificationContext.module.css';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={styles["notification-icon"]} />;
      case 'error':
        return <ExclamationTriangleIcon className={styles["notification-icon"]} />;
      case 'warning':
        return <ExclamationTriangleIcon className={styles["notification-icon"]} />;
      case 'info':
        return <InformationCircleIcon className={styles["notification-icon"]} />;
      default:
        return <InformationCircleIcon className={styles["notification-icon"]} />;
    }
  };

  const value = {
    showNotification,
    removeNotification,
    notifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Global notification container */}
      <div className={styles["notification-container"]}>
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`${styles["notification"]} ${styles[n.type]}`}
            onClick={() => removeNotification(n.id)}
          >
            {getNotificationIcon(n.type)}
            <span className={styles["notification-content"]}>{n.message}</span>
            <XMarkIcon className={styles["notification-close"]} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
