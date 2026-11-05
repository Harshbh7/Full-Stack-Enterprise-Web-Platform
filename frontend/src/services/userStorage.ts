import { getStoredTenants } from './tenantStorage.js';

export type VerificationStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'REJECTED' | 'INACTIVE';

export interface StoredUser {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  requestedRole?: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  status: VerificationStatus;
  tenantSlug: string;
  password?: string;
  authProvider?: 'LOCAL' | 'GOOGLE' | 'FIREBASE';
  requestedAt?: string;
  verifierRole?: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'INSTRUCTOR';
  verifierName?: string;
  verifiedAt?: string;
}

export const DEFAULT_USERS: StoredUser[] = [
  // Apex University Users (Sample demonstration courses for CAP646/CAP774)
  {
    id: 'usr-apex-admin',
    name: 'Eleanor Rigby',
    firstName: 'Eleanor',
    lastName: 'Rigby',
    email: 'admin@apex.edu',
    role: 'TENANT_ADMIN',
    status: 'ACTIVE',
    tenantSlug: 'apex-uni',
    password: 'Password123!',
  },
  {
    id: 'usr-apex-prof1',
    name: 'Prof. Marcus Smith',
    firstName: 'Marcus',
    lastName: 'Smith',
    email: 'prof.smith@apex.edu',
    role: 'INSTRUCTOR',
    status: 'ACTIVE',
    tenantSlug: 'apex-uni',
    password: 'Password123!',
  },
  {
    id: 'usr-apex-prof2',
    name: 'Prof. Aria Patel',
    firstName: 'Aria',
    lastName: 'Patel',
    email: 'prof.patel@apex.edu',
    role: 'INSTRUCTOR',
    status: 'ACTIVE',
    tenantSlug: 'apex-uni',
    password: 'Password123!',
  },
  {
    id: 'usr-apex-std1',
    name: 'Alice Johnson',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'student.alice@apex.edu',
    role: 'STUDENT',
    status: 'ACTIVE',
    tenantSlug: 'apex-uni',
    password: 'Password123!',
  },
  {
    id: 'usr-apex-std2',
    name: 'Bob Chen',
    firstName: 'Bob',
    lastName: 'Chen',
    email: 'student.bob@apex.edu',
    role: 'STUDENT',
    status: 'ACTIVE',
    tenantSlug: 'apex-uni',
    password: 'Password123!',
  },
  {
    id: 'usr-apex-std3',
    name: 'Charlie Davis',
    firstName: 'Charlie',
    lastName: 'Davis',
    email: 'student.charlie@apex.edu',
    role: 'STUDENT',
    status: 'ACTIVE',
    tenantSlug: 'apex-uni',
    password: 'Password123!',
  },

  // Lovely Professional University (LPU) - ONLY the provisioned Tenant Admin! No predefined dummy students/instructors
  {
    id: 'usr-lpu-admin',
    name: 'Lovely Administrator',
    firstName: 'Lovely',
    lastName: 'Administrator',
    email: 'admin@lpu.edu',
    role: 'TENANT_ADMIN',
    status: 'ACTIVE',
    tenantSlug: 'lpu',
    password: 'Password123!',
  },

  // Oakridge College Admin
  {
    id: 'usr-oakridge-admin',
    name: 'Robert Oakley',
    firstName: 'Robert',
    lastName: 'Oakley',
    email: 'admin@oakridge.edu',
    role: 'TENANT_ADMIN',
    status: 'ACTIVE',
    tenantSlug: 'oakridge-col',
    password: 'Password123!',
  },

  // Summit Tech Institute Admin
  {
    id: 'usr-summit-admin',
    name: 'Summit Admin',
    firstName: 'Summit',
    lastName: 'Admin',
    email: 'admin@summit.edu',
    role: 'TENANT_ADMIN',
    status: 'ACTIVE',
    tenantSlug: 'summit-inst',
    password: 'Password123!',
  },
];

const USER_STORAGE_KEY = 'edusphere_users';
export const USERS_CHANGED_EVENT = 'edusphere_users_changed';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('edusphere_users_sync_channel');
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'USERS_UPDATED' && Array.isArray(event.data.users)) {
        window.dispatchEvent(new CustomEvent(USERS_CHANGED_EVENT, { detail: event.data.users }));
      }
    };
  } catch {
    // fallback if unsupported
  }
}

