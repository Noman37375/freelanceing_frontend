import { User, FreelancerProfile, ClientProfile } from '@/models/User';
import { Project } from '@/models/Project';

// Mock data to simulate backend database
let MOCK_USERS: (FreelancerProfile | ClientProfile)[] = [
    {
        id: '1',
        name: 'Alishba Jafri',
        email: 'alishba@test.com',
        role: 'freelancer',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Freelancer specific
        title: 'UI/UX Designer',
        bio: 'Passionate designer',
        skills: ['UI/UX', 'React'],
        hourlyRate: 25,
        rating: 4.9,
        completedProjects: 12,
        totalEarnings: 3000,
        location: 'New York',
        languages: ['English'],
        availability: 'available',
        portfolio: [],
        certifications: [],
        education: [],
        workExperience: []
    },
    {
        id: '2',
        name: 'John Doe',
        email: 'john@test.com',
        role: 'freelancer',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Freelancer specific
        title: 'Backend Developer',
        bio: 'Node.js expert',
        skills: ['Node.js'],
        hourlyRate: 40,
        rating: 4.5,
        completedProjects: 5,
        totalEarnings: 2000,
        location: 'London',
        languages: ['English'],
        availability: 'available',
        portfolio: [],
        certifications: [],
        education: [],
        workExperience: []
    },
    {
        id: '3',
        name: 'Sarah Smith',
        email: 'sarah@test.com',
        role: 'client',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Client specific
        companyName: 'Tech Startup',
        companySize: '1-10',
        industry: 'Technology',
        contactPerson: 'Sarah Smith',
        projectsPosted: 10,
        totalSpent: 5000,
        averageRating: 4.8
    },
    {
        id: '4',
        name: 'Mike Johnson',
        email: 'mike@test.com',
        role: 'client',
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Client specific
        companyName: 'Ecommerce Biz',
        companySize: '11-50',
        industry: 'Retail',
        contactPerson: 'Mike Johnson',
        projectsPosted: 2,
        totalSpent: 1000,
        averageRating: 4.2
    },
];

let MOCK_PROJECTS: Project[] = [
    {
        id: '1',
        clientId: '3',
        title: 'E-commerce App UI',
        description: 'Need a modern UI for shop',
        budget: { min: 300, max: 500, type: 'fixed' },
        status: 'open',
        skills: ['UI/UX', 'Mobile'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 864000000).toISOString(),
        category: 'Design',
        complexity: 'intermediate',
        client: { name: 'Sarah Smith', rating: 4.8, projectsPosted: 10, location: 'NY' },
        proposals: 5,
        milestones: [],
        attachments: [],
        isRemote: true,
        experienceLevel: 'intermediate',
        projectDuration: '1_3_months'
    },
    {
        id: '2',
        clientId: '4',
        title: 'Backend API Fixes',
        description: 'Fix bugs in Node.js API',
        budget: { min: 100, max: 200, type: 'fixed' },
        status: 'open',
        skills: ['Node.js', 'Express'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 864000000).toISOString(),
        category: 'Development',
        complexity: 'expert',
        client: { name: 'Mike Johnson', rating: 4.2, projectsPosted: 2, location: 'London' },
        proposals: 2,
        milestones: [],
        attachments: [],
        isRemote: true,
        experienceLevel: 'expert',
        projectDuration: 'less_than_1_month'
    },
    {
        id: '3',
        clientId: '3',
        title: 'Website Redesign',
        description: 'Redesign corporate website',
        budget: { min: 800, max: 1000, type: 'fixed' },
        status: 'completed',
        skills: ['Web', 'React'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deadline: new Date(Date.now() - 864000000).toISOString(),
        category: 'Development',
        complexity: 'intermediate',
        client: { name: 'Sarah Smith', rating: 4.8, projectsPosted: 10, location: 'NY' },
        proposals: 10,
        milestones: [],
        attachments: [],
        isRemote: true,
        experienceLevel: 'intermediate',
        projectDuration: '1_3_months'
    }
];

export const adminService = {
    // Users
    getUsersByRole: async (role: 'freelancer' | 'client'): Promise<User[]> => {
        console.log(`[adminService] getUsersByRole: ${role}`);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Ensure consistent comparison
        const results = MOCK_USERS.filter(u => u.role.toLowerCase() === role.toLowerCase());
        console.log(`[adminService] Found ${results.length} users`);
        return results;
    },

    deleteUser: async (id: string): Promise<void> => {
        console.log(`[adminService] deleteUser: ${id}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        const initialLength = MOCK_USERS.length;
        MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
        console.log(`[adminService] Deleted user. Count before: ${initialLength}, after: ${MOCK_USERS.length}`);
    },

    updateUser: async (id: string, data: Partial<User>): Promise<User> => {
        console.log(`[adminService] updateUser: ${id}`, data);
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = MOCK_USERS.findIndex(u => u.id === id);
        if (index === -1) {
            console.error('[adminService] User not found');
            throw new Error('User not found');
        }

        // Merge updates
        MOCK_USERS[index] = { ...MOCK_USERS[index], ...data } as any;
        console.log('[adminService] User updated:', MOCK_USERS[index]);
        return MOCK_USERS[index];
    },

    // Projects
    getAllProjects: async (): Promise<Project[]> => {
        console.log('[adminService] getAllProjects');
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...MOCK_PROJECTS];
    },

    deleteProject: async (id: string): Promise<void> => {
        console.log(`[adminService] deleteProject: ${id}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        MOCK_PROJECTS = MOCK_PROJECTS.filter(p => p.id !== id);
    },

    updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
        console.log(`[adminService] updateProject: ${id}`, data);
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = MOCK_PROJECTS.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Project not found');

        MOCK_PROJECTS[index] = { ...MOCK_PROJECTS[index], ...data };
        return MOCK_PROJECTS[index];
    },

    // Dashboard Stats
    getDashboardStats: async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const totalFreelancers = MOCK_USERS.filter(u => u.role === 'freelancer').length;
        const totalClients = MOCK_USERS.filter(u => u.role === 'client').length;
        const activeProjects = MOCK_PROJECTS.filter(p => p.status === 'open' || p.status === 'in_progress').length;
        // Calculate revenue based on max budget
        const totalRevenue = MOCK_PROJECTS.reduce((acc, curr) => acc + (curr.budget.max || 0), 0) * 0.1;

        return {
            totalFreelancers,
            totalClients,
            activeProjects,
            totalRevenue
        };
    }
};

export interface DashboardStats {
    totalFreelancers: number;
    totalClients: number;
    activeProjects: number;
    totalRevenue: number;
}
