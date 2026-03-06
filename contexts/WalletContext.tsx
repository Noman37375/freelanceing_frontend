// WalletContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { walletService, Transaction } from '@/services/walletService';
import { useAuth } from '@/contexts/AuthContext';

interface WalletContextType {
  balance: number;
  escrowBalance: number;
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
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [escrowBalance, setEscrowBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoReplenishSettings] = useState({
    enabled: false,
    threshold: 250,
    amount: 500,
  });

  const getTransactionHistory = async () => {
    setIsLoading(true);
    try {
      const [wallet, txnData] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(),
      ]);

      setBalance(wallet.balance);
      setEscrowBalance(wallet.escrowBalance);
      setTransactions(txnData);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only auto-fetch wallet data when a user is authenticated
    if (user) {
      getTransactionHistory();
    }
  }, [user]);

  const value: WalletContextType = {
    balance,
    escrowBalance,
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
