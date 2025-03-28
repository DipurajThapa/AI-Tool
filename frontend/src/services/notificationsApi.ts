import { AxiosInstance } from 'axios';

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    financial: boolean;
    hr: boolean;
    operations: boolean;
    system: boolean;
  };
}

export class NotificationsApi {
  constructor(private api: AxiosInstance) {}

  async getNotifications(): Promise<Notification[]> {
    const response = await this.api.get<Notification[]>('/notifications');
    return response.data;
  }

  async markAsRead(id: number): Promise<void> {
    await this.api.post(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await this.api.post('/notifications/read-all');
  }

  async deleteNotification(id: number): Promise<void> {
    await this.api.delete(`/notifications/${id}`);
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await this.api.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  }

  async updatePreferences(data: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await this.api.patch<NotificationPreferences>('/notifications/preferences', data);
    return response.data;
  }
} 