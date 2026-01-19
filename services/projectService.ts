import { API_BASE_URL } from '@/config';
import { storageGet } from '@/utils/storage';
import { Project, Proposal } from '@/models/Project';

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
      throw new Error(errorMessage);
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
    status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    category?: string;
    search?: string;
    clientId?: string;
    freelancerId?: string;
  }): Promise<Project[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.freelancerId) params.append('freelancerId', filters.freelancerId);

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
    location?: string;
    tags?: string[];
    category?: string;
    duration?: string;
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
};

export const proposalService = {
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
};

export default {
  project: projectService,
  proposal: proposalService,
};

