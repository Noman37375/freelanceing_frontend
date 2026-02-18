/**
 * Chat Service - REST API for chat history, messages, send, read, unread count
 */

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
    console.error('[ChatService] API call failed:', error);
    if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK' || error.name === 'TypeError') {
      throw new Error(`Network error. Cannot connect to backend at ${API_BASE_URL}`);
    }
    throw error;
  }
};

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  projectId?: string | null;
  read: boolean;
  seenAt?: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: { id: string; user_name: string; email?: string; role?: string } | null;
  receiver?: { id: string; user_name: string; email?: string; role?: string } | null;
}

export interface ConversationItem {
  sender_id: string;
  receiver_id: string;
  otherUser?: { id: string; user_name: string; email?: string; role?: string; profile_image?: string | null } | null;
  latestMessage: string;
  timestamp: string;
  unread: boolean;
  created_at?: string;
  [key: string]: any;
}

/** For list UI: other user id and display info */
export interface ChatListItem {
  userId: string;
  otherUser?: { id: string; user_name: string; email?: string; role?: string } | null;
  latestMessage: string;
  timestamp: string;
  unread: boolean;
  unreadCount?: number;
}

/** User from GET /chats/users (for search) */
export interface ChatUserItem {
  id: string;
  user_name: string;
  email?: string;
  role: string;
  profile_image?: string | null;
}

export const chatService = {
  /** GET /api/v1/chats/history - conversations list with last message */
  getHistory: async (): Promise<ConversationItem[]> => {
    const response = await apiCall('/api/v1/chats/history');
    return response?.data ?? [];
  },

  /** GET /api/v1/chats/users?search= - users for chat search (exclude current user), with role */
  getUsers: async (search?: string): Promise<ChatUserItem[]> => {
    const params = new URLSearchParams();
    if (search && search.trim()) params.set('search', search.trim());
    const response = await apiCall(`/api/v1/chats/users?${params.toString()}`);
    return response?.data ?? [];
  },

  /** GET /api/v1/chats/profile/:userId - one user's profile for chat header (id, user_name, profile_image) */
  getUserProfile: async (userId: string): Promise<ChatUserItem | null> => {
    const response = await apiCall(`/api/v1/chats/profile/${encodeURIComponent(userId)}`);
    return response?.data ?? null;
  },

  /** GET /api/v1/chats/messages?receiverId=...&projectId=...&limit=...&offset=... */
  getMessages: async (
    receiverId: string,
    projectId?: string | null,
    limit = 50,
    offset = 0
  ): Promise<ChatMessage[]> => {
    const params = new URLSearchParams({ receiverId });
    if (projectId) params.set('projectId', projectId);
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    const response = await apiCall(`/api/v1/chats/messages?${params.toString()}`);
    return response?.data ?? [];
  },

  /** POST /api/v1/chats/send - send message (fallback when Socket is disconnected) */
  sendMessage: async (
    receiverId: string,
    message: string,
    projectId?: string | null
  ): Promise<ChatMessage> => {
    const response = await apiCall('/api/v1/chats/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, message, projectId: projectId || undefined }),
    });
    return response?.data;
  },

  /** PATCH /api/v1/chats/:messageId/read */
  markAsRead: async (messageId: string): Promise<void> => {
    await apiCall(`/api/v1/chats/${messageId}/read`, { method: 'PATCH' });
  },

  /** DELETE /api/v1/chats/:messageId - delete message (real-time emit to both) */
  deleteMessage: async (messageId: string): Promise<void> => {
    await apiCall(`/api/v1/chats/${encodeURIComponent(messageId)}`, { method: 'DELETE' });
  },

  /** PATCH /api/v1/chats/:messageId - update message (real-time emit to both) */
  updateMessage: async (messageId: string, message: string): Promise<ChatMessage | null> => {
    const response = await apiCall(`/api/v1/chats/${encodeURIComponent(messageId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ message }),
    });
    return response?.data ?? null;
  },

  /** GET /api/v1/chats/unread-count */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiCall('/api/v1/chats/unread-count');
    return response?.data?.count ?? 0;
  },
};
