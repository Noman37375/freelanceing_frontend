//blueprint for messages 
export interface Conversation {
  id: string;
  participants: string[];
  projectId?: string;
  contractId?: string;
  type: 'project_inquiry' | 'contract_discussion' | 'support' | 'general';
  title: string;
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    name: string;
    avatar?: string;
    role: 'freelancer' | 'client' | 'admin';
  };
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  attachments: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  editedAt?: string;
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  thumbnailUrl?: string;
}

export interface SystemMessage extends Message {
  systemType: 'milestone_approved' | 'payment_released' | 'contract_started' | 'project_completed' | 'dispute_opened';
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: {
    newMessages: boolean;
    projectUpdates: boolean;
    paymentNotifications: boolean;
    marketingEmails: boolean;
  };
  pushNotifications: {
    newMessages: boolean;
    projectUpdates: boolean;
    paymentNotifications: boolean;
  };
  inAppNotifications: {
    newMessages: boolean;
    projectUpdates: boolean;
    paymentNotifications: boolean;
  };
  updatedAt: string;
}