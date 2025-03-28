import { AxiosInstance } from 'axios';

export interface Ticket {
  id: number;
  customer_id: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  content: string;
  created_at: string;
  is_internal: boolean;
}

export interface SupportStats {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  average_resolution_time: number;
  customer_satisfaction: number;
  tickets_by_priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  tickets_by_status: {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
  };
}

export class SupportApi {
  constructor(private axiosInstance: AxiosInstance) {}

  // Ticket endpoints
  async getTickets(): Promise<Ticket[]> {
    const response = await this.axiosInstance.get<Ticket[]>('/support/tickets');
    return response.data;
  }

  async getTicket(id: number): Promise<Ticket> {
    const response = await this.axiosInstance.get<Ticket>(`/support/tickets/${id}`);
    return response.data;
  }

  async createTicket(data: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'resolved_at'>): Promise<Ticket> {
    const response = await this.axiosInstance.post<Ticket>('/support/tickets', data);
    return response.data;
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket> {
    const response = await this.axiosInstance.patch<Ticket>(`/support/tickets/${id}`, data);
    return response.data;
  }

  async deleteTicket(id: number): Promise<void> {
    await this.axiosInstance.delete(`/support/tickets/${id}`);
  }

  // Comment endpoints
  async getTicketComments(ticketId: number): Promise<TicketComment[]> {
    const response = await this.axiosInstance.get<TicketComment[]>(`/support/tickets/${ticketId}/comments`);
    return response.data;
  }

  async createTicketComment(ticketId: number, data: Omit<TicketComment, 'id' | 'created_at'>): Promise<TicketComment> {
    const response = await this.axiosInstance.post<TicketComment>(`/support/tickets/${ticketId}/comments`, data);
    return response.data;
  }

  // Stats endpoint
  async getStats(): Promise<SupportStats> {
    const response = await this.axiosInstance.get<SupportStats>('/support/stats');
    return response.data;
  }
} 