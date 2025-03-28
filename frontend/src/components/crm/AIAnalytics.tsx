import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  AutoGraph as AutoGraphIcon,
} from '@mui/icons-material';
import { Customer, Deal, AIInsight } from '../../services/crmApi';

interface AIAnalyticsProps {
  customers: Customer[];
  deals: Deal[];
  insights: AIInsight[];
}

interface PredictionCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'error' | 'warning';
  description: string;
}

const PredictionCard: React.FC<PredictionCardProps> = ({
  title,
  value,
  trend,
  icon,
  color,
  description,
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
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
      <Typography component="p" variant="h4" gutterBottom>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography
          variant="body2"
          color={trend >= 0 ? 'success.main' : 'error.main'}
          sx={{ mr: 1 }}
        >
          {trend >= 0 ? '+' : ''}{trend}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          vs last month
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const AIAnalytics: React.FC<AIAnalyticsProps> = ({
  customers,
  deals,
  insights,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getChurnRiskColor = (risk: number) => {
    if (risk < 30) return 'success';
    if (risk < 70) return 'warning';
    return 'error';
  };

  // Calculate AI-powered metrics
  const highRiskCustomers = customers.filter(c => c.churn_risk > 70).length;
  const totalCustomers = customers.length;
  const churnRiskPercentage = (highRiskCustomers / totalCustomers) * 100;

  const totalDealValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const averageDealValue = totalDealValue / deals.length;
  const dealValueTrend = 15; // This would be calculated based on historical data

  const upsellOpportunities = insights.filter(
    insight => insight.type === 'upsell_opportunity' && insight.score > 70
  ).length;

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        AI-Powered Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <PredictionCard
            title="Predicted Churn Risk"
            value={`${churnRiskPercentage.toFixed(1)}%`}
            trend={-5}
            icon={<WarningIcon color="error" />}
            color="error"
            description="AI predicts customer churn based on engagement patterns and historical data"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PredictionCard
            title="Average Deal Value"
            value={formatCurrency(averageDealValue)}
            trend={dealValueTrend}
            icon={<TrendingUpIcon color="success" />}
            color="success"
            description="AI analyzes deal patterns to predict optimal pricing and deal structures"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PredictionCard
            title="Upsell Opportunities"
            value={upsellOpportunities}
            trend={8}
            icon={<LightbulbIcon color="warning" />}
            color="warning"
            description="AI identifies high-potential customers for upselling based on behavior analysis"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          AI Recommendations
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  <AutoGraphIcon sx={{ mr: 1 }} />
                  Sales Strategy Optimization
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Best Time to Contact"
                      secondary="AI suggests optimal contact times based on customer behavior patterns"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Personalized Approach"
                      secondary="AI recommends tailored communication strategies for each customer segment"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  <PsychologyIcon sx={{ mr: 1 }} />
                  Customer Engagement Insights
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Engagement Score"
                      secondary="AI calculates customer engagement levels and suggests improvement actions"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Behavioral Patterns"
                      secondary="AI identifies key behavioral patterns that indicate customer satisfaction"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default AIAnalytics; 