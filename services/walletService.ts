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
    console.error('[WalletService] API call failed:', error);
    if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK' || error.name === 'TypeError') {
      throw new Error(`Network error. Cannot connect to backend at ${API_BASE_URL}`);
    }
    throw error;
  }
};

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  escrowBalance: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'escrow' | 'refund';
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  projectId?: string;
  createdAt: string;
  project?: {
    id: string;
    title: string;
  };
}

export const walletService = {
  /**
   * Get user's wallet
   */
  getWallet: async (): Promise<Wallet> => {
    const response = await apiCall('/api/v1/wallet', {
      method: 'GET',
    });
    return response.data.wallet;
  },

  /**
   * Get user's transactions
   */
  getTransactions: async (limit?: number): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const response = await apiCall(`/api/v1/wallet/transactions?${params.toString()}`, {
      method: 'GET',
    });
    return response.data.transactions || [];
  },

  /**
   * Add funds to wallet
   */
  addFunds: async (amount: number): Promise<{ wallet: Wallet; transaction: Transaction }> => {
    const response = await apiCall('/api/v1/wallet/add-funds', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return {
      wallet: response.data.wallet,
      transaction: response.data.transaction,
    };
  },
};
