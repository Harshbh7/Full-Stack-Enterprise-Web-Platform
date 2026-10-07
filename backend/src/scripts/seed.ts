import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.util.js';
import { logger } from '../config/logger.js';

export const seedDatabase = async () => {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('Connected to MongoDB for database seeding.');

  // Clean existing collections for fresh seed
  await Tenant.deleteMany({});
  await User.deleteMany({});

  // 1. Seed Tenants
  const apex = await Tenant.create({
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
  });

  const oakridge = await Tenant.create({
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
  });

  const summit = await Tenant.create({
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
  });

  logger.info(`Seeded 3 tenants: [${apex.slug}, ${oakridge.slug}, ${summit.slug}]`);

  // Common password hash for demo accounts
  const commonHash = await hashPassword('Password123!');

  // 2. Seed Users
  // Super Admin (Global platform scope)
  await User.create({
    email: 'superadmin@edusphere.io',
    passwordHash: commonHash,
    firstName: 'Alex',
    lastName: 'Vance',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
  });

  // Apex University Users
  await User.create({
    tenantId: apex._id,
    email: 'admin@apex.edu',
    passwordHash: commonHash,
    firstName: 'Eleanor',
    lastName: 'Rigby',
    role: 'TENANT_ADMIN',
    status: 'ACTIVE',
  });

  await User.create({
    tenantId: apex._id,
    email: 'prof.smith@apex.edu',
    passwordHash: commonHash,
    firstName: 'Marcus',
    lastName: 'Smith',
    role: 'INSTRUCTOR',
    status: 'ACTIVE',
  });

  await User.create({
    tenantId: apex._id,
    email: 'student.alice@apex.edu',
    passwordHash: commonHash,
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'STUDENT',
    status: 'ACTIVE',
  });

  // Oakridge College Admin
  await User.create({
    tenantId: oakridge._id,
    email: 'admin@oakridge.edu',
    passwordHash: commonHash,
    firstName: 'Robert',
    lastName: 'Oakley',
    role: 'TENANT_ADMIN',
    status: 'ACTIVE',
  });

  logger.info('Database seeded successfully with demo users and password [Password123!]');
  await mongoose.disconnect();
};

seedDatabase().catch((err) => {
  logger.error('Database seed error:', err);
  process.exit(1);
});
