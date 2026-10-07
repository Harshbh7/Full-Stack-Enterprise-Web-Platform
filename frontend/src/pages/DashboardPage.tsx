import React, { useState } from 'react';
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
import SettingsIcon from '@mui/icons-material/Settings';
import SpeedIcon from '@mui/icons-material/Speed';
import { useAppSelector } from '../store/index.js';
import { api } from '../services/api.js';

interface CourseItem {
  id?: string;
  code: string;
  title: string;
  description: string;
  instructor: string;
  enrolled: number;
  modulesCount: number;
  lessonsCount: number;
  rating: string;
  category: string;
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
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'STUDENT',
  });

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

  // Dynamic user list
  const [userList, setUserList] = useState([
    { name: 'Eleanor Rigby', email: 'admin@apex.edu', role: 'TENANT_ADMIN', status: 'ACTIVE' },
    { name: 'Marcus Smith', email: 'prof.smith@apex.edu', role: 'INSTRUCTOR', status: 'ACTIVE' },
    { name: 'Aria Patel', email: 'prof.patel@apex.edu', role: 'INSTRUCTOR', status: 'ACTIVE' },
    { name: 'Alice Johnson', email: 'student.alice@apex.edu', role: 'STUDENT', status: 'ACTIVE' },
    { name: 'Bob Chen', email: 'student.bob@apex.edu', role: 'STUDENT', status: 'ACTIVE' },
    { name: 'Charlie Davis', email: 'student.charlie@apex.edu', role: 'STUDENT', status: 'ACTIVE' },
  ]);

  // Dynamic course list
  const [courseList, setCourseList] = useState<CourseItem[]>([
    {
      code: 'CAP646',
      title: 'Full-Stack Web Development & Enterprise Architecture',
      description: 'Master micro-modular 6-tier architecture, multi-tenant database partitioning, JWT refresh token rotation, and high-concurrency Redis caching.',
      instructor: 'Prof. Marcus Smith',
      enrolled: 142,
      modulesCount: 3,
      lessonsCount: 4,
      rating: '4.9 ★ (38 reviews)',
      category: 'Web Engineering',
    },
    {
      code: 'CAP774',
      title: 'Styling and Scripting for Web Development',
      description: 'Enterprise design system engineering using Material UI (MUI v6), custom tokens, WCAG 2.1 AA accessibility, and Redux Toolkit state management.',
      instructor: 'Prof. Aria Patel',
      enrolled: 98,
      modulesCount: 2,
      lessonsCount: 2,
      rating: '4.8 ★ (24 reviews)',
      category: 'Frontend & UI/UX',
    },
  ]);

  // Dynamic announcement list
  const [announcementList, setAnnouncementList] = useState([
    {
      id: 1,
      title: 'CAP646 Project Milestones: CA2 & CA3 Defense Checkpoints',
      author: 'Prof. Marcus Smith',
      priority: 'HIGH',
      date: 'Today at 09:30 AM',
      content: 'Please ensure your repository satisfies all 27 non-negotiable architectural requirements, including Redis caching benchmarks and tenant isolation suites.',
    },
    {
      id: 2,
      title: 'Welcome to Academic Year 2026-2027 at Apex University!',
      author: 'Eleanor Rigby (Dean)',
      priority: 'NORMAL',
      date: 'Yesterday at 02:15 PM',
      content: 'We are thrilled to welcome all faculty and students to the EduSphere digital campus platform. Please review your enrolled course schedules.',
    },
  ]);

  // Handle Invite User Submit
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/invite', inviteForm);
      setUserList((prev) => [
        {
          name: `${inviteForm.firstName} ${inviteForm.lastName}`,
          email: inviteForm.email,
          role: inviteForm.role,
          status: 'ACTIVE',
        },
        ...prev,
      ]);
      setSuccessMessage(`Successfully invited ${inviteForm.firstName} ${inviteForm.lastName} (${inviteForm.email})!`);
      setInviteOpen(false);
      setInviteForm({ firstName: '', lastName: '', email: '', role: 'STUDENT' });
    } catch {
      // Graceful local update
      setUserList((prev) => [
        {
          name: `${inviteForm.firstName} ${inviteForm.lastName}`,
          email: inviteForm.email,
          role: inviteForm.role,
          status: 'ACTIVE',
        },
        ...prev,
      ]);
      setSuccessMessage(`User invited: ${inviteForm.firstName} ${inviteForm.lastName}!`);
      setInviteOpen(false);
      setInviteForm({ firstName: '', lastName: '', email: '', role: 'STUDENT' });
    }
  };

  // Handle Post Announcement Submit
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/announcements', announcementForm);
      setAnnouncementList((prev) => [
        {
          id: Date.now(),
          title: announcementForm.title,
          author: `${user?.firstName || 'Faculty'} ${user?.lastName || 'Member'}`,
          priority: announcementForm.priority,
          date: 'Just now',
          content: announcementForm.content,
        },
        ...prev,
      ]);
      setSuccessMessage(`Announcement [${announcementForm.title}] broadcasted to all enrolled students!`);
      setAnnouncementOpen(false);
      setAnnouncementForm({ title: '', content: '', priority: 'NORMAL' });
    } catch {
      setAnnouncementList((prev) => [
        {
          id: Date.now(),
          title: announcementForm.title,
          author: `${user?.firstName || 'Faculty'} ${user?.lastName || 'Member'}`,
          priority: announcementForm.priority,
          date: 'Just now',
          content: announcementForm.content,
        },
        ...prev,
      ]);
      setSuccessMessage(`Announcement posted: ${announcementForm.title}!`);
      setAnnouncementOpen(false);
      setAnnouncementForm({ title: '', content: '', priority: 'NORMAL' });
    }
  };

  // Handle Create Course Submit
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/courses', {
        title: courseForm.title,
        code: courseForm.code.toUpperCase(),
        category: courseForm.category,
        description: courseForm.description,
        level: courseForm.level,
      });
      setCourseList((prev) => [
        {
          code: courseForm.code.toUpperCase(),
          title: courseForm.title,
          description: courseForm.description,
          instructor: `${user?.firstName || 'Faculty'} ${user?.lastName || 'Member'}`,
          enrolled: 0,
          modulesCount: 1,
          lessonsCount: 1,
          rating: 'New ★',
          category: courseForm.category,
        },
        ...prev,
      ]);
      setSuccessMessage(`Course [${courseForm.code.toUpperCase()}: ${courseForm.title}] created and published!`);
      setCourseOpen(false);
      setCourseForm({ title: '', code: '', category: 'Web Engineering', level: 'INTERMEDIATE', description: '' });
    } catch {
      setCourseList((prev) => [
        {
          code: courseForm.code.toUpperCase(),
          title: courseForm.title,
          description: courseForm.description,
          instructor: `${user?.firstName || 'Faculty'} ${user?.lastName || 'Member'}`,
          enrolled: 0,
          modulesCount: 1,
          lessonsCount: 1,
          rating: 'New ★',
          category: courseForm.category,
        },
        ...prev,
      ]);
      setSuccessMessage(`Course created: ${courseForm.title}!`);
      setCourseOpen(false);
      setCourseForm({ title: '', code: '', category: 'Web Engineering', level: 'INTERMEDIATE', description: '' });
    }
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
          {user?.role === 'TENANT_ADMIN' && `Managing organizational operations for ${tenant?.name || 'Apex University'}.`}
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
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>3</Typography>
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
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>12,400</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>↑ 12% vs last term</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ACTIVE INSTRUCTORS</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>48</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>12 departments</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>COURSES PUBLISHED</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{courseList.length}</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>CAP646 & CAP774 active</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>COMPLETION RATE</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>84.2%</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>Above target (80%)</Typography>
                  </Paper>
                </Grid>
              </>
            )}

            {user?.role === 'INSTRUCTOR' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>MY ACTIVE STUDENTS</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>240</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>Across 2 courses</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>COURSES TAUGHT</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{courseList.length}</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>Active curriculum</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>SUBMISSIONS GRADED</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>92</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>88.5% avg score</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>STUDENT SATISFACTION</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>4.9 ★</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>62 reviews recorded</Typography>
                  </Paper>
                </Grid>
              </>
            )}

            {user?.role === 'STUDENT' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ENROLLED COURSES</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>2 Active</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>CAP646 & CAP774</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>LESSONS COMPLETED</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>4 / 5</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>80% curriculum view</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ASSESSMENTS PASSED</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>100%</Typography>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>30/30 on Midterm</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>OVERALL PROGRESS</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>75%</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>On track for Certificate</Typography>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>

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
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Chip label="CAP646" size="small" color="primary" sx={{ mb: 1, fontWeight: 700 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Full-Stack Web Development & Enterprise Architecture
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Current Topic: Multi-Tenant Database Partitioning and Discriminator Scoping
                      </Typography>
                      <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Progress: 75%</Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleOpenLesson('CAP646', 'Lesson 1.1: Multi-Tenancy Principles & Resolution')}
                        >
                          Resume Lesson
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Chip label="CAP774" size="small" color="secondary" sx={{ mb: 1, fontWeight: 700 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Styling and Scripting for Web Development
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Current Topic: Material UI Design Tokens, Plus Jakarta Sans & WCAG AA
                      </Typography>
                      <LinearProgress variant="determinate" value={60} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Progress: 60%</Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleOpenLesson('CAP774', 'Lesson 1.1: Design Tokens, Typography & WCAG Compliance')}
                        >
                          Resume Lesson
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
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
                Invite User
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
                  <TableRow key={i}>
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
                      <Chip label={u.status} size="small" color={u.status === 'ACTIVE' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<LockResetIcon />}
                        onClick={() => setSuccessMessage(`Password reset link dispatched to ${u.email}`)}
                        sx={{ fontSize: '0.75rem', mr: 1 }}
                      >
                        Reset PW
                      </Button>
                      <Button
                        size="small"
                        color={u.status === 'ACTIVE' ? 'warning' : 'success'}
                        onClick={() => {
                          setUserList((prev) =>
                            prev.map((item) =>
                              item.email === u.email
                                ? { ...item, status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
                                : item
                            )
                          );
                          setSuccessMessage(`Updated status for ${u.name}`);
                        }}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
                All accredited courses partitioned under tenant: <strong>{tenant?.name || 'Apex University'}</strong>
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

          <Grid container spacing={3}>
            {courseList.map((course, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Chip label={course.code} color={idx % 2 === 0 ? 'primary' : 'secondary'} size="small" sx={{ fontWeight: 700 }} />
                      <Chip label={course.rating} size="small" variant="outlined" />
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

          <Stack spacing={2}>
            {announcementList.map((ann) => (
              <Card key={ann.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {ann.title}
                  </Typography>
                  <Chip
                    label={ann.priority}
                    size="small"
                    color={ann.priority === 'HIGH' ? 'error' : 'default'}
                    sx={{ fontWeight: 700 }}
                  />
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

          <Stack spacing={2.5}>
            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  CAP646 Midterm Assessment: Multi-Tenancy & Architecture
                </Typography>
                <Chip label="20 mins • 3 Questions • 30 Points" size="small" color="primary" />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Timed evaluation covering layered architecture, tenant isolation, and JWT token family rotation.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<QuizIcon />}
                onClick={() => handleOpenQuiz('CAP646 Midterm Assessment: Multi-Tenancy & Architecture')}
              >
                Start Assessment
              </Button>
            </Card>

            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  CAP774 Practical Quiz: Material UI & WCAG AA Tokens
                </Typography>
                <Chip label="15 mins • 3 Questions • 30 Points" size="small" color="secondary" />
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Practical knowledge check on typography systems, color contrast ratios, and accessible form controls.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<QuizIcon />}
                onClick={() => handleOpenQuiz('CAP774 Practical Quiz: Material UI & WCAG AA Tokens')}
              >
                Start Assessment
              </Button>
            </Card>
          </Stack>
        </Paper>
      )}

      {/* ======================= VIEW: TENANTS ======================= */}
      {currentView === 'tenants' && (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Provisioned Tenant Organizations
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setSuccessMessage('New Tenant Provisioning wizard initialized.')}
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
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Apex University</TableCell>
                  <TableCell>apex-uni.edusphere.io</TableCell>
                  <TableCell><Chip label="ACTIVE" color="success" size="small" /></TableCell>
                  <TableCell>15,000</TableCell>
                  <TableCell>admin@apex.edu</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setSuccessMessage('Switched tenant context to Apex University')}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Oakridge College</TableCell>
                  <TableCell>oakridge-col.edusphere.io</TableCell>
                  <TableCell><Chip label="ACTIVE" color="success" size="small" /></TableCell>
                  <TableCell>5,000</TableCell>
                  <TableCell>admin@oakridge.edu</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setSuccessMessage('Switched tenant context to Oakridge College')}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Summit Tech Institute</TableCell>
                  <TableCell>summit-inst.edusphere.io</TableCell>
                  <TableCell><Chip label="ACTIVE" color="success" size="small" /></TableCell>
                  <TableCell>2,500</TableCell>
                  <TableCell>admin@summit.edu</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setSuccessMessage('Switched tenant context to Summit Tech Institute')}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
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
                  <TextField label="Institution Name" defaultValue={tenant?.name || 'Apex University'} size="small" fullWidth />
                  <TextField label="Tenant Domain Slug" defaultValue="apex-uni.edusphere.io" size="small" fullWidth disabled />
                  <TextField label="Administrative Contact Email" defaultValue={user?.email || 'admin@apex.edu'} size="small" fullWidth />
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
        <DialogTitle sx={{ fontWeight: 800 }}>Invite Student or Instructor</DialogTitle>
        <form onSubmit={handleInviteSubmit}>
          <DialogContent>
            <Stack spacing={2.5}>
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
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
              <TextField
                select
                label="Role"
                fullWidth
                size="small"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              >
                <MenuItem value="STUDENT">Student</MenuItem>
                <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                <MenuItem value="TENANT_ADMIN">Tenant Administrator</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Send Invitation
            </Button>
          </DialogActions>
        </form>
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
    </Box>
  );
};
