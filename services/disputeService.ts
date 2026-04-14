import { Platform } from 'react-native';
import { API_BASE_URL } from '@/config';
import { storageGet } from '@/utils/storage';
import type { Dispute } from '@/models/Dispute';

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
    return response?.data?.disputes || [];
  },

  /**
   * Get dispute by ID
   */
  getDisputeById: async (id: string): Promise<Dispute> => {
    const response = await apiCall(`/api/v1/disputes/${id}`, {
      method: 'GET',
    });
    return response?.data?.dispute;
  },

  /**
   * Create a new dispute
   */
  createDispute: async (disputeData: {
    projectId: string;
    reason: string;
    description?: string;
    amount?: number;
    milestoneId?: string;
  }): Promise<Dispute> => {
    const response = await apiCall('/api/v1/disputes', {
      method: 'POST',
      body: JSON.stringify(disputeData),
    });
    return response?.data?.dispute;
  },

  /**
   * Update dispute status
   */
  updateDisputeStatus: async (id: string, status: string): Promise<Dispute> => {
    const response = await apiCall(`/api/v1/disputes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response?.data?.dispute;
  },

  /**
   * Get messages for a dispute
   */
  getMessages: async (disputeId: string): Promise<any[]> => {
    const response = await apiCall(`/api/v1/disputes/${disputeId}/messages`, {
      method: 'GET',
    });
    return response?.data?.messages || [];
  },

  /**
   * Send a message in a dispute
   */
  sendMessage: async (disputeId: string, content: string, attachments: string[] = []): Promise<any> => {
    const response = await apiCall(`/api/v1/disputes/${disputeId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, attachments }),
    });
    return response?.data?.message;
  },

  /**
   * Get evidence for a dispute.
   * Normalizes backend field names (fileName/fileUrl/fileType) to the
   * DisputeEvidence shape (name/url/type) used by EvidenceUploader.
   */
  getEvidence: async (disputeId: string): Promise<any[]> => {
    const response = await apiCall(`/api/v1/disputes/${disputeId}/evidence`, {
      method: 'GET',
    });
    const raw: any[] = response?.data?.evidence || [];
    return raw.map((ev) => ({
      id:          ev.id,
      disputeId:   ev.disputeId,
      name:        ev.name        || ev.fileName  || '',
      url:         ev.url         || ev.fileUrl   || '',
      type:        ev.type        || ev.fileType  || 'document',
      description: ev.description || '',
      uploadedBy:  ev.uploadedBy  || '',
      uploadedAt:  ev.uploadedAt  || ev.createdAt || '',
    }));
  },

  /**
   * Upload evidence for a dispute.
   * Sends the actual file binary to the backend via FormData. The backend uploads
   * it to Supabase Storage and stores the public URL so the admin can open the file.
   *
   * fileData.uri  — local file URI from expo-image-picker / expo-document-picker
   * fileData.name — file name (e.g. "photo.jpg")
   * fileData.mimeType — MIME type (e.g. "image/jpeg", "application/pdf")
   */
  uploadEvidence: async (
    disputeId: string,
    fileData: { uri: string; name: string; mimeType: string; description?: string }
  ): Promise<any> => {
    const token = await getAuthToken();

    const form = new FormData();

    if (Platform.OS === 'web') {
      // On Expo Web, imagePickerResult.uri is a blob: or data: URL.
      // FormData requires a real File/Blob — { uri, name, type } only works on native.
      let fileBlob: Blob;
      if (fileData.uri.startsWith('blob:')) {
        const res = await fetch(fileData.uri);
        fileBlob = await res.blob();
      } else if (fileData.uri.startsWith('data:')) {
        const [header, b64] = fileData.uri.split(',');
        const mime = header.match(/:(.*?);/)?.[1] || fileData.mimeType;
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        fileBlob = new Blob([bytes], { type: mime });
      } else {
        const res = await fetch(fileData.uri);
        fileBlob = await res.blob();
      }
      form.append('file', new File([fileBlob], fileData.name, { type: fileData.mimeType }));
    } else {
      // React Native native: { uri, name, type } is the correct pattern
      form.append('file', { uri: fileData.uri, name: fileData.name, type: fileData.mimeType } as any);
    }

    form.append('fileName', fileData.name);
    form.append('fileType', fileData.mimeType);
    form.append('description', fileData.description || '');

    const response = await fetch(`${API_BASE_URL}/api/v1/disputes/${disputeId}/evidence`, {
      method: 'POST',
      headers: {
        // Do NOT set Content-Type — fetch sets it automatically with the correct boundary
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: form,
    });

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text}`);
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || `Upload failed: ${response.status}`);
    return data?.data?.evidence;
  },

  /**
   * Get timeline for a dispute
   */
  getTimeline: async (disputeId: string): Promise<any[]> => {
    const response = await apiCall(`/api/v1/disputes/${disputeId}/timeline`, {
      method: 'GET',
    });
    return response?.data?.timeline || [];
  },

  /**
   * Escalate dispute to support
   */
  escalateToSupport: async (disputeId: string, reason?: string): Promise<Dispute> => {
    const response = await apiCall(`/api/v1/disputes/${disputeId}/escalate`, {
      method: 'PUT',
      body: JSON.stringify({ reason: reason || '' }),
    });
    return response?.data?.dispute;
  },

  /**
   * Respondent submits their initial response: 'accepted' | 'rejected' | 'counter'
   */
  respondToDispute: async (disputeId: string, response: 'accepted' | 'rejected' | 'counter'): Promise<Dispute> => {
    const res = await apiCall(`/api/v1/disputes/${disputeId}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ response }),
    });
    return res?.data?.dispute;
  },

  /**
   * Accept the mediation recommendation issued by admin
   */
  acceptMediationProposal: async (disputeId: string): Promise<Dispute> => {
    const res = await apiCall(`/api/v1/disputes/${disputeId}/mediation-accept`, {
      method: 'PUT',
    });
    return res?.data?.dispute;
  },

  /**
   * Reject the mediation recommendation — escalates to arbitration
   */
  rejectMediationProposal: async (disputeId: string): Promise<Dispute> => {
    const res = await apiCall(`/api/v1/disputes/${disputeId}/mediation-reject`, {
      method: 'PUT',
    });
    return res?.data?.dispute;
  },
};
