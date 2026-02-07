import { User, FreelancerProfile, ClientProfile } from '@/models/User';
import { Project } from '@/models/Project';
import { API_BASE_URL } from '@/config';
import { storageGet } from '@/utils/storage';
import { CloudCog } from 'lucide-react-native';

const getAuthToken = async (): Promise<string | null> => {
    return await storageGet('accessToken');
};

const apiCall = async (
    endpoint: string,
    options: RequestInit = {}
): Promise<any> => {
    const token = await getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API Error');
    }

    return data;
};

export const adminService = {
    // Users
    getUsersByRole: async (role: 'freelancer' | 'client'): Promise<User[]> => {
        const response = await apiCall(`/api/v1/admin/users/${role}`);
        return response?.data;
    },

    deleteUser: async (id: string): Promise<void> => {
        await apiCall(`/api/v1/admin/users/${id}`, {
            method: 'DELETE'
        });
    },

    updateUser: async (id: string, data: Partial<User>): Promise<User> => {
        const response = await apiCall(`/api/v1/admin/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return response?.data;
    },

    // Projects
    getAllProjects: async (): Promise<Project[]> => {
        const response = await apiCall('/api/v1/admin/projects');
        return response?.data;
    },

    deleteProject: async (id: string): Promise<void> => {
        await apiCall(`/api/v1/admin/projects/${id}`, {
            method: 'DELETE'
        });
    },

    updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
        const response = await apiCall(`/api/v1/admin/projects/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return response.data;
    },

    // Dashboard Stats
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await apiCall('/api/v1/admin/stats', {
            method: 'GET',
        });
        return response?.data;
    },

    // Disputes
    getAllDisputes: async (filters: any = {}): Promise<any[]> => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);

        const response = await apiCall(`/api/v1/admin/disputes?${params.toString()}`, {
            method: 'GET',
        });
        return response?.data?.disputes || [];
    },

    resolveDispute: async (disputeId: string, resolutionData: any): Promise<any> => {
        const response = await apiCall(`/api/v1/admin/disputes/${disputeId}/resolve`, {
            method: 'PUT',
            body: JSON.stringify(resolutionData),
        });
        return response?.data?.dispute;
    },

    assignMediator: async (disputeId: string, mediatorId: string): Promise<any> => {
        const response = await apiCall(`/api/v1/admin/disputes/${disputeId}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ mediatorId }),
        });
        return response?.data?.dispute;
    },

    updateDisputePriority: async (disputeId: string, priority: string): Promise<any> => {
        const response = await apiCall(`/api/v1/admin/disputes/${disputeId}/priority`, {
            method: 'PUT',
            body: JSON.stringify({ priority }),
        });
        return response?.data?.dispute;
    },

    // Service Categories – GET from backend /api/v1/services; normalize to array for "All Service"
    getServiceCategories: async (): Promise<any[]> => {
        try {
            const response = await apiCall('/api/v1/services');
            let list: any[] = [];
            if (Array.isArray(response)) list = response;
            else if (Array.isArray(response?.data)) list = response.data;
            else if (response?.data?.categories) list = response.data.categories;
            else if (response?.data?.services) list = response.data.services;
            // Backend returns { id, created_at, name, icon, image } (snake_case); normalize for UI
            return list.map((s: any) => ({
                id: s.id ?? s.name,
                name: s.name ?? 'Service',
                image: s.image ?? s.icon,
                color: s.color ?? '#0F172A',
            }));
        } catch (_) {
            return [];
        }
    },

    createServiceCategory: async (data: any): Promise<any> => {
        const response = await apiCall('/api/v1/admin/services', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response?.data;
    },

    updateServiceCategory: async (id: string, data: any): Promise<any> => {
        const response = await apiCall(`/api/v1/admin/services/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return response?.data;
    },

    deleteServiceCategory: async (id: string): Promise<void> => {
        await apiCall(`/api/v1/admin/services/${id}`, {
            method: 'DELETE'
        });
    },

    // System Notifications
    getSystemNotifications: async (): Promise<any[]> => {
        const response = await apiCall('/api/v1/notifications');
        return response?.data?.notifications;
    },

    sendSystemNotification: async (data: any): Promise<any> => {
        const response = await apiCall('/api/v1/notifications', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response?.data;
    },

    updateSystemNotification: async (id: string, data: any): Promise<any> => {
        const response = await apiCall(`/api/v1/notifications/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return response?.data;
    },

    deleteSystemNotification: async (id: string): Promise<void> => {
        await apiCall(`/api/v1/notifications/${id}`, {
            method: 'DELETE'
        });
    },
};

export interface DashboardStats {
    totalFreelancers: number;
    totalClients: number;
    activeProjects: number;
    totalRevenue: number;
    totalServices: number;
    totalDisputes: number;
}
