import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import {
  Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine,
  Lock, Clock, ArrowLeft, Plus, X, Search,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { walletService, Transaction } from '@/services/walletService';

const QUICK_AMOUNTS = [50, 100, 250, 500];

function txnIsCredit(type: string) {
  return type === 'deposit' || type === 'refund';
}

export default function ClientWallet() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(client-tabs)/profile' as any);
    }
  };

  const [balance, setBalance]           = useState(0);
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);

  // Filter / search
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Add Funds modal
  const [showAddModal, setShowAddModal]   = useState(false);
  const [addAmount, setAddAmount]         = useState('');
  const [addLoading, setAddLoading]       = useState(false);

  // Withdraw modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount]       = useState('');
  const [withdrawLoading, setWithdrawLoading]     = useState(false);

  useEffect(() => { fetchWalletData(); }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletData, txData] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(),
      ]);
      setBalance(walletData.balance);
      setEscrowBalance(walletData.escrowBalance);
      setTransactions(txData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  // ── Add Funds ──────────────────────────────────────────────────────────
  const handleAddFunds = async () => {
    const parsed = parseFloat(addAmount);
    if (!addAmount || isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid amount', 'Please enter a positive amount.');
      return;
    }
    if (parsed > 10000) {
      Alert.alert('Limit exceeded', 'Maximum single deposit is $10,000.');
      return;
    }
    try {
      setAddLoading(true);
      await walletService.addFunds(parsed);
      await fetchWalletData();
      setShowAddModal(false);
      setAddAmount('');
      Alert.alert('Success', `$${parsed.toFixed(2)} added to your wallet.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add funds');
    } finally {
      setAddLoading(false);
    }
  };

  // ── Withdraw ───────────────────────────────────────────────────────────
  const handleWithdraw = async () => {
    const parsed = parseFloat(withdrawAmount);
    if (!withdrawAmount || isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid amount', 'Please enter a positive amount.');
      return;
    }
    if (parsed > balance) {
      Alert.alert('Insufficient funds', `Your available balance is $${balance.toFixed(2)}.`);
      return;
    }
    try {
      setWithdrawLoading(true);
      await walletService.withdrawFunds(parsed);
      await fetchWalletData();
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      Alert.alert('Success', `$${parsed.toFixed(2)} has been withdrawn.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to withdraw funds');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredTxns = transactions.filter((t) => {
    const matchesFilter =
      filter === 'all' ||
      t.type?.toLowerCase() === filter ||
      t.status?.toLowerCase() === filter;
    const matchesSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.project?.title?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#282A32" />
      </View>
    );
  }

  const total = balance + escrowBalance;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={22} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchWalletData}>
          <WalletIcon size={20} color="#282A32" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── BALANCE CARD ── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>

          <View style={styles.balanceBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Available</Text>
              <Text style={styles.breakdownAmount}>
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>In Escrow</Text>
              <Text style={[styles.breakdownAmount, escrowBalance > 0 && styles.escrowAmountActive]}>
                ${escrowBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setShowAddModal(true)}>
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.primaryButtonText}>Add Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowWithdrawModal(true)}>
              <ArrowUpFromLine size={18} color="#282A32" strokeWidth={2} />
              <Text style={styles.secondaryButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── ESCROW INFO ── */}
        {escrowBalance > 0 && (
          <View style={styles.infoBox}>
            <Lock size={18} color="#0891B2" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Funds in Escrow</Text>
              <Text style={styles.infoText}>
                ${escrowBalance.toFixed(2)} is locked in milestone escrow and will be released upon approval.
              </Text>
            </View>
          </View>
        )}

        {/* ── TRANSACTIONS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>

          {/* Search */}
          <View style={styles.searchWrapper}>
            <Search size={16} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {[
              { label: 'All', value: 'all' },
              { label: 'Deposits', value: 'deposit' },
              { label: 'Escrow', value: 'escrow' },
              { label: 'Payments', value: 'payment' },
              { label: 'Completed', value: 'completed' },
              { label: 'Pending', value: 'pending' },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.chip, filter === item.value && styles.activeChip]}
                onPress={() => setFilter(item.value)}
              >
                <Text style={[styles.chipText, filter === item.value && styles.activeChipText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredTxns.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          ) : (
            filteredTxns.map((txn) => {
              const isCredit = txnIsCredit(txn.type);
              return (
                <View key={txn.id} style={styles.transactionCard}>
                  <View style={[styles.txnIcon, isCredit ? styles.txnIconCredit : txn.type === 'escrow' ? styles.txnIconEscrow : styles.txnIconDebit]}>
                    {isCredit && <ArrowDownToLine size={18} color="#10B981" strokeWidth={2} />}
                    {txn.type === 'escrow' && <Lock size={18} color="#0891B2" strokeWidth={2} />}
                    {!isCredit && txn.type !== 'escrow' && <ArrowUpFromLine size={18} color="#EF4444" strokeWidth={2} />}
                  </View>
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnTitle} numberOfLines={1}>
                      {txn.project?.title || txn.description || txn.type}
                    </Text>
                    <View style={styles.txnMeta}>
                      <Clock size={11} color="#9CA3AF" strokeWidth={2} />
                      <Text style={styles.txnDate}>{formatDate(txn.createdAt)}</Text>
                      {txn.status && (
                        <Text style={[
                          styles.txnStatus,
                          txn.status === 'completed' && { color: '#10B981' },
                          txn.status === 'pending' && { color: '#F59E0B' },
                          txn.status === 'failed' && { color: '#EF4444' },
                        ]}>
                          · {txn.status}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={[styles.txnAmount, { color: isCredit ? '#10B981' : '#1F2937' }]}>
                    {isCredit ? '+' : '-'}${Number(txn.amount).toFixed(2)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>

      {/* ── ADD FUNDS MODAL ── */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Funds</Text>
              <TouchableOpacity onPress={() => { setShowAddModal(false); setAddAmount(''); }} style={styles.closeBtn}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Funds are available instantly.</Text>

            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={addAmount}
                onChangeText={setAddAmount}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <View style={styles.quickRow}>
              {QUICK_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickBtn, addAmount === String(amt) && styles.quickBtnActive]}
                  onPress={() => setAddAmount(String(amt))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.quickBtnText, addAmount === String(amt) && styles.quickBtnTextActive]}>
                    ${amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, (!addAmount || addLoading) && styles.confirmBtnDisabled]}
              onPress={handleAddFunds}
              disabled={!addAmount || addLoading}
              activeOpacity={0.85}
            >
              {addLoading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.confirmBtnText}>
                    Add {addAmount ? `$${parseFloat(addAmount || '0').toFixed(2)}` : 'Funds'}
                  </Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── WITHDRAW MODAL ── */}
      <Modal visible={showWithdrawModal} transparent animationType="slide" onRequestClose={() => setShowWithdrawModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => { setShowWithdrawModal(false); setWithdrawAmount(''); }} style={styles.closeBtn}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Available: ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>

            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <View style={styles.quickRow}>
              {QUICK_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickBtn, withdrawAmount === String(amt) && styles.quickBtnActive]}
                  onPress={() => setWithdrawAmount(String(amt))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.quickBtnText, withdrawAmount === String(amt) && styles.quickBtnTextActive]}>
                    ${amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, styles.withdrawBtn, (!withdrawAmount || withdrawLoading) && styles.confirmBtnDisabled]}
              onPress={handleWithdraw}
              disabled={!withdrawAmount || withdrawLoading}
              activeOpacity={0.85}
            >
              {withdrawLoading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.confirmBtnText}>
                    Withdraw {withdrawAmount ? `$${parseFloat(withdrawAmount || '0').toFixed(2)}` : 'Funds'}
                  </Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  refreshBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },

  // Balance card
  balanceCard: {
    margin: 20, backgroundColor: '#282A32', borderRadius: 20, padding: 24,
  },
  balanceLabel: { color: '#9CA3AF', fontSize: 13, fontWeight: '500', marginBottom: 4 },
  balanceAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginBottom: 20 },
  balanceBreakdown: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, padding: 14, marginBottom: 20,
  },
  breakdownItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  breakdownLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  breakdownAmount: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  escrowAmountActive: { color: '#67E8F9' },

  actionButtons: { flexDirection: 'row', gap: 12 },
  primaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', paddingVertical: 13, borderRadius: 12 },
  primaryButtonText: { color: '#282A32', fontSize: 15, fontWeight: '700' },
  secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'transparent', paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Info box
  infoBox: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 4,
    padding: 14, backgroundColor: '#F0F9FF', borderRadius: 14, borderWidth: 1, borderColor: '#BAE6FD',
  },
  infoContent: { flex: 1, marginLeft: 10 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#0C4A6E', marginBottom: 2 },
  infoText: { fontSize: 12, color: '#0891B2', lineHeight: 17 },

  // Transactions
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1F2937', marginBottom: 14 },

  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 12, paddingHorizontal: 12, height: 44,
    borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },

  filterRow: { marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#FFFFFF', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  activeChip: { backgroundColor: '#282A32', borderColor: '#282A32' },
  chipText: { color: '#6B7280', fontWeight: '600', fontSize: 12 },
  activeChipText: { color: '#FFF' },

  transactionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  txnIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txnIconCredit: { backgroundColor: '#F0FDF4' },
  txnIconEscrow: { backgroundColor: '#F0F9FF' },
  txnIconDebit: { backgroundColor: '#FEF2F2' },
  txnInfo: { flex: 1 },
  txnTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  txnMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  txnDate: { fontSize: 11, color: '#9CA3AF' },
  txnStatus: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
  txnAmount: { fontSize: 15, fontWeight: '800' },

  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 36, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
  closeBtn: { padding: 6, backgroundColor: '#F3F4F6', borderRadius: 10 },
  modalSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 22 },

  amountInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderWidth: 2, borderColor: '#E5E7EB',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 18,
  },
  currencySymbol: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 26, fontWeight: '800', color: '#1F2937' },

  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  quickBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  quickBtnActive: { backgroundColor: '#282A32', borderColor: '#282A32' },
  quickBtnText: { fontSize: 13, fontWeight: '700', color: '#4B5563' },
  quickBtnTextActive: { color: '#FFF' },

  confirmBtn: { backgroundColor: '#282A32', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  withdrawBtn: { backgroundColor: '#1F2937' },
  confirmBtnDisabled: { opacity: 0.45 },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
