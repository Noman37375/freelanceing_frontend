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
    console.error('[DisputeService] API call failed:', error);
    if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK' || error.name === 'TypeError') {
      throw new Error(`Network error. Cannot connect to backend at ${API_BASE_URL}`);
    }
    throw error;
  }
};

export interface Dispute {
  id: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  reason: string;
  description?: string;
  amount: number;
  status: 'Pending' | 'Resolved' | 'Denied';
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
    description?: string;
  };
  client?: {
    id: string;
    userName: string;
    email: string;
  };
  freelancer?: {
    id: string;
    userName: string;
    email: string;
  };
}

export const disputeService = {
  /**
   * Get user's disputes
   */
  getMyDisputes: async (status?: string): Promise<Dispute[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await apiCall(`/api/v1/disputes?${params.toString()}`, {
      method: 'GET',
    });
    return response.data.disputes || [];
  },

  /**
   * Get dispute by ID
   */
  getDisputeById: async (id: string): Promise<Dispute> => {
    const response = await apiCall(`/api/v1/disputes/${id}`, {
      method: 'GET',
    });
    return response.data.dispute;
  },

  /**
   * Create a new dispute
   */
  createDispute: async (disputeData: {
    projectId: string;
    reason: string;
    description?: string;
    amount?: number;
  }): Promise<Dispute> => {
    const response = await apiCall('/api/v1/disputes', {
      method: 'POST',
      body: JSON.stringify(disputeData),
    });
    return response.data.dispute;
  },

  /**
   * Update dispute status
   */
  updateDisputeStatus: async (id: string, status: 'Pending' | 'Resolved' | 'Denied'): Promise<Dispute> => {
    const response = await apiCall(`/api/v1/disputes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.data.dispute;
  },
};
