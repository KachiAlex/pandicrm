"use client";

import { useState, useEffect } from "react";
import { useNotifications, useNotificationToast } from "../../hooks/useNotifications";
import type { Notification } from "../../lib/api";

const notificationIcons = {
  task_assigned: "📋",
  task_completed: "✅",
  task_overdue: "⚠️",
  note_shared: "📝",
  note_transcribed: "🤖",
  ritual_completed: "🎉",
  ritual_missed: "😔",
  account_created: "🏢",
  contact_created: "👤",
  deal_created: "🤝",
  deal_won: "🎊",
  deal_lost: "💔",
  system_update: "🔧",
  mention: "🔔",
  reminder: "⏰",
};

const notificationColors = {
  task_assigned: "bg-blue-100 text-blue-800",
  task_completed: "bg-green-100 text-green-800",
  task_overdue: "bg-red-100 text-red-800",
  note_shared: "bg-purple-100 text-purple-800",
  note_transcribed: "bg-indigo-100 text-indigo-800",
  ritual_completed: "bg-yellow-100 text-yellow-800",
  ritual_missed: "bg-gray-100 text-gray-800",
  account_created: "bg-blue-100 text-blue-800",
  contact_created: "bg-green-100 text-green-800",
  deal_created: "bg-purple-100 text-purple-800",
  deal_won: "bg-green-100 text-green-800",
  deal_lost: "bg-red-100 text-red-800",
  system_update: "bg-gray-100 text-gray-800",
  mention: "bg-orange-100 text-orange-800",
  reminder: "bg-yellow-100 text-yellow-800",
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  
  const {
    notifications,
    stats,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    refresh,
  } = useNotifications();

  const { addToast } = useNotificationToast();

  const unreadCount = getUnreadCount();

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    addToast("Marked as read", "Notification marked as read", "success", 2000);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    addToast("All marked as read", "All notifications marked as read", "success", 2000);
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
    addToast("Deleted", "Notification deleted", "info", 2000);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return time.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === "all" || !notif.isRead
  );

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    filter === "all" 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    filter === "unread" 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading notifications...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {filter === "unread" ? "No unread notifications" : "No notifications"}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          notificationColors[notification.type as keyof typeof notificationColors] || "bg-gray-100 text-gray-800"
                        }`}>
                          {notificationIcons[notification.type as keyof typeof notificationIcons] || "🔔"}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  title="Mark as read"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(notification.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {unreadCount > 0 && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleMarkAllAsRead}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
