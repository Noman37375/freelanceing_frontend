import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { ArrowLeft, User, Calendar, Globe, ShieldAlert, CheckCircle2, XCircle, Clock, MessageSquare, ChevronDown } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Currency Configuration
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, label: 'USD', locale: 'en-US' },
  PKR: { symbol: 'Rs.', rate: 280.50, label: 'PKR', locale: 'en-PK' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR', locale: 'de-DE' },
};

export default function DisputeDetail() {
  const router = useRouter();
  const { disputeData } = useLocalSearchParams<{ disputeData: string }>();
  const [activeCurrency, setActiveCurrency] = useState(CURRENCIES.USD);

  // Parse the incoming stringified object
  const dispute = disputeData ? JSON.parse(disputeData) : null;

  if (!dispute) {
    return (
      <View style={styles.container}><Text>Case data not found.</Text></View>
    );
  }

  // Format amount based on selected currency
  const formatDisputedAmount = (baseUsd: string) => {
    const num = parseFloat(baseUsd.replace(/[^0-9.]/g, ''));
    const converted = num * activeCurrency.rate;
    return converted.toLocaleString(activeCurrency.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const cycleCurrency = () => {
    if (activeCurrency.label === 'USD') setActiveCurrency(CURRENCIES.PKR);
    else if (activeCurrency.label === 'PKR') setActiveCurrency(CURRENCIES.EUR);
    else setActiveCurrency(CURRENCIES.USD);
  };

  const getStatusTheme = () => {
    switch (dispute.status) {
      case 'Pending': return { color: '#F59E0B', bg: '#FFFBEB', icon: <Clock size={24} color="#F59E0B" /> };
      case 'Resolved': return { color: '#10B981', bg: '#ECFDF5', icon: <CheckCircle2 size={24} color="#10B981" /> };
      case 'Denied': return { color: '#EF4444', bg: '#FEF2F2', icon: <XCircle size={24} color="#EF4444" /> };
      default: return { color: '#64748B', bg: '#F1F5F9', icon: <Clock size={24} color="#64748B" /> };
    }
  };

  const theme = getStatusTheme();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Case #{dispute.id || 'N/A'}</Text>
        
        <TouchableOpacity style={styles.currencyBadge} onPress={cycleCurrency}>
          <Globe size={12} color="#6366F1" />
          <Text style={styles.currencyText}>{activeCurrency.label}</Text>
          <ChevronDown size={12} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* STATUS BANNER */}
        <View style={[styles.statusBanner, { backgroundColor: theme.bg }]}>
          {theme.icon}
          <View>
            <Text style={[styles.statusLabel, { color: theme.color }]}>{dispute.status.toUpperCase()}</Text>
            <Text style={styles.statusSub}>Final Decision by System Admin</Text>
          </View>
        </View>

        {/* FINANCIAL SUMMARY CARD */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.amountCard}>
          <Text style={styles.amountLabel}>DISPUTED AMOUNT</Text>
          <Text style={styles.amountValue}>
            <Text style={styles.symbol}>{activeCurrency.symbol}</Text> 
            {formatDisputedAmount(dispute.amount)}
          </Text>
          <View style={styles.caseSafety}>
            <ShieldAlert size={14} color="#6366F1" />
            <Text style={styles.safetyText}>Funds held securely in Escrow</Text>
          </View>
        </LinearGradient>

        {/* CASE DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PROJECT INFORMATION</Text>
          <View style={styles.detailBox}>
            <Text style={styles.projectTitle}>{dispute.projectTitle}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <User size={16} color="#94A3B8" />
                <Text style={styles.metaText}>{dispute.clientName}</Text>
              </View>
              <View style={styles.metaItem}>
                <Calendar size={16} color="#94A3B8" />
                <Text style={styles.metaText}>{dispute.createdDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* DISPUTE REASON */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REASON & EVIDENCE</Text>
          <View style={styles.reasonBox}>
            <Text style={styles.reasonTitle}>{dispute.reason}</Text>
            <Text style={styles.reasonBody}>
              {dispute.description || "The user has initiated this dispute regarding milestone fulfillment. Admin review of chat logs and deliverables is required."}
            </Text>
          </View>
        </View>

        {/* ADMIN RESOLUTION LOG */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ADMIN RESOLUTION</Text>
          <View style={styles.adminBox}>
            <View style={styles.adminIndicator} />
            <Text style={styles.adminText}>
              {dispute.status === 'Pending' 
                ? "Our legal team is currently reviewing the project deliverables and communication history. Expect an update within 48 hours."
                : dispute.status === 'Resolved'
                ? "Dispute resolved. The evidence provided supports the claim. Funds have been credited to your wallet in full."
                : "Dispute denied. Evidence indicates the contract terms were not met by the claimant."
              }
            </Text>
          </View>
        </View>

        {/* ACTION BUTTON */}
        <TouchableOpacity style={styles.supportBtn} activeOpacity={0.8}>
          <MessageSquare size={20} color="#FFF" />
          <Text style={styles.supportBtnText}>Appeal or Contact Support</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  
  currencyBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 10, 
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  currencyText: { fontSize: 12, fontWeight: '800', color: '#1E293B' },

  content: { flex: 1 },
  
  statusBanner: {
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 15
  },
  statusLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  statusSub: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 2 },

  amountCard: { marginHorizontal: 20, padding: 24, borderRadius: 28 },
  amountLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
  amountValue: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  symbol: { color: '#6366F1' },
  caseSafety: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  safetyText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 12 },
  
  detailBox: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  projectTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: '#64748B', fontWeight: '600' },

  reasonBox: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  reasonTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  reasonBody: { fontSize: 14, color: '#64748B', lineHeight: 22, fontWeight: '500' },

  adminBox: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 20, borderRadius: 20 },
  adminIndicator: { width: 4, backgroundColor: '#6366F1', borderRadius: 2, marginRight: 15 },
  adminText: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 22, fontWeight: '500' },

  supportBtn: { 
    margin: 20, 
    marginTop: 30,
    height: 56, 
    backgroundColor: '#1E293B', 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10 
  },
  supportBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});