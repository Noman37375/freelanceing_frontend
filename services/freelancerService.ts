import { API_BASE_URL } from '@/config';
import { storageGet } from '@/utils/storage';

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
    console.error('[FreelancerService] API call failed:', error);
    if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK' || error.name === 'TypeError') {
      throw new Error(`Network error. Cannot connect to backend at ${API_BASE_URL}`);
    }
    throw error;
  }
};

export interface Freelancer {
  id: string;
  name: string;
  email: string;
  title: string;
  rating: number;
  reviews: number;
  hourlyRate: string;
  location: string;
  skills: string[];
  completedProjects: number;
  availability: string;
}

export const freelancerService = {
  /**
   * Get all freelancers with optional filters
   */
  getFreelancers: async (filters?: {
    search?: string;
    skills?: string | string[];
  }): Promise<Freelancer[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.skills) {
      const skillsStr = Array.isArray(filters.skills) ? filters.skills.join(',') : filters.skills;
      params.append('skills', skillsStr);
    }
    
    const response = await apiCall(`/api/v1/freelancers?${params.toString()}`, {
      method: 'GET',
    });
    return response.data.freelancers || [];
  },
};
