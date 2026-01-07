import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function FDisputeDetail() {
  const router = useRouter();
  const { dispute } = useLocalSearchParams<{ dispute: string }>();
  const parsedDispute = dispute ? JSON.parse(dispute) : null;

  if (!parsedDispute) return <Text>No dispute data found!</Text>;

  const { clientName, projectTitle, reason, status, createdDate, amount } = parsedDispute;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#F59E0B';
      case 'Resolved': return '#10B981';
      case 'Denied': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={20} color="#F59E0B" strokeWidth={2} />;
      case 'Resolved': return <CheckCircle2 size={20} color="#10B981" strokeWidth={2} />;
      case 'Denied': return <XCircle size={20} color="#EF4444" strokeWidth={2} />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            {getStatusIcon(status)}
            <Text style={[styles.status, { color: getStatusColor(status) }]}>{status}</Text>
          </View>

          <Text style={styles.label}>Project:</Text>
          <Text style={styles.value}>{projectTitle}</Text>

          <Text style={styles.label}>Client:</Text>
          <Text style={styles.value}>{clientName}</Text>

          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>{amount}</Text>

          <Text style={styles.label}>Reason:</Text>
          <Text style={styles.value}>{reason}</Text>

          <Text style={styles.label}>Created Date:</Text>
          <Text style={styles.value}>{createdDate}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  content: { flex: 1, padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  status: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  value: { fontSize: 16, fontWeight: '500', color: '#111827', marginTop: 4 },
});
