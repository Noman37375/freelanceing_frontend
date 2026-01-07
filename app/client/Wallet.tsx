import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, Lock, Clock, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const WALLET_BALANCE = {
  available: 5420.50,
  escrow: 3200.00,
  total: 8620.50,
};

const TRANSACTIONS = [
  { id: '1', type: 'escrow' as const, title: 'Mobile App UI/UX Design', amount: -2500.00, date: 'Dec 12, 2025', status: 'locked' },
  { id: '2', type: 'payment' as const, title: 'Logo Design & Branding', amount: -800.00, date: 'Dec 10, 2025', status: 'completed' },
  { id: '3', type: 'deposit' as const, title: 'Wallet Top-up', amount: 5000.00, date: 'Dec 8, 2025', status: 'completed' },
  { id: '4', type: 'escrow' as const, title: 'E-commerce Website Development', amount: -700.00, date: 'Dec 5, 2025', status: 'locked' },
];

export default function Wallet() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 40 }} /> {/* Placeholder for spacing */}
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <WalletIcon size={32} color="#3B82F6" strokeWidth={2} />
          <Text style={styles.balanceLabel}>Total Balance</Text>
        </View>
        <Text style={styles.balanceAmount}>${WALLET_BALANCE.total.toFixed(2)}</Text>

        <View style={styles.balanceBreakdown}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Available</Text>
            <Text style={styles.breakdownAmount}>${WALLET_BALANCE.available.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>In Escrow</Text>
            <Text style={[styles.breakdownAmount, styles.escrowAmount]}>${WALLET_BALANCE.escrow.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <ArrowDownToLine size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.primaryButtonText}>Add Funds</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <ArrowUpFromLine size={20} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.secondaryButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {TRANSACTIONS.map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View style={styles.transactionIcon}>
              {transaction.type === 'escrow' && <Lock size={20} color="#F59E0B" strokeWidth={2} />}
              {transaction.type === 'payment' && <ArrowUpFromLine size={20} color="#EF4444" strokeWidth={2} />}
              {transaction.type === 'deposit' && <ArrowDownToLine size={20} color="#10B981" strokeWidth={2} />}
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{transaction.title}</Text>
              <View style={styles.transactionMeta}>
                <Clock size={12} color="#6B7280" strokeWidth={2} />
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[styles.transactionAmount, transaction.amount > 0 ? styles.positiveAmount : styles.negativeAmount]}>
                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
              </Text>
              {transaction.status === 'locked' && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Locked</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Lock size={20} color="#3B82F6" strokeWidth={2} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>About Escrow</Text>
          <Text style={styles.infoText}>
            Funds in escrow are held securely until project milestones are completed and approved.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  balanceCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  balanceLabel: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  balanceAmount: { fontSize: 40, fontWeight: '700', color: '#1F2937', marginBottom: 20 },
  balanceBreakdown: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 20 },
  breakdownItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: '#E5E7EB' },
  breakdownLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
  breakdownAmount: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  escrowAmount: { color: '#F59E0B' },
  actionButtons: { flexDirection: 'row', gap: 12 },
  primaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 10 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EFF6FF', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#3B82F6' },
  secondaryButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  transactionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transactionInfo: { flex: 1 },
  transactionTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  transactionMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  transactionDate: { fontSize: 12, color: '#6B7280' },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  positiveAmount: { color: '#10B981' },
  negativeAmount: { color: '#1F2937' },
  statusBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, color: '#F59E0B', fontWeight: '600' },
  infoBox: { flexDirection: 'row', margin: 20, marginTop: 0, padding: 16, backgroundColor: '#EFF6FF', borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  infoContent: { flex: 1, marginLeft: 12 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
});
