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
    console.error('[ReviewService] API call failed:', error);
    if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK' || error.name === 'TypeError') {
      throw new Error(`Network error. Cannot connect to backend at ${API_BASE_URL}`);
    }
    throw error;
  }
};

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  project?: {
    id: string;
    title: string;
  };
  reviewer?: {
    id: string;
    userName: string;
    email: string;
  };
}

export const reviewService = {
  /**
   * Get reviews for current user
   */
  getMyReviews: async (): Promise<Review[]> => {
    const response = await apiCall('/api/v1/reviews', {
      method: 'GET',
    });
    return response.data.reviews || [];
  },

  /**
   * Get average rating for current user
   */
  getAverageRating: async (): Promise<{ averageRating: number; totalReviews: number }> => {
    const response = await apiCall('/api/v1/reviews/average', {
      method: 'GET',
    });
    return {
      averageRating: response.data.averageRating || 0,
      totalReviews: response.data.totalReviews || 0,
    };
  },

  /**
   * Create a new review
   */
  createReview: async (reviewData: {
    projectId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> => {
    const response = await apiCall('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
    return response.data.review;
  },
};
