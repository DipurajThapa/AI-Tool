import { AxiosInstance } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

export interface Campaign {
  id: number;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface MarketingMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  averageCPC: number;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface EmailList {
  id: number;
  name: string;
  description: string;
  subscriber_count: number;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  created_at: string;
  updated_at: string;
}

export class MarketingApi {
  constructor(private axiosInstance: AxiosInstance) {}

  // Campaign endpoints
  async getCampaigns(): Promise<Campaign[]> {
    const response = await this.axiosInstance.get<Campaign[]>('/marketing/campaigns');
    return response.data;
  }

  async getCampaign(id: number): Promise<Campaign> {
    const response = await this.axiosInstance.get<Campaign>(`/marketing/campaigns/${id}`);
    return response.data;
  }

  async createCampaign(data: Omit<Campaign, 'id'>): Promise<Campaign> {
    const response = await this.axiosInstance.post<Campaign>('/marketing/campaigns', data);
    return response.data;
  }

  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign> {
    const response = await this.axiosInstance.patch<Campaign>(`/marketing/campaigns/${id}`, data);
    return response.data;
  }

  async deleteCampaign(id: number): Promise<void> {
    await this.axiosInstance.delete(`/marketing/campaigns/${id}`);
  }

  // Email template endpoints
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const response = await this.axiosInstance.get<EmailTemplate[]>('/marketing/templates');
    return response.data;
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate> {
    const response = await this.axiosInstance.get<EmailTemplate>(`/marketing/templates/${id}`);
    return response.data;
  }

  async createEmailTemplate(data: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const response = await this.axiosInstance.post<EmailTemplate>('/marketing/templates', data);
    return response.data;
  }

  async updateEmailTemplate(id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await this.axiosInstance.patch<EmailTemplate>(`/marketing/templates/${id}`, data);
    return response.data;
  }

  async deleteEmailTemplate(id: number): Promise<void> {
    await this.axiosInstance.delete(`/marketing/templates/${id}`);
  }

  // Email list endpoints
  async getEmailLists(): Promise<EmailList[]> {
    const response = await this.axiosInstance.get<EmailList[]>('/marketing/lists');
    return response.data;
  }

  async getEmailList(id: number): Promise<EmailList> {
    const response = await this.axiosInstance.get<EmailList>(`/marketing/lists/${id}`);
    return response.data;
  }

  async createEmailList(data: Omit<EmailList, 'id' | 'created_at' | 'updated_at' | 'subscriber_count'>): Promise<EmailList> {
    const response = await this.axiosInstance.post<EmailList>('/marketing/lists', data);
    return response.data;
  }

  async updateEmailList(id: number, data: Partial<EmailList>): Promise<EmailList> {
    const response = await this.axiosInstance.patch<EmailList>(`/marketing/lists/${id}`, data);
    return response.data;
  }

  async deleteEmailList(id: number): Promise<void> {
    await this.axiosInstance.delete(`/marketing/lists/${id}`);
  }

  // Subscriber endpoints
  async getSubscribers(listId: number): Promise<Subscriber[]> {
    const response = await this.axiosInstance.get<Subscriber[]>(`/marketing/lists/${listId}/subscribers`);
    return response.data;
  }

  async addSubscriber(listId: number, data: Omit<Subscriber, 'id' | 'created_at' | 'updated_at'>): Promise<Subscriber> {
    const response = await this.axiosInstance.post<Subscriber>(`/marketing/lists/${listId}/subscribers`, data);
    return response.data;
  }

  async updateSubscriber(listId: number, subscriberId: number, data: Partial<Subscriber>): Promise<Subscriber> {
    const response = await this.axiosInstance.patch<Subscriber>(`/marketing/lists/${listId}/subscribers/${subscriberId}`, data);
    return response.data;
  }

  async removeSubscriber(listId: number, subscriberId: number): Promise<void> {
    await this.axiosInstance.delete(`/marketing/lists/${listId}/subscribers/${subscriberId}`);
  }

  // Stats endpoint
  async getMetrics(): Promise<MarketingMetrics> {
    const response = await this.axiosInstance.get<MarketingMetrics>('/marketing/metrics');
    return response.data;
  }
} 