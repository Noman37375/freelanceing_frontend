import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowLeft,
  ShieldAlert,
  Plus
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { disputeService } from '@/services/disputeService';
import type { Dispute } from '@/models/Dispute';

export default function FDisputes() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'Resolved' | 'Denied'>('All');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, [activeFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const status = activeFilter === 'All' ? undefined : activeFilter;
      const data = await disputeService.getMyDisputes(status);
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

  // --- Helpers ---
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // If there's no history, redirect to the main messages or home tab
      router.replace('./(tabs)/messages');
    }
  };

  const getStatusStyles = (status: Dispute['status']) => {
    switch (status) {
      case 'Pending':
      case 'open':
      case 'under_review':
      case 'awaiting_response':
      case 'mediation':
        return { color: '#F59E0B', bg: '#FFFBEB', icon: <Clock size={16} color="#F59E0B" /> };

      case 'Resolved':
      case 'resolved':
      case 'closed':
        return { color: '#10B981', bg: '#ECFDF5', icon: <CheckCircle2 size={16} color="#10B981" /> };

      case 'Denied':
      case 'escalated':
        return { color: '#EF4444', bg: '#FEF2F2', icon: <XCircle size={16} color="#EF4444" /> };

      default:
        return { color: '#64748B', bg: '#F1F5F9', icon: <Clock size={16} color="#64748B" /> };
    }
  };

  const filteredDisputes = activeFilter === 'All'
    ? disputes
    : disputes.filter(d => {
      const s = d.status.toLowerCase();
      if (activeFilter === 'Pending') return s === 'open' || s === 'under_review' || s === 'pending';
      if (activeFilter === 'Resolved') return s === 'resolved' || s === 'closed';
      if (activeFilter === 'Denied') return s === 'denied' || s === 'escalated';
      return false;
    });

  return (
    <View style={styles.outerWrapper}>
      <SafeAreaView style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.6}
          >
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Disputes</Text>
          <View style={styles.headerIcon}>
            <ShieldAlert size={22} color="#6366F1" />
          </View>
        </View>

        {/* MODERN FILTER TABS */}
        <View style={styles.tabWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {['All', 'Pending', 'Resolved', 'Denied'].map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveFilter(tab as any)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* DISPUTE LIST */}
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : filteredDisputes.length === 0 ? (
            <View style={styles.emptyState}>
              <ShieldAlert size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No {activeFilter.toLowerCase()} disputes found.</Text>
            </View>
          ) : (
            filteredDisputes.map(dispute => {
              const stylesStatus = getStatusStyles(dispute.status);
              return (
                <TouchableOpacity
                  key={dispute.id}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => router.push({
                    pathname: '/FDisputeDetail' as any,
                    params: { dispute: JSON.stringify(dispute) },
                  })}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.iconSquircle}>
                      {stylesStatus.icon}
                    </View>
                    <View style={styles.headerText}>
                      <Text style={styles.projectTitle} numberOfLines={1}>
                        {dispute.title || 'Unknown Project'}
                      </Text>
                      <Text style={styles.clientName}>
                        {dispute.respondent?.role === 'client' ? `Client: ${dispute.respondent.name}` : `Respondent: ${dispute.respondent?.name || 'Unknown'}`}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#94A3B8" />
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>AMOUNT</Text>
                      <Text style={styles.detailValue}>
                        ${dispute.amount > 0 ? dispute.amount.toFixed(2) : '0.00'}
                      </Text>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>DATE</Text>
                      <Text style={styles.detailValue}>{formatDate(dispute.createdAt)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: stylesStatus.bg }]}>
                      <Text style={[styles.statusText, { color: stylesStatus.color }]}>{dispute.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.reasonText} numberOfLines={2}>
                    {dispute.reason}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>

      {/* FLOATING ACTION BUTTON (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/CreateDispute' as any)}
        activeOpacity={0.9}
      >
        <Plus size={30} color="#FFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 10, // Ensures back button is always on top
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  headerIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  tabWrapper: { marginBottom: 10 },
  tabScroll: { paddingHorizontal: 20, gap: 10, paddingVertical: 10 },
  tab: {
    paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0'
  },
  tabActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  tabText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 160, paddingTop: 10 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconSquircle: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center',
    marginRight: 12, borderWidth: 1, borderColor: '#F1F5F9'
  },
  headerText: { flex: 1 },
  projectTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  clientName: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  detailsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 12, marginBottom: 15
  },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  detailDivider: { width: 1, height: 20, backgroundColor: '#E2E8F0', marginHorizontal: 15 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  reasonText: { fontSize: 14, color: '#475569', lineHeight: 20, paddingHorizontal: 4 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#94A3B8', marginTop: 15, fontSize: 16, fontWeight: '600' },
  loadingContainer: { padding: 60, alignItems: 'center', justifyContent: 'center' },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  }
});