import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, Award, CheckCircle2, XCircle,
  Clock, ExternalLink, Shield, RefreshCw, Trophy,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { badgeService } from '@/services/badgeService';

type PendingBadge = {
  id: string;
  user_id: string;
  skill: string;
  badge_level: string;
  provider: string;
  verification_type: string;
  certificate_url?: string;
  status: string;
  created_at: string;
  // user info joined from backend
  full_name?: string;
  email?: string;
};

type TabKey = 'pending' | 'active';

const BADGE_LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Gold:   { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  Silver: { bg: '#F1F5F9', text: '#475569', border: '#94A3B8' },
  Bronze: { bg: '#FEF2E8', text: '#7C3A15', border: '#C2773A' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: '#FEF3C7', text: '#D97706' },
  active:   { bg: '#F0FDF4', text: '#16A34A' },
  rejected: { bg: '#FEF2F2', text: '#DC2626' },
  revoked:  { bg: '#F4F4F8', text: '#C2C2C8' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ManageBadges() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [pending, setPending] = useState<PendingBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Approve modal state
  const [approveModal, setApproveModal] = useState<{ id: string; skill: string } | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'Gold' | 'Silver' | 'Bronze'>('Silver');

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await badgeService.getPendingCertificates();
      setPending(data || []);
    } catch (e: any) {
      console.error('Failed to load badges:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    setActionLoading(approveModal.id);
    setApproveModal(null);
    try {
      await badgeService.reviewBadge(approveModal.id, 'approve', selectedLevel);
      setPending(prev => prev.filter(b => b.id !== approveModal.id));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to approve badge');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (id: string, skill: string) => {
    Alert.alert(
      'Reject Badge',
      `Reject the ${skill} certificate submission?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(id);
            try {
              await badgeService.reviewBadge(id, 'reject');
              setPending(prev => prev.filter(b => b.id !== id));
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to reject badge');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const pendingList = pending.filter(b => b.status === 'pending');
  const activeList  = pending.filter(b => b.status === 'active');

  const displayList = activeTab === 'pending' ? pendingList : activeList;

  const stats = {
    pending:  pendingList.length,
    active:   activeList.length,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#282A32" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Badge Management</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={() => loadData()} disabled={loading}>
            <RefreshCw size={18} color="#444751" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: '#F59E0B' }]}>
            <Clock size={18} color="#F59E0B" strokeWidth={2.5} />
            <Text style={styles.statNum}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#16A34A' }]}>
            <CheckCircle2 size={18} color="#16A34A" strokeWidth={2.5} />
            <Text style={styles.statNum}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
              Pending Review{stats.pending > 0 ? ` (${stats.pending})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.tabActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Active Badges{stats.active > 0 ? ` (${stats.active})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#282A32" />
            <Text style={styles.loadingText}>Loading badges...</Text>
          </View>
        ) : displayList.length === 0 ? (
          <View style={styles.center}>
            <View style={styles.emptyIcon}>
              <Award size={40} color="#C2C2C8" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending' ? 'No pending submissions' : 'No active badges found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'pending'
                ? 'All certificate submissions have been reviewed.'
                : 'Approved badges will appear here.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {displayList.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                tab={activeTab}
                actionLoading={actionLoading}
                onApprove={() => {
                  setSelectedLevel('Silver');
                  setApproveModal({ id: badge.id, skill: badge.skill });
                }}
                onReject={() => handleReject(badge.id, badge.skill)}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Approve Modal */}
      <Modal
        visible={!!approveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setApproveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Trophy size={32} color="#F59E0B" strokeWidth={1.5} style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Approve Badge</Text>
            <Text style={styles.modalSubtitle}>
              Select badge level for{' '}
              <Text style={{ fontWeight: '800' }}>{approveModal?.skill}</Text>
            </Text>

            <View style={styles.levelOptions}>
              {(['Gold', 'Silver', 'Bronze'] as const).map((level) => {
                const c = BADGE_LEVEL_COLORS[level];
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelBtn,
                      { borderColor: c.border, backgroundColor: selectedLevel === level ? c.bg : '#FFFFFF' },
                    ]}
                    onPress={() => setSelectedLevel(level)}
                    activeOpacity={0.8}
                  >
                    <Shield size={16} color={c.border} strokeWidth={2.5} />
                    <Text style={[styles.levelBtnText, { color: c.text }]}>{level}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setApproveModal(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleApprove}
                activeOpacity={0.8}
              >
                <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.modalConfirmText}>Approve as {selectedLevel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Badge Card ────────────────────────────────────────────────
function BadgeCard({
  badge, tab, actionLoading, onApprove, onReject,
}: {
  badge: PendingBadge;
  tab: TabKey;
  actionLoading: string | null;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isLoading = actionLoading === badge.id;
  const levelColor = BADGE_LEVEL_COLORS[badge.badge_level] ?? BADGE_LEVEL_COLORS.Silver;
  const statusColor = STATUS_COLORS[badge.status] ?? STATUS_COLORS.pending;

  return (
    <View style={styles.card}>
      {/* Top row: skill + status */}
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <View style={[styles.skillIcon, { backgroundColor: levelColor.bg }]}>
            <Award size={20} color={levelColor.border} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.cardSkill}>{badge.skill}</Text>
            <Text style={styles.cardProvider}>{badge.provider}</Text>
          </View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {badge.status.charAt(0).toUpperCase() + badge.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* User info */}
      {badge.full_name && (
        <View style={styles.userRow}>
          <Text style={styles.userLabel}>Submitted by</Text>
          <Text style={styles.userName}>{badge.full_name}</Text>
          {badge.email && <Text style={styles.userEmail}>{badge.email}</Text>}
        </View>
      )}

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={[styles.levelChip, { backgroundColor: levelColor.bg, borderColor: levelColor.border }]}>
          <Text style={[styles.levelChipText, { color: levelColor.text }]}>{badge.badge_level}</Text>
        </View>
        <Text style={styles.metaTime}>{timeAgo(badge.created_at)}</Text>
      </View>

      {/* Certificate URL */}
      {badge.certificate_url && (
        <TouchableOpacity
          style={styles.certLink}
          onPress={() => Linking.openURL(badge.certificate_url!)}
          activeOpacity={0.8}
        >
          <ExternalLink size={14} color="#4F46E5" strokeWidth={2.5} />
          <Text style={styles.certLinkText} numberOfLines={1}>
            {badge.certificate_url}
          </Text>
        </TouchableOpacity>
      )}

      {/* Actions — pending only */}
      {tab === 'pending' && badge.status === 'pending' && (
        <View style={styles.actions}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#282A32" style={{ flex: 1 }} />
          ) : (
            <>
              <TouchableOpacity style={styles.rejectBtn} onPress={onReject} activeOpacity={0.8}>
                <XCircle size={16} color="#DC2626" strokeWidth={2.5} />
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={onApprove} activeOpacity={0.8}>
                <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F8' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E4EA',
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#F4F4F8', justifyContent: 'center', alignItems: 'center',
  },
  refreshBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#F4F4F8', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#282A32', letterSpacing: -0.3 },

  // Stats
  statsRow: {
    flexDirection: 'row', gap: 12, padding: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E4EA',
  },
  statCard: {
    flex: 1, backgroundColor: '#FAFAFA', borderRadius: 14, borderWidth: 1.5,
    padding: 14, alignItems: 'center', gap: 4,
  },
  statNum: { fontSize: 24, fontWeight: '900', color: '#282A32', letterSpacing: -1 },
  statLabel: { fontSize: 12, color: '#C2C2C8', fontWeight: '600' },

  // Tabs
  tabRow: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E4EA',
  },
  tab: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#282A32' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#C2C2C8' },
  tabTextActive: { color: '#282A32' },

  // List
  list: { padding: 16, gap: 12, paddingBottom: 40 },

  // Empty / loading
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#C2C2C8', fontWeight: '500' },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#F4F4F8', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#282A32', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#C2C2C8', fontWeight: '500', textAlign: 'center', lineHeight: 20 },

  // Card
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#E5E4EA',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skillIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardSkill: { fontSize: 15, fontWeight: '800', color: '#282A32' },
  cardProvider: { fontSize: 12, color: '#C2C2C8', fontWeight: '500', marginTop: 2 },
  statusPill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },

  // User row
  userRow: { backgroundColor: '#F4F4F8', borderRadius: 10, padding: 10, marginBottom: 10 },
  userLabel: { fontSize: 10, color: '#C2C2C8', fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  userName: { fontSize: 13, fontWeight: '700', color: '#282A32' },
  userEmail: { fontSize: 12, color: '#C2C2C8', fontWeight: '500', marginTop: 1 },

  // Meta
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  levelChip: {
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  levelChipText: { fontSize: 11, fontWeight: '700' },
  metaTime: { fontSize: 12, color: '#C2C2C8', fontWeight: '500' },

  // Cert link
  certLink: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 10, padding: 10, marginBottom: 12,
  },
  certLinkText: { fontSize: 12, color: '#4F46E5', fontWeight: '600', flex: 1 },

  // Actions
  actions: {
    flexDirection: 'row', gap: 10, marginTop: 4,
    borderTopWidth: 1, borderTopColor: '#F4F4F8', paddingTop: 12,
  },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#FEF2F2', borderRadius: 12, paddingVertical: 11,
    borderWidth: 1, borderColor: '#FECACA',
  },
  rejectText: { fontSize: 13, color: '#DC2626', fontWeight: '700' },
  approveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#282A32', borderRadius: 12, paddingVertical: 11,
  },
  approveText: { fontSize: 13, color: '#FFFFFF', fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    width: '100%', maxWidth: 380, alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#282A32', marginBottom: 6, letterSpacing: -0.4 },
  modalSubtitle: { fontSize: 14, color: '#C2C2C8', fontWeight: '500', textAlign: 'center', marginBottom: 20 },
  levelOptions: { flexDirection: 'row', gap: 10, marginBottom: 24, width: '100%' },
  levelBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 2, borderRadius: 12, paddingVertical: 12,
  },
  levelBtnText: { fontSize: 13, fontWeight: '800' },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  modalCancelBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    backgroundColor: '#F4F4F8',
  },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: '#444751' },
  modalConfirmBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#282A32', borderRadius: 14, paddingVertical: 14,
  },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
