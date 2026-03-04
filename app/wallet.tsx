import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, Search, Plus, ArrowUpRight, ArrowDownLeft,
  History, Settings2, Lock, RefreshCw, X,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '@/contexts/WalletContext';
import { walletService } from '@/services/walletService';

const QUICK_AMOUNTS = [50, 100, 250, 500];

// ── helpers ────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function txnIsCredit(type: string) {
  return type === 'deposit' || type === 'refund';
}

function TxnIcon({ type }: { type: string }) {
  if (type === 'deposit')    return <Plus         size={18} color="#10B981" />;
  if (type === 'refund')     return <ArrowDownLeft size={18} color="#10B981" />;
  if (type === 'escrow')     return <Lock         size={18} color="#0891B2" />;
  return <ArrowUpRight size={18} color="#EF4444" />;
}

// ── component ──────────────────────────────────────────────────────────────
export default function WalletScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile' as any);
    }
  };

  const {
    balance,
    escrowBalance,
    transactions,
    isLoading,
    getTransactionHistory,
    autoReplenishSettings,
  } = useWallet();

  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [autoReplenish, setAutoReplenish] = useState(autoReplenishSettings.enabled);

  // Add Funds modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addAmount, setAddAmount]       = useState('');
  const [addLoading, setAddLoading]     = useState(false);

  // Withdraw modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount]       = useState('');
  const [withdrawLoading, setWithdrawLoading]     = useState(false);

  useEffect(() => { getTransactionHistory(); }, []);

  // ── Add Funds handler ───────────────────────────────────────────────────
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
      await getTransactionHistory(); // refresh balance + tx list
      setShowAddModal(false);
      setAddAmount('');
      Alert.alert('Success', `$${parsed.toFixed(2)} added to your wallet.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add funds');
    } finally {
      setAddLoading(false);
    }
  };

  // ── Withdraw handler ────────────────────────────────────────────────────
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
      await getTransactionHistory();
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      Alert.alert('Success', `$${parsed.toFixed(2)} has been withdrawn from your wallet.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to withdraw funds');
    } finally {
      setWithdrawLoading(false);
    }
  };

  // ── Filtered transactions ───────────────────────────────────────────────
  const filteredTxns = transactions.filter((txn) => {
    const matchesFilter =
      filter === 'all' ||
      txn.type?.toLowerCase()   === filter ||
      txn.status?.toLowerCase() === filter;
    const matchesSearch = !search || txn.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#282A32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={22} color="#282A32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financial Wallet</Text>
        <TouchableOpacity style={styles.headerRight} onPress={getTransactionHistory}>
          <Settings2 size={22} color="#282A32" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── WALLET CARD ── */}
        <View style={styles.walletCard}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceValue}>
                ${(balance + escrowBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.chipBranding}>
              <View style={styles.circleBlur} />
            </View>
          </View>

          <View style={styles.walletStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Available</Text>
              <Text style={styles.statValue}>
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>In Escrow</Text>
              <Text style={[styles.statValue, escrowBalance > 0 && { color: '#67E8F9' }]}>
                ${escrowBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryAction} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
              <Plus size={18} color="#282A32" />
              <Text style={styles.primaryActionText}>Add Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction} onPress={() => setShowWithdrawModal(true)} activeOpacity={0.8}>
              <ArrowUpRight size={18} color="#FFF" />
              <Text style={styles.secondaryActionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── AUTO-REPLENISH CARD ── */}
        <View style={styles.autoSection}>
          <View style={styles.autoInfo}>
            <View style={styles.autoHeader}>
              <Text style={styles.autoTitle}>Auto-Replenish</Text>
              <View style={[styles.statusIndicator, { backgroundColor: autoReplenish ? '#10B981' : '#94A3B8' }]} />
            </View>
            <Text style={styles.autoDesc}>
              Smart-fill ${autoReplenishSettings.amount} if balance {'<'} ${autoReplenishSettings.threshold}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.toggle, { backgroundColor: autoReplenish ? '#282A32' : '#E2E8F0' }]}
            onPress={() => setAutoReplenish(!autoReplenish)}
          >
            <View style={[styles.knob, { alignSelf: autoReplenish ? 'flex-end' : 'flex-start' }]} />
          </TouchableOpacity>
        </View>

        {/* ── TRANSACTIONS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <History size={18} color="#64748B" />
          </View>

          <View style={styles.searchWrapper}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchBar}
              placeholder="Search history..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {[
              { label: 'All',        value: 'all' },
              { label: 'Deposits',   value: 'deposit' },
              { label: 'Escrow',     value: 'escrow' },
              { label: 'Payments',   value: 'payment' },
              { label: 'Completed',  value: 'completed' },
              { label: 'Pending',    value: 'pending' },
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
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No activity found</Text>
            </View>
          ) : (
            filteredTxns.map((txn, index) => {
              const isCredit = txnIsCredit(txn.type);
              return (
                <View key={txn.id ?? index} style={styles.transactionItem}>
                  <View style={styles.txnIconWrapper}>
                    <TxnIcon type={txn.type} />
                  </View>

                  <View style={styles.txnContent}>
                    <Text style={styles.txnDesc} numberOfLines={1}>
                      {txn.description || txn.type}
                    </Text>
                    <View style={styles.txnMetaRow}>
                      <Text style={styles.txnDate}>{formatDate(txn.createdAt)}</Text>
                      {txn.status ? (
                        <>
                          <View style={styles.dot} />
                          <Text style={[
                            styles.txnStatusText,
                            txn.status === 'completed' && { color: '#10B981' },
                            txn.status === 'pending'   && { color: '#F59E0B' },
                            txn.status === 'failed'    && { color: '#EF4444' },
                          ]}>
                            {txn.status}
                          </Text>
                        </>
                      ) : null}
                    </View>
                  </View>

                  <Text style={[styles.txnAmount, { color: isCredit ? '#10B981' : '#282A32' }]}>
                    {isCredit ? '+' : '-'}${Number(txn.amount).toFixed(2)}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ── WITHDRAW MODAL ── */}
      <Modal visible={showWithdrawModal} transparent animationType="slide" onRequestClose={() => setShowWithdrawModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => { setShowWithdrawModal(false); setWithdrawAmount(''); }} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Available balance: ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>

            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
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
              style={[styles.confirmBtn, styles.withdrawConfirmBtn, (!withdrawAmount || withdrawLoading) && styles.confirmBtnDisabled]}
              onPress={handleWithdraw}
              disabled={!withdrawAmount || withdrawLoading}
              activeOpacity={0.85}
            >
              {withdrawLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.confirmBtnText}>
                  Withdraw {withdrawAmount ? `$${parseFloat(withdrawAmount || '0').toFixed(2)}` : 'Funds'}
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* ── ADD FUNDS MODAL ── */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Funds</Text>
              <TouchableOpacity onPress={() => { setShowAddModal(false); setAddAmount(''); }} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Funds will be added to your available balance instantly.
            </Text>

            {/* Amount input */}
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                value={addAmount}
                onChangeText={setAddAmount}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            {/* Quick amounts */}
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

            {/* Confirm button */}
            <TouchableOpacity
              style={[styles.confirmBtn, (!addAmount || addLoading) && styles.confirmBtnDisabled]}
              onPress={handleAddFunds}
              disabled={!addAmount || addLoading}
              activeOpacity={0.85}
            >
              {addLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.confirmBtnText}>
                  Add {addAmount ? `$${parseFloat(addAmount || '0').toFixed(2)}` : 'Funds'}
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ── styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#282A32' },
  backButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
  headerRight: { padding: 8 },

  // Wallet card
  walletCard: { backgroundColor: '#1E1B4B', margin: 20, borderRadius: 24, padding: 24, overflow: 'hidden' },
  circleBlur: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#282A32', top: -50, right: -50, opacity: 0.3 },
  chipBranding: {},
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  balanceLabel: { color: '#C7D2FE', fontSize: 14, fontWeight: '500' },
  balanceValue: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', marginTop: 4 },
  walletStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 24 },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', height: '100%' },
  statLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 4 },
  statValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 12 },
  primaryAction: { flex: 1, backgroundColor: '#FFFFFF', height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryActionText: { color: '#282A32', fontWeight: '700' },
  secondaryAction: { flex: 1, backgroundColor: '#282A32', height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryActionText: { color: '#FFF', fontWeight: '700' },

  // Auto-replenish
  autoSection: { backgroundColor: '#FFFFFF', marginHorizontal: 20, padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#F1F5F9' },
  autoInfo: { flex: 1 },
  autoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  autoTitle: { fontSize: 16, fontWeight: '700', color: '#282A32' },
  statusIndicator: { width: 8, height: 8, borderRadius: 4 },
  autoDesc: { fontSize: 13, color: '#64748B', marginTop: 4 },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 3 },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFF' },

  // Transactions
  section: { paddingHorizontal: 20, marginTop: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#282A32' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  searchBar: { flex: 1, marginLeft: 10, fontSize: 15, color: '#282A32' },
  filterRow: { marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFF', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  activeChip: { backgroundColor: '#282A32', borderColor: '#282A32' },
  chipText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  activeChipText: { color: '#FFF' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  txnIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  txnContent: { flex: 1, marginLeft: 12 },
  txnDesc: { fontSize: 15, fontWeight: '600', color: '#282A32', marginBottom: 4 },
  txnMetaRow: { flexDirection: 'row', alignItems: 'center' },
  txnDate: { fontSize: 12, color: '#94A3B8' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
  txnStatusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: '#94A3B8' },
  txnAmount: { fontSize: 16, fontWeight: '800' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#94A3B8', fontWeight: '500' },

  // Add Funds modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  closeBtn: { padding: 6, backgroundColor: '#F1F5F9', borderRadius: 10 },
  modalSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 24, lineHeight: 20 },

  amountInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: '#E2E8F0',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20,
  },
  currencySymbol: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 28, fontWeight: '800', color: '#1E293B' },

  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  quickBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  quickBtnActive: { backgroundColor: '#1E1B4B', borderColor: '#1E1B4B' },
  quickBtnText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  quickBtnTextActive: { color: '#FFF' },

  confirmBtn: { backgroundColor: '#1E1B4B', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  withdrawConfirmBtn: { backgroundColor: '#282A32' },
  confirmBtnDisabled: { opacity: 0.45 },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