export function normalizeTenantSlug(raw?: string): string {
  if (!raw) return '';
  const val = raw.toLowerCase().trim();
  if (val === 'lpu' || val === 'tenant-lpu' || val.includes('lovely')) return 'lpu';
  if (val === 'apex-uni' || val === 'tenant-1' || val.includes('apex')) return 'apex-uni';
  if (val === 'oakridge-col' || val === 'tenant-2' || val.includes('oakridge')) return 'oakridge-col';
  if (val === 'summit-inst' || val === 'tenant-3' || val.includes('summit')) return 'summit-inst';
  return val;
}

export function getAllStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  } catch {
    // ignore
  }
  return DEFAULT_USERS;
}

export function getStoredUsersForTenant(tenantSlug?: string): StoredUser[] {
  const all = getAllStoredUsers();
  if (!tenantSlug || tenantSlug === 'global') {
    return all;
  }
  const targetNorm = normalizeTenantSlug(tenantSlug);
  const filtered = all.filter((u) => normalizeTenantSlug(u.tenantSlug) === targetNorm);
  if (filtered.length > 0) {
    return filtered;
  }
  // If no users exist yet for this tenant in storage, check if this tenant has an admin in stored tenants
  const storedTenants = getStoredTenants();
  const matched = storedTenants.find((t) => normalizeTenantSlug(t.slug) === targetNorm);
  if (matched) {
    const adminUser: StoredUser = {
      id: `usr-${matched.slug}-admin`,
      name: matched.adminName || `${matched.name} Administrator`,
      firstName: (matched.adminName || matched.name).split(' ')[0] || 'Admin',
      lastName: (matched.adminName || matched.name).split(' ').slice(1).join(' ') || 'User',
      email: matched.contactEmail,
      role: 'TENANT_ADMIN',
      status: 'ACTIVE',
      tenantSlug: matched.slug,
      password: matched.adminPassword || 'Password123!',
    };
    addStoredUser(adminUser);
    return [adminUser];
  }
  return [];
}

export function saveAllStoredUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent(USERS_CHANGED_EVENT, { detail: users }));
    broadcastChannel?.postMessage({ type: 'USERS_UPDATED', users });
  } catch (err) {
    console.error('Failed to save users to localStorage', err);
  }
}

export function addStoredUser(newUser: StoredUser): void {
  const current = getAllStoredUsers();
  const updated = [newUser, ...current.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase())];
  saveAllStoredUsers(updated);
}

export function removeStoredUser(email: string, tenantSlug?: string): void {
  const current = getAllStoredUsers();
  const updated = current.filter((u) => {
    if (u.email.toLowerCase() !== email.toLowerCase()) return true;
    if (tenantSlug && u.tenantSlug !== tenantSlug) return true;
    return false;
  });
  saveAllStoredUsers(updated);
}

export function updateStoredUserStatus(email: string, status: VerificationStatus): void {
  const current = getAllStoredUsers();
  const updated = current.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, status } : u));
  saveAllStoredUsers(updated);
}

