import { useState, useEffect, useCallback } from "react";
import { api, type Notification } from "../lib/api";
import { useWebSocket } from "../lib/websocket";
import { useAuth } from "./useAuth";

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  recentCount: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();

  // WebSocket connection for real-time notifications
  const { isConnected, lastMessage } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000",
    userId: user?.id?.value || "",
    workspaceId: "default-workspace",
    onMessage: (message) => {
      if (message.type === "notification") {
        // Add new notification to the list
        setNotifications(prev => [message.data, ...prev.slice(0, 49)]); // Keep only 50 most recent
        loadStats(); // Refresh stats
      }
    },
  });

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getNotifications(user.id.value, "default-workspace");
      setNotifications(response.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await api.getNotificationStats(user.id.value, "default-workspace");
      setStats(response.stats);
    } catch (err) {
      console.error("Failed to load notification stats:", err);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      await api.markNotificationAsRead(notificationId, user.id.value);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      loadStats(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark notification as read");
    }
  }, [user, loadStats]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      await api.markAllNotificationsAsRead(user.id.value, "default-workspace");
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      loadStats(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all notifications as read");
    }
  }, [user, loadStats]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      await api.deleteNotification(notificationId, user.id.value);
      
      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      loadStats(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notification");
    }
  }, [user, loadStats]);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(notif => !notif.isRead).length;
  }, [notifications]);

  const getNotificationsByType = useCallback((type: string) => {
    return notifications.filter(notif => notif.type === type);
  }, [notifications]);

  const getRecentNotifications = useCallback((hours: number = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return notifications.filter(notif => new Date(notif.createdAt) > cutoff);
  }, [notifications]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
      loadStats();
    }
  }, [isAuthenticated, user, loadNotifications, loadStats]);

  return {
    notifications,
    stats,
    isLoading,
    error,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    getNotificationsByType,
    getRecentNotifications,
    refresh: loadNotifications,
  };
}

// Hook for notification toast/snackbar
export function useNotificationToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration?: number;
  }>>([]);

  const addToast = useCallback((
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substring(2);
    const toast = { id, title, message, type, duration };
    
    setToasts(prev => [...prev, toast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
  };
}

// Hook for real-time updates from WebSocket
export function useRealTimeUpdates() {
  const [updates, setUpdates] = useState<Array<{
    type: string;
    data: any;
    timestamp: string;
  }>>([]);

  const { isConnected, lastMessage } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000",
    userId: "", // Will be set by auth context
    workspaceId: "default-workspace",
    onMessage: (message) => {
      // Handle different real-time update types
      switch (message.type) {
        case "task_update":
        case "note_update":
        case "ritual_update":
        case "crm_update":
          setUpdates(prev => [message, ...prev.slice(0, 99)]); // Keep last 100 updates
          break;
      }
    },
  });

  const getUpdatesByType = useCallback((type: string) => {
    return updates.filter(update => update.type === type);
  }, [updates]);

  const getRecentUpdates = useCallback((minutes: number = 30) => {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return updates.filter(update => new Date(update.timestamp) > cutoff);
  }, [updates]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    updates,
    isConnected,
    getUpdatesByType,
    getRecentUpdates,
    clearUpdates,
  };
}
