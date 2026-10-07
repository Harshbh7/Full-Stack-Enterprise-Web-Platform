import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import DomainIcon from '@mui/icons-material/Domain';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  p: 0.8,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SchoolIcon fontSize="medium" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                EduSphere
              </Typography>
              <Chip
                label="Enterprise SaaS"
                size="small"
                variant="outlined"
                color="primary"
                sx={{ ml: 1, fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
              />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="text"
                color="inherit"
                onClick={() => navigate('/')}
                sx={{ fontWeight: 600, display: { xs: 'none', md: 'inline-flex' } }}
              >
                Platform
              </Button>
              <Button
                variant="text"
                color="inherit"
                startIcon={<DomainIcon />}
                onClick={() => navigate('/#tenants')}
                sx={{ fontWeight: 600, display: { xs: 'none', md: 'inline-flex' } }}
              >
                Tenants
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ fontWeight: 600, px: 2.5 }}
              >
                Sign In
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Routed Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          px: 2,
          mt: 'auto',
          bgcolor: '#0F172A',
          color: '#94A3B8',
          borderTop: 1,
          borderColor: '#1E293B',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <SchoolIcon sx={{ color: 'primary.light' }} />
              <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                EduSphere
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                — PGY2-01 Capstone (CAP646 & CAP774)
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Multi-Tenant Enterprise Learning Management System © 2026. All rights reserved.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};
