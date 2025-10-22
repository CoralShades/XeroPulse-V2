/**
 * Authentication & User Types
 */

export type UserRole = 'executive' | 'manager' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  organization_id: string;
  active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  organizationId?: string;
  role?: UserRole;
}
