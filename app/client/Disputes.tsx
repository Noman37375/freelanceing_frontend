import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Clock, CheckCircle2, XCircle, ChevronRight, ArrowLeft, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export interface Dispute {
  id: string;
  clientName: string;
  projectTitle: string;
  reason: string;
  status: 'Pending' | 'Resolved' | 'Denied';
  createdDate: string;
  amount: string;
  description?: string; // Optional for the list, used in detail
}

const DISPUTES_DATA: Dispute[] = [
  { 
    id: '1', 
    clientName: 'Alice Brown', 
    projectTitle: 'Landing Page Design', 
    reason: 'Late payment', 
    status: 'Pending', 
    createdDate: 'Dec 12, 2025', 
    amount: '$500',
    description: 'The client has not released the payment even though the work was approved three weeks ago.'
  },
  { 
    id: '2', 
    clientName: 'Mark Lee', 
    projectTitle: 'React Native App', 
    reason: 'Scope change', 
    status: 'Resolved', 
    createdDate: 'Dec 8, 2025', 
    amount: '$1,200',
    description: 'Additional features were requested outside of the initial contract without a price adjustment.'
  },
  { 
    id: '3', 
    clientName: 'Jane Smith', 
    projectTitle: 'Logo Design', 
    reason: 'Feedback not applied', 
    status: 'Denied', 
    createdDate: 'Dec 5, 2025', 
    amount: '$300',
    description: 'The client claimed feedback wasn’t followed, but logs show the revisions were submitted.'
  },
];

export default function Disputes() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<Dispute['status']>('Pending');

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

  const filteredDisputes = DISPUTES_DATA.filter(d => d.status === selectedTab);

  const counts = {
    Pending: DISPUTES_DATA.filter(d => d.status === 'Pending').length,
    Resolved: DISPUTES_DATA.filter(d => d.status === 'Resolved').length,
    Denied: DISPUTES_DATA.filter(d => d.status === 'Denied').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Disputes</Text>
        <TouchableOpacity 
          style={styles.newDisputeButton} 
          onPress={() => router.push('/NewDispute')}
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
          {filteredDisputes.length === 0 ? (
            <Text style={styles.noDisputeText}>No {selectedTab} disputes</Text>
          ) : (
            filteredDisputes.map((dispute) => (
              <TouchableOpacity
                key={dispute.id}
                style={styles.disputeCard}
                onPress={() => router.push({
                  pathname: '/client/DisputeDetail',
                  params: { disputeData: JSON.stringify(dispute) },
                })}
              >
                <View style={styles.disputeHeader}>
                  <View style={styles.disputeLeft}>
                    <View style={styles.iconContainer}>{getStatusIcon(dispute.status)}</View>
                    <View style={styles.disputeInfo}>
                      <Text style={styles.projectTitle}>{dispute.projectTitle}</Text>
                      <Text style={styles.clientName}>vs {dispute.clientName}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#6B7280" strokeWidth={2} />
                </View>
                <Text style={styles.reason} numberOfLines={2}>{dispute.reason}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(dispute.status) }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(dispute.status) }]}>{dispute.status}</Text>
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
});