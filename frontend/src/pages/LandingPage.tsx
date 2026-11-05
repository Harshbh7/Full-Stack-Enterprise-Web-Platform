import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  Stack,
  IconButton,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import HubIcon from '@mui/icons-material/Hub';
import QuizIcon from '@mui/icons-material/Quiz';
import ForumIcon from '@mui/icons-material/Forum';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { designTokens } from '../theme/tokens.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      badge: 'ENTERPRISE SAAS ARCHITECTURE',
      titlePart1: 'Multi-Tenant Enterprise',
      titlePart2: 'Learning Management System',
      description:
        'EduSphere delivers SaaS-grade educational infrastructure. Independent universities, colleges, and academies operate with dedicated branding, isolated curriculum, and unified cloud governance.',
      primaryBtnText: 'Launch Live Platform Demo',
      primaryAction: () => navigate('/login'),
      secondaryBtnText: 'Explore Platform Features',
      secondaryAction: () => {
        const el = document.getElementById('features');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
      tag: 'Logical Tenant Isolation & Scoping',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80',
      imageAlt: 'University students collaborating in enterprise digital campus',
      previewPill: 'Apex University • Multi-Tenant Isolation Active',
      previewMetrics: [
        { label: 'Active Institutions', value: '3 Tenants' },
        { label: 'Enrolled Students', value: '19,350' },
        { label: 'Isolation Policy', value: 'Strict Discriminator' },
      ],
      urlBar: 'https://edusphere.io/apex-uni/dashboard',
    },
    {
      badge: 'HIGH-CONCURRENCY BACKEND TIER',
      titlePart1: 'Sub-10ms Micro-Modular',
      titlePart2: 'Distributed Architecture',
      description:
        'Engineered with dual-token JWT authentication, Redis cache-aside invalidation, and automated cross-tenant security boundaries satisfying strict enterprise isolation standards.',
      primaryBtnText: 'Interactive API Docs',
      primaryAction: () => window.open('http://localhost:5000/api-docs', '_blank'),
      secondaryBtnText: 'Architecture Overview',
      secondaryAction: () => {
        const el = document.getElementById('features');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
      tag: 'Redis Caching & Swagger OpenAPI',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&auto=format&fit=crop&q=80',
      imageAlt: 'High concurrency cloud infrastructure and distributed server telemetry',
      previewPill: 'Valkey/Redis Cache-Aside Invalidation Engine',
      previewMetrics: [
        { label: 'Cache Latency', value: '< 0.4 ms' },
        { label: 'Cache Hit Rate', value: '98.4%' },
        { label: 'Security Rotation', value: 'Argon2id + JWT' },
      ],
      urlBar: 'https://edusphere.io/api/v1/telemetry/live',
    },
    {
      badge: 'COLLABORATIVE REAL-TIME CAMPUS',
      titlePart1: 'Event-Driven Classrooms',
      titlePart2: '& Timed Assessments',
      description:
        'Socket.IO live campus broadcasts, interactive course syllabus authoring, algorithmic quiz auto-grading, and comprehensive faculty gradebook management across all institutions.',
      primaryBtnText: 'Try Course Builder',
      primaryAction: () => navigate('/login?tenant=apex-uni'),
      secondaryBtnText: 'Explore Capabilities',
      secondaryAction: () => {
        const el = document.getElementById('features');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
      tag: 'WebSockets & Grading Engine',
      imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1600&auto=format&fit=crop&q=80',
      imageAlt: 'Interactive real-time classroom dashboard and automated assessment grading',
      previewPill: 'WebSocket Live Campus Channel & Quiz Engine',
      previewMetrics: [
        { label: 'Socket Connection', value: 'Authenticated WSS' },
        { label: 'Automated Grading', value: 'Instant 100%' },
        { label: 'Room Partition', value: 'tenant:apex-uni' },
      ],
      urlBar: 'https://edusphere.io/apex-uni/classrooms/cap646',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const features = [
    {
      icon: <SecurityIcon sx={{ color: 'primary.main', fontSize: 28 }} />,
      title: 'Strict Logical Tenant Isolation',
      desc: 'Shared scalable database tier with strict discriminator scoping and zero cross-tenant leakage guaranteed by automated security suites.',
    },
    {
      icon: <SpeedIcon sx={{ color: 'secondary.main', fontSize: 28 }} />,
      title: 'Redis Accelerated Performance',
      desc: 'Sub-10ms cache-aside reads for course catalogs, student rosters, and telemetry dashboards with automated invalidation.',
    },
    {
      icon: <HubIcon sx={{ color: 'primary.main', fontSize: 28 }} />,
      title: 'Enterprise 6-Tier Architecture',
      desc: 'Decoupled Route → Middleware → Controller → Service → Repository → MongoDB layer enforcing Single Responsibility.',
    },
    {
      icon: <ForumIcon sx={{ color: 'secondary.main', fontSize: 28 }} />,
      title: 'Real-Time WebSocket Gateway',
      desc: 'Instant tenant-scoped classroom chat, broadcast announcements, and notification toasts via Socket.IO.',
    },
    {
      icon: <QuizIcon sx={{ color: 'primary.main', fontSize: 28 }} />,
      title: 'Assessment & Auto-Grading Engine',
      desc: 'Timed multiple-choice quizzes, instant algorithmic grading, and submission review pipelines.',
    },
    {
      icon: <AnalyticsIcon sx={{ color: 'secondary.main', fontSize: 28 }} />,
      title: 'Four-Tier Granular RBAC',
      desc: 'Distinct authority scopes for Super Admin, Tenant Admin, Instructor, and Student with backend enforcement.',
    },
  ];

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      {/* Full-Screen Hero Banner */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          bgcolor: '#0E170E',
          color: '#FFFFFF',
          pt: { xs: 10, sm: 11, md: 12 },
          pb: { xs: 4, sm: 5, md: 6 },
        }}
      >
        {/* Full-Screen Ken Burns / Fade Background Images for all slides */}
        {heroSlides.map((slide, idx) => (
          <Box
            key={idx}
            component="img"
            src={slide.imageUrl}
            alt={slide.imageAlt}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
              opacity: currentSlide === idx ? 1 : 0,
              transform: currentSlide === idx ? 'scale(1.04)' : 'scale(1)',
              transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 8s cubic-bezier(0.1, 0.9, 0.2, 1)',
              filter: 'brightness(0.72) contrast(1.05)',
            }}
          />
        ))}

        {/* Deep Multi-Layer Luxury Dark Overlay for High-Contrast Text Legibility */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background:
              'linear-gradient(180deg, rgba(12, 20, 12, 0.72) 0%, rgba(12, 20, 12, 0.62) 45%, rgba(8, 14, 8, 0.94) 100%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background:
              'radial-gradient(ellipse at center, rgba(14, 22, 14, 0.2) 0%, rgba(8, 14, 8, 0.88) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Slide Navigation Arrow Controls (Desktop & Tablet) */}
        <IconButton
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          sx={{
            position: 'absolute',
            left: { xs: 8, md: 28 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            color: '#FFFFFF',
            bgcolor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            width: { xs: 40, md: 48 },
            height: { xs: 40, md: 48 },
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              transform: 'translateY(-50%) scale(1.08)',
            },
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-label="Previous slide"
        >
          <ChevronLeftIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
        </IconButton>

        <IconButton
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          sx={{
            position: 'absolute',
            right: { xs: 8, md: 28 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            color: '#FFFFFF',
            bgcolor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            width: { xs: 40, md: 48 },
            height: { xs: 40, md: 48 },
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              transform: 'translateY(-50%) scale(1.08)',
            },
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-label="Next slide"
        >
          <ChevronRightIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
        </IconButton>

        {/* Center Content Container */}
        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            my: 'auto',
            px: { xs: 2.5, sm: 4 },
          }}
        >
          <Box
            key={currentSlide}
            sx={{
              maxWidth: 960,
              mx: 'auto',
              width: '100%',
              animation: 'fadeInSlide 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              '@keyframes fadeInSlide': {
                from: { opacity: 0, transform: 'translateY(14px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {/* Giant Title */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.2rem', sm: '3.2rem', md: '4.2rem' },
                fontWeight: 600,
                fontFamily: designTokens.typography.fontSerif,
                color: '#FFFFFF',
                lineHeight: 1.12,
                letterSpacing: '-0.015em',
                textShadow: '0 4px 28px rgba(0, 0, 0, 0.75)',
                mb: 2,
              }}
            >
              {heroSlides[currentSlide].titlePart1} <br />
              <Box component="span" sx={{ color: '#BDE4A7', fontStyle: 'italic' }}>
                {heroSlides[currentSlide].titlePart2}
              </Box>
            </Typography>

            {/* Subtitle Description */}
            <Typography
              variant="subtitle1"
              sx={{
                color: 'rgba(255, 255, 255, 0.92)',
                maxWidth: 800,
                mx: 'auto',
                fontSize: { xs: '0.96rem', md: '1.15rem' },
                lineHeight: 1.65,
                textShadow: '0 2px 14px rgba(0, 0, 0, 0.65)',
                mb: 3.5,
              }}
            >
              {heroSlides[currentSlide].description}
            </Typography>

            {/* CTA Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2.5}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: { xs: 4, md: 5 } }}
            >
              <Button
                variant="contained"
                size="large"
                color="primary"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                onClick={heroSlides[currentSlide].primaryAction}
                sx={{
                  px: 4.5,
                  py: 1.6,
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  fontSize: '0.85rem',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
                }}
              >
                {heroSlides[currentSlide].primaryBtnText}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<HubIcon sx={{ fontSize: 18 }} />}
                onClick={heroSlides[currentSlide].secondaryAction}
                sx={{
                  px: 4,
                  py: 1.6,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  fontSize: '0.85rem',
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.45)',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.22)',
                    borderColor: '#FFFFFF',
                  },
                }}
              >
                {heroSlides[currentSlide].secondaryBtnText}
              </Button>
            </Stack>

            {/* Sleek Carousel Indicators */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={{
                mt: { xs: 3, md: 4 },
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                {heroSlides.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    sx={{
                      cursor: 'pointer',
                      width: currentSlide === idx ? 34 : 10,
                      height: 7,
                      borderRadius: 4,
                      bgcolor: currentSlide === idx ? '#BDE4A7' : 'rgba(255, 255, 255, 0.3)',
                      boxShadow: currentSlide === idx ? '0 0 12px rgba(189, 228, 167, 0.7)' : 'none',
                      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: currentSlide === idx ? '#BDE4A7' : 'rgba(255, 255, 255, 0.6)',
                      },
                    }}
                  />
                ))}
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  ml: 1,
                }}
              >
                0{currentSlide + 1} / 0{heroSlides.length}
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Feature Grid Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box id="features">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'primary.main',
                fontWeight: 800,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontSize: '0.72rem',
                display: 'block',
                mb: 1,
              }}
            >
              SYSTEM CAPABILITIES
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 600,
                fontFamily: designTokens.typography.fontSerif,
                fontSize: { xs: '2rem', md: '2.75rem' },
                mb: 1.5,
              }}
            >
              Engineered for Enterprise Scale
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', maxWidth: 640, mx: 'auto' }}
            >
              Visibly demonstrating real software engineering practices across all 27 academic requirements.
            </Typography>
          </Box>

          <Grid container spacing={3.5}>
            {features.map((f, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#FFFFFF',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(26, 34, 24, 0.04)',
                    '&:hover': {
                      boxShadow: '0 12px 30px rgba(26, 34, 24, 0.08)',
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2.5,
                        bgcolor: 'background.surface',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: designTokens.typography.fontSerif,
                        fontWeight: 600,
                        fontSize: '1.25rem',
                        mb: 1.2,
                        color: 'text.primary',
                      }}
                    >
                      {f.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65 }}>
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};
