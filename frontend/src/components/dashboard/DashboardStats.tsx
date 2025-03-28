import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { DashboardStats as DashboardStatsType } from '../../services/erpApi';

interface DashboardStatsProps {
  stats: DashboardStatsType | null;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'error' | 'warning';
}> = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box
        sx={{
          backgroundColor: `${color}.lighter`,
          borderRadius: 1,
          p: 1,
          mr: 2,
        }}
      >
        {icon}
      </Box>
      <Typography color="text.secondary" variant="subtitle2">
        {title}
      </Typography>
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  if (!stats) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.total_revenue)}
          icon={<TrendingUpIcon color="primary" />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats.total_expenses)}
          icon={<TrendingDownIcon color="error" />}
          color="error"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Net Profit"
          value={formatCurrency(stats.net_profit)}
          icon={<TrendingUpIcon color="success" />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Employee Count"
          value={stats.employee_count}
          icon={<PeopleIcon color="warning" />}
          color="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Pending Invoices"
          value={stats.pending_invoices}
          icon={<ReceiptIcon color="error" />}
          color="error"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Orders"
          value={stats.total_orders}
          icon={<ReceiptIcon color="primary" />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Average Order Value"
          value={formatCurrency(stats.average_order_value)}
          icon={<TrendingUpIcon color="success" />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Customer Satisfaction"
          value={`${stats.customer_satisfaction}%`}
          icon={<TrendingUpIcon color="warning" />}
          color="warning"
        />
      </Grid>
    </Grid>
  );
};

export default DashboardStats; 