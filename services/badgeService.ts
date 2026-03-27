import { API_BASE_URL } from '@/config';
import { storageGet } from '@/utils/storage';
import { Badge } from '@/models/Badge';

const getAuthToken = async (): Promise<string | null> => {
  return await storageGet('accessToken');
};

const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Server returned non-JSON response: ${text}`);
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `API Error: ${response.status}`);
  }

  return data;
};

export const badgeService = {
  // ── Public: get available skills + levels ────────────────────
  getAvailableSkills: async (): Promise<{ skill: string; levels: ('Bronze' | 'Silver' | 'Gold')[] }[]> => {
    const res = await apiCall('/api/v1/badges/skills', { method: 'GET' });
    return res.data.skills;
  },

  // ── Freelancer: get coding test question ─────────────────────
  requestCodingTest: async (skill: string, level: 'Bronze' | 'Silver' | 'Gold'): Promise<any> => {
    const res = await apiCall('/api/v1/badges/coding-test/request', {
      method: 'POST',
      body: JSON.stringify({ skill, level }),
    });
    return res.data;
  },

  // ── Freelancer: run code freely (no test cases) ──────────────
  runCode: async (
    source_code: string,
    skill: string,
    stdin?: string
  ): Promise<{
    stdout: string; stderr: string; compileOutput: string;
    statusId: number; statusDesc: string; time: string | null; memory: number | null;
  }> => {
    const res = await apiCall('/api/v1/badges/coding-test/run', {
      method: 'POST',
      body: JSON.stringify({ source_code, skill, stdin: stdin ?? '' }),
    });
    return res.data;
  },

  // ── Freelancer: submit code solution ─────────────────────────
  submitCodingResult: async (
    skill: string,
    level: 'Bronze' | 'Silver' | 'Gold',
    source_code: string
  ): Promise<{ score: number; passed: boolean; badge: Badge | null }> => {
    const res = await apiCall('/api/v1/badges/coding-test/submit', {
      method: 'POST',
      body: JSON.stringify({ skill, level, source_code }),
    });
    return res.data;
  },

  // ── Freelancer: submit certificate URL ───────────────────────
  submitCertificate: async (
    skill: string,
    certificateUrl: string,
    provider: string
  ): Promise<{ badge: Badge }> => {
    const res = await apiCall('/api/v1/badges/certificate/submit', {
      method: 'POST',
      body: JSON.stringify({ skill, certificateUrl, provider }),
    });
    return res.data;
  },

  // ── Freelancer: get my badges ─────────────────────────────────
  getMyBadges: async (): Promise<{ badges: Badge[]; totalBadgeScore: number }> => {
    const res = await apiCall('/api/v1/badges/my-badges', { method: 'GET' });
    return res.data;
  },

  // ── Public: get badges for any freelancer ────────────────────
  getFreelancerBadges: async (userId: string): Promise<{ badges: Badge[]; totalBadgeScore: number }> => {
    const res = await apiCall(`/api/v1/badges/user/${userId}`, { method: 'GET' });
    return res.data;
  },

  // ── Admin: get pending certificate submissions ────────────────
  getPendingCertificates: async (): Promise<any[]> => {
    const res = await apiCall('/api/v1/badges/admin/pending', { method: 'GET' });
    return res.data.pending;
  },

  // ── Admin: approve or reject a submission ────────────────────
  reviewBadge: async (
    id: string,
    action: 'approve' | 'reject',
    badgeLevel?: 'Gold' | 'Silver' | 'Bronze'
  ): Promise<Badge> => {
    const res = await apiCall(`/api/v1/badges/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, badgeLevel }),
    });
    return res.data.badge;
  },

  // ── Freelancer: get YouTube OAuth URL ────────────────────────
  getYoutubeAuthUrl: async (): Promise<{ authUrl: string }> => {
    const res = await apiCall('/api/v1/badges/youtube/auth-url', { method: 'GET' });
    return res.data;
  },

  // ── Freelancer: get GitHub OAuth URL ─────────────────────────
  getGithubAuthUrl: async (): Promise<{ authUrl: string }> => {
    const res = await apiCall('/api/v1/badges/github/auth-url', { method: 'GET' });
    return res.data;
  },

  // ── Freelancer: get Codeforces OIDC auth URL ─────────────────
  getCodeforcesAuthUrl: async (): Promise<{ authUrl: string }> => {
    const res = await apiCall('/api/v1/badges/codeforces/auth-url', { method: 'GET' });
    return res.data;
  },

  // ── Freelancer: verify Codeforces handle (legacy) ─────────────
  verifyCodeforcesHandle: async (handle: string): Promise<{
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    effectiveRating?: number;
    badge: Badge | null;
  }> => {
    const res = await apiCall('/api/v1/badges/codeforces/verify', {
      method: 'POST',
      body: JSON.stringify({ handle }),
    });
    return res.data;
  },

  // ── Admin: revoke a badge ────────────────────────────────────
  revokeBadge: async (id: string): Promise<Badge> => {
    const res = await apiCall(`/api/v1/badges/${id}/revoke`, {
      method: 'PATCH',
    });
    return res.data.badge;
  },

  // ── Freelancer: start a quiz session ─────────────────────────
  startQuiz: async (skill: string, level: 'Bronze' | 'Silver' | 'Gold'): Promise<{
    sessionToken: string;
    questions: { id: number; type: 'mcq' | 'output'; q: string; A?: string; B?: string; C?: string; D?: string; code?: string }[];
    total: number;
    level: string;
    skill: string;
    passPercent: number;
  }> => {
    const res = await apiCall('/api/v1/badges/quiz/start', {
      method: 'POST',
      body: JSON.stringify({ skill, level }),
    });
    return res.data;
  },

  // ── Freelancer: submit quiz answers ──────────────────────────
  submitQuiz: async (
    sessionToken: string,
    answers: string[],
    timeSpent?: number[]
  ): Promise<{
    score: number;
    passed: boolean;
    correct: number;
    total: number;
    breakdown: { id: number; userAnswer: string | null; correctAnswer: string; passed: boolean }[];
    badge: Badge | null;
  }> => {
    const res = await apiCall('/api/v1/badges/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ sessionToken, answers, timeSpent }),
    });
    return res.data;
  },
};
