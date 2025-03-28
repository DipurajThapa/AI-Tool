import { AxiosInstance } from 'axios';
import { ApiResponse, Workflow, WorkflowStep, PaginatedResponse } from '../types';

export interface WorkflowExecution {
  id: number;
  workflow_id: number;
  status: string;
  started_at: string;
  completed_at: string;
  result: any;
  error?: string;
}

export class WorkflowApi {
  constructor(private axios: AxiosInstance) {}

  async getWorkflows(page: number = 1, size: number = 10): Promise<ApiResponse<PaginatedResponse<Workflow>>> {
    const response = await this.axios.get('/workflows', {
      params: { page, size }
    });
    return response.data;
  }

  async getWorkflowById(id: number): Promise<ApiResponse<Workflow>> {
    const response = await this.axios.get(`/workflows/${id}`);
    return response.data;
  }

  async createWorkflow(data: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Workflow>> {
    const response = await this.axios.post('/workflows', data);
    return response.data;
  }

  async updateWorkflow(id: number, data: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    const response = await this.axios.put(`/workflows/${id}`, data);
    return response.data;
  }

  async deleteWorkflow(id: number): Promise<ApiResponse<void>> {
    const response = await this.axios.delete(`/workflows/${id}`);
    return response.data;
  }

  async getWorkflowSteps(workflowId: number): Promise<ApiResponse<WorkflowStep[]>> {
    const response = await this.axios.get(`/workflows/${workflowId}/steps`);
    return response.data;
  }

  async addWorkflowStep(workflowId: number, data: Omit<WorkflowStep, 'id'>): Promise<ApiResponse<WorkflowStep>> {
    const response = await this.axios.post(`/workflows/${workflowId}/steps`, data);
    return response.data;
  }

  async updateWorkflowStep(workflowId: number, stepId: number, data: Partial<WorkflowStep>): Promise<ApiResponse<WorkflowStep>> {
    const response = await this.axios.put(`/workflows/${workflowId}/steps/${stepId}`, data);
    return response.data;
  }

  async deleteWorkflowStep(workflowId: number, stepId: number): Promise<ApiResponse<void>> {
    const response = await this.axios.delete(`/workflows/${workflowId}/steps/${stepId}`);
    return response.data;
  }

  async executeWorkflow(id: number, input: any): Promise<ApiResponse<WorkflowExecution>> {
    const response = await this.axios.post(`/workflows/${id}/execute`, { input });
    return response.data;
  }

  async getWorkflowExecution(workflowId: number, executionId: number): Promise<ApiResponse<WorkflowExecution>> {
    const response = await this.axios.get(`/workflows/${workflowId}/executions/${executionId}`);
    return response.data;
  }

  async getWorkflowExecutions(workflowId: number, page: number = 1, size: number = 10): Promise<ApiResponse<PaginatedResponse<WorkflowExecution>>> {
    const response = await this.axios.get(`/workflows/${workflowId}/executions`, {
      params: { page, size }
    });
    return response.data;
  }
} 