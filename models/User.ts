//This first checks “Are you a freelancer or a client?” Then it shows the right kind of profile (its a blueprint).
export interface User {
  id: string;
  userName: string;
  email: string;
  avatar?: string;
  role: 'freelancer' | 'client' | 'Admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  bio?: string;
  about?: string;
  rating?: number;
  projectsCompleted?: number;
  hourlyRate?: number;
  location?: string;
  skills?: string[];
  languages?: string[];
}

export interface FreelancerProfile extends User {
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  completedProjects: number;
  totalEarnings: number;
  location: string;
  languages: string[];
  availability: 'available' | 'busy' | 'unavailable';
  portfolio: PortfolioItem[];
  certifications: Certification[];
  education: Education[];
  workExperience: WorkExperience[];
}

export interface ClientProfile extends User {
  companyName: string;
  companySize: string;
  industry: string;
  website?: string;
  contactPerson: string;
  projectsPosted: number;
  totalSpent: number;
  averageRating: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  technologies: string[];
  projectUrl?: string;
  category: string;
  completedAt: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
}