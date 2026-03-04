import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ArrowLeft, TrendingUp, Calendar, Lock, DollarSign } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '@/contexts/WalletContext';

const SCREEN_W = Dimensions.get('window').width;

function getLastNMonths(n: number) {
  const result: { label: string; year: number; month: number }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return result;
}

export default function EarningsScreen() {
  const router = useRouter();
  const { transactions, escrowBalance, isLoading } = useWallet();

  // Payments credited to this freelancer
  const earnedTxns = useMemo(
    () => transactions.filter((t) => t.type === 'payment' && t.status === 'completed'),
    [transactions]
  );

  const totalEarned = useMemo(
    () => earnedTxns.reduce((sum, t) => sum + Number(t.amount), 0),
    [earnedTxns]
  );

  const last6 = useMemo(() => getLastNMonths(6), []);

  const monthlyTotals = useMemo(
    () =>
      last6.map(({ year, month }) =>
        earnedTxns
          .filter((t) => {
            const d = new Date(t.createdAt);
            return d.getFullYear() === year && d.getMonth() === month;
          })
          .reduce((sum, t) => sum + Number(t.amount), 0)
      ),
    [earnedTxns, last6]
  );

  const activeMonths = last6.filter((_, i) => monthlyTotals[i] > 0).length || 1;
  const avgMonthly = totalEarned / activeMonths;

  // Per-project breakdown
  const byProject = useMemo(() => {
    const map: Record<string, { title: string; total: number; count: number }> = {};
    earnedTxns.forEach((t) => {
      const key = t.projectId || 'other';
      if (!map[key]) {
        map[key] = { title: t.project?.title || 'Direct Payment', total: 0, count: 0 };
      }
      map[key].total += Number(t.amount);
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [earnedTxns]);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#282A32" />
      </View>
    );
  }

  // Chart requires at least one non-zero value
  const hasData = monthlyTotals.some((v) => v > 0);
  const chartData = hasData ? monthlyTotals : monthlyTotals.map(() => 0.01);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color="#444751" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── HERO CARD ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroInfo}>
            <Text style={styles.heroLabel}>Total Earned</Text>
            <Text style={styles.heroValue}>
              ${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.trendBadge}>
              <TrendingUp size={14} color="#10B981" />
              <Text style={styles.trendText}>
                {earnedTxns.length} payment{earnedTxns.length !== 1 ? 's' : ''} received
              </Text>
            </View>
          </View>
          <View style={styles.avgContainer}>
            <Text style={styles.avgLabel}>Avg / Month</Text>
            <Text style={styles.avgValue}>
              ${avgMonthly.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

        {/* ── ESCROW PENDING ── */}
        {escrowBalance > 0 && (
          <View style={styles.escrowCard}>
            <Lock size={18} color="#0891B2" />
            <View style={styles.escrowInfo}>
              <Text style={styles.escrowTitle}>Pending in Escrow</Text>
              <Text style={styles.escrowSub}>Released when milestones are approved</Text>
            </View>
            <Text style={styles.escrowAmount}>
              ${escrowBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        )}

        {/* ── CHART ── */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Revenue — Last 6 Months</Text>
            <Calendar size={18} color="#94A3B8" />
          </View>
          <LineChart
            data={{
              labels: last6.map((m) => m.label),
              datasets: [{ data: chartData }],
            }}
            width={SCREEN_W - 40}
            height={200}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#282A32' },
              propsForBackgroundLines: { strokeDasharray: '', stroke: '#F1F5F9' },
            }}
            bezier
            style={styles.chart}
            withInnerLines
            withOuterLines={false}
          />
        </View>

        {/* ── BY PROJECT ── */}
        <View style={styles.listContainer}>
          <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>
            {byProject.length > 0 ? 'By Project' : 'No earnings yet'}
          </Text>

          {byProject.length === 0 ? (
            <View style={styles.emptyBox}>
              <DollarSign size={32} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                Approved milestone payments will appear here
              </Text>
            </View>
          ) : (
            byProject.map((p, i) => (
              <View key={i} style={styles.projectRow}>
                <View style={styles.projectIcon}>
                  <Text style={styles.projectInitial}>{p.title[0].toUpperCase()}</Text>
                </View>
                <View style={styles.projectDetails}>
                  <Text style={styles.projectName} numberOfLines={1}>{p.title}</Text>
                  <Text style={styles.projectSub}>
                    {p.count} milestone{p.count !== 1 ? 's' : ''} released
                  </Text>
                </View>
                <Text style={styles.projectAmount}>
                  ${p.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* ── RECENT PAYMENTS ── */}
        {earnedTxns.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Recent Payments</Text>
            {earnedTxns.slice(0, 10).map((txn, i) => (
              <View key={txn.id ?? i} style={styles.txnRow}>
                <View style={styles.txnIconWrap}>
                  <DollarSign size={16} color="#10B981" />
                </View>
                <View style={styles.txnContent}>
                  <Text style={styles.txnDesc} numberOfLines={1}>
                    {txn.description || txn.project?.title || 'Payment'}
                  </Text>
                  <Text style={styles.txnDate}>
                    {new Date(txn.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={styles.txnAmount}>+${Number(txn.amount).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
  },
  backButton: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 8,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#444751' },

  // Hero
  heroCard: {
    backgroundColor: '#1E1B4B', margin: 20, borderRadius: 24, padding: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  heroInfo: { flex: 1 },
  heroLabel: { color: '#C7D2FE', fontSize: 14, fontWeight: '500' },
  heroValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginVertical: 4 },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
    alignSelf: 'flex-start',
  },
  trendText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  avgContainer: { alignItems: 'flex-end' },
  avgLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  avgValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 2 },

  // Escrow card
  escrowCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0F9FF', marginHorizontal: 20, marginBottom: 4,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#BAE6FD',
  },
  escrowInfo: { flex: 1, marginLeft: 12 },
  escrowTitle: { fontSize: 14, fontWeight: '700', color: '#0C4A6E' },
  escrowSub: { fontSize: 12, color: '#0891B2', marginTop: 2 },
  escrowAmount: { fontSize: 16, fontWeight: '800', color: '#0C4A6E' },

  // Chart
  chartCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: 20,
    borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#444751' },
  chart: { marginLeft: -20, borderRadius: 16 },

  // By project
  listContainer: { paddingHorizontal: 20, marginTop: 28 },
  emptyBox: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '500', textAlign: 'center' },

  projectRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9',
  },
  projectIcon: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
  },
  projectInitial: { color: '#4F46E5', fontWeight: '800', fontSize: 16 },
  projectDetails: { flex: 1, marginLeft: 12 },
  projectName: { fontSize: 15, fontWeight: '700', color: '#282A32' },
  projectSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  projectAmount: { fontSize: 16, fontWeight: '800', color: '#10B981' },

  // Recent payments
  txnRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9',
  },
  txnIconWrap: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#F0FDF4',
    justifyContent: 'center', alignItems: 'center',
  },
  txnContent: { flex: 1, marginLeft: 12 },
  txnDesc: { fontSize: 14, fontWeight: '600', color: '#282A32' },
  txnDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  txnAmount: { fontSize: 15, fontWeight: '800', color: '#10B981' },
});
