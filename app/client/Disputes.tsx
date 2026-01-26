import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Clock, CheckCircle2, XCircle, ChevronRight, ArrowLeft, Plus, AlertCircle, ShieldAlert, Coins } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Centralized Currency Config
const CURRENCIES = [
  { id: 'USD', label: 'USD', symbol: '$', rate: 1, locale: 'en-US' },
  { id: 'PKR', label: 'PKR', symbol: 'Rs', rate: 280.50, locale: 'en-PK' },
  { id: 'EUR', label: 'EUR', symbol: '€', rate: 0.92, locale: 'de-DE' },
];

export interface Dispute {
  id: string;
  clientName: string;
  projectTitle: string;
  reason: string;
  status: 'Pending' | 'Resolved' | 'Denied';
  createdDate: string;
  amount: string;
  description?: string;
}

const DISPUTES_DATA: Dispute[] = [
  { 
    id: '1', 
    clientName: 'Alice Brown', 
    projectTitle: 'Landing Page Design', 
    reason: 'Milestone payment delay', 
    status: 'Pending', 
    createdDate: 'Jan 22, 2026', 
    amount: '500',
    description: 'The client has not released the payment even though the work was approved.' 
  },
  { 
    id: '2', 
    clientName: 'Mark Lee', 
    projectTitle: 'React Native App', 
    reason: 'Uncompensated scope change', 
    status: 'Resolved', 
    createdDate: 'Jan 10, 2026', 
    amount: '1200',
    description: 'Additional features were requested outside of the initial contract.'
  },
  { 
    id: '3', 
    clientName: 'Jane Smith', 
    projectTitle: 'Logo Design', 
    reason: 'False revision claims', 
    status: 'Denied', 
    createdDate: 'Jan 05, 2026', 
    amount: '300',
    description: 'Client claimed feedback wasn’t followed, but logs prove otherwise.'
  },
];

export default function Disputes() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<Dispute['status']>('Pending');
  
  // Currency Toggle Logic
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const activeCurrency = CURRENCIES[currencyIndex];

  const toggleCurrency = () => {
    setCurrencyIndex((prev) => (prev + 1) % CURRENCIES.length);
  };

  const formatPrice = (usdBase: string) => {
    const amount = parseFloat(usdBase);
    const converted = amount * activeCurrency.rate;
    return `${activeCurrency.symbol}${converted.toLocaleString(activeCurrency.locale, { 
      maximumFractionDigits: 0 
    })}`;
  };

  const getStatusTheme = (status: Dispute['status']) => {
    switch (status) {
      case 'Pending': return { color: '#F59E0B', bg: '#FFFBEB', icon: <Clock size={16} color="#F59E0B" strokeWidth={2.5} /> };
      case 'Resolved': return { color: '#10B981', bg: '#ECFDF5', icon: <CheckCircle2 size={16} color="#10B981" strokeWidth={2.5} /> };
      case 'Denied': return { color: '#EF4444', bg: '#FEF2F2', icon: <XCircle size={16} color="#EF4444" strokeWidth={2.5} /> };
    }
  };

  const filteredDisputes = DISPUTES_DATA.filter(d => d.status === selectedTab);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#1E293B" strokeWidth={2.5} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.currencyToggle} onPress={toggleCurrency}>
            <Coins size={16} color="#6366F1" />
            <Text style={styles.currencyText}>{activeCurrency.id}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>Resolution</Text>

        <TouchableOpacity 
          style={styles.plusBtn}
          onPress={() => router.push('/client/AddDispute')}
        >
          <Plus size={22} color="#6366F1" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.infoCard}>
          <View style={styles.infoLeft}>
            <ShieldAlert size={32} color="#6366F1" />
            <View>
              <Text style={styles.infoTitle}>Protected by Escrow</Text>
              <Text style={styles.infoSub}>Mediation in {activeCurrency.id}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* TAB SELECTOR */}
        <View style={styles.tabContainer}>
          {(['Pending', 'Resolved', 'Denied'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
              {selectedTab === tab && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* LIST */}
        <View style={styles.listWrapper}>
          {filteredDisputes.length === 0 ? (
            <View style={styles.emptyState}>
              <AlertCircle size={48} color="#E2E8F0" />
              <Text style={styles.emptyText}>No {selectedTab} disputes found.</Text>
            </View>
          ) : (
            filteredDisputes.map((dispute) => {
              const theme = getStatusTheme(dispute.status);
              return (
                <TouchableOpacity 
                  key={dispute.id} 
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/client/DisputeDetail',
                    params: { disputeData: JSON.stringify(dispute) },
                  })}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectLabel}>PROJECT CASE</Text>
                      <Text style={styles.projectTitle}>{dispute.projectTitle}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: theme.bg }]}>
                      {theme.icon}
                      <Text style={[styles.statusText, { color: theme.color }]}>{dispute.status}</Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardDetails}>
                    <View>
                      <Text style={styles.detailLabel}>Opposing Party</Text>
                      <Text style={styles.detailValue}>{dispute.clientName}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.detailLabel}>Disputed Amount</Text>
                      <Text style={styles.amountValue}>{formatPrice(dispute.amount)}</Text>
                    </View>
                  </View>

                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonText} numberOfLines={1}>
                      <Text style={{fontWeight: '900', color: '#64748B'}}>ISSUE: </Text>
                      {dispute.reason}
                    </Text>
                    <ChevronRight size={16} color="#CBD5E1" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  currencyToggle: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EEF2FF', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 10, 
    gap: 5,
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  currencyText: { fontSize: 12, fontWeight: '800', color: '#6366F1' },
  plusBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },

  content: { flex: 1 },
  infoCard: { margin: 24, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  infoTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  infoSub: { color: '#94A3B8', fontSize: 12, fontWeight: '500', marginTop: 2 },

  tabContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 20, gap: 25 },
  tab: { paddingVertical: 8, position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  tabTextActive: { color: '#6366F1' },
  activeIndicator: { position: 'absolute', bottom: -4, left: 0, right: 0, height: 3, backgroundColor: '#6366F1', borderRadius: 2 },

  listWrapper: { paddingHorizontal: 24, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  projectLabel: { fontSize: 10, fontWeight: '900', color: '#94A3B8' },
  projectTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '800' },
  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },
  cardDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  detailLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#475569' },
  amountValue: { fontSize: 15, fontWeight: '900', color: '#1E293B' },
  reasonBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 },
  reasonText: { fontSize: 13, color: '#64748B', flex: 1 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, fontSize: 14, color: '#94A3B8', fontWeight: '600' }
});