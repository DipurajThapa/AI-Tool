import React, { useEffect, useState } from 'react';
import { Box, Grid, CircularProgress, Alert, Typography } from '@mui/material';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import DashboardStats from './DashboardStats';
import FinancialForecast from './FinancialForecast';
import AIRecommendations from './AIRecommendations';
import RecentTransactions from './RecentTransactions';
import EmployeeList from './EmployeeList';
import RecentInvoices from './RecentInvoices';
import Notifications from './Notifications';
import { DashboardStats as DashboardStatsType, FinancialForecast as FinancialForecastType, AIRecommendation, Transaction, Employee, Invoice } from '../../services/erpApi';
import { Notification } from '../../services/notificationsApi';

interface DashboardData {
  stats: DashboardStatsType | null;
  forecast: FinancialForecastType | null;
  recommendations: AIRecommendation[];
  transactions: Transaction[];
  employees: Employee[];
  invoices: Invoice[];
  notifications: Notification[];
}

const ERPDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: null,
    forecast: null,
    recommendations: [],
    transactions: [],
    employees: [],
    invoices: [],
    notifications: [],
  });

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          stats,
          forecast,
          recommendations,
          transactions,
          employees,
          invoices,
          notifications,
        ] = await Promise.all([
          apiService.erp.getDashboardStats(),
          apiService.erp.getFinancialForecast(),
          apiService.erp.getAIRecommendations(),
          apiService.erp.getRecentTransactions(),
          apiService.erp.getEmployeeList(),
          apiService.erp.getRecentInvoices(),
          apiService.notifications.getNotifications(),
        ]);

        setDashboardData({
          stats,
          forecast,
          recommendations,
          transactions,
          employees,
          invoices,
          notifications,
        });
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName} {user?.lastName}!
      </Typography>
      <Grid container spacing={3}>
        {/* Stats Section */}
        <Grid item xs={12}>
          <DashboardStats stats={dashboardData.stats} />
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FinancialForecast forecast={dashboardData.forecast} />
            </Grid>
            <Grid item xs={12}>
              <AIRecommendations recommendations={dashboardData.recommendations} />
            </Grid>
            <Grid item xs={12}>
              <RecentTransactions transactions={dashboardData.transactions} />
            </Grid>
            <Grid item xs={12}>
              <EmployeeList employees={dashboardData.employees} />
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RecentInvoices invoices={dashboardData.invoices} />
            </Grid>
            <Grid item xs={12}>
              <Notifications notifications={dashboardData.notifications} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ERPDashboard; 