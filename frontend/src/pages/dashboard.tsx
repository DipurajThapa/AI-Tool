import React from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    LinearProgress,
} from '@mui/material';
import {
    People as PeopleIcon,
    AttachMoney as MoneyIcon,
    SupportAgent as SupportIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { withAuth } from '@/components/auth/withAuth';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Sample data for the line chart
const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
        {
            label: 'Sales',
            data: [65, 59, 80, 81, 56, 55],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
        },
        {
            label: 'Leads',
            data: [28, 48, 40, 19, 86, 27],
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1,
        },
    ],
};

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Sales and Leads Overview',
        },
    },
};

// Sample data for overview cards
const overviewCards = [
    {
        title: 'Total Leads',
        value: '1,234',
        icon: <PeopleIcon />,
        color: '#1976d2',
        progress: 75,
    },
    {
        title: 'Sales Revenue',
        value: '$45,678',
        icon: <MoneyIcon />,
        color: '#2e7d32',
        progress: 60,
    },
    {
        title: 'Support Tickets',
        value: '89',
        icon: <SupportIcon />,
        color: '#ed6c02',
        progress: 45,
    },
    {
        title: 'Tasks Completed',
        value: '156',
        icon: <CheckIcon />,
        color: '#9c27b0',
        progress: 90,
    },
];

// Sample data for recent activity
const recentActivity = [
    {
        id: 1,
        title: 'New lead assigned',
        description: 'John Doe from Acme Corp',
        timestamp: '2 hours ago',
    },
    {
        id: 2,
        title: 'Sales proposal sent',
        description: 'To Jane Smith at TechCorp',
        timestamp: '4 hours ago',
    },
    {
        id: 3,
        title: 'Support ticket resolved',
        description: 'Issue with product integration',
        timestamp: '6 hours ago',
    },
];

// Sample data for AI insights
const aiInsights = [
    {
        id: 1,
        title: 'Sales Trend Analysis',
        description: 'Positive growth in Q2 with 15% increase in conversion rate',
    },
    {
        id: 2,
        title: 'Customer Behavior',
        description: 'Most active customers are in the technology sector',
    },
    {
        id: 3,
        title: 'Performance Metrics',
        description: 'Support response time improved by 25% this month',
    },
];

function Dashboard() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Overview Cards */}
                {overviewCards.map((card) => (
                    <Grid item xs={12} sm={6} md={3} key={card.title}>
                        <Card>
                            <CardContent>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    mb={2}
                                >
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        color="text.secondary"
                                    >
                                        {card.title}
                                    </Typography>
                                    <Box
                                        sx={{
                                            color: card.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {card.icon}
                                    </Box>
                                </Box>
                                <Typography variant="h4" component="div">
                                    {card.value}
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={card.progress}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: card.color,
                                            },
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* Line Chart */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Line options={chartOptions} data={chartData} />
                    </Paper>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Activity
                        </Typography>
                        {recentActivity.map((activity) => (
                            <Box
                                key={activity.id}
                                sx={{
                                    py: 1,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="subtitle1">
                                    {activity.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {activity.description}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {activity.timestamp}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                {/* AI Insights */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            AI Insights
                        </Typography>
                        {aiInsights.map((insight) => (
                            <Box
                                key={insight.id}
                                sx={{
                                    py: 1,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="subtitle1">
                                    {insight.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {insight.description}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default withAuth(Dashboard); 