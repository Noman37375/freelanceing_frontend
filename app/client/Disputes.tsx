import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Clock, CheckCircle2, XCircle, ChevronRight, ArrowLeft, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { disputeService, Dispute } from '@/services/disputeService';

export default function Disputes() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'Pending' | 'Resolved' | 'Denied'>('Pending');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, [selectedTab]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const data = await disputeService.getMyDisputes(selectedTab);
      setDisputes(data);
    } catch (error: any) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusIcon = (status: Dispute['status']) => {
    switch (status) {
      case 'Pending': return <Clock size={20} color="#F59E0B" strokeWidth={2} />;
      case 'Resolved': return <CheckCircle2 size={20} color="#10B981" strokeWidth={2} />;
      case 'Denied': return <XCircle size={20} color="#EF4444" strokeWidth={2} />;
    }
  };

  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'Pending': return '#F59E0B';
      case 'Resolved': return '#10B981';
      case 'Denied': return '#EF4444';
    }
  };

  const getStatusBackground = (status: Dispute['status']) => {
    switch (status) {
      case 'Pending': return '#FEF3C7';
      case 'Resolved': return '#D1FAE5';
      case 'Denied': return '#FEE2E2';
    }
  };

  const counts = {
    Pending: disputes.filter(d => d.status === 'Pending').length,
    Resolved: disputes.filter(d => d.status === 'Resolved').length,
    Denied: disputes.filter(d => d.status === 'Denied').length,
  };

  const filteredDisputes = disputes.filter(d => d.status === selectedTab);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Disputes</Text>
        <TouchableOpacity 
          style={styles.newDisputeButton} 
          onPress={() => router.push('/NewDispute' as any)}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={3} />
          <Text style={styles.newDisputeText}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(['Pending', 'Resolved', 'Denied'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
              {tab} ({counts[tab]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.disputesList} showsVerticalScrollIndicator={false}>
        <View style={styles.disputesContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : filteredDisputes.length === 0 ? (
            <Text style={styles.noDisputeText}>No {selectedTab} disputes</Text>
          ) : (
            filteredDisputes.map((dispute) => (
              <TouchableOpacity
                key={dispute.id}
                style={styles.disputeCard}
                onPress={() => router.push({
                  pathname: '/client/DisputeDetail' as any,
                  params: { disputeData: JSON.stringify(dispute) },
                } as any)}
              >
                <View style={styles.disputeHeader}>
                  <View style={styles.disputeLeft}>
                    <View style={styles.iconContainer}>{getStatusIcon(dispute.status)}</View>
                    <View style={styles.disputeInfo}>
                      <Text style={styles.projectTitle}>{dispute.project?.title || 'Unknown Project'}</Text>
                      <Text style={styles.clientName}>
                        vs {dispute.freelancer?.userName || dispute.client?.userName || 'Unknown'}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#6B7280" strokeWidth={2} />
                </View>
                <Text style={styles.reason} numberOfLines={2}>{dispute.reason}</Text>
                {dispute.amount > 0 && (
                  <Text style={styles.amountText}>Amount: ${dispute.amount.toFixed(2)}</Text>
                )}
                <View style={styles.disputeFooter}>
                  <Text style={styles.dateText}>{formatDate(dispute.createdAt)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(dispute.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(dispute.status) }]}>{dispute.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 3 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', textAlign: 'center', flex: 1 },
  newDisputeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  newDisputeText: { color: '#FFFFFF', fontWeight: '600', marginLeft: 6 },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#E5E7EB' },
  tabButtonActive: { backgroundColor: '#3B82F6' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#FFFFFF' },
  disputesList: { flex: 1, paddingHorizontal: 20 },
  disputesContent: { gap: 12 },
  disputeCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, elevation: 3 },
  disputeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  disputeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  disputeInfo: {},
  projectTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  clientName: { fontSize: 13, color: '#6B7280' },
  reason: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: '600' },
  noDisputeText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#6B7280' },
  loadingContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  disputeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  amountText: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  dateText: { fontSize: 12, color: '#6B7280' },
});