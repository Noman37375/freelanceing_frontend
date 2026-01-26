import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions
} from 'react-native';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ArrowLeft, 
  Plus,
  CircleDollarSign
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- Mock Data ---
const DISPUTES_DATA = [
  { id: '1', clientName: 'Alice Brown', projectTitle: 'Landing Page Design', status: 'Pending', createdDate: 'Dec 12', baseAmount: 500, reason: 'Late payment after milestone completion' },
  { id: '2', clientName: 'Mark Lee', projectTitle: 'Mobile App API', status: 'Resolved', createdDate: 'Dec 08', baseAmount: 1200, reason: 'Scope change without notice' },
  { id: '3', clientName: 'Jane Smith', projectTitle: 'Brand Identity', status: 'Denied', createdDate: 'Dec 05', baseAmount: 300, reason: 'Feedback not applied as per brief' },
];

const CURRENCIES = {
  USD: { symbol: '$', rate: 1, color: '#6366F1' },
  EUR: { symbol: '€', rate: 0.92, color: '#10B981' },
  PKR: { symbol: '₨', rate: 280, color: '#F59E0B' },
};

export default function FDisputes() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [curKey, setCurKey] = useState<keyof typeof CURRENCIES>('USD');

  const switchCurrency = () => {
    const keys = Object.keys(CURRENCIES) as (keyof typeof CURRENCIES)[];
    setCurKey(keys[(keys.indexOf(curKey) + 1) % keys.length]);
  };

  const statusMap = {
    Pending: { color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
    Resolved: { color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 },
    Denied: { color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
  };

  const filteredData = useMemo(() => {
    const list = activeTab === 'All' ? DISPUTES_DATA : DISPUTES_DATA.filter(d => d.status === activeTab);
    return list.map(d => ({
      ...d,
      displayAmount: (d.baseAmount * CURRENCIES[curKey].rate).toLocaleString(),
      currencySymbol: CURRENCIES[curKey].symbol
    }));
  }, [activeTab, curKey]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.glowTop} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#1E293B" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.currencyPill} onPress={switchCurrency}>
            <CircleDollarSign size={16} color={CURRENCIES[curKey].color} />
            <Text style={styles.currencyText}>{curKey}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Dispute Center</Text>
          <Text style={styles.subTitle}>Manage and track your active resolutions</Text>
        </View>

        {/* TABS */}
        <View style={styles.tabWrapper}>
          {['All', 'Pending', 'Resolved'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LIST */}
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {filteredData.map(item => {
            const Config = statusMap[item.status as keyof typeof statusMap];
            return (
              <TouchableOpacity 
                key={item.id} 
                style={styles.glassCard} 
                activeOpacity={0.9}
                // RESTORED NAVIGATION LOGIC HERE
                onPress={() => router.push({
                  pathname: '/FDisputeDetail' as any,
                  params: { dispute: JSON.stringify({
                    ...item,
                    amount: `${item.currencySymbol}${item.displayAmount}`
                  }) },
                })}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.statusSquircle, { backgroundColor: Config.bg }]}>
                    <Config.icon size={18} color={Config.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.projectText}>{item.projectTitle}</Text>
                    <Text style={styles.clientText}>{item.clientName} • {item.createdDate}</Text>
                  </View>
                  <View style={styles.amountBox}>
                    <Text style={styles.currencySymbol}>{item.currencySymbol}</Text>
                    <Text style={styles.amountText}>{item.displayAmount}</Text>
                  </View>
                </View>
                
                <View style={styles.cardFooter}>
                  <View style={styles.statusBadge}>
                    <View style={[styles.dot, { backgroundColor: Config.color }]} />
                    <Text style={[styles.statusLabel, { color: Config.color }]}>{item.status}</Text>
                  </View>
                  <ChevronRight size={16} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/FCreateDispute')}
      >
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: width + 100,
    height: 400,
    backgroundColor: '#EEF2FF',
    borderRadius: 200,
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  currencyText: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  titleSection: { paddingHorizontal: 24, marginTop: 20 },
  mainTitle: { fontSize: 32, fontWeight: '900', color: '#1E293B', letterSpacing: -1 },
  subTitle: { fontSize: 15, color: '#64748B', marginTop: 4, fontWeight: '500' },
  tabWrapper: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 25, gap: 12 },
  tab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, backgroundColor: '#F8FAFC' },
  tabActive: { backgroundColor: '#1E293B' },
  tabText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#FFF' },
  listContainer: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 },
  glassCard: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1E293B', shadowOpacity: 0.08, shadowRadius: 20,
  },
  cardHeader: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  statusSquircle: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  projectText: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  clientText: { fontSize: 13, color: '#94A3B8', marginTop: 2, fontWeight: '600' },
  amountBox: { alignItems: 'flex-end' },
  currencySymbol: { fontSize: 12, fontWeight: '800', color: '#6366F1' },
  amountText: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  cardFooter: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F8FAFC'
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  fab: {
    position: 'absolute', bottom: 30, right: 24, width: 64, height: 64, 
    borderRadius: 22, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center',
  }
});