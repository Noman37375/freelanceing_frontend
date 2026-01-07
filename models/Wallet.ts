//// This defines how the app handles wallets, transactions, payments, and withdrawals for users.

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  category: TransactionCategory;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type TransactionCategory = 
  | 'project_payment'
  | 'milestone_payment'
  | 'wallet_funding'
  | 'withdrawal'
  | 'platform_fee'
  | 'refund'
  | 'bonus'
  | 'penalty'
  | 'dispute_resolution';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'paypal' | 'stripe';
  provider: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
  holderName: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowAccount {
  id: string;
  projectId: string;
  contractId: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'funded' | 'released' | 'refunded' | 'disputed';
  milestoneId?: string;
  releaseConditions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AutoReplenishSettings {
  id: string;
  userId: string;
  isEnabled: boolean;
  threshold: number;
  replenishAmount: number;
  paymentMethodId: string;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  bankAccountId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  processingFee: number;
  estimatedArrival: string;
  actualArrival?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}