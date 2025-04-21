import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Button, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TimelineIcon from '@mui/icons-material/Timeline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Navigation = () => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        component={RouterLink}
        to="/"
        color="inherit"
        startIcon={<DashboardIcon />}
      >
        Dashboard
      </Button>
      <Button
        component={RouterLink}
        to="/upload"
        color="inherit"
        startIcon={<CloudUploadIcon />}
      >
        Upload Data
      </Button>
      <Button
        component={RouterLink}
        to="/predictions"
        color="inherit"
        startIcon={<TimelineIcon />}
      >
        Predictions
      </Button>
      <Button
        component={RouterLink}
        to="/recommendations"
        color="inherit"
        startIcon={<LightbulbIcon />}
      >
        Recommendations
      </Button>
    </Box>
  );
};

export default Navigation; 