export type PlanTier = 'free' | 'lite' | 'pro';
export type UserRole = 'guest' | 'admin';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  phone?: string | null;
  role: UserRole;
  planTier: PlanTier;
  isSubscribed: boolean;
  createdAt?: Date | string | null;
  metadata?: unknown;
  accessExpiresAt?: Date | string | null;
  accessGrants?: string[];
  sessionVersion?: number | null;
  /** Internal flag for session mismatch detection */
  _mismatch?: boolean;
}

export interface AuthSessionResponse {
  user: AuthenticatedUser | null;
  reason?: 'multi_device' | 'expired' | 'invalid';
}
