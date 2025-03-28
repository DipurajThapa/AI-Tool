import { ApiResponse, PaginatedResponse, Task, Lead, Customer, Workflow, SupportTicket, User } from '../../types';

// Create mock functions with proper typings
const createMockFn = <T>() => jest.fn<Promise<T>, any[]>();

// Mock API modules with Jest mock functions
export const authApi = {
    login: createMockFn<ApiResponse<{ token: string; user: User }>>(),
    register: createMockFn<ApiResponse<{ token: string; user: User }>>(),
    logout: createMockFn<ApiResponse<void>>(),
};

export const erpApi = {
    getTasks: createMockFn<PaginatedResponse<Task>>(),
    getTask: createMockFn<ApiResponse<Task>>(),
    createTask: createMockFn<ApiResponse<Task>>(),
    updateTask: createMockFn<ApiResponse<Task>>(),
    deleteTask: createMockFn<ApiResponse<void>>(),
};

export const crmApi = {
    getLeads: createMockFn<PaginatedResponse<Lead>>(),
    getLead: createMockFn<ApiResponse<Lead>>(),
    createLead: createMockFn<ApiResponse<Lead>>(),
    updateLead: createMockFn<ApiResponse<Lead>>(),
    deleteLead: createMockFn<ApiResponse<void>>(),
};

export const marketingApi = {
    generateContent: createMockFn<ApiResponse<{ content: string; metadata: any }>>(),
    analyzeCampaign: createMockFn<ApiResponse<any>>(),
    getCampaigns: createMockFn<PaginatedResponse<any>>(),
    createCampaign: createMockFn<ApiResponse<any>>(),
    updateCampaign: createMockFn<ApiResponse<any>>(),
    deleteCampaign: createMockFn<ApiResponse<void>>(),
};

export const salesApi = {
    getOpportunities: createMockFn<PaginatedResponse<any>>(),
    getOpportunity: createMockFn<ApiResponse<any>>(),
    createOpportunity: createMockFn<ApiResponse<any>>(),
    updateOpportunity: createMockFn<ApiResponse<any>>(),
    deleteOpportunity: createMockFn<ApiResponse<void>>(),
};

export const supportApi = {
    chatWithAi: createMockFn<ApiResponse<{ message: string; is_ai_response: boolean }>>(),
    getTickets: createMockFn<PaginatedResponse<SupportTicket>>(),
    getTicket: createMockFn<ApiResponse<SupportTicket>>(),
    createTicket: createMockFn<ApiResponse<SupportTicket>>(),
    updateTicket: createMockFn<ApiResponse<SupportTicket>>(),
    deleteTicket: createMockFn<ApiResponse<void>>(),
};

export const workflowApi = {
    executeWorkflow: createMockFn<ApiResponse<{ id: string; status: string }>>(),
    getWorkflows: createMockFn<PaginatedResponse<Workflow>>(),
    getWorkflow: createMockFn<ApiResponse<Workflow>>(),
    createWorkflow: createMockFn<ApiResponse<Workflow>>(),
    updateWorkflow: createMockFn<ApiResponse<Workflow>>(),
    deleteWorkflow: createMockFn<ApiResponse<void>>(),
}; 