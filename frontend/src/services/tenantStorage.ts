export interface TenantOption {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  domain: string;
  status: 'ACTIVE' | 'SUSPENDED';
  maxStudents: number;
  contactEmail: string;
  primaryColor?: string;
  adminPassword?: string;
  adminName?: string;
}

export const DEFAULT_TENANTS: TenantOption[] = [
  {
    id: 'tenant-lpu',
    name: 'Lovely Professional University',
    slug: 'lpu',
    domain: 'lpu.edusphere.io',
    status: 'ACTIVE',
    maxStudents: 5000,
    contactEmail: 'admin@lpu.edu',
    primaryColor: '#D97706',
    adminPassword: 'Password123!',
    adminName: 'Lovely Administrator',
  },
  {
    id: 'tenant-1',
    name: 'Apex University',
    slug: 'apex-uni',
    domain: 'apex.edusphere.io',
    status: 'ACTIVE',
    maxStudents: 15000,
    contactEmail: 'admin@apex.edu',
    primaryColor: '#2D5A27',
    adminPassword: 'Password123!',
    adminName: 'Eleanor Rigby',
  },
  {
    id: 'tenant-2',
    name: 'Oakridge College',
    slug: 'oakridge-col',
    domain: 'oakridge.edusphere.io',
    status: 'ACTIVE',
    maxStudents: 5000,
    contactEmail: 'admin@oakridge.edu',
    primaryColor: '#3E6B48',
    adminPassword: 'Password123!',
    adminName: 'Robert Oakley',
  },
  {
    id: 'tenant-3',
    name: 'Summit Tech Institute',
    slug: 'summit-inst',
    domain: 'summit.edusphere.io',
    status: 'ACTIVE',
    maxStudents: 2500,
    contactEmail: 'admin@summit.edu',
    primaryColor: '#8C7355',
    adminPassword: 'Password123!',
    adminName: 'Summit Administrator',
  },
];

const STORAGE_KEY = 'edusphere_tenants';
export const TENANTS_CHANGED_EVENT = 'edusphere_tenants_changed';

export function getStoredTenants(): TenantOption[] {
  if (typeof window === 'undefined') return DEFAULT_TENANTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure Lovely Professional University is present in list if user expects it
        const hasLpu = parsed.some(
          (t: TenantOption) => t.slug === 'lpu' || t.name?.toLowerCase().includes('lovely')
        );
        if (!hasLpu) {
          const lpuDefault = DEFAULT_TENANTS.find((t) => t.slug === 'lpu');
          if (lpuDefault) {
            const updated = [lpuDefault, ...parsed];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
          }
        }
        return parsed;
      }
    }
  } catch {
    // fallback to defaults
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TENANTS));
  } catch {
    // ignore
  }
  return DEFAULT_TENANTS;
}

export function saveStoredTenants(tenants: TenantOption[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
    window.dispatchEvent(new CustomEvent(TENANTS_CHANGED_EVENT, { detail: tenants }));
  } catch (err) {
    console.error('Failed to save tenants to localStorage', err);
  }
}
