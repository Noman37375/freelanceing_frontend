//blueprint that defines how projects, proposals, milestones, and contracts are structured and stored in your freelancing app
export interface Project {
  id: string;
  title: string;
  description: string;
  budget: {
    min: number;
    max: number;
    type: 'fixed' | 'hourly';
  };
  deadline: string;
  skills: string[];
  category: string;
  complexity: 'beginner' | 'intermediate' | 'expert';
  clientId: string;
  client: {
    name: string;
    companyName?: string;
    rating: number;
    projectsPosted: number;
    location: string;
  };
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  proposals: number;
  milestones: Milestone[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  location?: string;
  isRemote: boolean;
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  projectDuration: 'less_than_1_month' | '1_3_months' | '3_6_months' | 'more_than_6_months';
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
  freelancer: {
    name: string;
    avatar?: string;
    title: string;
    rating: number;
    completedProjects: number;
    skills: string[];
  };
  coverLetter: string;
  proposedBudget: number;
  timeline: string;
  milestones: ProposalMilestone[];
  attachments: Attachment[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: string;
  updatedAt: string;
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