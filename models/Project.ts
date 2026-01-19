//blueprint that defines how projects, proposals, milestones, and contracts are structured and stored in your freelancing app
export interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  freelancerId?: string | null;
  budget: number; // Main budget field (from database)
  createdAt: string;
  location?: string;
  bidsCount: number;
  tags: string[];
  category?: string;
  duration?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  updatedAt: string;
  client?: {
    id: string;
    userName: string;
    email: string;
    role: string;
  };
  freelancer?: {
    id: string;
    userName: string;
    email: string;
    role: string;
  };
  // Legacy fields for backward compatibility (optional)
  budgetRange?: {
    min?: number;
    max?: number;
    type?: 'fixed' | 'hourly';
  };
  deadline?: string;
  skills?: string[];
  complexity?: 'beginner' | 'intermediate' | 'expert';
  proposals?: number;
  milestones?: Milestone[];
  attachments?: Attachment[];
  isRemote?: boolean;
  experienceLevel?: 'entry' | 'intermediate' | 'expert';
  projectDuration?: 'less_than_1_month' | '1_3_months' | '3_6_months' | 'more_than_6_months';
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  deliverables: string[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  coverLetter: string;
  bidAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  project?: Project;
  freelancer?: {
    id: string;
    userName: string;
    email: string;
    role: string;
    // Legacy fields for backward compatibility (optional)
    name?: string;
    avatar?: string;
    title?: string;
    rating?: number;
    completedProjects?: number;
    skills?: string[];
  };
  // Legacy fields for backward compatibility (optional)
  proposedBudget?: number;
  timeline?: string;
  milestones?: ProposalMilestone[];
  attachments?: Attachment[];
  submittedAt?: string;
}

export interface ProposalMilestone {
  name: string;
  description: string;
  amount: number;
  timeline: string;
}

export interface ProjectContract {
  id: string;
  projectId: string;
  proposalId: string;
  clientId: string;
  freelancerId: string;
  budget: number;
  milestones: Milestone[];
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  terms: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get display status for a project
 * If freelancerId exists, it means proposal is accepted and project is "Assigned/In Progress"
 * Otherwise, show the actual database status
 */
export function getProjectDisplayStatus(project: Project): 'Active' | 'Completed' | 'In Progress' | 'Cancelled' {
  // If project has a freelancer assigned, it means proposal was accepted
  if (project.freelancerId) {
    // If status is COMPLETED or CANCELLED, use that
    if (project.status === 'COMPLETED') return 'Completed';
    if (project.status === 'CANCELLED') return 'Cancelled';
    // Otherwise, show as "In Progress" (proposal accepted, work started/ready to start)
    return 'In Progress';
  }
  
  // No freelancer assigned - show actual status
  switch (project.status) {
    case 'ACTIVE':
      return 'Active';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Active';
  }
}