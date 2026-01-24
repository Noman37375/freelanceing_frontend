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
    }
};

export interface DashboardStats {
    totalFreelancers: number;
    totalClients: number;
    activeProjects: number;
    totalRevenue: number;
}
