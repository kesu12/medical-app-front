import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  NotificationItem,
} from '../api/notifications';

const REFRESH_INTERVAL_MS = 60_000;

function NotificationBell() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const [items, unread] = await Promise.all([
        fetchNotifications(user.userId),
        fetchUnreadCount(user.userId),
      ]);
      setNotifications(items);
      setUnreadCount(unread);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    }
    if (panelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [panelOpen]);

  const togglePanel = () => {
    if (!user) {
      return;
    }
    setPanelOpen((prev) => !prev);
    if (!panelOpen) {
      loadNotifications();
    }
  };

  const relativeTime = useCallback((timestamp: string) => {
    if (!timestamp) {
      return '';
    }
    const now = Date.now();
    const createdAt = new Date(timestamp).getTime();
    const diffMs = now - createdAt;

    if (diffMs < 60_000) {
      return 'just now';
    }
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 60) {
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }, []);

  const formattedNotifications = useMemo(() => notifications, [notifications]);

  const handleMarkRead = async (notificationId: number) => {
    if (!user) {
      return;
    }
    try {
      await markNotificationRead(notificationId, user.userId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (e: any) {
      setError(e?.message || 'Failed to update notification');
    }
  };

  const handleMarkAll = async () => {
    if (!user) {
      return;
    }
    try {
      await markAllNotificationsRead(user.userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e: any) {
      setError(e?.message || 'Failed to update notifications');
    }
  };

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        className="notification-bell__button"
        aria-label="Notifications"
        onClick={togglePanel}
      >
        <span className="notification-bell__icon" aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
      {panelOpen && (
        <div className="notification-panel">
          <div className="notification-panel__header">
            <div>
              <p className="notification-panel__title">Notifications</p>
              <p className="notification-panel__subtitle">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            <button
              className="notification-panel__mark-all"
              disabled={unreadCount === 0}
              onClick={handleMarkAll}
            >
              Mark all read
            </button>
          </div>
          <div className="notification-panel__body">
            {loading && <div className="notification-panel__status">Loading...</div>}
            {error && !loading && (
              <div className="notification-panel__status notification-panel__status--error">
                {error}
              </div>
            )}
            {!loading && !error && formattedNotifications.length === 0 && (
              <div className="notification-panel__status">No notifications yet</div>
            )}
            {!loading && !error && formattedNotifications.length > 0 && (
              <ul className="notification-panel__list">
                {formattedNotifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      className={`notification-item${
                        notification.read ? '' : ' notification-item--unread'
                      }`}
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      <span className="notification-item__message">{notification.message}</span>
                      <span className="notification-item__time">
                        {relativeTime(notification.createdAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

