import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import HubIcon from '@mui/icons-material/Hub';
import QuizIcon from '@mui/icons-material/Quiz';
import ForumIcon from '@mui/icons-material/Forum';
import AnalyticsIcon from '@mui/icons-material/Analytics';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const tenants = [
    {
      id: 'apex-uni',
      name: 'Apex University',
      tag: 'Higher Education',
      students: '12,400 Students',
      courses: '145 Courses',
      color: '#2563EB',
      description: 'Comprehensive undergraduate & postgraduate engineering and sciences curriculum.',
    },
    {
      id: 'oakridge-col',
      name: 'Oakridge College',
      tag: 'Liberal Arts & Business',
      students: '4,800 Students',
      courses: '68 Courses',
      color: '#059669',
      description: 'Interactive management, business analytics, and liberal arts programs.',
    },
    {
      id: 'summit-inst',
      name: 'Summit Tech Institute',
      tag: 'Professional Academy',
      students: '2,150 Enrolled',
      courses: '32 Bootcamps',
      color: '#7C3AED',
      description: 'Accelerated cloud computing, full-stack web, and DevOps certifications.',
    },
  ];

  const features = [
    {
      icon: <SecurityIcon color="primary" fontSize="large" />,
      title: 'Strict Logical Tenant Isolation',
      desc: 'Shared scalable database tier with strict discriminator scoping and zero cross-tenant leakage guaranteed by automated security suites.',
    },
    {
      icon: <SpeedIcon color="secondary" fontSize="large" />,
      title: 'Redis Accelerated Performance',
      desc: 'Sub-10ms cache-aside reads for course catalogs, student rosters, and telemetry dashboards with automated invalidation.',
    },
    {
      icon: <HubIcon color="primary" fontSize="large" />,
      title: 'Enterprise 6-Tier Architecture',
      desc: 'Decoupled Route → Middleware → Controller → Service → Repository → MongoDB layer enforcing Single Responsibility.',
    },
    {
      icon: <ForumIcon color="secondary" fontSize="large" />,
      title: 'Real-Time WebSocket Gateway',
      desc: 'Instant tenant-scoped classroom chat, broadcast announcements, and notification toasts via Socket.IO.',
    },
    {
      icon: <QuizIcon color="primary" fontSize="large" />,
      title: 'Assessment & Auto-Grading Engine',
      desc: 'Timed multiple-choice quizzes, instant algorithmic grading, and submission review pipelines.',
    },
    {
      icon: <AnalyticsIcon color="secondary" fontSize="large" />,
      title: 'Four-Tier Granular RBAC',
      desc: 'Distinct authority scopes for Super Admin, Tenant Admin, Instructor, and Student with backend enforcement.',
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
          <Chip
            label="PGY2-01 Full-Stack Enterprise Platform • CAP646 & CAP774"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, mb: 3 }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem' },
              fontWeight: 800,
              color: 'text.primary',
              lineHeight: 1.15,
              mb: 3,
            }}
          >
            Multi-Tenant Enterprise <br />
            <Box component="span" sx={{ color: 'primary.main' }}>
              Learning Management System
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 780,
              mx: 'auto',
              fontWeight: 400,
              lineHeight: 1.6,
              mb: 5,
            }}
          >
            EduSphere delivers SaaS-grade educational infrastructure. Independent universities, colleges, and academies operate with dedicated branding, curriculum, and analytics on a unified, high-performance platform.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/login')}
              sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
            >
              Launch Live Platform Demo
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="inherit"
              onClick={() => {
                const el = document.getElementById('tenants');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{ px: 3, py: 1.5, fontSize: '1rem', fontWeight: 600 }}
            >
              Explore Sample Tenants
            </Button>
          </Stack>
        </Box>

        {/* Feature Grid */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Typography
            variant="h3"
            sx={{ textAlign: 'center', fontWeight: 800, mb: 2 }}
          >
            Engineered for Enterprise Scale
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}
          >
            Visibly demonstrating real software engineering practices across all 27 academic requirements.
          </Typography>

          <Grid container spacing={4}>
            {features.map((f, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{ height: '100%', p: 1, display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 2 }}>{f.icon}</Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Multi-Tenant Showcase Section */}
        <Box id="tenants" sx={{ mb: 8 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 4 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Isolated Tenant Organizations
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Each tenant operates with distinct users, courses, analytics, and operational settings.
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={4}>
            {tenants.map((t) => (
              <Grid item xs={12} md={4} key={t.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderTop: `4px solid ${t.color}`,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Chip label={t.tag} size="small" sx={{ fontWeight: 600 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {t.id}.edusphere.io
                      </Typography>
                    </Stack>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                      {t.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                      {t.description}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Active Users
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {t.students}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Curriculum
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {t.courses}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate(`/login?tenant=${t.id}`)}
                    >
                      Access Tenant Portal
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};
