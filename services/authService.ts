/**
 * Auth Service - Backend API Integration
 * Connects frontend with backend authentication endpoints
 */

import { API_BASE_URL } from '@/config';
import { storageGet, storageSet, storageRemove } from '@/utils/storage';

// Types
export interface SignupRequest {
  userName: string;
  email: string;
  password: string;
  role?: 'Admin' | 'Client' | 'Freelancer'; // Optional, defaults to 'Freelancer'
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  otp: string;
}

export interface ResendOTPRequest {
  email: string;
  _id: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
  confirmPassword?: string;
}

export interface GoogleSigninRequest {
  email: string;
  userName: string;
  isVerified: boolean;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
}

export interface User {
  id: string;
  userName: string;
  email: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Helper function to get auth token
const getAuthToken = async (): Promise<string | null> => {
  return await storageGet('accessToken');
};

// Helper function to make API calls
const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] Calling: ${fullUrl}`);
    console.log(`[API] Method: ${options.method || 'GET'}`);
    if (options.body) {
      console.log(`[API] Body:`, JSON.parse(options.body as string));
    }
    
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include', // For cookies
    });

    console.log(`[API] Response Status: ${response.status} ${response.statusText}`);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error(`[API] Non-JSON response:`, text);
      throw new Error(`Server returned non-JSON response: ${text}`);
    }

    console.log(`[API] Response Data:`, data);

    if (!response.ok) {
      const errorMessage = data.message || data.error || `API Error: ${response.status}`;
      console.error(`[API] Error:`, errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    console.error('[API] Call failed:', error);
    // If it's a network error, provide a better message
    if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK' || error.name === 'TypeError') {
      throw new Error(`Network error. Cannot connect to backend at ${API_BASE_URL}. Please ensure backend is running on port 3000.`);
    }
    throw error;
  }
};

// Auth Service
export const authService = {
  /**
   * Sign up a new user
   * POST /api/v1/auth/signup
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiCall('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Backend returns: { statusCode, message, data: { user, accessToken, refreshToken } }
    const responseData = response.data || response;
    
    // Store tokens
    if (responseData?.accessToken && responseData?.refreshToken) {
      await storageSet('accessToken', responseData.accessToken);
      await storageSet('refreshToken', responseData.refreshToken);
      console.log('[AuthService] Tokens stored successfully');
    } else {
      console.warn('[AuthService] No tokens in response:', responseData);
    }

    return {
      user: responseData.user,
      accessToken: responseData.accessToken,
      refreshToken: responseData.refreshToken,
    };
  },

  /**
   * Sign in user
   * POST /api/v1/auth/signin
   */
  signin: async (data: SigninRequest): Promise<AuthResponse> => {
    const response = await apiCall('/api/v1/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Backend returns: { statusCode, message, data: { user, accessToken, refreshToken } }
    const responseData = response.data || response;
    
    // Store tokens
    if (responseData?.accessToken && responseData?.refreshToken) {
      await storageSet('accessToken', responseData.accessToken);
      await storageSet('refreshToken', responseData.refreshToken);
      console.log('[AuthService] Tokens stored successfully');
    } else {
      console.warn('[AuthService] No tokens in response:', responseData);
    }

    return {
      user: responseData.user,
      accessToken: responseData.accessToken,
      refreshToken: responseData.refreshToken,
    };
  },

  /**
   * Google Sign in
   * POST /api/v1/auth/google-signin
   */
  googleSignin: async (data: GoogleSigninRequest): Promise<AuthResponse> => {
    const response = await apiCall('/api/v1/auth/google-signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Backend returns: { statusCode, message, data: { user, accessToken, refreshToken } }
    const responseData = response.data || response;
    
    // Store tokens
    if (responseData?.accessToken && responseData?.refreshToken) {
      await storageSet('accessToken', responseData.accessToken);
      await storageSet('refreshToken', responseData.refreshToken);
    }

    return {
      user: responseData.user,
      accessToken: responseData.accessToken,
      refreshToken: responseData.refreshToken,
    };
  },

  /**
   * Verify email with OTP
   * POST /api/v1/auth/verify-email
   * Requires authentication
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResponse> => {
    return await apiCall('/api/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Resend OTP
   * POST /api/v1/auth/resend-otp
   */
  resendOTP: async (data: ResendOTPRequest): Promise<ApiResponse> => {
    return await apiCall('/api/v1/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Forgot password - Request reset link
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
    return await apiCall('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change password using reset token
   * POST /api/v1/auth/change-password/:token
   */
  changePassword: async (
    token: string,
    data: ChangePasswordRequest
  ): Promise<ApiResponse> => {
    return await apiCall(`/api/v1/auth/change-password/${token}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Logout user
   * POST /api/v1/auth/logout
   * Requires authentication
   */
  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await apiCall('/api/v1/auth/logout', {
        method: 'POST',
      });
      
      // Clear tokens
      await storageRemove('accessToken');
      await storageRemove('refreshToken');
      await storageRemove('user');
      
      return response;
    } catch (error) {
      // Even if API call fails, clear local storage
      await storageRemove('accessToken');
      await storageRemove('refreshToken');
      await storageRemove('user');
      throw error;
    }
  },

  /**
   * Get current user info
   * GET /api/v1/auth/current-user
   * Requires authentication
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiCall('/api/v1/auth/current-user', {
      method: 'GET',
    });
    // Backend returns: { statusCode, message, data: { user } }
    return response.data?.user || response.data || response;
  },

  /**
   * Get user info by ID
   * POST /api/v1/auth/isUser
   * Requires authentication
   */
  getUserInfo: async (): Promise<User> => {
    const response = await apiCall('/api/v1/auth/isUser', {
      method: 'POST',
    });
    // Backend returns: { statusCode, message, data: { user } }
    return response.data?.user || response.data || response;
  },

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  refreshToken: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const refreshToken = await storageGet('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiCall('/api/v1/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    // Backend returns: { statusCode, message, data: { accessToken, refreshToken } }
    const responseData = response.data || response;

    // Update tokens
    if (responseData?.accessToken && responseData?.refreshToken) {
      await storageSet('accessToken', responseData.accessToken);
      await storageSet('refreshToken', responseData.refreshToken);
    }

    return {
      accessToken: responseData.accessToken,
      refreshToken: responseData.refreshToken,
    };
  },

  /**
   * Update user profile
   * POST /api/v1/auth/update-user
   * Requires authentication
   */
  updateUser: async (profileData: Partial<User>): Promise<ApiResponse> => {
    return await apiCall('/api/v1/auth/update-user', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },
};

export default authService;
