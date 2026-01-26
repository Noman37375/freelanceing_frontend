import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, Lock, Clock, ArrowLeft, ShieldCheck, ChevronDown, Globe } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// 1. Currency Configuration (Mock Rates based on 1 USD)
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, label: 'USD', locale: 'en-US' },
  PKR: { symbol: 'Rs.', rate: 280.50, label: 'PKR', locale: 'en-PK' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR', locale: 'de-DE' },
};

const WALLET_BALANCE = {
  available: 5420.50,
  escrow: 3200.00,
  total: 8620.50,
};

const TRANSACTIONS = [
  { id: '1', type: 'escrow', title: 'Mobile App UI/UX Design', amount: -2500.00, date: 'Jan 22, 2026', status: 'locked' },
  { id: '2', type: 'payment', title: 'Logo Design & Branding', amount: -800.00, date: 'Jan 20, 2026', status: 'completed' },
  { id: '3', type: 'deposit', title: 'Wallet Top-up', amount: 5000.00, date: 'Jan 18, 2026', status: 'completed' },
  { id: '4', type: 'escrow', title: 'E-commerce Website', amount: -700.00, date: 'Jan 15, 2026', status: 'locked' },
];

export default function Wallet() {
  const router = useRouter();
  const [activeCurrency, setActiveCurrency] = useState(CURRENCIES.USD);

  // Helper to format currency values dynamically
  const formatMoney = (val: number) => {
    const converted = val * activeCurrency.rate;
    return converted.toLocaleString(activeCurrency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const cycleCurrency = () => {
    if (activeCurrency.label === 'USD') setActiveCurrency(CURRENCIES.PKR);
    else if (activeCurrency.label === 'PKR') setActiveCurrency(CURRENCIES.EUR);
    else setActiveCurrency(CURRENCIES.USD);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financials</Text>
        <TouchableOpacity style={styles.notificationBtn}>
           <ShieldCheck size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* MAIN BALANCE CARD */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>TOTAL CAPITAL</Text>
            
            <TouchableOpacity style={styles.currencyPicker} onPress={cycleCurrency}>
              <Globe size={12} color="#6366F1" />
              <Text style={styles.currencyText}>{activeCurrency.label}</Text>
              <ChevronDown size={12} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.totalAmount}>
            <Text style={styles.currencySymbol}>{activeCurrency.symbol} </Text>
            {formatMoney(WALLET_BALANCE.total)}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Available</Text>
              <Text style={styles.statValue}>{activeCurrency.symbol}{formatMoney(WALLET_BALANCE.available)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>In Escrow</Text>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {activeCurrency.symbol}{formatMoney(WALLET_BALANCE.escrow)}
              </Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.primaryBtn}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.btnGradient}>
                <ArrowDownToLine size={18} color="#FFF" strokeWidth={3} />
                <Text style={styles.primaryBtnText}>Add Funds</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryBtn}>
              <ArrowUpFromLine size={18} color="#FFF" />
              <Text style={styles.secondaryBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* TRANSACTION LEDGER */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction Ledger</Text>
            <TouchableOpacity><Text style={styles.filterText}>Filter</Text></TouchableOpacity>
          </View>

          {TRANSACTIONS.map((t) => (
            <TouchableOpacity key={t.id} style={styles.tCard} activeOpacity={0.7}>
              <View style={[styles.tIconBox, 
                t.type === 'deposit' ? {backgroundColor: '#ECFDF5'} : 
                t.type === 'escrow' ? {backgroundColor: '#FFFBEB'} : {backgroundColor: '#F1F5F9'}
              ]}>
                {t.type === 'escrow' && <Lock size={18} color="#F59E0B" />}
                {t.type === 'payment' && <ArrowUpFromLine size={18} color="#64748B" />}
                {t.type === 'deposit' && <ArrowDownToLine size={18} color="#10B981" />}
              </View>

              <View style={styles.tInfo}>
                <Text style={styles.tTitle} numberOfLines={1}>{t.title}</Text>
                <View style={styles.tMetaRow}>
                  <Clock size={10} color="#94A3B8" />
                  <Text style={styles.tDate}>{t.date}</Text>
                </View>
              </View>

              <View style={styles.tRight}>
                <Text style={[styles.tAmount, t.amount > 0 ? styles.pos : styles.neg]}>
                  {t.amount > 0 ? '+' : '-'}{activeCurrency.symbol}{formatMoney(Math.abs(t.amount))}
                </Text>
                {t.status === 'locked' && (
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockText}>Escrowed</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* INFO BOX */}
        <View style={styles.infoFooter}>
           <View style={styles.infoInner}>
              <ShieldCheck size={20} color="#6366F1" />
              <View style={{flex: 1}}>
                <Text style={styles.infoTitle}>Secure Milestone Payments</Text>
                <Text style={styles.infoText}>
                  Your funds are converted at real-time rates. Escrowed funds are released only after you approve the freelancer's work.
                </Text>
              </View>
           </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9'
  },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  notificationBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },

  scrollView: { flex: 1 },
  mainCard: { margin: 24, borderRadius: 32, padding: 24, shadowColor: '#1E293B', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardLabel: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5 },
  
  currencyPicker: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  currencyText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  totalAmount: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 24 },
  currencySymbol: { color: '#6366F1', fontSize: 22 },

  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 16, marginBottom: 24 },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '800', color: '#FFF' },

  cardActions: { flexDirection: 'row', gap: 12 },
  primaryBtn: { flex: 1.3, height: 54, borderRadius: 16, overflow: 'hidden' },
  btnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  secondaryBtn: { flex: 1, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  section: { paddingHorizontal: 24, marginTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  filterText: { fontSize: 14, color: '#6366F1', fontWeight: '700' },

  tCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  tIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  tInfo: { flex: 1, marginLeft: 16 },
  tTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  tMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tDate: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  tRight: { alignItems: 'flex-end' },
  tAmount: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  pos: { color: '#10B981' },
  neg: { color: '#1E293B' },
  lockBadge: { backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  lockText: { fontSize: 10, color: '#D97706', fontWeight: '800', textTransform: 'uppercase' },

  infoFooter: { padding: 24, paddingBottom: 50 },
  infoInner: { flexDirection: 'row', backgroundColor: '#F0F9FF', padding: 20, borderRadius: 24, gap: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#BAE6FD' },
  infoTitle: { fontSize: 14, fontWeight: '800', color: '#0369A1', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#075985', lineHeight: 18, fontWeight: '500' }
});