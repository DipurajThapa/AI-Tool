import React from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FinancialForecast as FinancialForecastType } from '../../services/erpApi';

interface FinancialForecastProps {
  forecast: FinancialForecastType | null;
}

const FinancialForecast: React.FC<FinancialForecastProps> = ({ forecast }) => {
  if (!forecast) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const data = months.map((month, index) => ({
    name: month,
    revenue: forecast.revenue_forecast[index],
    expenses: forecast.expense_forecast[index],
  }));

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Financial Forecast
      </Typography>
      <Box sx={{ flexGrow: 1, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 16,
              right: 16,
              bottom: 0,
              left: 24,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2196f3"
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#f44336"
              name="Expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Forecast Confidence: {forecast.confidence_score}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={forecast.confidence_score}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Key Factors Affecting Forecast:
        </Typography>
        <List dense>
          {forecast.key_factors.map((factor, index) => (
            <ListItem key={index}>
              <ListItemText primary={factor} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default FinancialForecast; 