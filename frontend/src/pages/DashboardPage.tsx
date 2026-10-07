import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CampaignIcon from '@mui/icons-material/Campaign';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import { useAppSelector } from '../store/index.js';

export const DashboardPage: React.FC = () => {
  const { user, tenant } = useAppSelector((state) => state.auth);

  return (
    <Box>
      {/* Welcome Banner */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {user?.role === 'SUPER_ADMIN' && 'Here is the platform-wide multi-tenant telemetry and operational state.'}
          {user?.role === 'TENANT_ADMIN' && `Managing organizational operations for ${tenant?.name || 'Apex University'}.`}
          {user?.role === 'INSTRUCTOR' && 'Review your curriculum engagement, pending assignments, and student inquiries.'}
          {user?.role === 'STUDENT' && 'Continue your coursework, complete upcoming quizzes, and track your certifications.'}
        </Typography>
      </Box>

      {/* Role-Specific Metric Cards */}
      {user?.role === 'SUPER_ADMIN' && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      ACTIVE TENANTS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                      3
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.2, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 2 }}>
                    <CorporateFareIcon />
                  </Box>
                </Stack>
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, mt: 1, display: 'block' }}>
                  +1 tenant provisioned this month
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      TOTAL USERS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                      19,350
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.2, bgcolor: '#DCFCE7', color: '#16A34A', borderRadius: 2 }}>
                    <PeopleIcon />
                  </Box>
                </Stack>
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, mt: 1, display: 'block' }}>
                  Across all partitions
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      REDIS CACHE HIT RATE
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                      98.4%
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.2, bgcolor: '#FEF3C7', color: '#D97706', borderRadius: 2 }}>
                    <TrendingUpIcon />
                  </Box>
                </Stack>
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, mt: 1, display: 'block' }}>
                  Sub-10ms latency
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      SERVICES STATUS
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                      HEALTHY
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.2, bgcolor: '#DCFCE7', color: '#16A34A', borderRadius: 2 }}>
                    <CheckCircleOutlineIcon />
                  </Box>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1, display: 'block' }}>
                  MongoDB & Redis UP
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Tenants Table */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Provisioned Tenant Organizations
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tenant Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Subdomain Slug</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Student Quota</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Contact Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Apex University</TableCell>
                    <TableCell>apex-uni.edusphere.io</TableCell>
                    <TableCell><Chip label="ACTIVE" color="success" size="small" /></TableCell>
                    <TableCell>15,000</TableCell>
                    <TableCell>admin@apex.edu</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Oakridge College</TableCell>
                    <TableCell>oakridge-col.edusphere.io</TableCell>
                    <TableCell><Chip label="ACTIVE" color="success" size="small" /></TableCell>
                    <TableCell>5,000</TableCell>
                    <TableCell>admin@oakridge.edu</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Summit Tech Institute</TableCell>
                    <TableCell>summit-inst.edusphere.io</TableCell>
                    <TableCell><Chip label="ACTIVE" color="success" size="small" /></TableCell>
                    <TableCell>2,500</TableCell>
                    <TableCell>admin@summit.edu</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {user?.role === 'TENANT_ADMIN' && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  TOTAL ENROLLED STUDENTS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  12,400
                </Typography>
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                  ↑ 12% vs last semester
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  ACTIVE INSTRUCTORS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  48
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Across 12 departments
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  PUBLISHED COURSES
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  145
                </Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  8 new drafts pending review
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  COMPLETION RATE
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  84.2%
                </Typography>
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                  Above industry average (78%)
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Quick Action Bar */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Quick Administrative Actions
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Manage students, publish courses, or broadcast announcements.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button variant="contained" color="primary" startIcon={<AddIcon />}>
                  Invite Students
                </Button>
                <Button variant="outlined" color="primary" startIcon={<CampaignIcon />}>
                  Post Announcement
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </>
      )}

      {user?.role === 'INSTRUCTOR' && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  ACTIVE COURSES
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  4
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  TOTAL STUDENTS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  342
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  PENDING SUBMISSIONS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'secondary.main' }}>
                  18
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  AVG QUIZ SCORE
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  81.5%
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {user?.role === 'STUDENT' && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  ENROLLED COURSES
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  3
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  LESSONS COMPLETED
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  24 / 32
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  QUIZZES PASSED
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                  5 / 5
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  OVERALL COMPLETION
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                  75%
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Continue Learning Cards */}
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Continue Learning
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Chip label="CAP646" size="small" color="primary" sx={{ mb: 1, fontWeight: 700 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Full Stack Web Development & Micro-Modular Architecture
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Lesson 4: Multi-Tenant Database Partitioning and Discriminator Scoping
                  </Typography>
                  <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Progress: 75%
                    </Typography>
                    <Button variant="contained" size="small" startIcon={<PlayArrowIcon />}>
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
                    Lesson 6: Material UI Design Tokens & Accessible Responsive Shells
                  </Typography>
                  <LinearProgress variant="determinate" value={60} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Progress: 60%
                    </Typography>
                    <Button variant="contained" size="small" startIcon={<PlayArrowIcon />}>
                      Resume Lesson
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};
