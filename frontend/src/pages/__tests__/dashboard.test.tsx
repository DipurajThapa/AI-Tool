import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from '../dashboard'
import { erpApi, crmApi, marketingApi } from '../../services/api'

jest.mock('../../services/api')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const mockTasks = {
  data: [
    {
      id: 1,
      title: 'Test Task 1',
      description: 'Test Description 1',
      status: 'pending',
      priority: 'high',
      due_date: '2024-12-31',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 2,
      title: 'Test Task 2',
      description: 'Test Description 2',
      status: 'completed',
      priority: 'medium',
      due_date: '2024-12-31',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ],
  meta: {
    total: 2,
    page: 1,
    size: 10,
    total_pages: 1,
  },
}

const mockLeads = {
  data: [
    {
      id: 1,
      name: 'Test Lead 1',
      email: 'test1@example.com',
      phone: '1234567890',
      company: 'Test Company 1',
      status: 'new',
      score: 80,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 2,
      name: 'Test Lead 2',
      email: 'test2@example.com',
      phone: '0987654321',
      company: 'Test Company 2',
      status: 'contacted',
      score: 60,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ],
  meta: {
    total: 2,
    page: 1,
    size: 10,
    total_pages: 1,
  },
}

const mockContent = {
  data: {
    content: 'Generated content for test',
    metadata: {
      tokens: 100,
      model: 'gpt-4',
    },
  },
}

describe('Dashboard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock API responses
    erpApi.getTasks.mockResolvedValue(mockTasks)
    crmApi.getLeads.mockResolvedValue(mockLeads)
    marketingApi.generateContent.mockResolvedValue(mockContent)
  })

  it('should render dashboard with all components', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    )

    // Wait for all data to load
    await waitFor(() => {
      expect(erpApi.getTasks).toHaveBeenCalled()
      expect(crmApi.getLeads).toHaveBeenCalled()
    }, { timeout: 3000 })

    // Check if all sections are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Tasks Overview')).toBeInTheDocument()
    expect(screen.getByText('Leads Overview')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('should display task data correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument()
      expect(screen.getByText('Test Task 2')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Check task statuses
    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
  })

  it('should display lead data correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Lead 1')).toBeInTheDocument()
      expect(screen.getByText('Test Lead 2')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Check lead statuses
    expect(screen.getByText('new')).toBeInTheDocument()
    expect(screen.getByText('contacted')).toBeInTheDocument()
  })

  it('should handle API errors gracefully', async () => {
    // Mock API errors
    erpApi.getTasks.mockRejectedValue(new Error('Failed to fetch tasks'))
    crmApi.getLeads.mockRejectedValue(new Error('Failed to fetch leads'))

    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    )

    // Wait for error states
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should refresh data when refresh button is clicked', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    )

    // Wait for initial data load
    await waitFor(() => {
      expect(erpApi.getTasks).toHaveBeenCalledTimes(1)
      expect(crmApi.getLeads).toHaveBeenCalledTimes(1)
    }, { timeout: 3000 })

    // Find and click refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    refreshButton.click()

    // Wait for refresh calls
    await waitFor(() => {
      expect(erpApi.getTasks).toHaveBeenCalledTimes(2)
      expect(crmApi.getLeads).toHaveBeenCalledTimes(2)
    }, { timeout: 3000 })
  })
}) 