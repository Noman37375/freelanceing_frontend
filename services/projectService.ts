import { API_BASE_URL } from '@/config';
import { storageGet } from '@/utils/storage';
import { Project, Proposal, Milestone } from '@/models/Project';

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

  try {
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
      const errorMessage = data.message || data.error || `API Error: ${response.status}`;
      const err: any = new Error(errorMessage);
      err.status = response.status;
      err.data = data.data ?? null;  // attach structured payload for caller to inspect
      throw err;
    }

    return data;
  } catch (error: any) {
    console.error('[ProjectService] API call failed:', error);
    if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK' || error.name === 'TypeError') {
      throw new Error(`Network error. Cannot connect to backend at ${API_BASE_URL}`);
    }
    throw error;
  }
};

export const projectService = {
  /**
   * Get all projects with optional filters
   */
  getProjects: async (filters?: {
    status?: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    category?: string;
    search?: string;
    clientId?: string;
    freelancerId?: string;
    available?: boolean;
  }): Promise<Project[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.freelancerId) params.append('freelancerId', filters.freelancerId);
    if (filters?.available === true) params.append('available', 'true');

    const response = await apiCall(`/api/v1/projects?${params.toString()}`, {
      method: 'GET',
    });
    return response.data.projects || [];
  },

  /**
   * Get project by ID
   */
  getProjectById: async (id: string): Promise<Project> => {
    const response = await apiCall(`/api/v1/projects/${id}`, {
      method: 'GET',
    });
    return response.data.project;
  },

  /**
   * Create a new project (Client only)
   */
  createProject: async (projectData: {
    title: string;
    description: string;
    budget: number;
    currency?: string;
    location?: string;
    tags?: string[];
    category?: string;
    duration?: string;
    paymentIntentId?: string;
  }): Promise<Project> => {
    const response = await apiCall('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.data.project;
  },

  /**
   * Update project
   */
  updateProject: async (id: string, updateData: Partial<Project>): Promise<Project> => {
    const response = await apiCall(`/api/v1/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response.data.project;
  },

  /**
   * Delete project
   */
  deleteProject: async (id: string): Promise<void> => {
    await apiCall(`/api/v1/projects/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get current user's saved project IDs (for bookmark state)
   */
  getSavedProjectIds: async (): Promise<string[]> => {
    const response = await apiCall('/api/v1/projects/saved/ids', { method: 'GET' });
    return response?.data?.projectIds ?? [];
  },

  /**
   * Save (bookmark) a project
   */
  saveProject: async (projectId: string): Promise<void> => {
    await apiCall(`/api/v1/projects/${projectId}/save`, { method: 'POST' });
  },

  /**
   * Unsave (remove bookmark) a project
   */
  unsaveProject: async (projectId: string): Promise<void> => {
    await apiCall(`/api/v1/projects/${projectId}/save`, { method: 'DELETE' });
  },

  /** Client: unlock every pending milestone with an amount (off-platform / PayPal), no wallet. */
  fundAllMilestonesExternal: async (
    projectId: string
  ): Promise<{ milestones: Milestone[]; count: number }> => {
    const response = await apiCall(`/api/v1/projects/${projectId}/milestones/fund-all-external`, {
      method: 'POST',
    });
    return {
      milestones: response.data.milestones || [],
      count: response.data.count ?? 0,
    };
  },
};

export const proposalService = {
  /**
   * Get proposal by ID
   */
  getProposalById: async (id: string): Promise<Proposal> => {
    const response = await apiCall(`/api/v1/proposals/${id}`, {
      method: 'GET',
    });

    const proposal =
      response?.data?.proposal ??
      response?.data ??
      response?.proposal ??
      response;

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    return proposal as Proposal;
  },

  /**
   * Get all proposals for a project
   */
  getProjectProposals: async (projectId: string): Promise<Proposal[]> => {
    const response = await apiCall(`/api/v1/proposals/project/${projectId}`, {
      method: 'GET',
    });
    return response.data.proposals || [];
  },

  /**
   * Get current user's proposals
   */
  getMyProposals: async (): Promise<Proposal[]> => {
    const response = await apiCall('/api/v1/proposals/my-proposals', {
      method: 'GET',
    });
    return response.data.proposals || [];
  },

  /**
   * Get all proposals for client's projects
   */
  getClientProposals: async (): Promise<Proposal[]> => {
    console.log('[ProjectService] Calling /api/v1/proposals/client');
    try {
      const response = await apiCall('/api/v1/proposals/client', {
        method: 'GET',
      });
      console.log('[ProjectService] Response received:', response);
      console.log('[ProjectService] Proposals in response:', response.data?.proposals?.length || 0);
      return response.data.proposals || [];
    } catch (error: any) {
      console.error('[ProjectService] Error in getClientProposals:', error);
      throw error;
    }
  },

  /**
   * Submit a proposal (Freelancer only)
   */
  createProposal: async (projectId: string, proposalData: {
    coverLetter: string;
    bidAmount: number;
  }): Promise<Proposal> => {
    const response = await apiCall(`/api/v1/proposals/project/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
    return response.data.proposal;
  },

  /**
   * Update proposal status (Accept/Reject) - Project owner only
   */
  updateProposalStatus: async (id: string, status: 'ACCEPTED' | 'REJECTED'): Promise<Proposal> => {
    console.log('[ProjectService] Updating proposal status:', { id, status });
    try {
      const response = await apiCall(`/api/v1/proposals/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      console.log('[ProjectService] Update response:', response);
      return response.data.proposal;
    } catch (error: any) {
      console.error('[ProjectService] Error updating proposal status:', error);
      throw error;
    }
  },

  /**
   * Delete proposal
   */
  deleteProposal: async (id: string): Promise<void> => {
    await apiCall(`/api/v1/proposals/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Start JD quiz before applying (Freelancer only).
   * Returns quiz session OR block info if on cooldown / permanently blocked.
   */
  startProposalQuiz: async (projectId: string): Promise<
    | { blocked: false; sessionToken: string; questions: { id: number; q: string; A: string; B: string; C: string; D: string }[]; total: number; projectTitle: string }
    | { blocked: true; permanentlyBlocked: boolean; attemptNumber?: number; retryAfter?: string | null; badgeUnblockAvailable?: boolean }
  > => {
    try {
      const response = await apiCall(`/api/v1/proposals/project/${projectId}/quiz/start`, { method: 'POST' });
      return { blocked: false, ...response.data };
    } catch (err: any) {
      if (err.data?.blocked) return { blocked: true, ...err.data };
      throw err;
    }
  },

  /**
   * Submit quiz + create proposal in one call (Freelancer only).
   * Returns pass result with proposal OR fail result without proposal.
   */
  createProposalWithQuiz: async (
    projectId: string,
    data: { coverLetter: string; bidAmount: number; sessionToken: string; answers: string[] }
  ): Promise<
    | { passed: true; proposal: Proposal; quizResult: { score: number; correct: number; total: number } }
    | { passed: false; score: number; correct: number; total: number; threshold: number; attemptNumber: number; retryAfter: string | null; permanentlyBlocked: boolean }
  > => {
    try {
      const response = await apiCall(`/api/v1/proposals/project/${projectId}/apply`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { passed: true, ...response.data };
    } catch (err: any) {
      if (err.data?.passed === false) return { passed: false, ...err.data };
      throw err;
    }
  },
};

export const milestoneService = {

  getMilestonesByProjectId: async (projectId: string): Promise<Milestone[]> => {
    try {
      const response = await apiCall(`/api/v1/projects/${projectId}/milestones`);
      return response.data.milestones || [];
    } catch (error: any) {
      // If user is not allowed to see milestones (403 Access denied), treat as no milestones
      if (error?.status === 403 || typeof error?.message === 'string' && error.message.toLowerCase().includes('access denied')) {
        return [];
      }
      throw error;
    }
  },

  getMilestones: async (projectId: string): Promise<Milestone[]> => {
    const response = await apiCall(`/api/v1/projects/${projectId}/milestones`);
    return response.data.milestones || [];
  },

  createMilestone: async (
    projectId: string,
    data: { title: string; description?: string; dueDate?: string; orderIndex?: number; amount?: number }
  ): Promise<Milestone> => {
    const response = await apiCall(`/api/v1/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data.milestone;
  },

  fundMilestone: async (milestoneId: string): Promise<Milestone> => {
    const response = await apiCall(`/api/v1/milestones/${milestoneId}/fund`, { method: 'PATCH' });
    return response.data.milestone;
  },

  /** Fund milestone without in-app wallet (client already paid platform off-app, e.g. PayPal). */
  fundMilestoneExternal: async (milestoneId: string): Promise<Milestone> => {
    const response = await apiCall(`/api/v1/milestones/${milestoneId}/fund-external`, { method: 'PATCH' });
    return response.data.milestone;
  },

  startMilestone: async (milestoneId: string): Promise<Milestone> => {
    const response = await apiCall(`/api/v1/milestones/${milestoneId}/start`, { method: 'PATCH' });
    return response.data.milestone;
  },

  submitMilestone: async (milestoneId: string, githubUrl?: string): Promise<Milestone> => {
    const response = await apiCall(`/api/v1/milestones/${milestoneId}/submit`, {
      method: 'PATCH',
      body: JSON.stringify({ githubUrl: githubUrl?.trim() || undefined }),
    });
    return response.data.milestone;
  },

  approveMilestone: async (milestoneId: string): Promise<{ milestone: Milestone; progress: number }> => {
    const response = await apiCall(`/api/v1/milestones/${milestoneId}/approve`, { method: 'PATCH' });
    return response.data;
  },

  requestChanges: async (milestoneId: string, message: string): Promise<Milestone> => {
    const response = await apiCall(`/api/v1/milestones/${milestoneId}/request-changes`, {
      method: 'PATCH',
      body: JSON.stringify({ message }),
    });
    return response.data.milestone;
  },

  deleteMilestone: async (milestoneId: string): Promise<void> => {
    await apiCall(`/api/v1/milestones/${milestoneId}`, { method: 'DELETE' });
  },
};

export default {
  project: projectService,
  proposal: proposalService,
};

