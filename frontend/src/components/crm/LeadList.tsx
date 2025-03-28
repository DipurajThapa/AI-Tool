import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Lead } from '../../services/crmApi';

interface LeadListProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: number) => void;
  onContact: (lead: Lead, type: 'phone' | 'email') => void;
}

const LeadList: React.FC<LeadListProps> = ({
  leads,
  onEdit,
  onDelete,
  onContact,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'info';
      case 'contacted':
        return 'warning';
      case 'qualified':
        return 'success';
      case 'proposal':
        return 'primary';
      case 'negotiation':
        return 'secondary';
      case 'closed_won':
        return 'success';
      case 'closed_lost':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Leads
      </Typography>
      <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>
                  <Chip
                    label={lead.status.replace('_', ' ')}
                    color={getStatusColor(lead.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {lead.score}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={lead.score}
                      sx={{ width: 50, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </TableCell>
                <TableCell>{formatDate(lead.created_at)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => onContact(lead, 'phone')}
                    sx={{ mr: 1 }}
                  >
                    <PhoneIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onContact(lead, 'email')}
                    sx={{ mr: 1 }}
                  >
                    <EmailIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(lead)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(lead.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default LeadList; 