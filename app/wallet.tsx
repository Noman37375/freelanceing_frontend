import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus, ArrowUpRight, History, Settings2, CircleDollarSign } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '@/contexts/WalletContext';

const { width } = Dimensions.get('window');

// --- Currency Configuration ---
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, color: '#6366F1' },
  EUR: { symbol: '€', rate: 0.92, color: '#10B981' },
  PKR: { symbol: '₨', rate: 280, color: '#F59E0B' },
};

type CurrencyKey = keyof typeof CURRENCIES;

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
  const [curKey, setCurKey] = useState<CurrencyKey>('USD');
  const [autoReplenish, setAutoReplenish] = useState(autoReplenishSettings.enabled);

  useEffect(() => {
    getTransactionHistory();
  }, []);

  // --- Currency Toggle Logic ---
  const switchCurrency = () => {
    const keys = Object.keys(CURRENCIES) as CurrencyKey[];
    setCurKey(keys[(keys.indexOf(curKey) + 1) % keys.length]);
  };

  const activeRate = CURRENCIES[curKey].rate;
  const activeSymbol = CURRENCIES[curKey].symbol;

  // Format helper for converted values
  const formatVal = (val: number) => 
    (val * activeRate).toLocaleString(undefined, { maximumFractionDigits: 0 });

  // --- Filter & Conversion Memo ---
  const filteredTxns = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesFilter = filter === 'All' || txn.status?.toLowerCase() === filter.toLowerCase();
      const matchesSearch = txn.description?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, search]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Financial Wallet</Text>
        
        <TouchableOpacity style={styles.currencyPill} onPress={switchCurrency}>
          <CircleDollarSign size={16} color={CURRENCIES[curKey].color} />
          <Text style={styles.currencyText}>{curKey}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* MAIN WALLET CARD */}
        <View style={styles.walletCard}>
          <View style={styles.circleBlur} />
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.balanceLabel}>Total Balance ({curKey})</Text>
              <Text style={styles.balanceValue}>
                <Text style={{ color: CURRENCIES[curKey].color }}>{activeSymbol}</Text>
                {formatVal(balance)}
              </Text>
            </View>
            <TouchableOpacity style={styles.settingsBtn}>
               <Settings2 size={20} color="#C7D2FE" />
            </TouchableOpacity>
          </View>

          <View style={styles.walletStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>On Hold</Text>
              <Text style={styles.statValue}>
                {activeSymbol}{formatVal(transactions.filter(t => t.status?.toLowerCase() === 'pending').reduce((sum, t) => sum + (t.amount || 0), 0))}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Lifetime</Text>
              <Text style={styles.statValue}>{activeSymbol}{formatVal(balance + 1250)}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryAction}>
              <Plus size={18} color="#4F46E5" />
              <Text style={styles.primaryActionText}>Add Funds</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction}>
              <ArrowUpRight size={18} color="#FFF" />
              <Text style={styles.secondaryActionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AUTO-REPLENISH */}
        <View style={styles.autoSection}>
          <View style={styles.autoInfo}>
            <View style={styles.autoHeader}>
              <Text style={styles.autoTitle}>Auto-Replenish</Text>
              <View style={[styles.statusIndicator, { backgroundColor: autoReplenish ? '#10B981' : '#94A3B8' }]} />
            </View>
            <Text style={styles.autoDesc}>
              Fill {activeSymbol}{formatVal(autoReplenishSettings.amount)} if balance {'<'} {activeSymbol}{formatVal(autoReplenishSettings.threshold)}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.toggle, { backgroundColor: autoReplenish ? '#4F46E5' : '#E2E8F0' }]}
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
                  <Text style={[styles.txnAmount, { color: txn.type === 'credit' ? '#10B981' : '#1E293B' }]}>
                    {txn.type === 'credit' ? '+' : '-'}{activeSymbol}{formatVal(txn.amount)}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFFFFF',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  backButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
  currencyPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  currencyText: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  
  walletCard: {
    backgroundColor: '#1E1B4B', margin: 20, borderRadius: 28, padding: 24, overflow: 'hidden',
  },
  circleBlur: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#4F46E5', top: -80, right: -60, opacity: 0.2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  balanceLabel: { color: '#C7D2FE', fontSize: 13, fontWeight: '500' },
  balanceValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginTop: 4 },
  settingsBtn: { padding: 4 },
  
  walletStats: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20, padding: 16, marginBottom: 24,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', height: '100%' },
  statLabel: { color: '#94A3B8', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' },
  statValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  
  actionRow: { flexDirection: 'row', gap: 12 },
  primaryAction: { flex: 1, backgroundColor: '#FFFFFF', height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryActionText: { color: '#4F46E5', fontWeight: '800', fontSize: 14 },
  secondaryAction: { flex: 1, backgroundColor: '#4F46E5', height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryActionText: { color: '#FFF', fontWeight: '800', fontSize: 14 },

  autoSection: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, padding: 20, borderRadius: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  autoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  autoTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  statusIndicator: { width: 6, height: 6, borderRadius: 3 },
  autoDesc: { fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: '500' },
  toggle: { width: 42, height: 22, borderRadius: 11, justifyContent: 'center', paddingHorizontal: 2 },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFF' },

  section: { paddingHorizontal: 20, marginTop: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  
  searchWrapper: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderRadius: 16, paddingHorizontal: 15, height: 48,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 
  },
  searchBar: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1E293B' },
  
  filterRow: { marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFF', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  activeChip: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  chipText: { color: '#64748B', fontWeight: '700', fontSize: 12 },
  activeChipText: { color: '#FFF' },

  transactionItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    padding: 14, borderRadius: 18, marginBottom: 10,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  txnIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  txnContent: { flex: 1, marginLeft: 12 },
  txnDesc: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  txnMetaRow: { flexDirection: 'row', alignItems: 'center' },
  txnDate: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 6 },
  txnStatusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  txnAmount: { fontSize: 15, fontWeight: '800' },
  
  text_completed: { color: '#10B981' },
  text_pending: { color: '#F59E0B' },
  text_withdrawn: { color: '#EF4444' },
  text_deposit: { color: '#10B981' },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#94A3B8', fontWeight: '500' },
});