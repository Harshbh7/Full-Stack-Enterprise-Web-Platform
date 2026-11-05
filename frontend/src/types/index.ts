export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId?: string;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'PENDING_VERIFICATION' | 'REJECTED' | 'INACTIVE';
  requestedRole?: UserRole;
  verifierRole?: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'INSTRUCTOR';
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  primaryColor?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
