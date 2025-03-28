import { AxiosInstance } from 'axios';
import { ApiResponse, Lead, Customer, PaginatedResponse } from '../types';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  status: 'active' | 'inactive' | 'churned';
  lifetime_value: number;
  churn_risk: number;
  last_purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: number;
  lead_id: number;
  name: string;
  amount: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  customer_id: number;
  deal_id?: number;
  type: 'call' | 'email' | 'meeting' | 'note';
  description: string;
  date: string;
  created_by: number;
}

export interface CRMStats {
  total_customers: number;
  active_customers: number;
  total_deals: number;
  open_deals: number;
  won_deals: number;
  total_revenue: number;
  average_deal_size: number;
  win_rate: number;
}

export interface Communication {
  id: number;
  lead_id: number;
  type: 'email' | 'call' | 'meeting' | 'note';
  subject: string;
  content: string;
  date: string;
  created_by: number;
}

export interface SalesPipeline {
  id: number;
  name: string;
  stages: {
    id: number;
    name: string;
    order: number;
    probability: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: number;
  type: 'churn_risk' | 'upsell_opportunity' | 'engagement_score';
  customer_id: number;
  score: number;
  details: string;
  created_at: string;
}

export class CRMApi {
  constructor(private axios: AxiosInstance) {}

  async getLeads(page: number = 1, size: number = 10): Promise<ApiResponse<PaginatedResponse<Lead>>> {
    const response = await this.axios.get('/crm/leads', {
      params: { page, size }
    });
    return response.data;
  }

  async getLeadById(id: number): Promise<ApiResponse<Lead>> {
    const response = await this.axios.get(`/crm/leads/${id}`);
    return response.data;
  }

  async createLead(data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Lead>> {
    const response = await this.axios.post('/crm/leads', data);
    return response.data;
  }

  async updateLead(id: number, data: Partial<Lead>): Promise<ApiResponse<Lead>> {
    const response = await this.axios.put(`/crm/leads/${id}`, data);
    return response.data;
  }

  async deleteLead(id: number): Promise<ApiResponse<void>> {
    const response = await this.axios.delete(`/crm/leads/${id}`);
    return response.data;
  }

  async getCustomers(page: number = 1, size: number = 10): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    const response = await this.axios.get('/crm/customers', {
      params: { page, size }
    });
    return response.data;
  }

  async getCustomerById(id: number): Promise<ApiResponse<Customer>> {
    const response = await this.axios.get(`/crm/customers/${id}`);
    return response.data;
  }

  async createCustomer(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Customer>> {
    const response = await this.axios.post('/crm/customers', data);
    return response.data;
  }

  async updateCustomer(id: number, data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    const response = await this.axios.put(`/crm/customers/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: number): Promise<ApiResponse<void>> {
    const response = await this.axios.delete(`/crm/customers/${id}`);
    return response.data;
  }

  async getDeals(): Promise<Deal[]> {
    const response = await this.axios.get<Deal[]>('/crm/deals');
    return response.data;
  }

  async getDeal(id: number): Promise<Deal> {
    const response = await this.axios.get<Deal>(`/crm/deals/${id}`);
    return response.data;
  }

  async createDeal(data: Omit<Deal, 'id' | 'created_at' | 'updated_at'>): Promise<Deal> {
    const response = await this.axios.post<Deal>('/crm/deals', data);
    return response.data;
  }

  async updateDeal(id: number, data: Partial<Deal>): Promise<Deal> {
    const response = await this.axios.patch<Deal>(`/crm/deals/${id}`, data);
    return response.data;
  }

  async deleteDeal(id: number): Promise<void> {
    await this.axios.delete(`/crm/deals/${id}`);
  }

  async getActivities(customerId?: number): Promise<Activity[]> {
    const url = customerId ? `/crm/activities?customer_id=${customerId}` : '/crm/activities';
    const response = await this.axios.get<Activity[]>(url);
    return response.data;
  }

  async createActivity(data: Omit<Activity, 'id' | 'created_by'>): Promise<Activity> {
    const response = await this.axios.post<Activity>('/crm/activities', data);
    return response.data;
  }

  async getStats(): Promise<CRMStats> {
    const response = await this.axios.get<CRMStats>('/crm/stats');
    return response.data;
  }

  async getCommunications(leadId: number): Promise<Communication[]> {
    const response = await this.axios.get<Communication[]>(`/crm/leads/${leadId}/communications`);
    return response.data;
  }

  async createCommunication(data: Omit<Communication, 'id' | 'created_by'>): Promise<Communication> {
    const response = await this.axios.post<Communication>('/crm/communications', data);
    return response.data;
  }

  async getPipelines(): Promise<SalesPipeline[]> {
    const response = await this.axios.get<SalesPipeline[]>('/crm/pipelines');
    return response.data;
  }

  async getPipeline(id: number): Promise<SalesPipeline> {
    const response = await this.axios.get<SalesPipeline>(`/crm/pipelines/${id}`);
    return response.data;
  }

  async createPipeline(data: Omit<SalesPipeline, 'id' | 'created_at' | 'updated_at'>): Promise<SalesPipeline> {
    const response = await this.axios.post<SalesPipeline>('/crm/pipelines', data);
    return response.data;
  }

  async updatePipeline(id: number, data: Partial<SalesPipeline>): Promise<SalesPipeline> {
    const response = await this.axios.patch<SalesPipeline>(`/crm/pipelines/${id}`, data);
    return response.data;
  }

  async getCustomerInsights(customerId: number): Promise<AIInsight[]> {
    const response = await this.axios.get<AIInsight[]>(`/crm/customers/${customerId}/insights`);
    return response.data;
  }

  async getLeadScore(leadId: number): Promise<number> {
    const response = await this.axios.get<{ score: number }>(`/crm/leads/${leadId}/score`);
    return response.data.score;
  }

  async getChurnRisk(customerId: number): Promise<number> {
    const response = await this.axios.get<{ risk: number }>(`/crm/customers/${customerId}/churn-risk`);
    return response.data.risk;
  }
} 