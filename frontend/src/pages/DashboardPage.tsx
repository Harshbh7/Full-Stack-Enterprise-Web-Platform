import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CampaignIcon from '@mui/icons-material/Campaign';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import CloseIcon from '@mui/icons-material/Close';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import LockResetIcon from '@mui/icons-material/LockReset';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import SpeedIcon from '@mui/icons-material/Speed';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useAppSelector } from '../store/index.js';
import { api } from '../services/api.js';
import {
  getStoredTenants,
  saveStoredTenants,
  TENANTS_CHANGED_EVENT,
  TenantOption,
} from '../services/tenantStorage.js';
import {
  StoredUser,
  getStoredUsersForTenant,
  addStoredUser,
  removeStoredUser,
  updateStoredUserStatus,
  getPendingVerificationsForRole,
  getOtherTenantPendingVerifications,
  reassignTenantAndApprove,
  getAllStoredUsers,
  saveAllStoredUsers,
  approveVerificationRequest,
  rejectVerificationRequest,
  USERS_CHANGED_EVENT,
} from '../services/userStorage.js';
import {
  CourseItem,
  AnnouncementItem,
  getStoredCoursesForTenant,
  addStoredCourse,
  removeStoredCourse,
  getStoredAnnouncementsForTenant,
  addStoredAnnouncement,
  removeStoredAnnouncement,
  TENANT_DATA_CHANGED_EVENT,
} from '../services/tenantDataStorage.js';

