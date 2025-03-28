import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
} from '@mui/material';
import { AIRecommendation } from '../../services/erpApi';

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ recommendations }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        AI Recommendations
      </Typography>
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {recommendations.map((recommendation) => (
          <ListItem
            key={recommendation.id}
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
                    {recommendation.title}
                  </Typography>
                  <Chip
                    label={recommendation.priority}
                    color={getPriorityColor(recommendation.priority)}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {recommendation.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    Impact: {recommendation.impact}
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

export default AIRecommendations; 