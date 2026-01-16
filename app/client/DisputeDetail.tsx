import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, User, Calendar, DollarSign, FileText, CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function DisputeDetail() {
  const router = useRouter();
  const { disputeData } = useLocalSearchParams<{ disputeData: string }>();

  // Parse the incoming stringified object
  const dispute = disputeData ? JSON.parse(disputeData) : null;

  if (!dispute) {
    return (
      <View style={styles.container}><Text>No data found.</Text></View>
    );
  }

  const getStatusIcon = () => {
    switch (dispute.status) {
      case 'Pending': return <Clock size={24} color="#F59E0B" strokeWidth={2} />;
      case 'Resolved': return <CheckCircle2 size={24} color="#10B981" strokeWidth={2} />;
      case 'Denied': return <XCircle size={24} color="#EF4444" strokeWidth={2} />;
    }
  };

  const getStatusColor = () => {
    switch (dispute.status) {
      case 'Pending': return '#F59E0B';
      case 'Resolved': return '#10B981';
      case 'Denied': return '#EF4444';
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {getStatusIcon()}
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[styles.statusValue, { color: getStatusColor() }]}>{dispute.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.projectTitleText}>{dispute.projectTitle}</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <User size={16} color="#6B7280" />
                <Text style={styles.infoText}>{dispute.clientName}</Text>
              </View>
              <View style={styles.infoItem}>
                <DollarSign size={16} color="#6B7280" />
                <Text style={styles.infoText}>{dispute.amount}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.infoText}>{dispute.createdDate}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Dispute</Text>
          <View style={styles.reasonCard}>
            <Text style={styles.reasonTitle}>{dispute.reason}</Text>
            <Text style={styles.reasonDescription}>{dispute.description || "No further details provided."}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Review</Text>
          <View style={styles.reviewCard}>
            {dispute.status === 'Pending' ? (
              <Text style={styles.reviewMessage}>Under review. Expected resolution: 24-48 hours.</Text>
            ) : dispute.status === 'Resolved' ? (
              <Text style={styles.reviewMessage}>Decision: Favor of user. Funds returned to wallet.</Text>
            ) : (
              <Text style={styles.reviewMessage}>Decision: Dispute denied based on project evidence.</Text>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.contactButton}>
            <MessageSquare size={18} color="#3B82F6" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 3 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  content: { flex: 1 },
  statusCard: { margin: 20, padding: 20, backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 3 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  statusValue: { fontSize: 20, fontWeight: '700' },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, elevation: 3 },
  projectTitleText: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: '#6B7280' },
  reasonCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, elevation: 3 },
  reasonTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  reasonDescription: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  reviewCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, elevation: 3 },
  reviewMessage: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  actionButtons: { padding: 20, paddingBottom: 40 },
  contactButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EFF6FF', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#3B82F6' },
  contactButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600' },
});