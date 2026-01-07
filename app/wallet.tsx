import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '@/contexts/WalletContext'; // ✅ Use context

export default function WalletScreen() {
  const router = useRouter();
  const {
    balance,
    transactions,
    isLoading,
    getTransactionHistory,
    autoReplenishSettings,
  } = useWallet();

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [autoReplenish, setAutoReplenish] = useState(
    autoReplenishSettings.enabled
  );

  useEffect(() => {
    getTransactionHistory(); // ✅ Now comes from WalletContext
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  const filteredTxns = transactions.filter((txn) => {
    const matchesFilter =
      filter === 'All' || txn.status?.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      txn.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* MAIN WALLET CARD */}
        <View style={styles.walletCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>${balance}</Text>

          <View style={styles.walletStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>
                $
                {transactions
                  .filter((t) => t.status?.toLowerCase() === 'pending')
                  .reduce((sum, t) => sum + (t.amount || 0), 0)}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>
                $
                {balance +
                  transactions
                    .filter((t) => t.status?.toLowerCase() === 'pending')
                    .reduce((sum, t) => sum + (t.amount || 0), 0)}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Add Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonOutline}>
              <Text style={styles.actionTextOutline}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AUTO-REPLENISH */}
        <View style={styles.autoSection}>
          <Text style={styles.autoTitle}>
            {autoReplenish ? 'Auto-Replenish Active' : 'Auto-Replenish Inactive'}
          </Text>
          <Text style={styles.autoDesc}>
            When balance drops below ${autoReplenishSettings.threshold}, add $
            {autoReplenishSettings.amount} automatically.
          </Text>
          <TouchableOpacity
            style={[
              styles.toggle,
              { backgroundColor: autoReplenish ? '#0D9488' : '#E5E7EB' },
            ]}
            onPress={() => setAutoReplenish(!autoReplenish)}
          >
            <View
              style={[
                styles.knob,
                { alignSelf: autoReplenish ? 'flex-end' : 'flex-start' },
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* TRANSACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="Search transaction..."
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
          >
            {['All', 'Withdrawn', 'Completed', 'Pending', 'Deposit'].map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, filter === item && styles.activeChip]}
                  onPress={() => setFilter(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filter === item && styles.activeChipText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          {filteredTxns.length === 0 ? (
            <Text style={styles.emptyText}>No transactions found.</Text>
          ) : (
            filteredTxns.map((txn, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.txnDate}>{txn.date}</Text>
                  <Text style={styles.txnDesc} numberOfLines={2}>
                    {txn.description}
                  </Text>
                  <Text
                    style={[
                      styles.statusTag,
                      styles[`status_${txn.status?.toLowerCase()}`],
                      { alignSelf: 'flex-start', marginTop: 4 },
                    ]}
                  >
                    {txn.status}
                  </Text>
                </View>

                <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      styles.txnAmount,
                      { color: txn.type === 'credit' ? '#0D9488' : '#DC2626' },
                    ]}
                  >
                    {txn.type === 'credit' ? '+' : '-'}${txn.amount}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  walletCard: {
    backgroundColor: '#0D9488',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  balanceLabel: { color: '#CCFBF1', fontSize: 16 },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
  },
  walletStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statBox: { alignItems: 'center', flex: 1 },
  statLabel: { color: '#A7F3D0', fontSize: 14 },
  statValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  actionButtonOutline: {
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionTextOutline: { color: '#fff', fontWeight: '600', fontSize: 16 },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
  },
  settingsBtn: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#E0F2FE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  settingsText: { color: '#0369A1', fontWeight: '600' },
  autoSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  autoTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  autoDesc: { fontSize: 14, color: '#475569', marginTop: 4 },
  toggle: {
    width: 48,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 3,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  section: { paddingHorizontal: 20, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterRow: { marginVertical: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    marginRight: 8,
  },
  activeChip: { backgroundColor: '#0D9488' },
  chipText: { color: '#334155', fontWeight: '500' },
  activeChipText: { color: '#FFFFFF' },
  emptyText: { color: '#6B7280', fontSize: 14, marginTop: 10 },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  txnDate: { color: '#94A3B8', fontSize: 12 },
  txnDesc: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  txnAmount: { fontSize: 16, fontWeight: '600' },
  statusTag: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    textAlign: 'center',
  },
  status_completed: { backgroundColor: '#DCFCE7', color: '#166534' },
  status_pending: { backgroundColor: '#FEF9C3', color: '#854D0E' },
  status_withdrawn: { backgroundColor: '#FFE4E6', color: '#991B1B' },
  status_deposit: { backgroundColor: '#CCFBF1', color: '#0F766E' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
