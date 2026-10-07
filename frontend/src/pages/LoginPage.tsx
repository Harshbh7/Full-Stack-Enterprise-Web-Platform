import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  Divider,
  Alert,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import GoogleIcon from '@mui/icons-material/Google';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '../services/api.js';
import { useAppDispatch } from '../store/index.js';
import { setCredentials } from '../store/slices/authSlice.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const initialTenant = searchParams.get('tenant') || 'apex-uni';

  const [tenantSlug, setTenantSlug] = useState(initialTenant);
  const [email, setEmail] = useState('admin@apex.edu');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { role: 'SUPER_ADMIN', email: 'superadmin@edusphere.io', tenant: 'global', label: 'Super Admin' },
    { role: 'TENANT_ADMIN', email: 'admin@apex.edu', tenant: 'apex-uni', label: 'Tenant Admin' },
    { role: 'INSTRUCTOR', email: 'prof.smith@apex.edu', tenant: 'apex-uni', label: 'Instructor' },
    { role: 'STUDENT', email: 'student.alice@apex.edu', tenant: 'apex-uni', label: 'Student' },
  ];

  const handleQuickFill = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword('Password123!');
    setTenantSlug(acc.tenant);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        tenantSlug: tenantSlug === 'global' ? undefined : tenantSlug,
      });

      if (res.data.success) {
        const { user, accessToken, tenant } = res.data.data;
        dispatch(
          setCredentials({
            user,
            token: accessToken,
            tenant: tenant || undefined,
          })
        );
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3, color: 'text.secondary', fontWeight: 600 }}
      >
        Back to Home
      </Button>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 0.8,
              borderRadius: 1.5,
              display: 'flex',
            }}
          >
            <SchoolIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Sign In to EduSphere
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Select tenant organization & role credentials
            </Typography>
          </Box>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Quick Fill Persona Badges for Viva/Evaluations */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
            FACULTY & EVALUATION DEMO ACCOUNTS (CLICK TO AUTOFILL):
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {demoAccounts.map((acc) => (
              <Chip
                key={acc.role}
                label={acc.label}
                size="small"
                clickable
                color={email === acc.email ? 'primary' : 'default'}
                variant={email === acc.email ? 'filled' : 'outlined'}
                onClick={() => handleQuickFill(acc)}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Box>

        <form onSubmit={handleLogin}>
          <Stack spacing={2.5}>
            <TextField
              select
              label="Tenant Organization"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              fullWidth
              size="small"
              disabled={isLoading}
            >
              <MenuItem value="global">Global Platform (Super Admin)</MenuItem>
              <MenuItem value="apex-uni">Apex University (apex.edusphere.io)</MenuItem>
              <MenuItem value="oakridge-col">Oakridge College (oakridge.edusphere.io)</MenuItem>
              <MenuItem value="summit-inst">Summit Tech Institute (summit.edusphere.io)</MenuItem>
            </TextField>

            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              required
              disabled={isLoading}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              size="small"
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isLoading}
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            OR SIGN IN WITH
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<GoogleIcon />}
          onClick={() => alert('Initiating Google OAuth2 authorization...')}
          disabled={isLoading}
          sx={{ py: 1, borderColor: 'divider', fontWeight: 600 }}
        >
          Google Workspace Account
        </Button>
      </Paper>
    </Container>
  );
};
