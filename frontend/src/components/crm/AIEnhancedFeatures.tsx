import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  AutoGraph as AutoGraphIcon,
  Timeline as TimelineIcon,
  SentimentSatisfied as SentimentIcon,
  Email as EmailIcon,
  Topic as TopicIcon,
  TrendingUp as TrendingUpIcon,
  Map as MapIcon,
  CompareArrows as CompareIcon,
  SmartToy as SmartToyIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { Customer, Deal, AIInsight } from '../../services/crmApi';

interface AIEnhancedFeaturesProps {
  customers: Customer[];
  deals: Deal[];
  insights: AIInsight[];
}

interface FeatureCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  metrics: {
    label: string;
    value: string | number;
    trend?: number;
  }[];
  color: 'primary' | 'success' | 'error' | 'warning' | 'info';
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  icon,
  description,
  metrics,
  color,
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
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" paragraph>
        {description}
      </Typography>
      <List dense>
        {metrics.map((metric, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={metric.label}
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    {metric.value}
                  </Typography>
                  {metric.trend !== undefined && (
                    <Chip
                      label={`${metric.trend >= 0 ? '+' : ''}${metric.trend}%`}
                      color={metric.trend >= 0 ? 'success' : 'error'}
                      size="small"
                    />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

const AIEnhancedFeatures: React.FC<AIEnhancedFeaturesProps> = ({
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

  // Calculate AI-powered metrics
  const totalCustomers = customers.length;
  const highValueCustomers = customers.filter(c => c.lifetime_value > 100000).length;
  const engagementScore = 85; // This would be calculated based on customer interactions
  const sentimentScore = 92; // This would be calculated using NLP on customer communications
  const averageResponseTime = '2.5h'; // This would be calculated based on historical data
  const conversionRate = 68; // This would be calculated based on lead-to-customer conversion

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        AI-Enhanced Features
      </Typography>

      <Grid container spacing={3}>
        {/* Lead Scoring & Qualification */}
        <Grid item xs={12} md={6}>
          <FeatureCard
            title="AI-Powered Lead Scoring"
            icon={<PsychologyIcon color="primary" />}
            description="Advanced lead qualification using machine learning models analyzing behavior patterns and historical data"
            metrics={[
              { label: 'High-Quality Leads', value: '24', trend: 12 },
              { label: 'Conversion Probability', value: '68%', trend: 5 },
              { label: 'Average Response Time', value: averageResponseTime, trend: -15 },
            ]}
            color="primary"
          />
        </Grid>

        {/* Natural Language Processing */}
        <Grid item xs={12} md={6}>
          <FeatureCard
            title="Natural Language Processing"
            icon={<SentimentIcon color="success" />}
            description="Advanced text analysis for customer communications and sentiment tracking"
            metrics={[
              { label: 'Sentiment Score', value: `${sentimentScore}%`, trend: 3 },
              { label: 'Key Topics Identified', value: '156', trend: 8 },
              { label: 'Response Suggestions', value: '89%', trend: 5 },
            ]}
            color="success"
          />
        </Grid>

        {/* Sales Forecasting */}
        <Grid item xs={12} md={6}>
          <FeatureCard
            title="Predictive Sales Forecasting"
            icon={<TimelineIcon color="warning" />}
            description="AI-driven revenue predictions and pipeline analysis based on historical data and market trends"
            metrics={[
              { label: 'Revenue Forecast', value: formatCurrency(2500000), trend: 15 },
              { label: 'Pipeline Velocity', value: '2.3x', trend: 8 },
              { label: 'Deal Closure Rate', value: '72%', trend: 5 },
            ]}
            color="warning"
          />
        </Grid>

        {/* Customer Journey Analytics */}
        <Grid item xs={12} md={6}>
          <FeatureCard
            title="Customer Journey Analytics"
            icon={<MapIcon color="info" />}
            description="AI-powered journey mapping and optimization recommendations"
            metrics={[
              { label: 'Journey Touchpoints', value: '8', trend: 2 },
              { label: 'Friction Points', value: '3', trend: -1 },
              { label: 'Optimization Score', value: '92%', trend: 5 },
            ]}
            color="info"
          />
        </Grid>

        {/* Competitive Intelligence */}
        <Grid item xs={12} md={6}>
          <FeatureCard
            title="Competitive Intelligence"
            icon={<CompareIcon color="error" />}
            description="AI-driven market analysis and competitor behavior tracking"
            metrics={[
              { label: 'Market Share', value: '24%', trend: 3 },
              { label: 'Price Competitiveness', value: '92%', trend: 5 },
              { label: 'Competitor Moves', value: '12', trend: 2 },
            ]}
            color="error"
          />
        </Grid>

        {/* Workflow Optimization */}
        <Grid item xs={12} md={6}>
          <FeatureCard
            title="Workflow Optimization"
            icon={<SpeedIcon color="primary" />}
            description="AI-powered task prioritization and process optimization"
            metrics={[
              { label: 'Process Efficiency', value: '89%', trend: 7 },
              { label: 'Task Automation', value: '45%', trend: 12 },
              { label: 'Resource Utilization', value: '92%', trend: 5 },
            ]}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* AI Recommendations Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          AI-Powered Recommendations
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  <SmartToyIcon sx={{ mr: 1 }} />
                  Smart Automation
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Automated Email Responses"
                      secondary="AI generates personalized email responses based on customer context"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TopicIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Content Generation"
                      secondary="AI creates personalized content for different customer segments"
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
                  <AnalyticsIcon sx={{ mr: 1 }} />
                  Predictive Analytics
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Revenue Predictions"
                      secondary="AI forecasts revenue based on historical data and market trends"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AutoGraphIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Customer Behavior"
                      secondary="AI predicts customer behavior patterns and suggests engagement strategies"
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

export default AIEnhancedFeatures; 