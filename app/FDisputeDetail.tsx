import React, { useState } from 'react';
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
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  User, 
  Briefcase, 
  FileText,
  CircleDollarSign,
  Headphones
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Keep config consistent with the main list
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, color: '#6366F1' },
  EUR: { symbol: '€', rate: 0.92, color: '#10B981' },
  PKR: { symbol: '₨', rate: 280, color: '#F59E0B' },
};

type CurrencyKey = keyof typeof CURRENCIES;

export default function FDisputeDetail() {
  const router = useRouter();
  const { dispute } = useLocalSearchParams<{ dispute: string }>();
  const parsedDispute = dispute ? JSON.parse(dispute) : null;

  // State for internal conversion
  const [curKey, setCurKey] = useState<CurrencyKey>('USD');

  if (!parsedDispute) return (
    <View style={styles.container}><Text>No dispute data found!</Text></View>
  );

  const { clientName, projectTitle, reason, status, createdDate, baseAmount, id } = parsedDispute;

  // Logic to switch currency locally
  const switchCurrency = () => {
    const keys = Object.keys(CURRENCIES) as CurrencyKey[];
    setCurKey(keys[(keys.indexOf(curKey) + 1) % keys.length]);
  };

  // Calculate the converted value based on baseAmount
  const displayAmount = (baseAmount * CURRENCIES[curKey].rate).toLocaleString();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pending': return { color: '#F59E0B', bg: '#FFFBEB', icon: Clock };
      case 'Resolved': return { color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 };
      case 'Denied': return { color: '#EF4444', bg: '#FEF2F2', icon: XCircle };
      default: return { color: '#64748B', bg: '#F8FAFC', icon: Clock };
    }
  };

  const Config = getStatusConfig(status);

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
          
          <Text style={styles.headerTitle}>Case Details</Text>

          {/* ADDED CURRENCY PILL HERE */}
          <TouchableOpacity style={styles.currencyPill} onPress={switchCurrency}>
            <CircleDollarSign size={16} color={CURRENCIES[curKey].color} />
            <Text style={styles.currencyText}>{curKey}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* STATUS HERO */}
          <View style={[styles.statusHero, { backgroundColor: Config.bg }]}>
            <View style={styles.squircleIcon}>
              <Config.icon size={28} color={Config.color} />
            </View>
            <Text style={[styles.statusMainText, { color: Config.color }]}>
              {status} Dispute
            </Text>
            <Text style={styles.refText}>CASE ID: #DISP-{id || '001'}</Text>
          </View>

          {/* MAIN INFO CARD */}
          <View style={styles.glassCard}>
            <Text style={styles.cardLabel}>Financial Overview</Text>
            
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>EXPECTED SETTLEMENT ({curKey})</Text>
              <Text style={styles.amountValue}>
                <Text style={{ color: CURRENCIES[curKey].color }}>{CURRENCIES[curKey].symbol}</Text>
                {displayAmount}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconBox}><Briefcase size={18} color="#6366F1" /></View>
              <View>
                <Text style={styles.rowLabel}>PROJECT</Text>
                <Text style={styles.rowValue}>{projectTitle}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}><User size={18} color="#6366F1" /></View>
              <View>
                <Text style={styles.rowLabel}>CLIENT</Text>
                <Text style={styles.rowValue}>{clientName}</Text>
              </View>
            </View>
          </View>

          {/* REASON CARD */}
          <View style={styles.glassCard}>
            <View style={styles.reasonHeader}>
              <FileText size={18} color="#6366F1" />
              <Text style={styles.cardLabel}>Reasoning</Text>
            </View>
            <Text style={styles.reasonBody}>{reason}</Text>
          </View>

          {/* SUPPORT ACTION */}
          <TouchableOpacity style={styles.actionButton}>
            <Headphones size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Speak with Arbitrator</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  glowTop: {
    position: 'absolute', top: -120, left: -50, width: width + 100, height: 400,
    backgroundColor: '#EEF2FF', borderRadius: 200, opacity: 0.6,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 12,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  currencyPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  currencyText: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },

  statusHero: {
    borderRadius: 30, padding: 30, alignItems: 'center', marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
  },
  squircleIcon: {
    width: 60, height: 60, borderRadius: 22, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
  },
  statusMainText: { fontSize: 22, fontWeight: '900', marginBottom: 6 },
  refText: { fontSize: 11, color: '#94A3B8', fontWeight: '800', letterSpacing: 1 },

  glassCard: {
    backgroundColor: '#FFF', borderRadius: 28, padding: 24, marginBottom: 20,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#1E293B', shadowOpacity: 0.06, shadowRadius: 20,
  },
  cardLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  
  amountContainer: { alignItems: 'center', paddingBottom: 20 },
  amountLabel: { fontSize: 10, fontWeight: '800', color: '#6366F1', marginBottom: 4 },
  amountValue: { fontSize: 36, fontWeight: '900', color: '#1E293B' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F7FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  rowLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginBottom: 2 },
  rowValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },

  reasonHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reasonBody: { fontSize: 15, color: '#64748B', lineHeight: 24, fontWeight: '500' },

  actionButton: {
    backgroundColor: '#1E293B', flexDirection: 'row', padding: 20, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 10,
  },
  actionButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});