export function requestGoogleRegistration(data: {
  name: string;
  email: string;
  role: 'TENANT_ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  tenantSlug: string;
  authProvider?: 'GOOGLE' | 'FIREBASE';
}): StoredUser {
  const verifierRole =
    data.role === 'TENANT_ADMIN'
      ? 'SUPER_ADMIN'
      : data.role === 'INSTRUCTOR'
      ? 'TENANT_ADMIN'
      : 'INSTRUCTOR';

  const parts = data.name.trim().split(' ');
  const firstName = parts[0] || 'User';
  const lastName = parts.slice(1).join(' ') || '';

  const cleanSlug = normalizeTenantSlug(data.tenantSlug) || 'lpu';

  const newUser: StoredUser = {
    id: `usr-sso-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    name: data.name.trim(),
    firstName,
    lastName,
    email: data.email.toLowerCase().trim(),
    role: data.role,
    requestedRole: data.role,
    status: 'PENDING_VERIFICATION',
    tenantSlug: cleanSlug,
    authProvider: data.authProvider || 'GOOGLE',
    requestedAt: new Date().toISOString(),
    verifierRole,
  };

  addStoredUser(newUser);
  return newUser;
}

export function getPendingVerificationsForRole(
  currentRole: string,
  tenantSlug?: string
): StoredUser[] {
  const all = getAllStoredUsers();
  const normalizedSlug = normalizeTenantSlug(tenantSlug);

  if (currentRole === 'SUPER_ADMIN') {
    // Superadmin verifies all Tenant Admins across all institutions
    return all.filter(
      (u) =>
        u.status === 'PENDING_VERIFICATION' &&
        (u.requestedRole === 'TENANT_ADMIN' || u.role === 'TENANT_ADMIN')
    );
  }

  if (currentRole === 'TENANT_ADMIN') {
    // College Admin verifies Teachers/Instructors AND Students for their institution
    return all.filter((u) => {
      if (u.status !== 'PENDING_VERIFICATION') return false;
      const targetRole = u.requestedRole || u.role;
      const isCampusRole = targetRole === 'INSTRUCTOR' || targetRole === 'STUDENT';
      if (!isCampusRole) return false;
      if (!normalizedSlug || normalizedSlug === 'global') return true;
      return normalizeTenantSlug(u.tenantSlug) === normalizedSlug;
    });
  }

  if (currentRole === 'INSTRUCTOR') {
    // Teachers verify Students for their college
    return all.filter((u) => {
      if (u.status !== 'PENDING_VERIFICATION') return false;
      const targetRole = u.requestedRole || u.role;
      if (targetRole !== 'STUDENT') return false;
      if (!normalizedSlug || normalizedSlug === 'global') return true;
      return normalizeTenantSlug(u.tenantSlug) === normalizedSlug;
    });
  }

  return [];
}

/**
 * Returns any pending verifications that are NOT currently scoped to the active tenant.
 * Helpful for administrators to detect if an applicant accidentally selected another campus.
 */
export function getOtherTenantPendingVerifications(activeTenantSlug?: string): StoredUser[] {
  const all = getAllStoredUsers();
  const normalizedActive = normalizeTenantSlug(activeTenantSlug);
  return all.filter((u) => {
    if (u.status !== 'PENDING_VERIFICATION') return false;
    const targetRole = u.requestedRole || u.role;
    if (targetRole === 'SUPER_ADMIN') return false;
    const userTenant = normalizeTenantSlug(u.tenantSlug);
    return userTenant !== normalizedActive;
  });
}

/**
 * Reassigns an applicant to the administrator's campus and approves them immediately.
 */
export function reassignTenantAndApprove(
  email: string,
  targetTenantSlug: string,
  verifierName: string
): boolean {
  const all = getAllStoredUsers();
  const target = all.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!target) return false;

  const updated = all.map((u) => {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      return {
        ...u,
        status: 'ACTIVE' as VerificationStatus,
        tenantSlug: normalizeTenantSlug(targetTenantSlug),
        role: u.requestedRole || u.role,
        verifierName,
        verifiedAt: new Date().toISOString(),
      };
    }
    return u;
  });

  saveAllStoredUsers(updated);
  return true;
}

export function approveVerificationRequest(email: string, verifierName: string): boolean {
  const all = getAllStoredUsers();
  const target = all.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!target) return false;

  const updated = all.map((u) => {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      return {
        ...u,
        status: 'ACTIVE' as VerificationStatus,
        role: u.requestedRole || u.role,
        verifierName,
        verifiedAt: new Date().toISOString(),
      };
    }
    return u;
  });

  saveAllStoredUsers(updated);
  return true;
}

export function rejectVerificationRequest(email: string, verifierName: string): boolean {
  const all = getAllStoredUsers();
  const target = all.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!target) return false;

  const updated = all.map((u) => {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      return {
        ...u,
        status: 'REJECTED' as VerificationStatus,
        verifierName,
        verifiedAt: new Date().toISOString(),
      };
    }
    return u;
  });

  saveAllStoredUsers(updated);
  return true;
}

