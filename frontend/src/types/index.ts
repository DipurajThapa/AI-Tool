export interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    source: string;
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
    assigned_to: number;
    created_at: string;
    updated_at: string;
}

export interface Workflow {
    id: number;
    name: string;
    description: string;
    steps: WorkflowStep[];
    created_at: string;
    updated_at: string;
}

export interface WorkflowStep {
    id: number;
    name: string;
    description: string;
    order: number;
    action_type: string;
    action_config: any;
}

export interface SupportTicket {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    assigned_to: number;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
} 