import { AxiosInstance } from 'axios';
import { ApiResponse } from '../types';

export interface DashboardStats {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  employee_count: number;
  pending_invoices: number;
  total_orders: number;
  average_order_value: number;
  customer_satisfaction: number;
}

export interface FinancialForecast {
  revenue_forecast: number[];
  expense_forecast: number[];
  confidence_score: number;
  key_factors: string[];
}

export interface AIRecommendation {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export interface Transaction {
  id: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
}

export interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  salary: number;
  hire_date: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  vendor: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

export interface PayrollRecord {
  id: number;
  employee_id: number;
  pay_period: string;
  gross_salary: number;
  deductions: {
    tax: number;
    benefits: number;
    other: number;
  };
  net_salary: number;
  status: 'pending' | 'processed' | 'paid';
  payment_date: string;
}

export interface Budget {
  id: number;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  fiscal_year: string;
  department: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  parent_category?: string;
}

export class ERPApi {
  constructor(private api: AxiosInstance) {}

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.api.get<DashboardStats>('/erp/dashboard/stats');
    return response.data;
  }

  async getFinancialForecast(): Promise<FinancialForecast> {
    const response = await this.api.get<FinancialForecast>('/erp/dashboard/forecast');
    return response.data;
  }

  async getAIRecommendations(): Promise<AIRecommendation[]> {
    const response = await this.api.get<AIRecommendation[]>('/erp/dashboard/recommendations');
    return response.data;
  }

  // Transaction endpoints
  async getRecentTransactions(): Promise<Transaction[]> {
    const response = await this.api.get<Transaction[]>('/erp/transactions/recent');
    return response.data;
  }

  async createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    const response = await this.api.post<Transaction>('/erp/transactions', data);
    return response.data;
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction> {
    const response = await this.api.patch<Transaction>(`/erp/transactions/${id}`, data);
    return response.data;
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.api.delete(`/erp/transactions/${id}`);
  }

  // Employee endpoints
  async getEmployeeList(): Promise<Employee[]> {
    const response = await this.api.get<Employee[]>('/erp/employees');
    return response.data;
  }

  async getEmployee(id: number): Promise<Employee> {
    const response = await this.api.get<Employee>(`/erp/employees/${id}`);
    return response.data;
  }

  async createEmployee(data: Omit<Employee, 'id'>): Promise<Employee> {
    const response = await this.api.post<Employee>('/erp/employees', data);
    return response.data;
  }

  async updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
    const response = await this.api.patch<Employee>(`/erp/employees/${id}`, data);
    return response.data;
  }

  async deleteEmployee(id: number): Promise<void> {
    await this.api.delete(`/erp/employees/${id}`);
  }

  // Invoice endpoints
  async getRecentInvoices(): Promise<Invoice[]> {
    const response = await this.api.get<Invoice[]>('/erp/invoices/recent');
    return response.data;
  }

  async uploadInvoice(file: File): Promise<Invoice> {
    const formData = new FormData();
    formData.append('invoice', file);
    const response = await this.api.post<Invoice>('/erp/invoices/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async processInvoice(id: number): Promise<Invoice> {
    const response = await this.api.post<Invoice>(`/erp/invoices/${id}/process`);
    return response.data;
  }

  // Payroll endpoints
  async getPayrollRecords(employeeId?: number): Promise<PayrollRecord[]> {
    const url = employeeId ? `/erp/payroll?employee_id=${employeeId}` : '/erp/payroll';
    const response = await this.api.get<PayrollRecord[]>(url);
    return response.data;
  }

  async processPayroll(): Promise<void> {
    await this.api.post('/erp/payroll/process');
  }

  // Budget endpoints
  async getBudgets(fiscalYear?: string): Promise<Budget[]> {
    const url = fiscalYear ? `/erp/budgets?fiscal_year=${fiscalYear}` : '/erp/budgets';
    const response = await this.api.get<Budget[]>(url);
    return response.data;
  }

  async createBudget(data: Omit<Budget, 'id'>): Promise<Budget> {
    const response = await this.api.post<Budget>('/erp/budgets', data);
    return response.data;
  }

  async updateBudget(id: number, data: Partial<Budget>): Promise<Budget> {
    const response = await this.api.patch<Budget>(`/erp/budgets/${id}`, data);
    return response.data;
  }

  // Expense categories endpoints
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const response = await this.api.get<ExpenseCategory[]>('/erp/expense-categories');
    return response.data;
  }

  async createExpenseCategory(data: Omit<ExpenseCategory, 'id'>): Promise<ExpenseCategory> {
    const response = await this.api.post<ExpenseCategory>('/erp/expense-categories', data);
    return response.data;
  }

  async updateExpenseCategory(id: number, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const response = await this.api.patch<ExpenseCategory>(`/erp/expense-categories/${id}`, data);
    return response.data;
  }

  async deleteExpenseCategory(id: number): Promise<void> {
    await this.api.delete(`/erp/expense-categories/${id}`);
  }
} 