import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Deal, Lead } from '../../services/crmApi';

interface SalesPipelineProps {
  deals: Deal[];
  leads: Lead[];
  onEdit: (deal: Deal) => void;
  onDelete: (dealId: number) => void;
  onContact: (deal: Deal, type: 'phone' | 'email') => void;
  onDragEnd: (result: DropResult) => void;
}

const stages = [
  { id: 'prospecting', name: 'Prospecting', color: 'info' },
  { id: 'qualification', name: 'Qualification', color: 'warning' },
  { id: 'proposal', name: 'Proposal', color: 'primary' },
  { id: 'negotiation', name: 'Negotiation', color: 'secondary' },
  { id: 'closed_won', name: 'Closed Won', color: 'success' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'error' },
];

const SalesPipeline: React.FC<SalesPipelineProps> = ({
  deals,
  leads,
  onEdit,
  onDelete,
  onContact,
  onDragEnd,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getDealsByStage = (stageId: string) => {
    return deals.filter((deal) => deal.stage === stageId);
  };

  const getLeadById = (leadId: number) => {
    return leads.find((lead) => lead.id === leadId);
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Sales Pipeline
      </Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            flexGrow: 1,
            minHeight: 0,
          }}
        >
          {stages.map((stage) => (
            <Droppable key={stage.id} droppableId={stage.id}>
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    flex: 1,
                    minWidth: 300,
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={getDealsByStage(stage.id).length}
                      color={stage.color as any}
                      size="small"
                    />
                    {stage.name}
                  </Typography>
                  {getDealsByStage(stage.id).map((deal, index) => {
                    const lead = getLeadById(deal.lead_id);
                    return (
                      <Draggable
                        key={deal.id}
                        draggableId={deal.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ mb: 1 }}
                          >
                            <CardContent>
                              <Typography variant="subtitle2" gutterBottom>
                                {deal.name}
                              </Typography>
                              {lead && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  gutterBottom
                                >
                                  {lead.company}
                                </Typography>
                              )}
                              <Typography
                                variant="h6"
                                color="primary"
                                gutterBottom
                              >
                                {formatCurrency(deal.amount)}
                              </Typography>
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Probability: {deal.probability}%
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={deal.probability}
                                  sx={{ height: 4, borderRadius: 2 }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Tooltip title="Call">
                                  <IconButton
                                    size="small"
                                    onClick={() => onContact(deal, 'phone')}
                                    sx={{ mr: 1 }}
                                  >
                                    <PhoneIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Email">
                                  <IconButton
                                    size="small"
                                    onClick={() => onContact(deal, 'email')}
                                    sx={{ mr: 1 }}
                                  >
                                    <EmailIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => onEdit(deal)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => onDelete(deal.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          ))}
        </Box>
      </DragDropContext>
    </Paper>
  );
};

export default SalesPipeline; 