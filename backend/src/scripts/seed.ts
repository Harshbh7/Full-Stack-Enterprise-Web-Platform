import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Enrollment } from '../models/Enrollment.js';
import { LessonProgress } from '../models/LessonProgress.js';
import { Announcement } from '../models/Announcement.js';
import { Notification } from '../models/Notification.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { hashPassword } from '../utils/password.util.js';
import { logger } from '../config/logger.js';

export const seedDatabase = async () => {
  const startTime = Date.now();
  logger.info('Starting enterprise database seed for EduSphere...');

  await mongoose.connect(env.MONGODB_URI);
  logger.info(`Connected to MongoDB: ${env.MONGODB_URI}`);

  // 1. Purge existing collections
  await Promise.all([
    Tenant.deleteMany({}),
    User.deleteMany({}),
    Course.deleteMany({}),
    Module.deleteMany({}),
    Lesson.deleteMany({}),
    Quiz.deleteMany({}),
    Question.deleteMany({}),
    QuizAttempt.deleteMany({}),
    Enrollment.deleteMany({}),
    LessonProgress.deleteMany({}),
    Announcement.deleteMany({}),
    Notification.deleteMany({}),
    RefreshToken.deleteMany({}),
  ]);
  logger.info('Cleaned all existing collections.');

  // 2. Seed Tenants
  const [apex, oakridge, summit] = await Promise.all([
    Tenant.create({
      name: 'Apex University',
      slug: 'apex-uni',
      domain: 'apex.edusphere.io',
      primaryColor: '#2563EB',
      status: 'ACTIVE',
      contactEmail: 'admin@apex.edu',
      settings: {
        allowSelfRegistration: true,
        maxStudents: 15000,
        maxCourses: 250,
        storageQuotaBytes: 107374182400,
        requireMFA: false,
      },
    }),
    Tenant.create({
      name: 'Oakridge College',
      slug: 'oakridge-col',
      domain: 'oakridge.edusphere.io',
      primaryColor: '#059669',
      status: 'ACTIVE',
      contactEmail: 'admin@oakridge.edu',
      settings: {
        allowSelfRegistration: true,
        maxStudents: 5000,
        maxCourses: 100,
        storageQuotaBytes: 53687091200,
        requireMFA: false,
      },
    }),
    Tenant.create({
      name: 'Summit Tech Institute',
      slug: 'summit-inst',
      domain: 'summit.edusphere.io',
      primaryColor: '#7C3AED',
      status: 'ACTIVE',
      contactEmail: 'admin@summit.edu',
      settings: {
        allowSelfRegistration: true,
        maxStudents: 2500,
        maxCourses: 50,
        storageQuotaBytes: 26843545600,
        requireMFA: false,
      },
    }),
  ]);

  logger.info(`Seeded 3 tenants: [${apex.slug}, ${oakridge.slug}, ${summit.slug}]`);

  // Common password hash for test accounts
  const passwordHash = await hashPassword('Password123!');

  // 3. Seed Users
  // Super Admin (Global scope, null tenantId)
  const superAdmin = await User.create({
    email: 'superadmin@edusphere.io',
    passwordHash,
    firstName: 'Alex',
    lastName: 'Vance',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  // Apex University Users
  const [apexAdmin, profSmith, profPatel, studentAlice, studentBob, studentCharlie] = await Promise.all([
    User.create({
      tenantId: apex._id,
      email: 'admin@apex.edu',
      passwordHash,
      firstName: 'Eleanor',
      lastName: 'Rigby',
      role: 'TENANT_ADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    }),
    User.create({
      tenantId: apex._id,
      email: 'prof.smith@apex.edu',
      passwordHash,
      firstName: 'Marcus',
      lastName: 'Smith',
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    }),
    User.create({
      tenantId: apex._id,
      email: 'prof.patel@apex.edu',
      passwordHash,
      firstName: 'Aria',
      lastName: 'Patel',
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    }),
    User.create({
      tenantId: apex._id,
      email: 'student.alice@apex.edu',
      passwordHash,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'STUDENT',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    }),
    User.create({
      tenantId: apex._id,
      email: 'student.bob@apex.edu',
      passwordHash,
      firstName: 'Bob',
      lastName: 'Chen',
      role: 'STUDENT',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    }),
    User.create({
      tenantId: apex._id,
      email: 'student.charlie@apex.edu',
      passwordHash,
      firstName: 'Charlie',
      lastName: 'Davis',
      role: 'STUDENT',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    }),
  ]);

  // Oakridge College Users
  const [oakAdmin, profWong, studentDiana] = await Promise.all([
    User.create({
      tenantId: oakridge._id,
      email: 'admin@oakridge.edu',
      passwordHash,
      firstName: 'Robert',
      lastName: 'Oakley',
      role: 'TENANT_ADMIN',
      status: 'ACTIVE',
    }),
    User.create({
      tenantId: oakridge._id,
      email: 'prof.wong@oakridge.edu',
      passwordHash,
      firstName: 'Claire',
      lastName: 'Wong',
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
    }),
    User.create({
      tenantId: oakridge._id,
      email: 'student.diana@oakridge.edu',
      passwordHash,
      firstName: 'Diana',
      lastName: 'Prince',
      role: 'STUDENT',
      status: 'ACTIVE',
    }),
  ]);

  logger.info(`Seeded ${[superAdmin, apexAdmin, profSmith, profPatel, studentAlice, studentBob, studentCharlie, oakAdmin, profWong, studentDiana].length} users across 3 roles & tenants.`);

  // 4. Seed Courses for Apex University
  const courseCap646 = await Course.create({
    tenantId: apex._id,
    instructorId: profSmith._id,
    title: 'Full-Stack Web Development & Enterprise Architecture',
    slug: 'cap646-full-stack-web-dev',
    code: 'CAP646',
    description: 'Master micro-modular 6-tier architecture, multi-tenant database partitioning, JWT refresh token rotation, and high-concurrency Redis caching.',
    category: 'Web Engineering',
    level: 'ADVANCED',
    status: 'PUBLISHED',
    price: 0,
    enrolledCount: 142,
    ratingAverage: 4.9,
    ratingCount: 38,
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Redis', 'Multi-Tenancy'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
  });

  const courseCap774 = await Course.create({
    tenantId: apex._id,
    instructorId: profPatel._id,
    title: 'Styling and Scripting for Web Development',
    slug: 'cap774-styling-scripting',
    code: 'CAP774',
    description: 'Enterprise design system engineering using Material UI (MUI v6), custom tokens, WCAG 2.1 AA accessibility, and Redux Toolkit state management.',
    category: 'Frontend Engineering',
    level: 'INTERMEDIATE',
    status: 'PUBLISHED',
    price: 0,
    enrolledCount: 98,
    ratingAverage: 4.8,
    ratingCount: 24,
    tags: ['CSS', 'Material UI', 'Accessibility', 'Redux', 'Design Systems'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600',
  });

  const courseCs501 = await Course.create({
    tenantId: apex._id,
    instructorId: profSmith._id,
    title: 'Cloud Computing & Container Orchestration',
    slug: 'cs501-cloud-computing',
    code: 'CS501',
    description: 'Production containerization using multi-stage Dockerfiles, Docker Compose service meshes, CI/CD automated test gates, and k6 load testing.',
    category: 'Cloud & DevOps',
    level: 'ADVANCED',
    status: 'PUBLISHED',
    price: 0,
    enrolledCount: 65,
    ratingAverage: 4.7,
    ratingCount: 19,
    tags: ['Docker', 'CI/CD', 'k6', 'DevOps'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600',
  });

  // Oakridge Course (for Tenant Isolation testing)
  const courseOakridgeBus = await Course.create({
    tenantId: oakridge._id,
    instructorId: profWong._id,
    title: 'Business Analytics & Decision Sciences',
    slug: 'bus301-business-analytics',
    code: 'BUS301',
    description: 'Quantitative analytics for corporate decision intelligence and financial modeling.',
    category: 'Business',
    level: 'INTERMEDIATE',
    status: 'PUBLISHED',
    price: 0,
    enrolledCount: 88,
    ratingAverage: 4.8,
    ratingCount: 22,
    tags: ['Analytics', 'Finance', 'Strategy'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
  });

  logger.info(`Seeded 4 courses across tenants [CAP646, CAP774, CS501, BUS301].`);

  // 5. Seed Curriculum: Modules & Lessons for CAP646
  const [mod1, mod2, mod3] = await Promise.all([
    Module.create({
      tenantId: apex._id,
      courseId: courseCap646._id,
      title: 'Module 1: Multi-Tenant Architecture & Data Partitioning',
      order: 1,
      description: 'Understanding logical database partitioning, discriminator fields, and tenant resolution middleware.',
    }),
    Module.create({
      tenantId: apex._id,
      courseId: courseCap646._id,
      title: 'Module 2: Enterprise Authentication & Token Security',
      order: 2,
      description: 'Implementing Argon2id password hashing, dual-token JWT, and refresh token family rotation.',
    }),
    Module.create({
      tenantId: apex._id,
      courseId: courseCap646._id,
      title: 'Module 3: High-Performance Caching & WebSockets',
      order: 3,
      description: 'Redis cache-aside performance optimization and real-time Socket.IO room isolation.',
    }),
  ]);

  const [les1, les2, les3, les4] = await Promise.all([
    Lesson.create({
      tenantId: apex._id,
      courseId: courseCap646._id,
      moduleId: mod1._id,
      title: 'Lesson 1.1: Multi-Tenancy Principles & Resolution Strategies',
      order: 1,
      contentType: 'VIDEO',
      contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      durationSeconds: 1080,
      isFreePreview: true,
      textContent: 'Comprehensive breakdown of Shared Database vs Database-per-Tenant trade-offs in cloud SaaS environments.',
    }),
    Lesson.create({
      tenantId: apex._id,
      courseId: courseCap646._id,
      moduleId: mod1._id,
      title: 'Lesson 1.2: BaseRepository Auto-Scoping Pattern',
      order: 2,
      contentType: 'MARKDOWN',
      durationSeconds: 900,
      textContent: `### BaseRepository Pattern in TypeScript\n\nBy injecting the \`tenantId\` filter automatically into every Mongoose query in the base repository layer, developers eliminate accidental data leaks.\n\n\`\`\`typescript\nprotected applyTenantFilter(filter: FilterQuery<T>, tenantId?: string) {\n  if (!tenantId) throw new TenantIsolationError();\n  return { ...filter, tenantId: new Types.ObjectId(tenantId) };\n}\n\`\`\``,
    }),
    Lesson.create({
      tenantId: apex._id,
      courseId: courseCap646._id,
      moduleId: mod2._id,
      title: 'Lesson 2.1: Refresh Token Family Rotation & Replay Defense',
      order: 1,
      contentType: 'VIDEO',
      contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      durationSeconds: 1320,
      textContent: 'How single-use tokens detect stolen tokens and instantly invalidate active user sessions across the entire token family.',
    }),
    Lesson.create({
      tenantId: apex._id,
      courseId: courseCap646._id,
      moduleId: mod3._id,
      title: 'Lesson 3.1: Redis Cache-Aside & Socket.IO Rooms',
      order: 1,
      contentType: 'VIDEO',
      contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      durationSeconds: 1200,
      textContent: 'Benchmarking sub-10ms response times with Redis and broadcasting instant updates via tenant-scoped rooms.',
    }),
  ]);

  logger.info(`Seeded 3 modules and 4 lessons for CAP646.`);

  // 6. Seed Modules & Lessons for CAP774
  const modCap774 = await Module.create({
    tenantId: apex._id,
    courseId: courseCap774._id,
    title: 'Module 1: Material UI v6 Design System & Tokens',
    order: 1,
    description: 'Constructing robust UI shells using custom typography, cobalt color palettes, and accessible components.',
  });

  const lesCap774 = await Lesson.create({
    tenantId: apex._id,
    courseId: courseCap774._id,
    moduleId: modCap774._id,
    title: 'Lesson 1.1: Design Tokens, Typography & WCAG Compliance',
    order: 1,
    contentType: 'MARKDOWN',
    durationSeconds: 780,
    textContent: 'Deep dive into Plus Jakarta Sans font scaling, 4.5:1 text contrast ratios, 44px touch targets, and accessible focus outlines.',
  });

  // 7. Seed Quizzes & Questions
  const quizCap646 = await Quiz.create({
    tenantId: apex._id,
    courseId: courseCap646._id,
    title: 'CAP646 Midterm Assessment: Multi-Tenancy & Architecture',
    description: 'Comprehensive evaluation of layered backend patterns, tenant isolation, and JWT token rotation.',
    passingScorePercentage: 70,
    timeLimitMinutes: 20,
    maxAttempts: 3,
    status: 'PUBLISHED',
  });

  const [q1, q2, q3] = await Promise.all([
    Question.create({
      tenantId: apex._id,
      quizId: quizCap646._id,
      prompt: 'In a shared-database multi-tenant architecture, what is the primary purpose of the tenantId discriminator?',
      questionType: 'MULTIPLE_CHOICE',
      points: 10,
      options: [
        { id: 'opt_1a', text: 'To encrypt database passwords in transit', isCorrect: false },
        { id: 'opt_1b', text: 'To logically partition all queries and prevent cross-tenant data leakage', isCorrect: true },
        { id: 'opt_1c', text: 'To compress JSON payloads before sending to client', isCorrect: false },
        { id: 'opt_1d', text: 'To enable server-sent events for real-time notifications', isCorrect: false },
      ],
      explanation: 'The tenantId discriminator partitions data on shared collections so every repository query strictly limits results to the requesting tenant.',
    }),
    Question.create({
      tenantId: apex._id,
      quizId: quizCap646._id,
      prompt: 'What security action should occur when an already revoked refresh token is presented to the refresh endpoint?',
      questionType: 'MULTIPLE_CHOICE',
      points: 10,
      options: [
        { id: 'opt_2a', text: 'Silently issue a new token without warning', isCorrect: false },
        { id: 'opt_2b', text: 'Revoke the ENTIRE token family for that user and reject with HTTP 403', isCorrect: true },
        { id: 'opt_2c', text: 'Ignore the request and return HTTP 200', isCorrect: false },
        { id: 'opt_2d', text: 'Increase the token expiry time by 7 days', isCorrect: false },
      ],
      explanation: 'Replay of an expired/revoked refresh token indicates token theft; enterprise systems revoke all active tokens in that family immediately.',
    }),
    Question.create({
      tenantId: apex._id,
      quizId: quizCap646._id,
      prompt: 'Which caching strategy is used when the application first checks Redis, queries MongoDB on miss, and writes the result back to Redis with a TTL?',
      questionType: 'MULTIPLE_CHOICE',
      points: 10,
      options: [
        { id: 'opt_3a', text: 'Write-Through Caching', isCorrect: false },
        { id: 'opt_3b', text: 'Cache-Aside (Lazy Loading)', isCorrect: true },
        { id: 'opt_3c', text: 'Refresh-Ahead Caching', isCorrect: false },
        { id: 'opt_3d', text: 'Write-Behind (Write-Back)', isCorrect: false },
      ],
      explanation: 'Cache-Aside checks cache first, queries DB on miss, and caches the result for future reads.',
    }),
  ]);

  logger.info(`Seeded quiz [${quizCap646.title}] with 3 questions.`);

  // 8. Seed Student Enrollments
  const [enrollAliceCap646, enrollAliceCap774, enrollBobCap646] = await Promise.all([
    Enrollment.create({
      tenantId: apex._id,
      studentId: studentAlice._id,
      courseId: courseCap646._id,
      status: 'ACTIVE',
      progressPercentage: 75,
      enrolledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(),
    }),
    Enrollment.create({
      tenantId: apex._id,
      studentId: studentAlice._id,
      courseId: courseCap774._id,
      status: 'ACTIVE',
      progressPercentage: 60,
      enrolledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(),
    }),
    Enrollment.create({
      tenantId: apex._id,
      studentId: studentBob._id,
      courseId: courseCap646._id,
      status: 'ACTIVE',
      progressPercentage: 30,
      enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(),
    }),
  ]);

  // 9. Seed Lesson Progress records for Alice
  await Promise.all([
    LessonProgress.create({
      tenantId: apex._id,
      studentId: studentAlice._id,
      courseId: courseCap646._id,
      lessonId: les1._id,
      isCompleted: true,
      secondsWatched: 1080,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    }),
    LessonProgress.create({
      tenantId: apex._id,
      studentId: studentAlice._id,
      courseId: courseCap646._id,
      lessonId: les2._id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }),
    LessonProgress.create({
      tenantId: apex._id,
      studentId: studentAlice._id,
      courseId: courseCap646._id,
      lessonId: les3._id,
      isCompleted: true,
      secondsWatched: 1320,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    }),
    LessonProgress.create({
      tenantId: apex._id,
      studentId: studentAlice._id,
      courseId: courseCap774._id,
      lessonId: lesCap774._id,
      isCompleted: true,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }),
  ]);

  // 10. Seed Quiz Attempt for Alice (100% Passed)
  await QuizAttempt.create({
    tenantId: apex._id,
    quizId: quizCap646._id,
    studentId: studentAlice._id,
    courseId: courseCap646._id,
    score: 30,
    maxScore: 30,
    percentage: 100,
    passed: true,
    answers: [
      { questionId: q1._id, selectedOptionIds: ['opt_1b'] },
      { questionId: q2._id, selectedOptionIds: ['opt_2b'] },
      { questionId: q3._id, selectedOptionIds: ['opt_3b'] },
    ],
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000),
  });

  // 11. Seed Announcements
  await Promise.all([
    Announcement.create({
      tenantId: apex._id,
      authorId: apexAdmin._id,
      title: 'Welcome to Academic Year 2026-2027 at Apex University!',
      content: 'We are thrilled to welcome all faculty and students to the EduSphere digital campus platform. Please review your enrolled course schedules.',
      priority: 'HIGH',
    }),
    Announcement.create({
      tenantId: apex._id,
      courseId: courseCap646._id,
      authorId: profSmith._id,
      title: 'CAP646 Project Milestones: CA2 & CA3 Defense Checkpoints',
      content: 'Please ensure your repository satisfies all 27 non-negotiable architectural requirements, including Redis caching benchmarks and tenant isolation suites.',
      priority: 'HIGH',
    }),
  ]);

  // 12. Seed Notifications
  await Promise.all([
    Notification.create({
      tenantId: apex._id,
      recipientId: studentAlice._id,
      title: 'Quiz Graded: Perfect Score!',
      body: 'You scored 30/30 (100%) on CAP646 Midterm Assessment. Outstanding work!',
      type: 'QUIZ_GRADED',
      isRead: false,
    }),
    Notification.create({
      tenantId: apex._id,
      recipientId: studentAlice._id,
      title: 'New Announcement in CAP646',
      body: 'Prof. Marcus Smith posted an announcement regarding CA2 & CA3 Defense Checkpoints.',
      type: 'ANNOUNCEMENT',
      isRead: true,
    }),
    Notification.create({
      tenantId: apex._id,
      recipientId: profSmith._id,
      title: 'New Student Enrollment',
      body: 'Bob Chen successfully enrolled in CAP646.',
      type: 'COURSE_UPDATE',
      isRead: false,
    }),
  ]);

  const durationMs = Date.now() - startTime;
  logger.info(`✨ EduSphere enterprise database seeding completed in ${durationMs}ms!`);
  logger.info('Summary of seeded records:');
  logger.info('  • 3 Tenants (Apex University, Oakridge College, Summit Tech Institute)');
  logger.info('  • 10 Users across 4 roles (SUPER_ADMIN, TENANT_ADMIN, INSTRUCTOR, STUDENT)');
  logger.info('  • 4 Courses with categories, ratings, tags, and pricing');
  logger.info('  • 4 Modules and 5 rich Lessons (Video + Markdown)');
  logger.info('  • 1 Timed Assessment Quiz with 3 multiple-choice Questions');
  logger.info('  • 3 Student Enrollments with granular progress percentages');
  logger.info('  • 4 Completed Lesson Progress tracking records');
  logger.info('  • 1 Completed Quiz Attempt (100% score)');
  logger.info('  • 2 Broadcast Announcements and 3 User Notifications');

  await mongoose.disconnect();
};

seedDatabase().catch((err) => {
  logger.error('Database seed error:', err);
  process.exit(1);
});
