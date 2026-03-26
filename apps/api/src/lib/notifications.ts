import type { NotificationPreferences } from "@pandi/core-domain";
import { wsManager } from "./websocket";

export interface Notification {
  id: string;
  userId: string;
  workspaceId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export type NotificationType = 
  | "task_assigned"
  | "task_completed"
  | "task_overdue"
  | "note_shared"
  | "note_transcribed"
  | "ritual_completed"
  | "ritual_missed"
  | "account_created"
  | "contact_created"
  | "deal_created"
  | "deal_won"
  | "deal_lost"
  | "system_update"
  | "mention"
  | "reminder";

export interface CreateNotificationInput {
  userId: string;
  workspaceId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  expiresAt?: string;
}

// In-memory storage for notifications
const notifications: Map<string, Notification> = new Map();
const userNotifications: Map<string, string[]> = new Map();

export class NotificationManager {
  private static instance: NotificationManager;
  private notificationIdCounter = 1;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      userId: input.userId,
      workspaceId: input.workspaceId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
      isRead: false,
      createdAt: new Date().toISOString(),
      expiresAt: input.expiresAt,
    };

    // Store notification
    notifications.set(notification.id, notification);

    // Add to user notifications
    const userNotifs = userNotifications.get(input.userId) || [];
    userNotifs.push(notification.id);
    userNotifications.set(input.userId, userNotifs);

    // Send real-time notification
    wsManager.sendNotification(input.workspaceId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    const notification = notifications.get(notificationId);
    
    if (!notification || notification.userId !== userId) {
      return null;
    }

    notification.isRead = true;
    notifications.set(notificationId, notification);

    return notification;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const userNotifs = userNotifications.get(userId) || [];
    let markedCount = 0;

    userNotifs.forEach(notificationId => {
      const notification = notifications.get(notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notifications.set(notificationId, notification);
        markedCount++;
      }
    });

    return markedCount;
  }

  async getUserNotifications(
    userId: string, 
    workspaceId: string,
    limit: number = 50,
    offset: number = 0,
    includeRead: boolean = false
  ): Promise<Notification[]> {
    const userNotifs = userNotifications.get(userId) || [];
    
    let filteredNotifications = userNotifs
      .map(id => notifications.get(id))
      .filter(notif => notif && notif.workspaceId === workspaceId) as Notification[];

    if (!includeRead) {
      filteredNotifications = filteredNotifications.filter(notif => !notif.isRead);
    }

    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    return filteredNotifications.slice(offset, offset + limit);
  }

  async getUnreadCount(userId: string, workspaceId: string): Promise<number> {
    const userNotifs = userNotifications.get(userId) || [];
    
    return userNotifs.reduce((count, notificationId) => {
      const notification = notifications.get(notificationId);
      return count + (notification && !notification.isRead && notification.workspaceId === workspaceId ? 1 : 0);
    }, 0);
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const notification = notifications.get(notificationId);
    
    if (!notification || notification.userId !== userId) {
      return false;
    }

    // Remove from storage
    notifications.delete(notificationId);

    // Remove from user notifications
    const userNotifs = userNotifications.get(userId) || [];
    const index = userNotifs.indexOf(notificationId);
    if (index > -1) {
      userNotifs.splice(index, 1);
      userNotifications.set(userId, userNotifs);
    }

    return true;
  }

  async cleanupExpiredNotifications(): Promise<number> {
    const now = new Date();
    let deletedCount = 0;

    for (const [id, notification] of notifications.entries()) {
      if (notification.expiresAt && new Date(notification.expiresAt) < now) {
        notifications.delete(id);
        
        // Remove from user notifications
        const userNotifs = userNotifications.get(notification.userId) || [];
        const index = userNotifs.indexOf(id);
        if (index > -1) {
          userNotifs.splice(index, 1);
          userNotifications.set(notification.userId, userNotifs);
        }
        
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Helper methods for common notification types
  async notifyTaskAssigned(userId: string, workspaceId: string, task: any) {
    return this.create({
      userId,
      workspaceId,
      type: "task_assigned",
      title: "New Task Assigned",
      message: `You've been assigned a new task: ${task.title}`,
      data: { taskId: task.id },
    });
  }

  async notifyTaskCompleted(userId: string, workspaceId: string, task: any) {
    return this.create({
      userId,
      workspaceId,
      type: "task_completed",
      title: "Task Completed",
      message: `Task "${task.title}" has been completed`,
      data: { taskId: task.id },
    });
  }

  async notifyNoteShared(userId: string, workspaceId: string, note: any, sharedBy: string) {
    return this.create({
      userId,
      workspaceId,
      type: "note_shared",
      title: "Note Shared With You",
      message: `${sharedBy} shared a note with you: ${note.title}`,
      data: { noteId: note.id, sharedBy },
    });
  }

  async notifyRitualCompleted(userId: string, workspaceId: string, ritual: any) {
    return this.create({
      userId,
      workspaceId,
      type: "ritual_completed",
      title: "Ritual Completed! 🎉",
      message: `Great job completing your ritual: ${ritual.name}`,
      data: { ritualId: ritual.id },
    });
  }

  async notifyDealWon(userId: string, workspaceId: string, deal: any) {
    return this.create({
      userId,
      workspaceId,
      type: "deal_won",
      title: "Deal Won! 🎊",
      message: `Congratulations! Deal "${deal.name}" has been won`,
      data: { dealId: deal.id, value: deal.value },
    });
  }

  async notifyMention(userId: string, workspaceId: string, mentionedBy: string, entityType: string, entityName: string) {
    return this.create({
      userId,
      workspaceId,
      type: "mention",
      title: "You were mentioned",
      message: `${mentionedBy} mentioned you in a ${entityType}: ${entityName}`,
      data: { mentionedBy, entityType, entityName },
    });
  }

  private generateId(): string {
    return `notif_${this.notificationIdCounter++}_${Date.now()}`;
  }

  // Get notification statistics
  async getNotificationStats(userId: string, workspaceId: string) {
    const userNotifs = userNotifications.get(userId) || [];
    const workspaceNotifs = userNotifs
      .map(id => notifications.get(id))
      .filter(notif => notif && notif.workspaceId === workspaceId) as Notification[];

    const stats = {
      total: workspaceNotifs.length,
      unread: workspaceNotifs.filter(n => !n.isRead).length,
      byType: {} as Record<NotificationType, number>,
      recentCount: workspaceNotifs.filter(n => 
        new Date(n.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
      ).length,
    };

    // Count by type
    workspaceNotifs.forEach(notif => {
      stats.byType[notif.type] = (stats.byType[notif.type] || 0) + 1;
    });

    return stats;
  }
}

export const notificationManager = NotificationManager.getInstance();
