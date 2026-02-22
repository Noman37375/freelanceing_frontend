//blueprint for handling disputes
export interface Dispute {
  id: string;
  projectId: string;
  contractId: string;
  initiatorId: string;
  respondentId: string;
  initiator: {
    name: string;
    role: 'freelancer' | 'client';
  };
  respondent: {
    name: string;
    role: 'freelancer' | 'client';
  };
  reason: DisputeReason;
  title: string;
  description: string;
  amount: number;
  currency: string;
  evidence: DisputeEvidence[];
  status: DisputeStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedMediatorId?: string;
  mediator?: {
    name: string;
    avatar?: string;
  };
  resolution?: DisputeResolution;
  messages: DisputeMessage[];
  timeline: DisputeTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type DisputeReason = 
  | 'quality_issues'
  | 'missed_deadline'
  | 'scope_creep'
  | 'payment_delay'
  | 'communication_issues'
  | 'breach_of_contract'
  | 'intellectual_property'
  | 'other';

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'awaiting_response'
  | 'mediation'
  | 'resolved'
  | 'closed'
  | 'escalated'
  | 'denied'
  // Legacy PascalCase values from DB (backwards compatibility)
  | 'Pending'
  | 'Resolved'
  | 'Denied'
  | 'Under Review'
  | string;

export interface DisputeEvidence {
  id: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'screenshot' | 'chat_log';
  name: string;
  url: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  sender: {
    name: string;
    role: 'freelancer' | 'client' | 'mediator' | 'admin';
  };
  content: string;
  attachments: DisputeEvidence[];
  isInternal: boolean; // Only visible to mediators/admins
  createdAt: string;
}

export interface DisputeResolution {
  type: 'full_refund' | 'partial_refund' | 'no_refund' | 'additional_work' | 'payment_release' | 'custom';
  amount?: number;
  description: string;
  agreedByInitiator: boolean;
  agreedByRespondent: boolean;
  enforcedByMediator: boolean;
  resolvedBy: string;
  resolvedAt: string;
}

export interface DisputeTimelineEvent {
  id: string;
  type: 'created' | 'response_submitted' | 'evidence_added' | 'mediator_assigned' | 'resolution_proposed' | 'resolved' | 'closed';
  description: string;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, any>;
}

export interface DisputeStatistics {
  totalDisputes: number;
  openDisputes: number;
  resolvedDisputes: number;
  averageResolutionTime: number; // in days
  resolutionRate: number; // percentage
  commonReasons: Array<{
    reason: DisputeReason;
    count: number;
    percentage: number;
  }>;
}