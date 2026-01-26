import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ArrowLeft, TrendingUp, Calendar, ArrowUpRight, CircleDollarSign } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// --- Configuration ---
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, color: '#6366F1' },
  EUR: { symbol: '€', rate: 0.92, color: '#10B981' },
  PKR: { symbol: '₨', rate: 280, color: '#F59E0B' },
};

type CurrencyKey = keyof typeof CURRENCIES;

export default function EarningsScreen() {
  const router = useRouter();
  const [curKey, setCurKey] = useState<CurrencyKey>('USD');

  const rawEarnings = [
    { month: 'Jan', amount: 1200 }, { month: 'Feb', amount: 1500 },
    { month: 'Mar', amount: 1000 }, { month: 'Apr', amount: 1700 },
    { month: 'May', amount: 2000 }, { month: 'Jun', amount: 1800 },
    { month: 'Jul', amount: 2200 }, { month: 'Aug', amount: 2100 },
    { month: 'Sep', amount: 2300 }, { month: 'Oct', amount: 2500 },
    { month: 'Nov', amount: 2400 }, { month: 'Dec', amount: 2600 },
  ];

  // --- Conversion Logic ---
  const switchCurrency = () => {
    const keys = Object.keys(CURRENCIES) as CurrencyKey[];
    setCurKey(keys[(keys.indexOf(curKey) + 1) % keys.length]);
  };

  const convertedData = useMemo(() => {
    const rate = CURRENCIES[curKey].rate;
    return rawEarnings.map(item => ({
      ...item,
      convertedAmount: item.amount * rate
    }));
  }, [curKey]);

  const totals = convertedData.map((e) => e.convertedAmount);
  const totalEarnings = totals.reduce((acc, val) => acc + val, 0);
  const avgEarnings = (totalEarnings / rawEarnings.length).toFixed(0);
  const currentSymbol = CURRENCIES[curKey].symbol;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Analytics</Text>

        <TouchableOpacity style={styles.currencyPill} onPress={switchCurrency}>
          <CircleDollarSign size={16} color={CURRENCIES[curKey].color} />
          <Text style={styles.currencyText}>{curKey}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* TOTAL HIGHLIGHT CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroInfo}>
            <Text style={styles.heroLabel}>Net Income ({curKey})</Text>
            <Text style={styles.heroValue}>
              <Text style={{ color: CURRENCIES[curKey].color }}>{currentSymbol}</Text>
              {totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Text>
            <View style={styles.trendBadge}>
              <TrendingUp size={14} color="#10B981" />
              <Text style={styles.trendText}>+12.5% vs last year</Text>
            </View>
          </View>
          <View style={styles.avgContainer}>
            <Text style={styles.avgLabel}>Avg</Text>
            <Text style={styles.avgValue}>{currentSymbol}{Number(avgEarnings).toLocaleString()}</Text>
          </View>
        </View>

        {/* CHART SECTION */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Revenue Growth</Text>
            <Calendar size={18} color="#94A3B8" />
          </View>
          
          <LineChart
            data={{
              labels: rawEarnings.map(e => e.month).filter((_, i) => i % 2 === 0),
              datasets: [{ data: totals }],
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisLabel={currentSymbol}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#4F46E5' },
              propsForBackgroundLines: { strokeDasharray: '', stroke: '#F1F5F9' },
            }}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
          />
        </View>

        {/* MONTHLY LIST */}
        <View style={styles.listContainer}>
          <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Detailed Breakdown</Text>
          {convertedData.slice().reverse().map((item, index) => (
            <View key={index} style={styles.monthRow}>
              <View style={styles.monthIcon}>
                <Text style={styles.monthInitial}>{item.month[0]}</Text>
              </View>
              <View style={styles.monthDetails}>
                <Text style={styles.monthName}>{item.month} 2025</Text>
                <Text style={styles.subText}>Monthly payout</Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={styles.monthAmount}>
                  {currentSymbol}{item.convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Text>
                <ArrowUpRight size={14} color="#10B981" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backButton: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 8,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  currencyPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  currencyText: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  
  heroCard: {
    backgroundColor: '#1E1B4B', margin: 20, borderRadius: 24, padding: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  heroLabel: { color: '#C7D2FE', fontSize: 12, fontWeight: '500', textTransform: 'uppercase' },
  heroValue: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginVertical: 4 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  trendText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  avgContainer: { alignItems: 'flex-end' },
  avgLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '600' },
  avgValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 2 },

  chartCard: {
    backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 24,
    padding: 20, borderWidth: 1, borderColor: '#F1F5F9',
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  chart: { marginVertical: 8, borderRadius: 16, marginLeft: -20 },

  listContainer: { paddingHorizontal: 20, marginTop: 25 },
  monthRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    padding: 14, borderRadius: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  monthIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  monthInitial: { color: '#4F46E5', fontWeight: '800', fontSize: 16 },
  monthDetails: { flex: 1, marginLeft: 12 },
  monthName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  subText: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthAmount: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
});