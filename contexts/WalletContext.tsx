// WalletContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: string;
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  getTransactionHistory: () => Promise<void>;
  autoReplenishSettings: {
    enabled: boolean;
    threshold: number;
    amount: number;
  };
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoReplenishSettings, setAutoReplenishSettings] = useState({
    enabled: false,
    threshold: 250,
    amount: 500,
  });

  // Fetch transactions from backend
  const getTransactionHistory = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/transactions`);
      const txnData: Transaction[] = res.data || [];

      setTransactions(txnData);

      // Calculate balance from MongoDB transactions
      const totalCredits = txnData
        .filter((t) => t.type === 'credit')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalDebits = txnData
        .filter((t) => t.type === 'debit')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setBalance(totalCredits - totalDebits);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTransactionHistory();
  }, []);

  const value: WalletContextType = {
    balance,
    transactions,
    isLoading,
    getTransactionHistory,
    autoReplenishSettings,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
}
