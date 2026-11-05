export interface CourseItem {
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
  tenantSlug: string;
}

export interface AnnouncementItem {
  id: string | number;
  title: string;
  author: string;
  priority: string;
  date: string;
  content: string;
  tenantSlug: string;
}

// Only demo sample courses for apex-uni. All new/other tenants start empty!
export const DEFAULT_COURSES: CourseItem[] = [
  {
    id: 'course-cap646',
    code: 'CAP646',
    title: 'Full-Stack Web Development & Enterprise Architecture',
    description: 'Master micro-modular 6-tier architecture, multi-tenant database partitioning, JWT refresh token rotation, and high-concurrency Redis caching.',
    instructor: 'Prof. Marcus Smith',
    enrolled: 142,
    modulesCount: 3,
    lessonsCount: 4,
    rating: '4.9 ★ (38 reviews)',
    category: 'Web Engineering',
    tenantSlug: 'apex-uni',
  },
  {
    id: 'course-cap774',
    code: 'CAP774',
    title: 'Styling and Scripting for Web Development',
    description: 'Enterprise design system engineering using Material UI (MUI v6), custom tokens, WCAG 2.1 AA accessibility, and Redux Toolkit state management.',
    instructor: 'Prof. Aria Patel',
    enrolled: 98,
    modulesCount: 2,
    lessonsCount: 2,
    rating: '4.8 ★ (24 reviews)',
    category: 'Frontend & UI/UX',
    tenantSlug: 'apex-uni',
  },
];

// Only demo sample announcements for apex-uni. All new/other tenants start empty!
export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 1,
    title: 'CAP646 Project Milestones: CA2 & CA3 Defense Checkpoints',
    author: 'Prof. Marcus Smith',
    priority: 'HIGH',
    date: 'Today at 09:30 AM',
    content: 'Please ensure your repository satisfies all 27 non-negotiable architectural requirements, including Redis caching benchmarks and tenant isolation suites.',
    tenantSlug: 'apex-uni',
  },
  {
    id: 2,
    title: 'Welcome to Academic Year 2026-2027 at Apex University!',
    author: 'Eleanor Rigby (Dean)',
    priority: 'NORMAL',
    date: 'Yesterday at 02:15 PM',
    content: 'We are thrilled to welcome all faculty and students to the EduSphere digital campus platform. Please review your enrolled course schedules.',
    tenantSlug: 'apex-uni',
  },
];

const COURSES_STORAGE_KEY = 'edusphere_courses';
const ANNOUNCEMENTS_STORAGE_KEY = 'edusphere_announcements';
export const TENANT_DATA_CHANGED_EVENT = 'edusphere_tenant_data_changed';

export function getAllStoredCourses(): CourseItem[] {
  if (typeof window === 'undefined') return DEFAULT_COURSES;
  try {
    const raw = localStorage.getItem(COURSES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  try {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(DEFAULT_COURSES));
  } catch {
    // ignore
  }
  return DEFAULT_COURSES;
}

export function getStoredCoursesForTenant(tenantSlug?: string): CourseItem[] {
  const all = getAllStoredCourses();
  if (!tenantSlug || tenantSlug === 'global') {
    return all;
  }
  return all.filter((c) => c.tenantSlug === tenantSlug);
}

export function saveAllStoredCourses(courses: CourseItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    window.dispatchEvent(new CustomEvent(TENANT_DATA_CHANGED_EVENT, { detail: { type: 'courses' } }));
  } catch (err) {
    console.error('Failed to save courses to localStorage', err);
  }
}

export function addStoredCourse(course: CourseItem): void {
  const all = getAllStoredCourses();
  const updated = [course, ...all.filter((c) => !(c.code === course.code && c.tenantSlug === course.tenantSlug))];
  saveAllStoredCourses(updated);
}

export function removeStoredCourse(codeOrId: string, tenantSlug?: string): void {
  const all = getAllStoredCourses();
  const updated = all.filter((c) => {
    if (tenantSlug && c.tenantSlug !== tenantSlug) return true;
    return c.code !== codeOrId && c.id !== codeOrId;
  });
  saveAllStoredCourses(updated);
}

export function getAllStoredAnnouncements(): AnnouncementItem[] {
  if (typeof window === 'undefined') return DEFAULT_ANNOUNCEMENTS;
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  try {
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
  } catch {
    // ignore
  }
  return DEFAULT_ANNOUNCEMENTS;
}

export function getStoredAnnouncementsForTenant(tenantSlug?: string): AnnouncementItem[] {
  const all = getAllStoredAnnouncements();
  if (!tenantSlug || tenantSlug === 'global') {
    return all;
  }
  return all.filter((a) => a.tenantSlug === tenantSlug);
}

export function saveAllStoredAnnouncements(announcements: AnnouncementItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
    window.dispatchEvent(new CustomEvent(TENANT_DATA_CHANGED_EVENT, { detail: { type: 'announcements' } }));
  } catch (err) {
    console.error('Failed to save announcements to localStorage', err);
  }
}

export function addStoredAnnouncement(announcement: AnnouncementItem): void {
  const all = getAllStoredAnnouncements();
  const updated = [announcement, ...all];
  saveAllStoredAnnouncements(updated);
}

export function removeStoredAnnouncement(id: string | number, tenantSlug?: string): void {
  const all = getAllStoredAnnouncements();
  const updated = all.filter((a) => {
    if (tenantSlug && a.tenantSlug !== tenantSlug) return true;
    return a.id !== id;
  });
  saveAllStoredAnnouncements(updated);
}

