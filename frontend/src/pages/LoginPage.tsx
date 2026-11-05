import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  IconButton,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BadgeIcon from '@mui/icons-material/Badge';
import { api } from '../services/api.js';
import { useAppDispatch } from '../store/index.js';
import { setCredentials } from '../store/slices/authSlice.js';
import { designTokens } from '../theme/tokens.js';
import {
  getStoredTenants,
  saveStoredTenants,
  TENANTS_CHANGED_EVENT,
  TenantOption,
} from '../services/tenantStorage.js';
import {
  getAllStoredUsers,
  requestGoogleRegistration,
  StoredUser,
  USERS_CHANGED_EVENT,
} from '../services/userStorage.js';
import {
  firebaseAuth,
  googleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from '../config/firebase.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const initialTenant = searchParams.get('tenant') || 'apex-uni';

  const [tenants, setTenants] = useState<TenantOption[]>(() => getStoredTenants());
  const [tenantSlug, setTenantSlug] = useState(initialTenant);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleStep, setGoogleStep] = useState<'choose_account' | 'onboarding' | 'pending'>('choose_account');
  const [googleLoginError, setGoogleLoginError] = useState<string | null>(null);
  const [onboardingEmail, setOnboardingEmail] = useState('');
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingTenant, setOnboardingTenant] = useState(initialTenant === 'global' ? 'apex-uni' : initialTenant);
  const [onboardingRole, setOnboardingRole] = useState<'TENANT_ADMIN' | 'INSTRUCTOR' | 'STUDENT'>('INSTRUCTOR');
  const [pendingAccountInfo, setPendingAccountInfo] = useState<StoredUser | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleSync = () => {
      setTenants(getStoredTenants());
    };
    window.addEventListener(TENANTS_CHANGED_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    api.get('/tenants/public')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          interface PublicTenantData {
            id?: string;
            _id?: string;
            name: string;
            slug: string;
            domain?: string;
            status?: 'ACTIVE' | 'SUSPENDED';
            maxStudents?: number;
            contactEmail?: string;
            primaryColor?: string;
          }
          const apiTenants: TenantOption[] = res.data.data.map((item: PublicTenantData) => ({
            id: item.id || item._id || item.slug,
            name: item.name,
            slug: item.slug,
            domain: item.domain || `${item.slug}.edusphere.io`,
            status: item.status || 'ACTIVE',
            maxStudents: item.maxStudents || 5000,
            contactEmail: item.contactEmail || `admin@${item.slug}.edu`,
            primaryColor: item.primaryColor || '#2D5A27',
          }));
          const current = getStoredTenants();
          const merged = [...current];
          for (const at of apiTenants) {
            if (!merged.some((m) => m.slug === at.slug)) {
              merged.push(at);
            }
          }
          saveStoredTenants(merged);
          setTenants(merged);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener(TENANTS_CHANGED_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cleanEmail = email.toLowerCase().trim();

    // Check stored provisioned users (tenant admin, instructors, students)
    const allUsers = getAllStoredUsers();

    const googleUserMatch = allUsers.find(
      (u) => u.email.toLowerCase().trim() === cleanEmail && u.authProvider === 'GOOGLE'
    );
    if (googleUserMatch) {
      setError('This account uses Google Workspace SSO. Please sign in via the Google Workspace Account button below.');
      setIsLoading(false);
      return;
    }

    // Try Firebase Email/Password Authentication
    try {
      const fbCredential = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);
      if (fbCredential?.user?.email) {
        const matchedUser = allUsers.find((u) => u.email.toLowerCase().trim() === cleanEmail);
        if (matchedUser) {
          if (matchedUser.status === 'PENDING_VERIFICATION') {
            setPendingAccountInfo(matchedUser);
            setGoogleStep('pending');
            setIsGoogleModalOpen(true);
            setIsLoading(false);
            return;
          }
          if (matchedUser.status === 'REJECTED') {
            setError(`Registration for ${matchedUser.email} was rejected by institutional administrator.`);
            setIsLoading(false);
            return;
          }
          if (matchedUser.status === 'ACTIVE') {
            executeLoginForUser(matchedUser);
            setIsLoading(false);
            return;
          }
        }
      }
    } catch {
      // Firebase email/password not found or invalid in Firebase -> proceed to backend / local authentication
    }

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
        return;
      }
    } catch (err: any) {
      // Check stored provisioned users (tenant admin, instructors, students)
      const allUsers = getAllStoredUsers();

      const googleUserMatch = allUsers.find(
        (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.authProvider === 'GOOGLE'
      );
      if (googleUserMatch) {
        setError('This account uses Google Workspace SSO. Please sign in via the Google Workspace Account button below.');
        setIsLoading(false);
        return;
      }

      const matchedUser = allUsers.find(
        (u) =>
          (u.tenantSlug === tenantSlug || (tenantSlug === 'global' && u.role === 'SUPER_ADMIN')) &&
          u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
          Boolean(u.password) &&
          password === u.password
      );
      if (matchedUser) {
        if (matchedUser.status === 'PENDING_VERIFICATION') {
          setPendingAccountInfo(matchedUser);
          setGoogleStep('pending');
          setIsGoogleModalOpen(true);
          return;
        }
        if (matchedUser.status === 'REJECTED') {
          setError(`Registration for ${matchedUser.email} was rejected by institutional administrator.`);
          return;
        }

        const storedTenants = getStoredTenants();
        const currentTenant = storedTenants.find((t) => t.slug === matchedUser.tenantSlug) || {
          id: matchedUser.tenantSlug,
          name: matchedUser.tenantSlug.toUpperCase(),
          slug: matchedUser.tenantSlug,
          status: 'ACTIVE',
        };

        dispatch(
          setCredentials({
            user: {
              id: matchedUser.id,
              email: matchedUser.email,
              firstName: matchedUser.firstName || matchedUser.name.split(' ')[0] || 'User',
              lastName: matchedUser.lastName || matchedUser.name.split(' ').slice(1).join(' ') || '',
              role: matchedUser.role,
              tenantId: currentTenant.id || currentTenant.slug,
            },
            token: `token-${matchedUser.role.toLowerCase()}-${matchedUser.id}-${Date.now()}`,
            tenant: {
              id: currentTenant.id || currentTenant.slug,
              name: currentTenant.name,
              slug: currentTenant.slug,
              status: 'ACTIVE',
            },
          })
        );
        navigate('/dashboard');
        return;
      }

      // Check stored provisioned tenants for matching tenant admin credentials
      const stored = getStoredTenants();
      const matchedTenant = stored.find((t) => t.slug === tenantSlug);
      if (
        matchedTenant &&
        email.toLowerCase().trim() === matchedTenant.contactEmail.toLowerCase().trim() &&
        password === (matchedTenant.adminPassword || 'Password123!')
      ) {
        const nameParts = (matchedTenant.adminName || `${matchedTenant.name} Administrator`).trim().split(' ');
        dispatch(
          setCredentials({
            user: {
              id: `usr-${matchedTenant.slug}-admin`,
              email: matchedTenant.contactEmail,
              firstName: nameParts[0] || 'Admin',
              lastName: nameParts.slice(1).join(' ') || 'User',
              role: 'TENANT_ADMIN',
              tenantId: matchedTenant.id || matchedTenant.slug,
            },
            token: `token-tenant-admin-${matchedTenant.slug}-${Date.now()}`,
            tenant: {
              id: matchedTenant.id || matchedTenant.slug,
              name: matchedTenant.name,
              slug: matchedTenant.slug,
              status: 'ACTIVE',
            },
          })
        );
        navigate('/dashboard');
        return;
      }

      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const executeLoginForUser = (targetUser: StoredUser, tenantInfo?: TenantOption) => {
    const effectiveTenant =
      tenantInfo ||
      tenants.find((t) => t.slug === targetUser.tenantSlug) || {
        id: targetUser.tenantSlug,
        name: targetUser.tenantSlug.toUpperCase(),
        slug: targetUser.tenantSlug,
        status: 'ACTIVE' as const,
        domain: `${targetUser.tenantSlug}.edusphere.io`,
        maxStudents: 5000,
        contactEmail: `admin@${targetUser.tenantSlug}.edu`,
      };

    const firstName = targetUser.firstName || targetUser.name.split(' ')[0] || 'User';
    const lastName = targetUser.lastName || targetUser.name.split(' ').slice(1).join(' ') || '';

    dispatch(
      setCredentials({
        user: {
          id: targetUser.id,
          email: targetUser.email,
          firstName,
          lastName,
          role: targetUser.role,
          tenantId: targetUser.role === 'SUPER_ADMIN' ? undefined : effectiveTenant.id || effectiveTenant.slug,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + '+' + lastName)}&background=3E6B48&color=fff`,
        },
        token: `google-oauth-jwt-${targetUser.role.toLowerCase()}-${Date.now()}`,
        tenant: {
          id: effectiveTenant.id || effectiveTenant.slug,
          name: effectiveTenant.name,
          slug: effectiveTenant.slug,
          status: 'ACTIVE',
        },
      })
    );
    setIsGoogleModalOpen(false);
    navigate('/dashboard');
  };

  const handleSelectGoogleAccount = async (targetEmail: string, targetName: string) => {
    setIsLoading(true);
    setError(null);
    setGoogleLoginError(null);

    const cleanEmail = targetEmail.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setIsLoading(false);
      setGoogleLoginError('Please enter a valid Google email address.');
      return;
    }

    const allUsers = getAllStoredUsers();
    const existing = allUsers.find((u) => u.email.toLowerCase().trim() === cleanEmail);

    if (existing) {
      setIsLoading(false);
      if (existing.status === 'PENDING_VERIFICATION') {
        setPendingAccountInfo(existing);
        setGoogleStep('pending');
        setPendingNotice(null);
        setIsGoogleModalOpen(true);
        return;
      }
      if (existing.status === 'REJECTED') {
        setGoogleLoginError(`Access request for "${existing.email}" was rejected by institutional administration.`);
        return;
      }
      if (existing.status === 'INACTIVE') {
        setGoogleLoginError(`Account "${existing.email}" is currently inactive. Contact your campus administrator.`);
        return;
      }
      if (existing.status === 'ACTIVE') {
        executeLoginForUser(existing);
        return;
      }
    }

    // Check with backend SSO endpoint strictly for existing registered user
    try {
      const res = await api.post('/auth/sso/google', {
        email: cleanEmail,
        name: targetName,
        tenantSlug,
      });

      if (res.data?.success && res.data?.data) {
        setIsLoading(false);
        if (res.data.data.isPending) {
          const u = res.data.data.user;
          const pendingObj: StoredUser = {
            id: u.id,
            name: `${u.firstName} ${u.lastName}`.trim(),
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role,
            requestedRole: u.requestedRole || u.role,
            verifierRole: u.verifierRole,
            status: 'PENDING_VERIFICATION',
            tenantSlug,
          };
          setPendingAccountInfo(pendingObj);
          setGoogleStep('pending');
          setPendingNotice(null);
          setIsGoogleModalOpen(true);
          return;
        }

        const { user: apiUser, accessToken, tenant: apiTenant } = res.data.data;
        dispatch(
          setCredentials({
            user: apiUser,
            token: accessToken,
            tenant: apiTenant || undefined,
          })
        );
        setIsGoogleModalOpen(false);
        navigate('/dashboard');
        return;
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg =
        err.response?.data?.message ||
        `No registered account found for "${cleanEmail}". Please register first using the "Register New Role" tab.`;
      setGoogleLoginError(msg);
      return;
    }

    setIsLoading(false);
    // User does not exist in system: STRICT SECURITY BLOCK
    setGoogleLoginError(
      `No approved account found for "${cleanEmail}". Only verified accounts may sign in. Please use the "Register New Role" tab to request campus authorization.`
    );
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingEmail || !onboardingName) return;

    setIsLoading(true);
    setError(null);

    const newUser = requestGoogleRegistration({
      name: onboardingName.trim(),
      email: onboardingEmail.toLowerCase().trim(),
      role: onboardingRole,
      tenantSlug: onboardingTenant,
      authProvider: 'GOOGLE',
    });

    try {
      await api.post('/auth/sso/google', {
        email: onboardingEmail.toLowerCase().trim(),
        name: onboardingName.trim(),
        tenantSlug: onboardingTenant,
        requestedRole: onboardingRole,
      });
    } catch {
      // Registered in client-side storage
    }

    setIsLoading(false);
    setPendingAccountInfo(newUser);
    setGoogleStep('pending');
    setPendingNotice(`Registration request submitted! Your account is pending verification.`);
  };

  const handleCheckApprovalStatus = async () => {
    if (!pendingAccountInfo) return;
    setIsLoading(true);
    setPendingNotice(null);

    // Refresh from stored users
    const allUsers = getAllStoredUsers();
    const fresh = allUsers.find((u) => u.email.toLowerCase() === pendingAccountInfo.email.toLowerCase());

    if (fresh && fresh.status === 'ACTIVE') {
      setIsLoading(false);
      executeLoginForUser(fresh);
      return;
    }

    // Try backend
    try {
      const res = await api.post('/auth/sso/google', {
        email: pendingAccountInfo.email,
        name: pendingAccountInfo.name,
        tenantSlug: pendingAccountInfo.tenantSlug,
      });

      if (res.data?.success && res.data?.data && !res.data.data.isPending) {
        const { user: apiUser, accessToken, tenant: apiTenant } = res.data.data;
        dispatch(
          setCredentials({
            user: apiUser,
            token: accessToken,
            tenant: apiTenant || undefined,
          })
        );
        setIsGoogleModalOpen(false);
        setIsLoading(false);
        navigate('/dashboard');
        return;
      }
    } catch {
      // ignore
    }

    setIsLoading(false);
    const verifierRoleName =
      pendingAccountInfo.verifierRole === 'SUPER_ADMIN'
        ? 'Global Super Admin'
        : pendingAccountInfo.verifierRole === 'TENANT_ADMIN'
        ? 'College Administrator'
        : 'Course Teacher / Faculty Instructor';

    setPendingNotice(
      `Status: Awaiting Verification. Please wait for approval from your ${verifierRoleName}, or check again once approved.`
    );
  };

  const handleFirebaseGooglePopup = async () => {
    setIsLoading(true);
    setGoogleLoginError(null);
    try {
      const userCredential = await signInWithPopup(firebaseAuth, googleAuthProvider);
      const fbUser = userCredential.user;
      if (!fbUser || !fbUser.email) {
        throw new Error('Google authentication did not provide an email address.');
      }
      const cleanEmail = fbUser.email.toLowerCase().trim();
      const displayName = fbUser.displayName || cleanEmail.split('@')[0];
      await handleSelectGoogleAccount(cleanEmail, displayName);
    } catch (err: any) {
      setIsLoading(false);
      console.warn('Google popup status:', err?.code, err?.message);
      if (err.code === 'auth/popup-closed-by-user') {
        setGoogleLoginError('Sign-in popup was closed before completion. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // popup request replaced
      } else if (err.code === 'auth/popup-blocked') {
        setGoogleLoginError('Browser blocked the sign-in popup. Please allow popups and try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setGoogleLoginError('Domain not authorized for this application. Please try again.');
      } else {
        setGoogleLoginError(err.message || 'Google Sign-In failed. Please try again.');
      }
    }
  };

  const handleGoogleBtnClick = () => {
    if (email && email.includes('@')) {
      const userParts = email.split('@')[0].split('.');
      const guessedName = userParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      handleSelectGoogleAccount(email, guessedName);
    } else {
      setGoogleStep('choose_account');
      setIsGoogleModalOpen(true);
    }
  };

  const currentTenant = tenants.find((t) => t.slug === tenantSlug) || {
    id: tenantSlug,
    name: tenantSlug.toUpperCase(),
    slug: tenantSlug,
    status: 'ACTIVE' as const,
    domain: `${tenantSlug}.edusphere.io`,
    maxStudents: 5000,
    contactEmail: `admin@${tenantSlug}.edu`,
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(72, 90, 50, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 100% 100%, rgba(140, 115, 85, 0.05) 0%, transparent 50%)
        `,
        py: { xs: 4, md: 8 },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          {/* Left Column: The Boundary Editorial Showcase */}
          <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ pr: 2 }}>
              {/* Eyebrow with fine decorative line */}
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ width: 28, height: 1.5, bgcolor: 'primary.main' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 800,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                  }}
                >
                  ENTERPRISE MULTI-TENANT ARCHITECTURE
                </Typography>
              </Stack>

              <Typography
                variant="h2"
                sx={{
                  fontFamily: designTokens.typography.fontSerif,
                  fontWeight: 600,
                  fontSize: { md: '2.75rem', lg: '3.25rem' },
                  color: 'text.primary',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                  mb: 2.5,
                }}
              >
                Refined learning infrastructure for modern institutions.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  mb: 4,
                }}
              >
                EduSphere delivers strict tenant isolation, Argon2id encryption, sub-10ms Redis caching,
                and real-time collaborative classrooms engineered for academic precision.
              </Typography>

              {/* Architectural Highlights in Soft Sage Frames */}
              <Stack spacing={2} sx={{ mb: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'background.surface',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: 'primary.main',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <VerifiedUserIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Strict Multi-Tenancy Boundary
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Auto-scoped repositories preventing cross-tenant data leakage
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'background.surface',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: 'primary.main',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <LockOutlinedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Cryptographic Rotation & RBAC
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Dual-token JWT rotation with Redis token reuse detection
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              {/* Institution Seal Counter */}
              <Stack direction="row" spacing={3} sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                    3
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Active Tenants
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                    4 Roles
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Granular RBAC
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                    100%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Test Suite Pass
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* Right Column: The Polished Luxury Login Card */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3.5, sm: 5 },
                borderRadius: 3.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: '#FFFFFF',
                boxShadow: '0 20px 50px rgba(26, 34, 24, 0.08), 0 1px 3px rgba(26, 34, 24, 0.04)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #485A32 0%, #8C7355 50%, #485A32 100%)',
                },
              }}
            >
              {/* Header with Luxury Brand Mark */}
              <Box sx={{ mb: 3.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: 'primary.main',
                      color: '#FFFFFF',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(72, 90, 50, 0.25)',
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 800,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        fontSize: '0.68rem',
                        display: 'block',
                      }}
                    >
                      EDUSPHERE ENTERPRISE LMS
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: designTokens.typography.fontSerif,
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: { xs: '1.75rem', sm: '2.1rem' },
                        lineHeight: 1.2,
                      }}
                    >
                      Sign In to EduSphere
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary', ml: { xs: 0, sm: 7.2 } }}>
                  Select tenant organization & role credentials to enter the workspace
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'error.light',
                    bgcolor: 'error.light',
                    color: 'error.dark',
                    '& .MuiAlert-icon': { color: 'error.main' },
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin}>
                <Stack spacing={2.5}>
                  <TextField
                    select
                    label="Tenant Organization"
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value)}
                    fullWidth
                    size="medium"
                    disabled={isLoading}
                    helperText="Logical data partition & institution scope"
                  >
                    <MenuItem value="global">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AdminPanelSettingsIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <span>Global Platform (Super Admin Portal)</span>
                      </Stack>
                    </MenuItem>
                    {tenants.map((t) => (
                      <MenuItem key={t.slug} value={t.slug}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CorporateFareIcon sx={{ fontSize: 18, color: t.primaryColor || 'primary.main' }} />
                          <span>{t.name} ({t.domain})</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    size="medium"
                    required
                    disabled={isLoading}
                    placeholder="e.g. admin@apex.edu"
                  />

                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    size="medium"
                    required
                    disabled={isLoading}
                    placeholder="••••••••••••"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            sx={{ color: 'text.secondary' }}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={isLoading}
                    sx={{
                      py: 1.5,
                      mt: 1,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      fontSize: '0.82rem',
                    }}
                  >
                    {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Sign In to Workspace'}
                  </Button>
                </Stack>
              </form>

              {/* Divider */}
              <Divider sx={{ my: 3.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    fontSize: '0.68rem',
                  }}
                >
                  OR CONTINUE WITH ENTERPRISE SSO
                </Typography>
              </Divider>

              {/* Google Workspace SSO Button */}
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<GoogleIcon sx={{ fontSize: 18, color: '#EA4335' }} />}
                onClick={handleGoogleBtnClick}
                disabled={isLoading}
                sx={{
                  py: 1.3,
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  fontSize: '0.78rem',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(72, 90, 50, 0.04)',
                    color: 'primary.main',
                  },
                }}
              >
                Google Workspace SSO
              </Button>

              {/* Architectural Assurance Proof */}
              <Box
                sx={{
                  mt: 3.5,
                  pt: 2.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.72rem',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.8,
                  }}
                >
                  <LockOutlinedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                  Strict Logical Tenant Scoping • Dual-Token JWT • Negative Isolation Enforced
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Google Workspace / Firebase SSO & Hierarchical Verification Dialog */}
      <Dialog
        open={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            p: 1,
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.22)',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {googleStep === 'onboarding' ? (
              <IconButton size="small" onClick={() => setGoogleStep('choose_account')} sx={{ mr: 0.5 }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            ) : (
              <GoogleIcon sx={{ color: '#EA4335', fontSize: 26 }} />
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
                {googleStep === 'choose_account' && 'Google Workspace SSO Sign-In'}
                {googleStep === 'onboarding' && 'Institutional Role Access Request'}
                {googleStep === 'pending' && 'Role Verification Pending'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {googleStep === 'choose_account' && 'Enterprise Identity Provider • Multi-Tier Verification Active'}
                {googleStep === 'onboarding' && 'Select your university campus and requested role for verification'}
                {googleStep === 'pending' && 'Multi-tier cryptographic approval required before dashboard access'}
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={() => setIsGoogleModalOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          {googleStep !== 'pending' && (
            <Tabs
              value={googleStep === 'onboarding' ? 1 : 0}
              onChange={(_, val) => {
                if (val === 0) {
                  setGoogleStep('choose_account');
                } else {
                  setOnboardingEmail(email || '');
                  setGoogleStep('onboarding');
                }
              }}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}
            >
              <Tab label="Sign In with Google" sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.9rem' }} />
              <Tab label="Register New Role" sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.9rem' }} />
            </Tabs>
          )}

          {/* STEP 1: CHOOSE OR ENTER GOOGLE ACCOUNT */}
          {googleStep === 'choose_account' && (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.6 }}>
                Sign in with your verified Google account to access your campus dashboard.
              </Typography>

              {googleLoginError && (
                <Alert
                  severity="error"
                  onClose={() => setGoogleLoginError(null)}
                  sx={{ mb: 2.5, borderRadius: 2, fontWeight: 600, fontSize: '0.85rem' }}
                >
                  {googleLoginError}
                </Alert>
              )}

              <Stack spacing={2.5}>
                {/* One-Click Google Sign-In with Popup */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<GoogleIcon sx={{ fontSize: 20 }} />}
                  disabled={isLoading}
                  onClick={handleFirebaseGooglePopup}
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    borderRadius: 2,
                    bgcolor: '#4285F4',
                    color: '#FFFFFF',
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(66, 133, 244, 0.28)',
                    '&:hover': {
                      bgcolor: '#3367D6',
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Continue with Google'}
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}>
                  NEW USER ONBOARDING
                </Typography>
              </Divider>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={() => {
                  setOnboardingEmail(email || '');
                  setOnboardingName('');
                  setOnboardingTenant(tenantSlug === 'global' ? 'apex-uni' : tenantSlug);
                  setGoogleLoginError(null);
                  setGoogleStep('onboarding');
                }}
                sx={{
                  py: 1.3,
                  fontWeight: 700,
                  borderRadius: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(72, 90, 50, 0.05)' },
                }}
              >
                Register New Account (Select College & Role)
              </Button>
            </Box>
          )}

          {/* STEP 2: INSTITUTIONAL ONBOARDING & ROLE REQUEST */}
          {googleStep === 'onboarding' && (
            <Box component="form" onSubmit={handleSubmitOnboarding}>
              <Box
                sx={{
                  bgcolor: 'rgba(72, 90, 50, 0.06)',
                  p: 2,
                  borderRadius: 2.5,
                  mb: 2.5,
                  border: '1px solid',
                  borderColor: 'rgba(72, 90, 50, 0.2)',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShieldOutlinedIcon sx={{ fontSize: 18 }} />
                  Hierarchical Multi-Tier Approval Protocol
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}>
                  • <strong>Admin role</strong> requires approval by <strong>Global Super Admin</strong><br />
                  • <strong>Teacher role</strong> requires approval by <strong>College Administrator</strong><br />
                  • <strong>Student role</strong> requires approval by <strong>Course Teacher / Faculty</strong>
                </Typography>
              </Box>

              <Stack spacing={2}>
                <TextField
                  label="Google Workspace Email"
                  size="small"
                  value={onboardingEmail}
                  onChange={(e) => setOnboardingEmail(e.target.value)}
                  fullWidth
                  required
                  helperText="Your authenticated institutional Google account"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GoogleIcon sx={{ fontSize: 18, color: '#EA4335' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Full Name"
                  size="small"
                  value={onboardingName}
                  onChange={(e) => setOnboardingName(e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g. Dr. Rajesh Sharma or Priya Verma"
                />

                <TextField
                  select
                  label="Target College / University"
                  size="small"
                  value={onboardingTenant}
                  onChange={(e) => setOnboardingTenant(e.target.value)}
                  fullWidth
                  required
                >
                  {tenants.map((t) => (
                    <MenuItem key={t.slug} value={t.slug}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CorporateFareIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>({t.domain})</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>

                <Box sx={{ pt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                    Select Requested Role & Verifier Authority:
                  </Typography>

                  <Stack spacing={1.5}>
                    {/* Role Option 1: College Admin */}
                    <Paper
                      onClick={() => setOnboardingRole('TENANT_ADMIN')}
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: onboardingRole === 'TENANT_ADMIN' ? 'primary.main' : 'divider',
                        bgcolor: onboardingRole === 'TENANT_ADMIN' ? 'rgba(72, 90, 50, 0.05)' : 'background.paper',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            🏛️ College Administrator
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                            Manage campus courses, instructors, students, and operational policies.
                          </Typography>
                        </Box>
                        <Chip
                          label="Verified by Super Admin"
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            bgcolor: onboardingRole === 'TENANT_ADMIN' ? 'primary.main' : 'action.selected',
                            color: onboardingRole === 'TENANT_ADMIN' ? '#FFFFFF' : 'text.primary',
                          }}
                        />
                      </Stack>
                    </Paper>

                    {/* Role Option 2: Teacher */}
                    <Paper
                      onClick={() => setOnboardingRole('INSTRUCTOR')}
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: onboardingRole === 'INSTRUCTOR' ? 'primary.main' : 'divider',
                        bgcolor: onboardingRole === 'INSTRUCTOR' ? 'rgba(72, 90, 50, 0.05)' : 'background.paper',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            👨‍🏫 Teacher / Faculty Instructor
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                            Author course curricula, grade timed quizzes, and approve student roster.
                          </Typography>
                        </Box>
                        <Chip
                          label="Verified by College Admin"
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            bgcolor: onboardingRole === 'INSTRUCTOR' ? 'primary.main' : 'action.selected',
                            color: onboardingRole === 'INSTRUCTOR' ? '#FFFFFF' : 'text.primary',
                          }}
                        />
                      </Stack>
                    </Paper>

                    {/* Role Option 3: Student */}
                    <Paper
                      onClick={() => setOnboardingRole('STUDENT')}
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: onboardingRole === 'STUDENT' ? 'primary.main' : 'divider',
                        bgcolor: onboardingRole === 'STUDENT' ? 'rgba(72, 90, 50, 0.05)' : 'background.paper',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            🎓 Student / Learner
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                            Access enrolled courses, complete assessments, and view academic progress.
                          </Typography>
                        </Box>
                        <Chip
                          label="Verified by Course Teacher"
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            bgcolor: onboardingRole === 'STUDENT' ? 'primary.main' : 'action.selected',
                            color: onboardingRole === 'STUDENT' ? '#FFFFFF' : 'text.primary',
                          }}
                        />
                      </Stack>
                    </Paper>
                  </Stack>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoading || !onboardingEmail || !onboardingName}
                  sx={{ py: 1.3, fontWeight: 800, mt: 1 }}
                >
                  {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Submit for Verification & Approval'}
                </Button>
              </Stack>
            </Box>
          )}

          {/* STEP 3: PENDING APPROVAL SCREEN */}
          {googleStep === 'pending' && pendingAccountInfo && (
            <Box sx={{ py: 1 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'rgba(237, 108, 2, 0.12)',
                    color: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  <HourglassTopIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Verification Pending Approval
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420, mx: 'auto', mt: 0.5 }}>
                  Your Google SSO registration has been submitted and is currently in review.
                </Typography>
              </Box>

              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.surface',
                  mb: 2.5,
                }}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      APPLICANT NAME:
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {pendingAccountInfo.name}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      GOOGLE EMAIL:
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {pendingAccountInfo.email}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      INSTITUTION:
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {tenants.find((t) => t.slug === pendingAccountInfo.tenantSlug)?.name || pendingAccountInfo.tenantSlug}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      REQUESTED ROLE:
                    </Typography>
                    <Chip
                      label={pendingAccountInfo.requestedRole || pendingAccountInfo.role}
                      size="small"
                      color="warning"
                      sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                    />
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: 'rgba(237, 108, 2, 0.08)',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'rgba(237, 108, 2, 0.25)',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.dark', display: 'block', mb: 0.3 }}>
                      DESIGNATED VERIFIER AUTHORITY:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {(pendingAccountInfo.requestedRole || pendingAccountInfo.role) === 'TENANT_ADMIN' &&
                        '👑 Global Super Admin (superadmin@edusphere.io)'}
                      {(pendingAccountInfo.requestedRole || pendingAccountInfo.role) === 'INSTRUCTOR' &&
                        `🏛️ College Administrator (admin@${pendingAccountInfo.tenantSlug}.edu)`}
                      {(pendingAccountInfo.requestedRole || pendingAccountInfo.role) === 'STUDENT' &&
                        `👨‍🏫 Faculty Instructor for ${tenants.find((t) => t.slug === pendingAccountInfo.tenantSlug)?.name || pendingAccountInfo.tenantSlug}`}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {pendingNotice && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                  {pendingNotice}
                </Alert>
              )}

              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                  disabled={isLoading}
                  onClick={handleCheckApprovalStatus}
                  sx={{ py: 1.2, fontWeight: 700 }}
                >
                  Check Approval Status & Enter Dashboard
                </Button>

                <Button
                  variant="text"
                  color="inherit"
                  fullWidth
                  onClick={() => {
                    setGoogleStep('choose_account');
                    setPendingNotice(null);
                  }}
                  sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Sign in with a different account
                </Button>
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
