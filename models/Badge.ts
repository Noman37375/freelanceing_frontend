export interface Badge {
  id: string;
  userId: string;
  skill: string;
  badgeLevel: 'Gold' | 'Silver' | 'Bronze';
  badgePoints: number;
  provider: string;
  verificationType: 'coding_test' | 'certificate' | 'portfolio';
  score?: number | null;
  certificateUrl?: string | null;
  status: 'pending' | 'active' | 'rejected' | 'revoked' | 'expired';
  createdAt: string;
  expiresAt?: string | null;
}

export const BADGE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Gold:   { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: '#F59E0B' },
  Silver: { bg: '#F1F5F9', border: '#94A3B8', text: '#475569', icon: '#94A3B8' },
  Bronze: { bg: '#FEF2E8', border: '#C2773A', text: '#7C3A15', icon: '#C2773A' },
};
