import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Stack,
  Button,
  Badge,
  useMediaQuery,
  useTheme,
  Popover,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import QuizIcon from '@mui/icons-material/Quiz';
import GradeIcon from '@mui/icons-material/Grade';
import CampaignIcon from '@mui/icons-material/Campaign';
import SettingsIcon from '@mui/icons-material/Settings';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import InsightsIcon from '@mui/icons-material/Insights';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { logout } from '../store/slices/authSlice.js';
import { getPendingVerificationsForRole, USERS_CHANGED_EVENT } from '../services/userStorage.js';

const DRAWER_WIDTH = 260;

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'overview';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const { user, tenant } = useAppSelector((state) => state.auth);

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const updatePending = () => {
      const list = getPendingVerificationsForRole(user.role, user.tenantId);
      setPendingCount(list.length);
    };
    updatePending();
    window.addEventListener(USERS_CHANGED_EVENT, updatePending);
    return () => window.removeEventListener(USERS_CHANGED_EVENT, updatePending);
  }, [user]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Quiz Graded: Perfect Score! (30/30)',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'CAP646: CA2 & CA3 Defense Checkpoints Released',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      title: 'Welcome to Academic Year 2026-2027 at Apex University',
      time: '1 day ago',
      read: false,
    },
  ]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSelectView = (view: string) => {
    navigate(`/dashboard?view=${view}`);
    if (isMobile) setMobileOpen(false);
  };

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setNotificationsAnchor(notificationsAnchor ? null : event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchor(null);
  };

  const handleNotificationClick = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setNotificationsAnchor(null);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setNotificationsAnchor(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length + pendingCount;

  // Role-tailored Navigation Items with distinct views
  const getNavItems = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return [
          { text: 'Platform Overview', icon: <DashboardIcon />, view: 'overview' },
          { text: 'Tenants Directory', icon: <CorporateFareIcon />, view: 'tenants' },
          { text: 'System Telemetry', icon: <InsightsIcon />, view: 'telemetry' },
          { text: 'Global Settings', icon: <SettingsIcon />, view: 'settings' },
        ];
      case 'TENANT_ADMIN':
        return [
          { text: 'Admin Overview', icon: <DashboardIcon />, view: 'overview' },
          { text: 'User Directory', icon: <PeopleIcon />, view: 'users' },
          { text: 'Courses & Catalog', icon: <AutoStoriesIcon />, view: 'courses' },
          { text: 'Announcements', icon: <CampaignIcon />, view: 'announcements' },
          { text: 'Tenant Settings', icon: <SettingsIcon />, view: 'settings' },
        ];
      case 'INSTRUCTOR':
        return [
          { text: 'Instructor Hub', icon: <DashboardIcon />, view: 'overview' },
          { text: 'Course Builder', icon: <AutoStoriesIcon />, view: 'courses' },
          { text: 'Quiz Authoring', icon: <QuizIcon />, view: 'quizzes' },
          { text: 'Grading Center', icon: <GradeIcon />, view: 'grading' },
          { text: 'Announcements', icon: <CampaignIcon />, view: 'announcements' },
        ];
      case 'STUDENT':
      default:
        return [
          { text: 'My Learning', icon: <DashboardIcon />, view: 'overview' },
          { text: 'Course Catalog', icon: <AutoStoriesIcon />, view: 'courses' },
          { text: 'Quizzes & Tests', icon: <QuizIcon />, view: 'quizzes' },
          { text: 'Announcements', icon: <CampaignIcon />, view: 'announcements' },
          { text: 'My Progress', icon: <InsightsIcon />, view: 'telemetry' },
        ];
    }
  };

  const navItems = getNavItems();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 0.8,
            borderRadius: 1.5,
            display: 'flex',
          }}
        >
          <SchoolIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            EduSphere
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Enterprise LMS
          </Typography>
        </Box>
      </Box>

      {/* Tenant Context Indicator */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'background.default',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
            CURRENT TENANT
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {tenant ? tenant.name : 'Global Platform'}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Nav List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isSelected = currentView === item.view;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleSelectView(item.view)}
                sx={{
                  borderRadius: 2,
                  py: 1.1,
                  px: 2,
                  color: isSelected ? '#FFFFFF' : 'text.primary',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#FFFFFF !important',
                    '& .MuiListItemText-primary': {
                      color: '#FFFFFF !important',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#FFFFFF !important',
                    },
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      color: '#FFFFFF !important',
                      '& .MuiListItemText-primary': {
                        color: '#FFFFFF !important',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#FFFFFF !important',
                      },
                    },
                  },
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'rgba(72, 90, 50, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: isSelected ? '#FFFFFF' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 700 : 600,
                    fontSize: '0.92rem',
                    color: isSelected ? '#FFFFFF' : 'inherit',
                  }}
                />
                {item.view === 'overview' && pendingCount > 0 && (
                  <Chip
                    label={`${pendingCount} pending`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: isSelected ? '#FFFFFF' : '#D97706',
                      color: isSelected ? 'primary.main' : '#FFFFFF',
                      letterSpacing: '0.02em',
                      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.35)',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User Footer Profile */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 38, height: 38, fontWeight: 700 }}>
            {user?.firstName?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Chip
              label={user?.role?.replace('_', ' ')}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
            />
          </Box>
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          color="error"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ borderRadius: 1.5, fontWeight: 600 }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {currentView === 'overview' && 'Dashboard Overview'}
              {currentView === 'users' && 'User Directory & Roster'}
              {currentView === 'courses' && 'Courses & Curriculum'}
              {currentView === 'quizzes' && 'Quizzes & Assessments'}
              {currentView === 'announcements' && 'Campus Announcements'}
              {currentView === 'tenants' && 'Tenants Directory'}
              {currentView === 'telemetry' && 'System Telemetry'}
              {currentView === 'settings' && 'Platform Settings'}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton
              id="notifications-button"
              aria-controls={Boolean(notificationsAnchor) ? 'notifications-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(notificationsAnchor) ? 'true' : undefined}
              color="inherit"
              size="medium"
              onClick={handleOpenNotifications}
              sx={{
                p: 1,
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(72, 90, 50, 0.08)',
                },
              }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsIcon sx={{ fontSize: 24 }} />
              </Badge>
            </IconButton>

            {/* Notifications Dropdown Menu */}
            <Menu
              id="notifications-menu"
              anchorEl={notificationsAnchor}
              open={Boolean(notificationsAnchor)}
              onClose={handleCloseNotifications}
              onClick={(e) => e.stopPropagation()}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    width: 360,
                    maxWidth: '92vw',
                    p: 1.5,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 12px 32px rgba(26, 34, 24, 0.14)',
                    mt: 1.2,
                  },
                },
              }}
            >
              <Box sx={{ px: 1, py: 0.5, mb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
                  </Typography>
                  {unreadCount > 0 && (
                    <Button
                      size="small"
                      onClick={handleMarkAllRead}
                      sx={{ fontSize: '0.72rem', textTransform: 'none', py: 0.2, fontWeight: 700 }}
                    >
                      Mark all as read
                    </Button>
                  )}
                </Stack>
              </Box>
              <Divider sx={{ mb: 1 }} />
              {pendingCount > 0 && (
                <MenuItem
                  onClick={() => {
                    handleSelectView('overview');
                    setNotificationsAnchor(null);
                  }}
                  sx={{
                    borderRadius: 1.5,
                    mb: 1,
                    p: 1.2,
                    whiteSpace: 'normal',
                    bgcolor: 'rgba(217, 119, 6, 0.1)',
                    border: '1px solid rgba(217, 119, 6, 0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(217, 119, 6, 0.18)',
                    },
                  }}
                >
                  <Stack spacing={0.3} sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label="ACTION REQUIRED" size="small" color="warning" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Live Queue</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {pendingCount} new account role verification request{pendingCount > 1 ? 's' : ''} awaiting your approval.
                    </Typography>
                  </Stack>
                </MenuItem>
              )}
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No notifications yet.
                  </Typography>
                </Box>
              ) : (
                notifications.map((n) => (
                  <MenuItem
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id)}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.8,
                      p: 1.2,
                      whiteSpace: 'normal',
                      bgcolor: n.read ? 'transparent' : 'rgba(72, 90, 50, 0.08)',
                      '&:hover': {
                        bgcolor: n.read ? 'rgba(72, 90, 50, 0.04)' : 'rgba(72, 90, 50, 0.14)',
                      },
                    }}
                  >
                    <Stack spacing={0.5} sx={{ width: '100%' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {!n.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: n.read ? 500 : 700,
                            color: 'text.primary',
                            lineHeight: 1.3,
                          }}
                        >
                          {n.title}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', pl: n.read ? 0 : 2 }}
                      >
                        {n.time}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))
              )}
            </Menu>

            <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />

            <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
              {user?.email}
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer (Mobile + Desktop) */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          disableRestoreFocus
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
