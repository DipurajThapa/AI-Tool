import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import AIEnhancedFeatures from '../components/crm/AIEnhancedFeatures';
import CustomerInsights from '../components/crm/CustomerInsights';
import SalesPipeline from '../components/crm/SalesPipeline';
import LeadList from '../components/crm/LeadList';
import { Customer, Deal, AIInsight } from '../services/crmApi';

// Demo data
const demoCustomers: Customer[] = [
  {
    id: 1,
    name: 'John Smith',
    company: 'Tech Solutions Inc.',
    industry: 'Technology',
    email: 'john@techsolutions.com',
    phone: '555-0123',
    status: 'active',
    lifetime_value: 150000,
    churn_risk: 25,
    last_purchase_date: '2024-02-15',
    created_at: '2024-01-15',
    updated_at: '2024-02-15',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    company: 'Global Industries',
    industry: 'Manufacturing',
    email: 'sarah@globalindustries.com',
    phone: '555-0124',
    status: 'active',
    lifetime_value: 250000,
    churn_risk: 15,
    last_purchase_date: '2024-02-10',
    created_at: '2024-01-10',
    updated_at: '2024-02-10',
  },
  {
    id: 3,
    name: 'Michael Brown',
    company: 'Digital Dynamics',
    industry: 'Software',
    email: 'michael@digitaldynamics.com',
    phone: '555-0125',
    status: 'active',
    lifetime_value: 180000,
    churn_risk: 45,
    last_purchase_date: '2024-02-05',
    created_at: '2024-01-05',
    updated_at: '2024-02-05',
  },
];

const demoDeals: Deal[] = [
  {
    id: 1,
    name: 'Enterprise License',
    amount: 50000,
    stage: 'negotiation',
    probability: 75,
    expected_close_date: '2024-03-15',
    lead_id: 1,
    owner_id: 1,
    created_at: '2024-02-15',
    updated_at: '2024-02-15',
  },
  {
    id: 2,
    name: 'Cloud Services Package',
    amount: 25000,
    stage: 'proposal',
    probability: 60,
    expected_close_date: '2024-03-20',
    lead_id: 2,
    owner_id: 1,
    created_at: '2024-02-10',
    updated_at: '2024-02-10',
  },
  {
    id: 3,
    name: 'Consulting Services',
    amount: 35000,
    stage: 'qualification',
    probability: 40,
    expected_close_date: '2024-03-25',
    lead_id: 3,
    owner_id: 1,
    created_at: '2024-02-05',
    updated_at: '2024-02-05',
  },
];

const demoLeads = [
  {
    id: 1,
    name: 'John Smith',
    company: 'Tech Solutions Inc.',
    email: 'john@techsolutions.com',
    phone: '555-0123',
    source: 'Website',
    status: 'qualified',
    score: 85,
    created_at: '2024-02-15',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    company: 'Global Industries',
    email: 'sarah@globalindustries.com',
    phone: '555-0124',
    source: 'Referral',
    status: 'contacted',
    score: 92,
    created_at: '2024-02-10',
  },
  {
    id: 3,
    name: 'Michael Brown',
    company: 'Digital Dynamics',
    email: 'michael@digitaldynamics.com',
    phone: '555-0125',
    source: 'Trade Show',
    status: 'new',
    score: 78,
    created_at: '2024-02-05',
  },
];

const demoInsights: AIInsight[] = [
  {
    id: 1,
    customer_id: 1,
    type: 'churn_risk',
    score: 25,
    details: 'Customer engagement has increased by 15% in the last month',
    created_at: '2024-02-15',
  },
  {
    id: 2,
    customer_id: 1,
    type: 'upsell_opportunity',
    score: 85,
    details: 'High potential for upgrading to premium package based on usage patterns',
    created_at: '2024-02-14',
  },
  {
    id: 3,
    customer_id: 1,
    type: 'engagement_score',
    score: 92,
    details: 'Positive engagement detected in recent communications',
    created_at: '2024-02-13',
  },
];

const DemoPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI-Enhanced CRM Demo
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Experience the power of AI-driven customer relationship management
        </Typography>

        {/* AI Enhanced Features */}
        <Box sx={{ mb: 4 }}>
          <AIEnhancedFeatures
            customers={demoCustomers}
            deals={demoDeals}
            insights={demoInsights}
          />
        </Box>

        {/* Customer Insights */}
        <Box sx={{ mb: 4 }}>
          <CustomerInsights
            customer={demoCustomers[0]}
            insights={demoInsights}
          />
        </Box>

        {/* Sales Pipeline */}
        <Box sx={{ mb: 4 }}>
          <SalesPipeline
            deals={demoDeals}
            leads={demoLeads}
            onEdit={() => {}}
            onDelete={() => {}}
            onContact={() => {}}
            onDragEnd={() => {}}
          />
        </Box>

        {/* Lead List */}
        <Box sx={{ mb: 4 }}>
          <LeadList
            leads={demoLeads}
            onEdit={() => {}}
            onDelete={() => {}}
            onContact={() => {}}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default DemoPage; 