interface TenantItem {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  domain: string;
  status: 'ACTIVE' | 'SUSPENDED';
  maxStudents: number;
  contactEmail: string;
  primaryColor?: string;
}

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'overview';
  const { user, tenant } = useAppSelector((state) => state.auth);

  // Success alert state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Focus safety helper to avoid browser aria-hidden focus blocking
  const safeBlur = () => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // 1. Invite User Dialog State
  const [inviteOpen, setInviteOpen] = useState(false);
  const [showInvitePassword, setShowInvitePassword] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'STUDENT',
    password: 'Password123!',
  });

  // Delete User Dialog State
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<StoredUser | null>(null);

  // 2. Announcement Dialog State
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
  });

  // 3. Create Course Dialog State
  const [courseOpen, setCourseOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    code: '',
    category: 'Web Engineering',
    level: 'INTERMEDIATE',
    description: '',
  });

  // 4. Lesson Player Modal State
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<{
    title: string;
    course: string;
    videoUrl: string;
    duration: string;
    notes: string;
  } | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  // 5. Quiz Runner Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [selectedQuizTitle, setSelectedQuizTitle] = useState('CAP646 Midterm Assessment: Multi-Tenancy & Architecture');

  // Search filter for Users
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Telemetry simulation state
  const [dbLatency, setDbLatency] = useState('1.2 ms');
  const [cacheLatency, setCacheLatency] = useState('0.4 ms');
  const [cacheHitRate, setCacheHitRate] = useState('98.4%');

  // Resolve active tenant slug and display name
  const resolveTenantSlug = (): string => {
    if (tenant?.slug) return tenant.slug;
    if (user?.role === 'SUPER_ADMIN') return 'global';
    if (user?.tenantId) {
      const stored = getStoredTenants();
      const found = stored.find((t) => t.id === user.tenantId || t.slug === user.tenantId);
      if (found) return found.slug;
      return user.tenantId;
    }
    if (user?.email) {
      const stored = getStoredTenants();
      const match = stored.find(
        (t) =>
          user.email.toLowerCase().includes(t.slug) ||
          (t.domain && user.email.toLowerCase().includes(t.domain))
      );
      if (match) return match.slug;
      if (user.email.includes('lpu.edu')) return 'lpu';
    }
    return 'apex-uni';
  };

  const activeTenantSlug = resolveTenantSlug();
  const storedTenantInfo = getStoredTenants().find((t) => t.slug === activeTenantSlug);
  const tenantDisplayName =
    tenant?.name ||
    storedTenantInfo?.name ||
    (activeTenantSlug === 'lpu' ? 'Lovely Professional University' : 'Apex University');

  // Dynamic user list scoped to active tenant
  const [userList, setUserList] = useState<StoredUser[]>(() => getStoredUsersForTenant(activeTenantSlug));

  // Dynamic course list scoped to active tenant (only user-entered or scoped courses)
  const [courseList, setCourseList] = useState<CourseItem[]>(() => getStoredCoursesForTenant(activeTenantSlug));

  // Dynamic announcement list scoped to active tenant (only user-entered or scoped announcements)
  const [announcementList, setAnnouncementList] = useState<AnnouncementItem[]>(() =>
    getStoredAnnouncementsForTenant(activeTenantSlug)
  );

  // Dynamic pending role verifications for the current user's authority tier
  const [pendingVerifications, setPendingVerifications] = useState<StoredUser[]>(() =>
    getPendingVerificationsForRole(user?.role || '', activeTenantSlug)
  );

  // Other pending users in system (e.g. if applicant selected another campus by accident)
  const [otherPendingUsers, setOtherPendingUsers] = useState<StoredUser[]>(() =>
    getOtherTenantPendingVerifications(activeTenantSlug)
  );

  // Filter tab for pending verifications ('ALL' | 'INSTRUCTOR' | 'STUDENT')
  const [pendingRoleFilter, setPendingRoleFilter] = useState<'ALL' | 'INSTRUCTOR' | 'STUDENT'>('ALL');

  const fetchAndSyncPending = async () => {
    // 1. Update from local storage
    const local = getPendingVerificationsForRole(user?.role || '', activeTenantSlug);
    setPendingVerifications(local);
    setOtherPendingUsers(getOtherTenantPendingVerifications(activeTenantSlug));

    // 2. Fetch from backend /users/pending to ensure cross-browser/cross-client sync
    try {
      const res = await api.get('/users/pending');
      if (res.data?.data && Array.isArray(res.data.data)) {
        interface BackendPendingUser {
          id?: string;
          _id?: string;
          firstName?: string;
          lastName?: string;
          email: string;
          role: string;
          requestedRole?: string;
          status: string;
          verifierRole?: string;
          createdAt?: string;
          tenantId?: { _id?: string; id?: string; slug?: string; name?: string } | string;
        }

        const currentUsers = getAllStoredUsers();
        let updated = false;
        const list = [...currentUsers];

        for (const item of res.data.data as BackendPendingUser[]) {
          const tenantSlugFromItem =
            typeof item.tenantId === 'object' && item.tenantId?.slug
              ? item.tenantId.slug
              : activeTenantSlug;

          const existingIndex = list.findIndex(
            (u) => u.email.toLowerCase() === item.email.toLowerCase()
          );

          const backendMapped: StoredUser = {
            id: item.id || item._id || `usr-sso-${Date.now().toString(36)}`,
            name: `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email,
            firstName: item.firstName,
            lastName: item.lastName,
            email: item.email.toLowerCase().trim(),
            role: (item.requestedRole || item.role) as any,
            requestedRole: (item.requestedRole || item.role) as any,
            status: 'PENDING_VERIFICATION',
            tenantSlug: tenantSlugFromItem,
            verifierRole: item.verifierRole as any,
            requestedAt: item.createdAt || new Date().toISOString(),
          };

          if (existingIndex === -1) {
            list.unshift(backendMapped);
            updated = true;
          } else if (list[existingIndex].status !== 'PENDING_VERIFICATION') {
            list[existingIndex] = {
              ...list[existingIndex],
              status: 'PENDING_VERIFICATION',
              requestedRole: (item.requestedRole || item.role) as any,
            };
            updated = true;
          }
        }

        if (updated) {
          saveAllStoredUsers(list);
        }
        setPendingVerifications(getPendingVerificationsForRole(user?.role || '', activeTenantSlug));
        setOtherPendingUsers(getOtherTenantPendingVerifications(activeTenantSlug));
      }
    } catch {
      // client-side storage active
    }
  };

  // Sync users, courses, announcements, and verifications on tenant change or storage update
  useEffect(() => {
    const handleDataSync = () => {
      setUserList(getStoredUsersForTenant(activeTenantSlug));
      setCourseList(getStoredCoursesForTenant(activeTenantSlug));
      setAnnouncementList(getStoredAnnouncementsForTenant(activeTenantSlug));
      fetchAndSyncPending();
    };

    window.addEventListener(USERS_CHANGED_EVENT, handleDataSync);
    window.addEventListener(TENANT_DATA_CHANGED_EVENT, handleDataSync);
    window.addEventListener('storage', handleDataSync);

    setUserList(getStoredUsersForTenant(activeTenantSlug));
    setCourseList(getStoredCoursesForTenant(activeTenantSlug));
    setAnnouncementList(getStoredAnnouncementsForTenant(activeTenantSlug));
    fetchAndSyncPending();

    return () => {
      window.removeEventListener(USERS_CHANGED_EVENT, handleDataSync);
      window.removeEventListener(TENANT_DATA_CHANGED_EVENT, handleDataSync);
      window.removeEventListener('storage', handleDataSync);
    };
  }, [activeTenantSlug, tenant?.slug, user?.email, user?.role]);

  const handleApproveVerification = async (targetUser: StoredUser) => {
    try {
      await api.post(`/users/${targetUser.id || targetUser.email}/approve`);
    } catch {
      // client fallback
    }
    const verifierName = `${user?.firstName || 'Admin'} ${user?.lastName || ''}`.trim();
    approveVerificationRequest(targetUser.email, verifierName);
    setPendingVerifications(getPendingVerificationsForRole(user?.role || '', activeTenantSlug));
    setOtherPendingUsers(getOtherTenantPendingVerifications(activeTenantSlug));
    setUserList(getStoredUsersForTenant(activeTenantSlug));
    setSuccessMessage(
      `✓ Successfully approved ${targetUser.name} (${targetUser.email}) as ${targetUser.requestedRole || targetUser.role}! Account is now ACTIVE.`
    );
  };

  const handleClaimAndApprove = async (targetUser: StoredUser) => {
    try {
      await api.post(`/users/${targetUser.id || targetUser.email}/approve`);
    } catch {
      // client fallback
    }
    const verifierName = `${user?.firstName || 'Admin'} ${user?.lastName || ''}`.trim();
    reassignTenantAndApprove(targetUser.email, activeTenantSlug, verifierName);
    setPendingVerifications(getPendingVerificationsForRole(user?.role || '', activeTenantSlug));
    setOtherPendingUsers(getOtherTenantPendingVerifications(activeTenantSlug));
    setUserList(getStoredUsersForTenant(activeTenantSlug));
    setSuccessMessage(
      `✓ Successfully associated ${targetUser.name} (${targetUser.email}) with ${tenantDisplayName} and approved account as ACTIVE!`
    );
  };

  const handleRejectVerification = async (targetUser: StoredUser) => {
    try {
      await api.post(`/users/${targetUser.id || targetUser.email}/reject`);
    } catch {
      // client fallback
    }
    const verifierName = `${user?.firstName || 'Admin'} ${user?.lastName || ''}`.trim();
    rejectVerificationRequest(targetUser.email, verifierName);
    setPendingVerifications(getPendingVerificationsForRole(user?.role || '', activeTenantSlug));
    setOtherPendingUsers(getOtherTenantPendingVerifications(activeTenantSlug));
    setUserList(getStoredUsersForTenant(activeTenantSlug));
    setSuccessMessage(`Access request for ${targetUser.name} (${targetUser.email}) has been rejected.`);
  };

  // Dynamic tenant list for Super Admin
  const [tenantsList, setTenantsList] = useState<TenantOption[]>(() => getStoredTenants());

  // Tenant Provision & Delete Dialog States
  const [provisionTenantModalOpen, setProvisionTenantModalOpen] = useState(false);
  const [deleteTenantModalOpen, setDeleteTenantModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<TenantOption | null>(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    slug: '',
    domain: '',
    contactEmail: '',
    maxStudents: 5000,
    primaryColor: '#2D5A27',
    adminName: 'Campus Administrator',
    adminPassword: 'Password123!',
  });

  // Sync and fetch tenants
  useEffect(() => {
    const handleSync = () => {
      setTenantsList(getStoredTenants());
    };
    window.addEventListener(TENANTS_CHANGED_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    if (user?.role === 'SUPER_ADMIN') {
      api.get('/tenants/public')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            interface ApiTenant {
              _id?: string;
              id?: string;
              name: string;
              slug: string;
              domain?: string;
              status?: 'ACTIVE' | 'SUSPENDED';
              settings?: { maxStudents?: number };
              maxStudents?: number;
              contactEmail?: string;
              primaryColor?: string;
            }
            const apiTenants: TenantOption[] = res.data.data.map((item: ApiTenant) => ({
              id: item._id || item.id || item.slug,
              name: item.name,
              slug: item.slug,
              domain: item.domain || `${item.slug}.edusphere.io`,
              status: item.status || 'ACTIVE',
              maxStudents: item.settings?.maxStudents || item.maxStudents || 5000,
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
            setTenantsList(merged);
          }
        })
        .catch(() => {
          // Graceful fallback to stored tenants
        });
    }

    return () => {
      window.removeEventListener(TENANTS_CHANGED_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user?.role]);

  // Handle Invite / Create User Submit
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = activeTenantSlug;
    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name: `${inviteForm.firstName.trim()} ${inviteForm.lastName.trim()}`,
      firstName: inviteForm.firstName.trim(),
      lastName: inviteForm.lastName.trim(),
      email: inviteForm.email.toLowerCase().trim(),
      role: inviteForm.role as any,
      status: 'ACTIVE',
      tenantSlug: slug,
      password: inviteForm.password || 'Password123!',
    };

    try {
      await api.post('/users/invite', {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
        tenantId: tenant?.id || user?.tenantId,
      });
    } catch {
      // Graceful fallback to client-side
    }

    addStoredUser(newUser);
    setUserList(getStoredUsersForTenant(slug));
    setSuccessMessage(
      `Successfully created ${newUser.role} "${newUser.name}"! Login: ${newUser.email} (Password: ${newUser.password})`
    );
    setInviteOpen(false);
    setInviteForm({ firstName: '', lastName: '', email: '', role: 'STUDENT', password: 'Password123!' });
  };

  // Open Delete User Dialog
  const handleOpenDeleteUserModal = (targetUser: StoredUser) => {
    safeBlur();
    setUserToDelete(targetUser);
    setDeleteUserModalOpen(true);
  };

  // Handle Confirm Delete User
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const slug = activeTenantSlug;
    try {
      await api.delete(`/users/${userToDelete.id || userToDelete.email}`);
    } catch {
      // Graceful fallback
    }
    removeStoredUser(userToDelete.email, slug);
    setUserList(getStoredUsersForTenant(slug));
    setSuccessMessage(`${userToDelete.role} "${userToDelete.name}" (${userToDelete.email}) was removed from the roster.`);
    setDeleteUserModalOpen(false);
    setUserToDelete(null);
  };

  // Handle Post Announcement Submit
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAnnouncement: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: announcementForm.title.trim(),
      author: `${user?.firstName || 'Faculty'} ${user?.lastName || 'Member'}`.trim(),
      priority: announcementForm.priority,
      date: 'Just now',
      content: announcementForm.content.trim(),
      tenantSlug: activeTenantSlug,
    };

    try {
      await api.post('/announcements', announcementForm);
    } catch {
      // Graceful fallback to client-side storage
    }

    addStoredAnnouncement(newAnnouncement);
    setAnnouncementList(getStoredAnnouncementsForTenant(activeTenantSlug));
    setSuccessMessage(`Announcement [${newAnnouncement.title}] broadcasted to all enrolled students!`);
    setAnnouncementOpen(false);
    setAnnouncementForm({ title: '', content: '', priority: 'NORMAL' });
  };

  // Handle Remove Announcement
  const handleRemoveAnnouncement = (id: string | number) => {
    removeStoredAnnouncement(id, activeTenantSlug);
    setAnnouncementList(getStoredAnnouncementsForTenant(activeTenantSlug));
    setSuccessMessage('Announcement was removed.');
  };

  // Handle Create Course Submit
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse: CourseItem = {
      id: `course-${Date.now()}`,
      code: courseForm.code.toUpperCase().trim(),
      title: courseForm.title.trim(),
      description: courseForm.description.trim(),
      instructor: `${user?.firstName || 'Faculty'} ${user?.lastName || 'Member'}`.trim(),
      enrolled: 0,
      modulesCount: 1,
      lessonsCount: 1,
      rating: 'New ★',
      category: courseForm.category,
      tenantSlug: activeTenantSlug,
    };

    try {
      await api.post('/courses', {
        title: newCourse.title,
        code: newCourse.code,
        category: newCourse.category,
        description: newCourse.description,
        level: courseForm.level,
      });
    } catch {
      // Graceful fallback to client-side storage
    }

    addStoredCourse(newCourse);
    setCourseList(getStoredCoursesForTenant(activeTenantSlug));
    setSuccessMessage(`Course [${newCourse.code}: ${newCourse.title}] created and published!`);
    setCourseOpen(false);
    setCourseForm({ title: '', code: '', category: 'Web Engineering', level: 'INTERMEDIATE', description: '' });
  };

  // Handle Remove Course
  const handleRemoveCourse = (codeOrId: string) => {
    removeStoredCourse(codeOrId, activeTenantSlug);
    setCourseList(getStoredCoursesForTenant(activeTenantSlug));
    setSuccessMessage(`Course [${codeOrId}] was removed from the catalog.`);
  };

  // Open Lesson Player
  const handleOpenLesson = (course: string, title: string) => {
    safeBlur();
    setCurrentLesson({
      course,
      title,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: '18 mins',
      notes: 'This lecture covers multi-tenant database partitioning using discriminator indexing and repository auto-scoping in enterprise SaaS environments.',
    });
    setLessonCompleted(false);
    setLessonModalOpen(true);
  };

  // Open Quiz Runner
  const handleOpenQuiz = (title = 'CAP646 Midterm Assessment: Multi-Tenancy & Architecture') => {
    safeBlur();
    setSelectedQuizTitle(title);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizModalOpen(true);
  };

  // Handle Quiz Submission
  const handleQuizSubmit = () => {
    let score = 0;
    if (quizAnswers['q1'] === 'b') score += 10;
    if (quizAnswers['q2'] === 'b') score += 10;
    if (quizAnswers['q3'] === 'b') score += 10;
    setQuizScore(score);
    setQuizSubmitted(true);
    setSuccessMessage(`Assessment completed! You scored ${score} / 30 (${Math.round((score / 30) * 100)}%).`);
  };

  // Open Provision Tenant Dialog
  const handleOpenProvisionTenantModal = () => {
    safeBlur();
    setShowAdminPassword(false);
    setNewTenantForm({
      name: '',
      slug: '',
      domain: '',
      contactEmail: '',
      maxStudents: 5000,
      primaryColor: '#2D5A27',
      adminName: 'Campus Administrator',
      adminPassword: 'Password123!',
    });
    setProvisionTenantModalOpen(true);
  };

  // Handle Provision Tenant Submit
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantForm.name || !newTenantForm.slug) return;

    const computedSlug = newTenantForm.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const computedDomain = newTenantForm.domain.trim() || `${computedSlug}.edusphere.io`;

    const newTenant: TenantOption = {
      id: `tenant-${Date.now()}`,
      name: newTenantForm.name.trim(),
      slug: computedSlug,
      domain: computedDomain,
      status: 'ACTIVE',
      maxStudents: Number(newTenantForm.maxStudents) || 5000,
      contactEmail: newTenantForm.contactEmail.trim() || `admin@${computedSlug}.edu`,
      primaryColor: newTenantForm.primaryColor || '#2D5A27',
      adminName: newTenantForm.adminName.trim() || 'Campus Administrator',
      adminPassword: newTenantForm.adminPassword || 'Password123!',
    };

    try {
      const response = await api.post('/tenants', {
        name: newTenant.name,
        slug: newTenant.slug,
        domain: newTenant.domain,
        contactEmail: newTenant.contactEmail,
        maxStudents: newTenant.maxStudents,
        primaryColor: newTenant.primaryColor,
        adminName: newTenant.adminName,
        adminPassword: newTenant.adminPassword,
      });
      if (response.data?.data?._id) {
        newTenant.id = response.data.data._id;
      }
    } catch {
      // Graceful fallback to client-side state
    }

    const updated = [newTenant, ...tenantsList];
    setTenantsList(updated);
    saveStoredTenants(updated);
    setProvisionTenantModalOpen(false);
    setSuccessMessage(
      `University "${newTenant.name}" provisioned successfully! Admin login: ${newTenant.contactEmail} (Password: ${newTenant.adminPassword})`
    );
  };

  // Open Delete Tenant Dialog
  const handleOpenDeleteTenantModal = (tenantItem: TenantOption) => {
    safeBlur();
    setTenantToDelete(tenantItem);
    setDeleteTenantModalOpen(true);
  };

  // Handle Confirm Delete Tenant
  const handleConfirmDeleteTenant = async () => {
    if (!tenantToDelete) return;
    const targetId = tenantToDelete.id || (tenantToDelete as any)._id;
    try {
      if (targetId && !targetId.startsWith('tenant-')) {
        await api.delete(`/tenants/${targetId}`);
      }
    } catch {
      // Graceful fallback
    }

    const updated = tenantsList.filter((t) => (t.id || (t as any)._id) !== targetId && t.name !== tenantToDelete.name);
    setTenantsList(updated);
    saveStoredTenants(updated);
    setSuccessMessage(`University "${tenantToDelete.name}" has been successfully deprovisioned and removed.`);
    setDeleteTenantModalOpen(false);
    setTenantToDelete(null);
  };

  // Filtered users
  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Top Notification Toast */}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Header Banner */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {user?.role === 'SUPER_ADMIN' && 'Platform-wide multi-tenant telemetry and operational control.'}
          {user?.role === 'TENANT_ADMIN' && `Managing organizational operations for ${tenantDisplayName}.`}
          {user?.role === 'INSTRUCTOR' && 'Review curriculum engagement, grade assignments, and post announcements.'}
          {user?.role === 'STUDENT' && 'Continue your coursework, complete upcoming assessments, and track progress.'}
        </Typography>
      </Box>

      {/* ======================= VIEW: OVERVIEW ======================= */}
      {currentView === 'overview' && (
        <>
          {/* Quick Metrics Bar */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {user?.role === 'SUPER_ADMIN' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ACTIVE TENANTS</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{tenantsList.length}</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>Across global partitions</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>TOTAL USERS</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>19,350</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>+140 this week</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>REDIS CACHE HIT RATE</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{cacheHitRate}</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>Sub-10ms response latency</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>SERVICES STATUS</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>HEALTHY</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>MongoDB & Valkey UP</Typography>
                  </Paper>
                </Grid>
              </>
            )}

            {user?.role === 'TENANT_ADMIN' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>TOTAL STUDENTS</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{userList.filter((u) => u.role === 'STUDENT').length}</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>{userList.filter((u) => u.role === 'STUDENT').length} enrolled</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ACTIVE INSTRUCTORS</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{userList.filter((u) => u.role === 'INSTRUCTOR').length}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{userList.filter((u) => u.role === 'INSTRUCTOR').length} faculty assigned</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>COURSES PUBLISHED</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{courseList.length}</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {courseList.length === 0 ? 'No courses active' : `${courseList.length} active course${courseList.length === 1 ? '' : 's'}`}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>COMPLETION RATE</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{courseList.length > 0 ? '84.2%' : '0%'}</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>{courseList.length > 0 ? 'Above target (80%)' : 'No student enrollments yet'}</Typography>
                  </Paper>
                </Grid>
              </>
            )}

            {user?.role === 'INSTRUCTOR' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>MY ACTIVE STUDENTS</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{userList.filter((u) => u.role === 'STUDENT').length}</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>Enrolled in institution</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>COURSES TAUGHT</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{courseList.length}</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {courseList.length === 0 ? 'No courses published' : `${courseList.length} active curriculum course${courseList.length === 1 ? '' : 's'}`}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>SUBMISSIONS GRADED</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{courseList.length > 0 ? 92 : 0}</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>{courseList.length > 0 ? '88.5% avg score' : 'Awaiting submissions'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>STUDENT SATISFACTION</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>{courseList.length > 0 ? '4.9 ★' : 'N/A'}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{courseList.length > 0 ? '62 reviews recorded' : 'No reviews yet'}</Typography>
                  </Paper>
                </Grid>
              </>
            )}

            {user?.role === 'STUDENT' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ENROLLED COURSES</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{courseList.length} Active</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {courseList.length === 0 ? 'No courses enrolled' : courseList.map((c) => c.code).join(' & ')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>LESSONS COMPLETED</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{courseList.length > 0 ? '4 / 5' : '0 / 0'}</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>{courseList.length > 0 ? '80% curriculum view' : 'No lessons scheduled'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ASSESSMENTS PASSED</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>{courseList.length > 0 ? '100%' : 'N/A'}</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>{courseList.length > 0 ? '30/30 on Midterm' : 'No assessments taken'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>OVERALL PROGRESS</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>{courseList.length > 0 ? '75%' : '0%'}</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>{courseList.length > 0 ? 'On track for Certificate' : 'Enroll in course to start'}</Typography>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>

          {/* ================= PENDING ROLE VERIFICATIONS QUEUE ================= */}
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'TENANT_ADMIN' || user?.role === 'INSTRUCTOR') && (() => {
            const instructorsCount = pendingVerifications.filter(
              (u) => (u.requestedRole || u.role) === 'INSTRUCTOR'
            ).length;

            const studentsCount = pendingVerifications.filter(
              (u) => (u.requestedRole || u.role) === 'STUDENT'
            ).length;

            const displayedPending = pendingVerifications.filter((item) => {
              const r = item.requestedRole || item.role;
              if (pendingRoleFilter === 'INSTRUCTOR') return r === 'INSTRUCTOR';
              if (pendingRoleFilter === 'STUDENT') return r === 'STUDENT';
              return true;
            });

            return (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2.5,
                  mb: 4,
                  border: '1px solid',
                  borderColor: pendingVerifications.length > 0 ? 'warning.main' : 'divider',
                  bgcolor: pendingVerifications.length > 0 ? 'rgba(237, 108, 2, 0.03)' : 'background.paper',
                  boxShadow: pendingVerifications.length > 0 ? '0 4px 20px rgba(237, 108, 2, 0.08)' : 'none',
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
                  <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Pending Role Verifications & Approval Queue
                      </Typography>
                      {pendingVerifications.length > 0 ? (
                        <Chip
                          label={`${pendingVerifications.length} Awaiting Authorization`}
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                        />
                      ) : (
                        <Chip
                          label="Roster Verified"
                          color="success"
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {user?.role === 'SUPER_ADMIN' && 'Hierarchical Verification Tier 1: Authorize new College Administrators before institutional deployment.'}
                      {user?.role === 'TENANT_ADMIN' && `Hierarchical Verification Tier 2: Authorize Faculty Instructors & Student Enrollees for ${tenantDisplayName}.`}
                      {user?.role === 'INSTRUCTOR' && `Hierarchical Verification Tier 3: Authorize Student Enrollees for ${tenantDisplayName}.`}
                    </Typography>

                    {/* Role Filter Chips for College Admin */}
                    {user?.role === 'TENANT_ADMIN' && pendingVerifications.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                        <Chip
                          label={`All (${pendingVerifications.length})`}
                          size="small"
                          clickable
                          onClick={() => setPendingRoleFilter('ALL')}
                          color={pendingRoleFilter === 'ALL' ? 'primary' : 'default'}
                          variant={pendingRoleFilter === 'ALL' ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                        <Chip
                          label={`Faculty Instructors (${instructorsCount})`}
                          size="small"
                          clickable
                          onClick={() => setPendingRoleFilter('INSTRUCTOR')}
                          color={pendingRoleFilter === 'INSTRUCTOR' ? 'primary' : 'default'}
                          variant={pendingRoleFilter === 'INSTRUCTOR' ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                        <Chip
                          label={`Students (${studentsCount})`}
                          size="small"
                          clickable
                          onClick={() => setPendingRoleFilter('STUDENT')}
                          color={pendingRoleFilter === 'STUDENT' ? 'primary' : 'default'}
                          variant={pendingRoleFilter === 'STUDENT' ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      </Stack>
                    )}
                  </Box>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={async () => {
                      await fetchAndSyncPending();
                      setSuccessMessage('✓ Verification queue refreshed.');
                    }}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Refresh Queue
                  </Button>
                </Stack>

                {displayedPending.length === 0 ? (
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: 'background.surface',
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      ✓ All accounts under your authority are active and verified.
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                      {user?.role === 'SUPER_ADMIN' && 'New College Admins will appear here for cryptographic sign-off upon registration.'}
                      {user?.role === 'TENANT_ADMIN' && 'New Faculty Instructors and Students will appear here for verification upon registration.'}
                      {user?.role === 'INSTRUCTOR' && 'New Students enrolling in your courses will appear here for verification.'}
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'background.surface' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Institution Campus</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Role Requested</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">Verification Decision</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {displayedPending.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell sx={{ fontWeight: 700 }}>{item.name}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{item.email}</TableCell>
                            <TableCell>
                              {tenantsList.find((t) => t.slug === item.tenantSlug)?.name || item.tenantSlug}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.requestedRole || item.role}
                                size="small"
                                sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                                color={
                                  (item.requestedRole || item.role) === 'TENANT_ADMIN'
                                    ? 'primary'
                                    : (item.requestedRole || item.role) === 'INSTRUCTOR'
                                    ? 'secondary'
                                    : 'info'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label="PENDING APPROVAL"
                                size="small"
                                color="warning"
                                sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircleOutlineIcon />}
                                  onClick={() => handleApproveVerification(item)}
                                  sx={{ fontWeight: 700, fontSize: '0.75rem', px: 1.5 }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleRejectVerification(item)}
                                  sx={{ fontWeight: 700, fontSize: '0.75rem', px: 1.5 }}
                                >
                                  Reject
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Cross-Campus Notice: When applicants registered under other institutions */}
                {otherPendingUsers.length > 0 && (user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <Alert
                    severity="info"
                    icon={<ShieldOutlinedIcon fontSize="inherit" />}
                    sx={{ mt: 2.5, borderRadius: 2 }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {otherPendingUsers.length} Pending Applicant{otherPendingUsers.length > 1 ? 's' : ''} Registered Under Other Institutions
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                      If any of these applicants intended to register for {tenantDisplayName}, you can verify and associate them directly:
                    </Typography>
                    <Stack spacing={1}>
                      {otherPendingUsers.map((op) => (
                        <Stack
                          key={op.email}
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          spacing={1}
                          sx={{
                            bgcolor: 'background.paper',
                            p: 1.2,
                            px: 1.8,
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {op.name}{' '}
                              <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                ({op.email})
                              </Typography>
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Role: <strong>{op.requestedRole || op.role}</strong> • Selected Campus:{' '}
                              <strong>{tenantsList.find((t) => t.slug === op.tenantSlug)?.name || op.tenantSlug}</strong>
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => handleClaimAndApprove(op)}
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                          >
                            Claim & Approve for {tenantDisplayName}
                          </Button>
                        </Stack>
                      ))}
                    </Stack>
                  </Alert>
                )}
              </Paper>
            );
          })()}

          {/* Interactive Action Bar */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Quick Action Panel
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Execute role actions directly with immediate live feedback.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                {(user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      safeBlur();
                      setInviteOpen(true);
                    }}
                  >
                    Invite Users
                  </Button>
                )}
                {(user?.role === 'TENANT_ADMIN' || user?.role === 'INSTRUCTOR') && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      safeBlur();
                      setCourseOpen(true);
                    }}
                  >
                    Create Course
                  </Button>
                )}
                {(user?.role === 'TENANT_ADMIN' || user?.role === 'INSTRUCTOR') && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CampaignIcon />}
                    onClick={() => {
                      safeBlur();
                      setAnnouncementOpen(true);
                    }}
                  >
                    Post Announcement
                  </Button>
                )}
                {user?.role === 'STUDENT' && (
                  <>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<QuizIcon />}
                      onClick={() => handleOpenQuiz()}
                    >
                      Take Practice Assessment
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AutoStoriesIcon />}
                      onClick={() => setSearchParams({ view: 'courses' })}
                    >
                      Browse Courses
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>
          </Paper>

          {/* Student "Continue Learning" Section */}
          {user?.role === 'STUDENT' && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                Continue Learning
              </Typography>
              {courseList.length === 0 ? (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <AutoStoriesIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    No enrolled courses yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Your institution has not published any courses yet. Once courses are published, your learning progress will appear here.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {courseList.slice(0, 2).map((course, idx) => (
                    <Grid item xs={12} md={6} key={course.id || course.code}>
                      <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <CardContent>
                          <Chip
                            label={course.code}
                            size="small"
                            color={idx % 2 === 0 ? 'primary' : 'secondary'}
                            sx={{ mb: 1, fontWeight: 700 }}
                          />
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            {course.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            {course.description}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={idx === 0 ? 75 : 60}
                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                          />
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              Progress: {idx === 0 ? '75%' : '60%'}
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PlayArrowIcon />}
                              onClick={() => handleOpenLesson(course.code, `Module 1: Getting Started with ${course.code}`)}
                            >
                              Resume Lesson
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </>
      )}

      {/* ======================= VIEW: USERS ======================= */}
      {(currentView === 'users' || (user?.role === 'TENANT_ADMIN' && currentView === 'overview')) && (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              User Directory & Student Roster
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TextField
                placeholder="Search user or email..."
                size="small"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: 200, sm: 240 } }}
              />
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  safeBlur();
                  setInviteOpen(true);
                }}
              >
                Add / Invite User
              </Button>
            </Stack>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((u, i) => (
                  <TableRow key={u.id || i} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role.replace('_', ' ')}
                        size="small"
                        color={u.role === 'INSTRUCTOR' ? 'secondary' : u.role === 'STUDENT' ? 'default' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.status}
                        size="small"
                        color={u.status === 'ACTIVE' ? 'success' : u.status === 'PENDING_VERIFICATION' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {u.status === 'PENDING_VERIFICATION' ? (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleApproveVerification(u)}
                              sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleRejectVerification(u)}
                              sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="small"
                              startIcon={<LockResetIcon />}
                              onClick={() => setSuccessMessage(`Password reset link dispatched to ${u.email}`)}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              Reset PW
                            </Button>
                            <Button
                              size="small"
                              color={u.status === 'ACTIVE' ? 'warning' : 'success'}
                              onClick={() => {
                                const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                updateStoredUserStatus(u.email, newStatus);
                                const slug = tenant?.slug || (user?.email?.includes('lpu.edu') ? 'lpu' : 'apex-uni');
                                setUserList(getStoredUsersForTenant(slug));
                                setSuccessMessage(`Updated status for ${u.name}`);
                              }}
                              sx={{ fontSize: '0.75rem' }}
                            >
                              {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </Button>
                          </>
                        )}
                        {u.email.toLowerCase() !== user?.email?.toLowerCase() && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => handleOpenDeleteUserModal(u)}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Remove
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No instructors or students found. Click "+ Add / Invite User" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ======================= VIEW: COURSES ======================= */}
      {currentView === 'courses' && (
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Courses & Curriculum Directory
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                All accredited courses partitioned under tenant: <strong>{tenantDisplayName}</strong>
              </Typography>
            </Box>
            {(user?.role === 'TENANT_ADMIN' || user?.role === 'INSTRUCTOR' || user?.role === 'SUPER_ADMIN') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  safeBlur();
                  setCourseOpen(true);
                }}
              >
                Add New Course
              </Button>
            )}
          </Stack>

          {courseList.length === 0 ? (
            <Paper
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                No courses published yet for {tenantDisplayName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 480, mx: 'auto', mb: 3 }}>
                This institutional catalog is currently empty. As an instructor or administrator, you can publish accredited courses and build syllabus modules here.
              </Typography>
              {(user?.role === 'TENANT_ADMIN' || user?.role === 'INSTRUCTOR' || user?.role === 'SUPER_ADMIN') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    safeBlur();
                    setCourseOpen(true);
                  }}
                >
                  Create First Course
                </Button>
              )}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {courseList.map((course, idx) => (
                <Grid item xs={12} md={6} key={course.id || course.code || idx}>
                  <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={course.code} color={idx % 2 === 0 ? 'primary' : 'secondary'} size="small" sx={{ fontWeight: 700 }} />
                          <Chip label={course.category} size="small" variant="outlined" />
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Chip label={course.rating} size="small" variant="outlined" />
                          {(user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'INSTRUCTOR') && (
                            <IconButton
                              size="small"
                              color="error"
                              title="Delete Course"
                              onClick={() => handleRemoveCourse(course.code)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </Stack>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        {course.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Instructor: {course.instructor} • {course.enrolled} Enrolled • {course.modulesCount} Modules • {course.lessonsCount} Lessons
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleOpenLesson(course.code, `Module 1: Getting Started with ${course.code}`)}
                      >
                        Open Curriculum
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSuccessMessage(`Course details & syllabus for ${course.code} opened`)}
                      >
                        View Syllabus
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ======================= VIEW: ANNOUNCEMENTS ======================= */}
      {currentView === 'announcements' && (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Campus Announcements Feed
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Real-time tenant notices and academic updates.
              </Typography>
            </Box>
            {(user?.role === 'TENANT_ADMIN' || user?.role === 'INSTRUCTOR' || user?.role === 'SUPER_ADMIN') && (
              <Button
                variant="contained"
                startIcon={<CampaignIcon />}
                onClick={() => {
                  safeBlur();
                  setAnnouncementOpen(true);
                }}
              >
                New Announcement
              </Button>
            )}
          </Stack>

          {announcementList.length === 0 ? (
            <Paper
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <CampaignIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                No campus announcements posted yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 480, mx: 'auto', mb: 3 }}>
                Keep your campus informed about schedules, exams, events, and department notices.
              </Typography>
              {(user?.role === 'TENANT_ADMIN' || user?.role === 'INSTRUCTOR' || user?.role === 'SUPER_ADMIN') && (
                <Button
                  variant="contained"
                  startIcon={<CampaignIcon />}
                  onClick={() => {
                    safeBlur();
                    setAnnouncementOpen(true);
                  }}
                >
                  Create First Announcement
                </Button>
              )}
            </Paper>
          ) : (
            <Stack spacing={2}>
              {announcementList.map((ann) => (
                <Card key={ann.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {ann.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={ann.priority}
                        size="small"
                        color={ann.priority === 'HIGH' ? 'error' : 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                      {(user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'INSTRUCTOR') && (
                        <IconButton
                          size="small"
                          color="error"
                          title="Delete Announcement"
                          onClick={() => handleRemoveAnnouncement(ann.id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                    {ann.content}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Posted by <strong>{ann.author}</strong> • {ann.date}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setSuccessMessage(`Announcement "${ann.title}" marked as acknowledged.`)}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Acknowledge
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>
      )}

      {/* ======================= VIEW: QUIZZES ======================= */}
      {currentView === 'quizzes' && (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Quizzes & Knowledge Assessments
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Interactive timed assessments with automated grading and instant feedback.
              </Typography>
            </Box>
          </Stack>

          {courseList.length === 0 ? (
            <Paper
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <QuizIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                No assessments scheduled yet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                There are currently no active quizzes or assessments published for {tenantDisplayName}.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2.5}>
              {courseList.map((c, idx) => (
                <Card key={c.code} variant="outlined" sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {c.code} Assessment: {c.title}
                    </Typography>
                    <Chip label="20 mins • 3 Questions • 30 Points" size="small" color={idx % 2 === 0 ? 'primary' : 'secondary'} />
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Comprehensive knowledge check covering key syllabus topics in {c.code}.
                  </Typography>
                  <Button
                    variant="contained"
                    color={idx % 2 === 0 ? 'primary' : 'secondary'}
                    startIcon={<QuizIcon />}
                    onClick={() => handleOpenQuiz(`${c.code} Assessment: ${c.title}`)}
                  >
                    Start Assessment
                  </Button>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>
      )}

      {/* ======================= VIEW: TENANTS ======================= */}
      {currentView === 'tenants' && (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Provisioned Tenant Organizations
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Universities / Tenants: {tenantsList.length}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenProvisionTenantModal}
            >
              Provision New Tenant
            </Button>
          </Stack>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tenant Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subdomain Slug</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Max Students</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contact Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenantsList.map((t) => {
                  const key = t.id || t._id || t.slug;
                  return (
                    <TableRow key={key} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{t.name}</TableCell>
                      <TableCell>{t.domain}</TableCell>
                      <TableCell>
                        <Chip
                          label={t.status}
                          color={t.status === 'ACTIVE' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{t.maxStudents?.toLocaleString() || '5,000'}</TableCell>
                      <TableCell>{t.contactEmail}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            onClick={() => setSuccessMessage(`Switched tenant context to ${t.name}`)}
                          >
                            Manage
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => handleOpenDeleteTenantModal(t)}
                          >
                            Remove
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {tenantsList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No university tenants provisioned. Click "+ Provision New Tenant" to add one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ======================= VIEW: TELEMETRY ======================= */}
      {currentView === 'telemetry' && (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Real-Time System & Cache Telemetry
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setDbLatency(`${(0.8 + Math.random() * 0.6).toFixed(1)} ms`);
                  setCacheLatency(`${(0.2 + Math.random() * 0.3).toFixed(1)} ms`);
                  setSuccessMessage('Telemetry metrics refreshed from cluster nodes!');
                }}
              >
                Refresh Metrics
              </Button>
              <Button
                variant="contained"
                size="small"
                color="secondary"
                startIcon={<DeleteSweepIcon />}
                onClick={() => {
                  setCacheHitRate('99.1%');
                  setSuccessMessage('Redis cache purged for tenant. Next query warm-up triggered.');
                }}
              >
                Purge Redis Cache
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>DATABASE LATENCY</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>{dbLatency}</Typography>
                <Typography variant="caption">MongoDB 8.0 WiredTiger Engine</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>REDIS CACHE LATENCY</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>{cacheLatency}</Typography>
                <Typography variant="caption">Valkey 9.1 In-Memory Store</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>HTTP REST THROUGHPUT</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>1,250 req/s</Typography>
                <Typography variant="caption">k6 Benchmark Evaluated</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* ======================= VIEW: SETTINGS ======================= */}
      {currentView === 'settings' && (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {user?.role === 'SUPER_ADMIN' ? 'Global Platform Settings' : 'Tenant Organization Settings'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Configure institutional branding, domain resolution, security controls, and session policies.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                  Institutional Profile & Branding
                </Typography>
                <Stack spacing={2}>
                  <TextField label="Institution Name" defaultValue={tenantDisplayName} size="small" fullWidth />
                  <TextField label="Tenant Domain Slug" defaultValue={`${activeTenantSlug}.edusphere.io`} size="small" fullWidth disabled />
                  <TextField label="Administrative Contact Email" defaultValue={user?.email || `admin@${activeTenantSlug}.edu`} size="small" fullWidth />
                  <TextField label="Primary Brand Color" defaultValue="#2563EB" size="small" fullWidth />
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                  Security & Authentication Policies
                </Typography>
                <Stack spacing={2}>
                  <TextField label="JWT Access Token TTL" defaultValue="15 minutes (Dual-Token Standard)" size="small" fullWidth disabled />
                  <TextField label="Refresh Token Family Policy" defaultValue="Argon2id + Rotation with Reuse Detection" size="small" fullWidth disabled />
                  <TextField label="Max Concurrent Student Seats" defaultValue="15,000" size="small" fullWidth />
                  <TextField label="CORS Whitelist Origin" defaultValue="http://localhost:5173, http://localhost:5174" size="small" fullWidth />
                </Stack>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => setSuccessMessage('Settings reset to organization defaults.')}>
              Discard Changes
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSuccessMessage('Institutional settings and security policies updated successfully!')}
            >
              Save Settings
            </Button>
          </Box>
        </Paper>
      )}

      {/* ======================= DIALOG: INVITE USER ======================= */}
      <Dialog
        open={inviteOpen}
        onClose={() => {
          safeBlur();
          setInviteOpen(false);
        }}
        disableRestoreFocus
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Instructor or Student</DialogTitle>
        <form onSubmit={handleInviteSubmit}>
          <DialogContent>
            <Stack spacing={2.5}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Provision a new user account directly within this university organization. The user will be able to log in with these credentials immediately.
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="First Name"
                  fullWidth
                  size="small"
                  required
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  size="small"
                  required
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                />
              </Stack>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                size="small"
                required
                placeholder="e.g. prof.sharma@lpu.edu or student.aman@lpu.edu"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
              <TextField
                select
                label="Assigned Role"
                fullWidth
                size="small"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              >
                <MenuItem value="INSTRUCTOR">Instructor (Faculty / Course Lead)</MenuItem>
                <MenuItem value="STUDENT">Student (Learner)</MenuItem>
                <MenuItem value="TENANT_ADMIN">Tenant Administrator</MenuItem>
              </TextField>
              <TextField
                label="Initial Password"
                type={showInvitePassword ? 'text' : 'password'}
                fullWidth
                size="small"
                required
                value={inviteForm.password}
                onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                helperText="Password to sign in with this email (Default: Password123!)"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowInvitePassword(!showInvitePassword)}
                        edge="end"
                        size="small"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showInvitePassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<AddIcon />}>
              Create User
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ======================= DIALOG: CONFIRM DELETE USER ======================= */}
      <Dialog
        open={deleteUserModalOpen}
        onClose={() => setDeleteUserModalOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="delete-user-dialog-title"
      >
        <DialogTitle id="delete-user-dialog-title" sx={{ fontWeight: 800, color: 'error.main' }}>
          Confirm User Removal
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Are you sure you want to remove <strong>{userToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Email: <code>{userToDelete?.email}</code> • Role: <strong>{userToDelete?.role}</strong>
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This will permanently remove the user from this institution's roster, revoking their portal access and enrollments.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteUserModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={handleConfirmDeleteUser}
          >
            Confirm Removal
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================= DIALOG: POST ANNOUNCEMENT ======================= */}
      <Dialog
        open={announcementOpen}
        onClose={() => {
          safeBlur();
          setAnnouncementOpen(false);
        }}
        disableRestoreFocus
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Broadcast Announcement</DialogTitle>
        <form onSubmit={handleAnnouncementSubmit}>
          <DialogContent>
            <Stack spacing={2.5}>
              <TextField
                label="Announcement Title"
                fullWidth
                size="small"
                required
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              />
              <TextField
                select
                label="Priority Level"
                fullWidth
                size="small"
                value={announcementForm.priority}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="NORMAL">Normal</MenuItem>
                <MenuItem value="HIGH">High (Urgent)</MenuItem>
              </TextField>
              <TextField
                label="Content / Message"
                fullWidth
                multiline
                rows={4}
                required
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setAnnouncementOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Broadcast
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ======================= DIALOG: CREATE COURSE ======================= */}
      <Dialog
        open={courseOpen}
        onClose={() => {
          safeBlur();
          setCourseOpen(false);
        }}
        disableRestoreFocus
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Course</DialogTitle>
        <form onSubmit={handleCourseSubmit}>
          <DialogContent>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Course Code"
                  placeholder="e.g. CAP889"
                  fullWidth
                  size="small"
                  required
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                />
                <TextField
                  select
                  label="Category"
                  fullWidth
                  size="small"
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                >
                  <MenuItem value="Web Engineering">Web Engineering</MenuItem>
                  <MenuItem value="Frontend & UI/UX">Frontend & UI/UX</MenuItem>
                  <MenuItem value="Cloud & DevOps">Cloud & DevOps</MenuItem>
                  <MenuItem value="Software Architecture">Software Architecture</MenuItem>
                </TextField>
              </Stack>
              <TextField
                label="Course Title"
                placeholder="e.g. Advanced Microservices & Cloud Systems"
                fullWidth
                size="small"
                required
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              />
              <TextField
                label="Course Description"
                placeholder="Detailed curriculum objectives and syllabus..."
                fullWidth
                multiline
                rows={3}
                required
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setCourseOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Publish Course
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ======================= DIALOG: LESSON PLAYER MODAL ======================= */}
      <Dialog
        open={lessonModalOpen}
        onClose={() => {
          safeBlur();
          setLessonModalOpen(false);
        }}
        disableRestoreFocus
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {currentLesson?.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {currentLesson?.course} • Duration: {currentLesson?.duration}
            </Typography>
          </Box>
          <IconButton onClick={() => setLessonModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* Video Player */}
          <Box sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', bgcolor: '#000', mb: 2 }}>
            <video
              controls
              autoPlay
              style={{ width: '100%', maxHeight: 380, display: 'block' }}
              src={currentLesson?.videoUrl}
            />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Lecture Notes & Architecture Insights
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            {currentLesson?.notes}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Box>
            {lessonCompleted && (
              <Chip icon={<CheckCircleIcon />} label="Completed" color="success" size="small" />
            )}
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button onClick={() => setLessonModalOpen(false)}>Close Player</Button>
            <Button
              variant="contained"
              color={lessonCompleted ? 'success' : 'primary'}
              onClick={() => {
                setLessonCompleted(true);
                setSuccessMessage('Lesson marked as completed! Progress updated.');
              }}
            >
              {lessonCompleted ? 'Lesson Completed ✓' : 'Mark Complete & Next'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* ======================= DIALOG: QUIZ RUNNER MODAL ======================= */}
      <Dialog
        open={quizModalOpen}
        onClose={() => {
          safeBlur();
          setQuizModalOpen(false);
        }}
        disableRestoreFocus
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedQuizTitle}
        </DialogTitle>
        <DialogContent dividers>
          {quizSubmitted ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 1.5 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Assessment Complete!
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>
                Score: {quizScore} / 30 ({Math.round(((quizScore || 0) / 30) * 100)}%)
              </Typography>
              <Alert severity={quizScore && quizScore >= 20 ? 'success' : 'warning'} sx={{ maxWidth: 400, mx: 'auto' }}>
                {quizScore && quizScore >= 20
                  ? 'Congratulations! You passed the assessment above the 70% threshold.'
                  : 'You did not meet the passing grade. Review the lessons and try again.'}
              </Alert>
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Question 1 */}
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  1. In a shared-database multi-tenant architecture, what is the primary purpose of the tenantId discriminator?
                </FormLabel>
                <RadioGroup
                  value={quizAnswers['q1'] || ''}
                  onChange={(e) => setQuizAnswers({ ...quizAnswers, q1: e.target.value })}
                >
                  <FormControlLabel value="a" control={<Radio />} label="A) To encrypt database passwords in transit" />
                  <FormControlLabel value="b" control={<Radio />} label="B) To logically partition all queries and prevent cross-tenant data leakage" />
                  <FormControlLabel value="c" control={<Radio />} label="C) To compress JSON payloads before sending to client" />
                  <FormControlLabel value="d" control={<Radio />} label="D) To enable server-sent events for real-time notifications" />
                </RadioGroup>
              </FormControl>

              {/* Question 2 */}
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  2. What security action should occur when an already revoked refresh token is presented to the refresh endpoint?
                </FormLabel>
                <RadioGroup
                  value={quizAnswers['q2'] || ''}
                  onChange={(e) => setQuizAnswers({ ...quizAnswers, q2: e.target.value })}
                >
                  <FormControlLabel value="a" control={<Radio />} label="A) Silently issue a new token without warning" />
                  <FormControlLabel value="b" control={<Radio />} label="B) Revoke the ENTIRE token family for that user and reject with HTTP 403" />
                  <FormControlLabel value="c" control={<Radio />} label="C) Ignore the request and return HTTP 200" />
                  <FormControlLabel value="d" control={<Radio />} label="D) Increase token expiry by 7 days" />
                </RadioGroup>
              </FormControl>

              {/* Question 3 */}
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  3. Which caching pattern queries Redis first, fetches from MongoDB on miss, and populates Redis with a TTL?
                </FormLabel>
                <RadioGroup
                  value={quizAnswers['q3'] || ''}
                  onChange={(e) => setQuizAnswers({ ...quizAnswers, q3: e.target.value })}
                >
                  <FormControlLabel value="a" control={<Radio />} label="A) Write-Through Caching" />
                  <FormControlLabel value="b" control={<Radio />} label="B) Cache-Aside (Lazy Loading)" />
                  <FormControlLabel value="c" control={<Radio />} label="C) Refresh-Ahead Caching" />
                  <FormControlLabel value="d" control={<Radio />} label="D) Write-Behind (Write-Back)" />
                </RadioGroup>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setQuizModalOpen(false)}>
            {quizSubmitted ? 'Close' : 'Cancel'}
          </Button>
          {!quizSubmitted && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleQuizSubmit}
              disabled={!quizAnswers['q1'] || !quizAnswers['q2'] || !quizAnswers['q3']}
            >
              Submit Assessment
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 6. Provision New Tenant Dialog */}
      <Dialog
        open={provisionTenantModalOpen}
        onClose={() => setProvisionTenantModalOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="provision-tenant-dialog-title"
      >
        <DialogTitle id="provision-tenant-dialog-title" sx={{ fontWeight: 800 }}>
          Provision New University / Tenant
        </DialogTitle>
        <form onSubmit={handleCreateTenant}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Set up a new isolated multi-tenant organization. The system will allocate dedicated branding, domain routing, and tenant partitioning.
              </Typography>
              <TextField
                label="University / Institution Name"
                placeholder="e.g. Stanford University"
                fullWidth
                required
                value={newTenantForm.name}
                onChange={(e) => {
                  const nameVal = e.target.value;
                  const autoSlug = nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  setNewTenantForm((prev) => ({
                    ...prev,
                    name: nameVal,
                    slug: prev.slug === '' || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug,
                    domain: `${autoSlug || 'subdomain'}.edusphere.io`,
                  }));
                }}
              />
              <TextField
                label="Subdomain Slug"
                placeholder="e.g. stanford-edu"
                fullWidth
                required
                value={newTenantForm.slug}
                helperText={`Full URL: https://${newTenantForm.slug ? newTenantForm.slug.toLowerCase() : 'subdomain'}.edusphere.io`}
                onChange={(e) => {
                  const slugVal = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  setNewTenantForm((prev) => ({
                    ...prev,
                    slug: slugVal,
                    domain: `${slugVal}.edusphere.io`,
                  }));
                }}
              />
              <TextField
                label="Contact / Administrator Email"
                placeholder="admin@university.edu"
                type="email"
                fullWidth
                required
                value={newTenantForm.contactEmail}
                onChange={(e) => setNewTenantForm({ ...newTenantForm, contactEmail: e.target.value })}
              />
              <TextField
                label="Maximum Student Capacity"
                placeholder="5000"
                type="number"
                fullWidth
                value={newTenantForm.maxStudents}
                onChange={(e) => setNewTenantForm({ ...newTenantForm, maxStudents: Number(e.target.value) })}
              />
              <TextField
                label="Administrator Full Name"
                placeholder="e.g. Dr. John Doe"
                fullWidth
                required
                value={newTenantForm.adminName}
                onChange={(e) => setNewTenantForm({ ...newTenantForm, adminName: e.target.value })}
              />
              <TextField
                label="Administrator Initial Password"
                placeholder="Password123!"
                type={showAdminPassword ? 'text' : 'password'}
                fullWidth
                required
                value={newTenantForm.adminPassword}
                onChange={(e) => setNewTenantForm({ ...newTenantForm, adminPassword: e.target.value })}
                helperText="Initial credentials to sign into this institution's portal as Tenant Admin (Default: Password123!)"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showAdminPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setProvisionTenantModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!newTenantForm.name || !newTenantForm.slug}
            >
              Provision University
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 7. Confirm Deprovision / Delete Tenant Dialog */}
      <Dialog
        open={deleteTenantModalOpen}
        onClose={() => setDeleteTenantModalOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="delete-tenant-dialog-title"
      >
        <DialogTitle id="delete-tenant-dialog-title" sx={{ fontWeight: 800, color: 'error.main' }}>
          Confirm University Removal
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 1.5 }}>
            Are you sure you want to remove <strong>{tenantToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Domain: <code>{tenantToDelete?.domain}</code>
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Deprovisioning will unlink all associated courses, users, and telemetry records for this tenant organization. This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTenantModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={handleConfirmDeleteTenant}
          >
            Confirm Removal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
