import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Chip,
} from '@mui/material';
import { Customer, AIInsight } from '../../services/crmApi';

interface CustomerInsightsProps {
  customer: Customer;
  insights: AIInsight[];
}

const CustomerInsights: React.FC<CustomerInsightsProps> = ({
  customer,
  insights,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getChurnRiskColor = (risk: number) => {
    if (risk < 30) return 'success';
    if (risk < 70) return 'warning';
    return 'error';
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Customer Insights
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {customer.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {customer.company} • {customer.industry}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2">
            Lifetime Value: {formatCurrency(customer.lifetime_value)}
          </Typography>
          <Chip
            label={`${customer.churn_risk}% Churn Risk`}
            color={getChurnRiskColor(customer.churn_risk)}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Last Purchase: {formatDate(customer.last_purchase_date)}
        </Typography>
      </Box>
      <Typography variant="subtitle2" gutterBottom>
        AI Insights
      </Typography>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {insights.map((insight) => (
          <ListItem
            key={insight.id}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">
                    {insight.type.replace('_', ' ').toUpperCase()}
                  </Typography>
                  <Chip
                    label={`${insight.score}%`}
                    color={
                      insight.type === 'churn_risk'
                        ? getChurnRiskColor(insight.score)
                        : insight.type === 'upsell_opportunity'
                        ? 'success'
                        : 'primary'
                    }
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {insight.details}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    Generated on {formatDate(insight.created_at)}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default CustomerInsights; 