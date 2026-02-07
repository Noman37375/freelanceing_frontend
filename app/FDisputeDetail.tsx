import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Calendar, DollarSign, User, Briefcase, FileText } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FDisputeDetail() {
  const router = useRouter();
  const { dispute } = useLocalSearchParams<{ dispute: string }>();
  const parsedDispute = dispute ? JSON.parse(dispute) : null;

  if (!parsedDispute) return <View style={styles.container}><Text>No dispute data found!</Text></View>;

  const { clientName, projectTitle, reason, status, createdDate, amount } = parsedDispute;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pending': return { color: '#F59E0B', bg: '#FFFBEB', icon: <Clock size={20} color="#F59E0B" /> };
      case 'Resolved': return { color: '#10B981', bg: '#ECFDF5', icon: <CheckCircle2 size={20} color="#10B981" /> };
      case 'Denied': return { color: '#EF4444', bg: '#FEF2F2', icon: <XCircle size={20} color="#EF4444" /> };
      default: return { color: '#64748B', bg: '#F1F5F9', icon: <Clock size={20} color="#64748B" /> };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#282A32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Case Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
      >
        {/* STATUS TOP CARD */}
        <View style={[styles.statusHero, { backgroundColor: statusConfig.bg }]}>
          <View style={styles.iconCircle}>
            {statusConfig.icon}
          </View>
          <Text style={[styles.statusMainText, { color: statusConfig.color }]}>
            Dispute {status}
          </Text>
          <Text style={styles.statusSubText}>Reference ID: #DISP-{parsedDispute.id || '001'}</Text>
        </View>

        {/* DETAILS SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>General Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconBg}><Briefcase size={18} color="#444751" /></View>
            <View>
              <Text style={styles.label}>PROJECT</Text>
              <Text style={styles.value}>{projectTitle}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconBg}><User size={18} color="#444751" /></View>
            <View>
              <Text style={styles.label}>CLIENT</Text>
              <Text style={styles.value}>{clientName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconBg}><DollarSign size={18} color="#444751" /></View>
            <View>
              <Text style={styles.label}>DISPUTED AMOUNT</Text>
              <Text style={styles.value}>{amount}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconBg}><Calendar size={18} color="#444751" /></View>
            <View>
              <Text style={styles.label}>SUBMISSION DATE</Text>
              <Text style={styles.value}>{createdDate}</Text>
            </View>
          </View>
        </View>

        {/* DESCRIPTION SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.reasonHeader}>
            <FileText size={18} color="#444751" />
            <Text style={styles.sectionTitle}>Dispute Reason</Text>
          </View>
          <Text style={styles.reasonBody}>{reason}</Text>
        </View>

        {/* HELP FOOTER */}
        <TouchableOpacity style={styles.supportButton}>
          <Text style={styles.supportButtonText}>Contact Support for this Case</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backButton: { 
    width: 40, height: 40, borderRadius: 12, 
    backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' 
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#282A32' },
  
  content: { flex: 1 },
  scrollPadding: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },

  statusHero: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  statusMainText: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  statusSubText: { fontSize: 12, color: '#64748B', fontWeight: '600', letterSpacing: 0.5 },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#282A32',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#282A32', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E5E4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  label: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '700', color: '#444751' },

  reasonHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  reasonBody: { fontSize: 15, color: '#475569', lineHeight: 24 },

  supportButton: {
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10
  },
  supportButtonText: { color: '#444751', fontWeight: '800', fontSize: 15 }
});