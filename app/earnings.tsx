import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function EarningsScreen() {
  const router = useRouter();

  // Static earnings data till December
  const earnings = [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 1500 },
    { month: 'Mar', amount: 1000 },
    { month: 'Apr', amount: 1700 },
    { month: 'May', amount: 2000 },
    { month: 'Jun', amount: 1800 },
    { month: 'Jul', amount: 2200 },
    { month: 'Aug', amount: 2100 },
    { month: 'Sep', amount: 2300 },
    { month: 'Oct', amount: 2500 },
    { month: 'Nov', amount: 2400 },
    { month: 'Dec', amount: 2600 },
  ];

  const months = earnings.map((e) => e.month);
  const totals = earnings.map((e) => e.amount);
  const totalEarnings = totals.reduce((acc, val) => acc + val, 0);
  const avgEarnings = (totalEarnings / earnings.length).toFixed(0);

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Earnings Overview</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🔹 Graph Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Monthly Growth</Text>
          <LineChart
            data={{
              labels: months,
              datasets: [{ data: totals }],
            }}
            width={Dimensions.get('window').width - 64}
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#10B981',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* 🔹 Totals Section */}
        <View style={[styles.card, styles.totalCard]}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalValue}>${totalEarnings}</Text>
          <Text style={styles.avgLabel}>Avg per Month: ${avgEarnings}</Text>
        </View>

        {/* 🔹 Monthly Breakdown */}
        <View style={[styles.card, styles.monthList]}>
          <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
          {earnings.map((item, index) => (
            <View key={index} style={styles.monthRow}>
              <View>
                <Text style={styles.monthName}>{item.month}</Text>
                <Text style={styles.subText}>Earnings</Text>
              </View>
              <Text style={styles.monthAmount}>${item.amount}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 6,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginTop: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  totalCard: {
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
  },
  totalLabel: {
    fontSize: 16,
    color: '#047857',
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 4,
  },
  avgLabel: {
    fontSize: 14,
    color: '#047857',
    marginTop: 4,
  },
  monthList: {
    marginTop: 8,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  subText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  monthAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#10B981',
  },
});
