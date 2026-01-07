import { API_BASE_URL } from "@/config";

/**
 * Validation Service
 * Handles email validation before signup
 */

interface EmailValidationResponse {
  isValid: boolean;
  email: string;
  formatValid: boolean;
  domainValid: boolean;
  message: string;
  isTypo?: boolean;
  suggestion?: string;
  suggestedEmail?: string;
  hasWarning?: boolean;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Validate email format and domain
 * @param email - Email address to validate
 * @returns Promise with validation result
 */
export const validateEmail = async (email: string): Promise<EmailValidationResponse> => {
  try {
    console.log(`[Validation] Checking email: ${email}`);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/validation/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data: ApiResponse<EmailValidationResponse> = await response.json();
    console.log(`[Validation] Response:`, data);

    if (!response.ok) {
      // Return the validation data even if not ok
      return data.data;
    }

    return data.data;
  } catch (error: any) {
    console.error('[Validation] Error:', error);
    
    // If network error or timeout, return a default response
    if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
};

/**
 * Check if email is available for registration
 * This is a lightweight check before the full signup process
 */
export const isEmailAvailable = async (email: string): Promise<{ available: boolean; message: string }> => {
  try {
    const validation = await validateEmail(email);
    
    if (!validation.isValid) {
      return {
        available: false,
        message: validation.message
      };
    }

    return {
      available: true,
      message: 'Email is valid and available'
    };
  } catch (error: any) {
    return {
      available: false,
      message: error.message || 'Unable to validate email. Please try again.'
    };
  }
};

export const validationService = {
  validateEmail,
  isEmailAvailable,
};

