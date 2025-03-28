import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ERPDashboard from '../ERPDashboard';
import { api } from '../../../services/api';
import { useAuthStore } from '../../../stores/authStore';

// Mock the API service
jest.mock('../../../services/api', () => ({
  api: {
    erpApi: {
      getDashboardStats: jest.fn(),
      getFinancialForecast: jest.fn(),
      getAIRecommendations: jest.fn(),
      getRecentTransactions: jest.fn(),
      getEmployeeList: jest.fn(),
      getRecentInvoices: jest.fn(),
    },
  },
}));

// Mock the auth store
jest.mock('../../../stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockUser = {
  id: 1,
  full_name: 'John Doe',
  email: 'john@example.com',
  role: 'ADMIN',
};

const mockDashboardData = {
  stats: {
    total_revenue: 100000,
    total_expenses: 75000,
    net_profit: 25000,
    employee_count: 50,
    pending_invoices: 5,
    notifications: [
      {
        id: 1,
        type: 'info',
        message: 'New invoice received',
        priority: 'medium',
        created_at: '2024-01-20T10:00:00Z',
      },
    ],
  },
  forecast: {
    revenue_forecast: [100000, 110000, 120000],
    expense_forecast: [75000, 80000, 85000],
    confidence_score: 0.85,
    key_factors: ['Market growth', 'Seasonal trends'],
  },
  recommendations: [
    {
      type: 'financial',
      title: 'Optimize Expenses',
      description: 'Consider reducing operational costs',
      priority: 'high',
      impact: 'High',
    },
  ],
  transactions: [
    {
      id: 1,
      amount: 5000,
      type: 'income',
      category: 'Sales',
      description: 'Product sale',
      date: '2024-01-20',
    },
  ],
  employees: [
    {
      id: 1,
      full_name: 'Jane Smith',
      department: 'Engineering',
      position: 'Senior Developer',
      salary: 120000,
      hire_date: '2023-01-01',
    },
  ],
  invoices: [
    {
      id: 1,
      vendor: 'Supplier A',
      amount: 2500,
      due_date: '2024-02-01',
      status: 'pending',
      invoice_number: 'INV-001',
    },
  ],
};

describe('ERPDashboard', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock the auth store
    (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: mockUser });

    // Mock API responses
    (api.erpApi.getDashboardStats as jest.Mock).mockResolvedValue(mockDashboardData.stats);
    (api.erpApi.getFinancialForecast as jest.Mock).mockResolvedValue(mockDashboardData.forecast);
    (api.erpApi.getAIRecommendations as jest.Mock).mockResolvedValue(mockDashboardData.recommendations);
    (api.erpApi.getRecentTransactions as jest.Mock).mockResolvedValue(mockDashboardData.transactions);
    (api.erpApi.getEmployeeList as jest.Mock).mockResolvedValue(mockDashboardData.employees);
    (api.erpApi.getRecentInvoices as jest.Mock).mockResolvedValue(mockDashboardData.invoices);
  });

  it('renders loading state initially', () => {
    render(<ERPDashboard />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state when API calls fail', async () => {
    // Mock API error
    (api.erpApi.getDashboardStats as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<ERPDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });

  it('renders dashboard data when API calls succeed', async () => {
    render(<ERPDashboard />);

    await waitFor(() => {
      // Check if all components are rendered
      expect(screen.getByText('Welcome back, John Doe')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Financial Forecast')).toBeInTheDocument();
      expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
      expect(screen.getByText('Employee List')).toBeInTheDocument();
      expect(screen.getByText('Recent Invoices')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('displays correct financial data', async () => {
    render(<ERPDashboard />);

    await waitFor(() => {
      expect(screen.getByText('$100,000.00')).toBeInTheDocument(); // Total Revenue
      expect(screen.getByText('$75,000.00')).toBeInTheDocument(); // Total Expenses
      expect(screen.getByText('$25,000.00')).toBeInTheDocument(); // Net Profit
    });
  });

  it('displays correct employee and invoice counts', async () => {
    render(<ERPDashboard />);

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument(); // Employee Count
      expect(screen.getByText('5')).toBeInTheDocument(); // Pending Invoices
    });
  });
}); 