import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus, ArrowUpRight, History, Settings2, CheckCircle2, Clock, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '@/contexts/WalletContext';

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
  const [autoReplenish, setAutoReplenish] = useState(autoReplenishSettings.enabled);

  useEffect(() => {
    getTransactionHistory();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#282A32" />
      </View>
    );
  }

  const filteredTxns = transactions.filter((txn) => {
    const matchesFilter = filter === 'All' || txn.status?.toLowerCase() === filter.toLowerCase();
    const matchesSearch = txn.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#282A32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financial Wallet</Text>
        <TouchableOpacity style={styles.headerRight}>
          <Settings2 size={22} color="#282A32" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* MAIN WALLET CARD */}
        <View style={styles.walletCard}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceValue}>${balance.toLocaleString()}</Text>
            </View>
            <View style={styles.chipBranding}>
              <View style={styles.circleBlur} />
            </View>
          </View>

          <View style={styles.walletStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>On Hold</Text>
              <Text style={styles.statValue}>
                ${transactions.filter(t => t.status?.toLowerCase() === 'pending').reduce((sum, t) => sum + (t.amount || 0), 0)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Lifetime</Text>
              <Text style={styles.statValue}>${balance + 1250} {/* Example offset */}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryAction}>
              <Plus size={18} color="#282A32" />
              <Text style={styles.primaryActionText}>Add Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction}>
              <ArrowUpRight size={18} color="#FFF" />
              <Text style={styles.secondaryActionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AUTO-REPLENISH MODULAR CARD */}
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

        {/* TRANSACTIONS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <History size={18} color="#64748B" />
          </View>

          {/* Styled Search */}
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

          {/* Filters Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {['All', 'Completed', 'Pending', 'Withdrawn', 'Deposit'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, filter === item && styles.activeChip]}
                onPress={() => setFilter(item)}
              >
                <Text style={[styles.chipText, filter === item && styles.activeChipText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredTxns.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No activity found</Text>
            </View>
          ) : (
            filteredTxns.map((txn, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.txnIconWrapper}>
                  {txn.type === 'credit' ? 
                    <Plus size={18} color="#10B981" /> : 
                    <ArrowUpRight size={18} color="#EF4444" />
                  }
                </View>
                
                <View style={styles.txnContent}>
                  <Text style={styles.txnDesc}>{txn.description}</Text>
                  <View style={styles.txnMetaRow}>
                    <Text style={styles.txnDate}>{txn.date}</Text>
                    <View style={styles.dot} />
                    <Text style={[styles.txnStatusText, styles[`text_${txn.status?.toLowerCase()}`]]}>
                      {txn.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.txnAmountWrapper}>
                  <Text style={[styles.txnAmount, { color: txn.type === 'credit' ? '#10B981' : '#282A32' }]}>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#282A32' },
  backButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
  headerRight: { padding: 8 },
  
  walletCard: {
    backgroundColor: '#1E1B4B',
    margin: 20,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  circleBlur: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#282A32',
    top: -50,
    right: -50,
    opacity: 0.3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  balanceLabel: { color: '#C7D2FE', fontSize: 14, fontWeight: '500' },
  balanceValue: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', marginTop: 4 },
  
  walletStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', height: '100%' },
  statLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 4 },
  statValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  
  actionRow: { flexDirection: 'row', gap: 12 },
  primaryAction: { flex: 1, backgroundColor: '#FFFFFF', height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryActionText: { color: '#282A32', fontWeight: '700' },
  secondaryAction: { flex: 1, backgroundColor: '#282A32', height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryActionText: { color: '#FFF', fontWeight: '700' },

  autoSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  autoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  autoTitle: { fontSize: 16, fontWeight: '700', color: '#282A32' },
  statusIndicator: { width: 8, height: 8, borderRadius: 4 },
  autoDesc: { fontSize: 13, color: '#64748B', marginTop: 4 },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 3 },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFF' },

  section: { paddingHorizontal: 20, marginTop: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#282A32' },
  
  searchWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 14, 
    paddingHorizontal: 15, 
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15 
  },
  searchBar: { flex: 1, marginLeft: 10, fontSize: 15, color: '#282A32' },
  
  filterRow: { marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFF', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  activeChip: { backgroundColor: '#282A32', borderColor: '#282A32' },
  chipText: { color: '#64748B', fontWeight: '600', fontSize: 13 },
  activeChipText: { color: '#FFF' },

  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  txnIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  txnContent: { flex: 1, marginLeft: 12 },
  txnDesc: { fontSize: 15, fontWeight: '600', color: '#282A32', marginBottom: 4 },
  txnMetaRow: { flexDirection: 'row', alignItems: 'center' },
  txnDate: { fontSize: 12, color: '#94A3B8' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
  txnStatusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  txnAmount: { fontSize: 16, fontWeight: '800' },
  
  text_completed: { color: '#10B981' },
  text_pending: { color: '#F59E0B' },
  text_withdrawn: { color: '#EF4444' },
  text_deposit: { color: '#10B981' },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#94A3B8', fontWeight: '500' },
});