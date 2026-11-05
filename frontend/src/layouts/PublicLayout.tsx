import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Stack,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { designTokens } from '../theme/tokens.js';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Top Navigation Bar - Ultra-Luxe Glassmorphism Navbar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: isLandingPage
            ? isScrolled
              ? 'rgba(12, 20, 13, 0.78)'
              : 'rgba(12, 20, 13, 0.45)'
            : 'rgba(250, 248, 245, 0.78)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid',
          borderColor: isLandingPage
            ? 'rgba(255, 255, 255, 0.14)'
            : 'rgba(72, 90, 50, 0.12)',
          boxShadow: isLandingPage
            ? '0 8px 32px 0 rgba(0, 0, 0, 0.35)'
            : '0 8px 32px 0 rgba(45, 90, 39, 0.06)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1.2 }}>
            <Stack
              direction="row"
              spacing={1.8}
              alignItems="center"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: '#FFFFFF',
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  border: isLandingPage ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                }}
              >
                <SchoolIcon fontSize="small" />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: designTokens.typography.fontSerif,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    lineHeight: 1.1,
                    color: isLandingPage ? '#FFFFFF' : 'text.primary',
                    textShadow: isLandingPage ? '0 2px 8px rgba(0, 0, 0, 0.6)' : 'none',
                  }}
                >
                  EDUSPHERE
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: isLandingPage ? '#BDE4A7' : 'primary.main',
                  }}
                >
                  ENTERPRISE PLATFORM
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="text"
                onClick={() => {
                  if (!isLandingPage) {
                    navigate('/');
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                sx={{
                  color: isLandingPage ? 'rgba(255, 255, 255, 0.9)' : 'text.primary',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  fontSize: '0.74rem',
                  display: { xs: 'none', md: 'inline-flex' },
                  px: 2,
                  py: 0.8,
                  borderRadius: 2,
                  '&:hover': {
                    color: isLandingPage ? '#BDE4A7' : 'primary.main',
                    bgcolor: isLandingPage ? 'rgba(255, 255, 255, 0.08)' : 'rgba(72, 90, 50, 0.06)',
                  },
                }}
              >
                Platform
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  fontSize: '0.74rem',
                  px: 2.8,
                  py: 1,
                  bgcolor: isLandingPage ? 'rgba(72, 90, 50, 0.85)' : 'primary.main',
                  color: '#FFFFFF',
                  border: isLandingPage ? '1px solid rgba(189, 228, 167, 0.4)' : 'none',
                  backdropFilter: isLandingPage ? 'blur(10px)' : 'none',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  '&:hover': {
                    bgcolor: '#485A32',
                    borderColor: '#BDE4A7',
                  },
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Routed Content - Padded only for non-landing pages */}
      <Box component="main" sx={{ flexGrow: 1, pt: isLandingPage ? 0 : '68px' }}>
        <Outlet />
      </Box>

      {/* Footer - The Boundary Deep Forest Luxury Footer */}
      <Box
        component="footer"
        sx={{
          py: 5,
          px: 2,
          mt: 'auto',
          bgcolor: '#141A12',
          color: '#FAF8F5',
          borderTop: '1px solid rgba(220, 214, 200, 0.15)',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2.5}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <SchoolIcon sx={{ color: 'primary.light' }} />
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: designTokens.typography.fontSerif,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                EduSphere Platform
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'rgba(250, 248, 245, 0.6)', fontSize: '0.8rem' }}>
              Multi-Tenant Enterprise Learning Management System © 2026. All rights reserved.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};
