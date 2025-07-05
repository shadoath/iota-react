import React, { useState } from 'react';
import { 
  Drawer, 
  IconButton, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Divider,
  Chip 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

interface SidebarProps {
  cardsLeft: number;
  lastTurnScore: number | null;
  pendingPoints: number;
  pendingCount: number;
  turnInProgress: boolean;
  onNewGame: () => void;
  onCompleteTurn: () => void;
  onUndoLast: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  cardsLeft,
  lastTurnScore,
  pendingPoints,
  pendingCount,
  turnInProgress,
  onNewGame,
  onCompleteTurn,
  onUndoLast,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
          zIndex: 1100,
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box sx={{ width: 280, padding: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Game Menu
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Cards Remaining
              </Typography>
              <Typography variant="h4">
                {cardsLeft}
              </Typography>
            </Paper>

            {lastTurnScore !== null && (
              <Paper sx={{ padding: 2, backgroundColor: '#10b981', color: 'white' }}>
                <Typography variant="subtitle2">
                  Last Turn Score
                </Typography>
                <Typography variant="h4">
                  +{lastTurnScore}
                </Typography>
              </Paper>
            )}

            {pendingCount > 0 && (
              <Chip 
                label={`Pending: +${pendingPoints} points`}
                color="warning"
                sx={{ fontSize: '1rem', padding: '8px' }}
              />
            )}

            <Divider sx={{ my: 2 }} />

            <Button 
              variant="contained" 
              fullWidth
              onClick={() => {
                onNewGame();
                setOpen(false);
              }}
              sx={{
                backgroundColor: '#2563eb',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                },
              }}
            >
              New Game
            </Button>

          </Box>
        </Box>
      </Drawer>
    </>
  );
};