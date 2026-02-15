import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Platform, StatusBar } from 'react-native';
import { FileText, CheckCircle, XCircle, Clock, DollarSign, User, Calendar, AlertCircle, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { proposalService } from '@/services/projectService';
import { Proposal } from '@/models/Project';
import { SafeAreaView } from 'react-native-safe-area-context';

type ResultModal = { type: 'success' | 'error'; action: 'accept' | 'reject'; message: string } | null;
type ConfirmModal = { action: 'accept' | 'reject'; proposalId: string; projectTitle: string } | null;

export default function Proposals() {
  const router = useRouter();
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [updatingProposalId, setUpdatingProposalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<ResultModal>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>(null);

  const fetchProposals = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const allProposals = await proposalService.getClientProposals();

      // Sort by created date (newest first)
      const sortedProposals = [...allProposals].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setProposals(sortedProposals);
    } catch (error: any) {
      console.error('[Proposals] Failed to fetch proposals:', error);
      setError(error?.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProposals();
  };

  const handleAccept = async (proposalId: string) => {
    if (updatingProposalId) return;
    setConfirmModal(null);
    try {
      setUpdatingProposalId(proposalId);
      await proposalService.updateProposalStatus(proposalId, 'ACCEPTED');
      await fetchProposals();
      setActiveFilter('ACCEPTED');
      setResultModal({ type: 'success', action: 'accept', message: 'Proposal accepted successfully.' });
    } catch (err: any) {
      setResultModal({ type: 'error', action: 'accept', message: err?.message || 'Failed to accept proposal.' });
    } finally {
      setUpdatingProposalId(null);
    }
  };

  const handleReject = async (proposalId: string) => {
    if (updatingProposalId) return;
    setConfirmModal(null);
    try {
      setUpdatingProposalId(proposalId);
      await proposalService.updateProposalStatus(proposalId, 'REJECTED');
      await fetchProposals();
      setActiveFilter('REJECTED');
      setResultModal({ type: 'success', action: 'reject', message: 'Proposal rejected.' });
    } catch (err: any) {
      setResultModal({ type: 'error', action: 'reject', message: err?.message || 'Failed to reject proposal.' });
    } finally {
      setUpdatingProposalId(null);
    }
  };

  const openConfirm = (action: 'accept' | 'reject', proposal: Proposal) => {
    setConfirmModal({
      action,
      proposalId: proposal.id,
      projectTitle: proposal.project?.title || 'this project',
    });
  };

  const filteredProposals = activeFilter === 'ALL'
    ? proposals
    : proposals.filter(p => p.status === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return '#444751';
      case 'REJECTED': return '#C2C2C8';
      case 'PENDING': return '#282A32';
      default: return '#E5E4EA';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return CheckCircle;
      case 'REJECTED': return XCircle;
      case 'PENDING': return Clock;
      default: return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#444751" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* CLEAN HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={22} color="#282A32" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Proposals</Text>
            <Text style={styles.headerSubtitle}>{filteredProposals.length} {filteredProposals.length === 1 ? 'proposal' : 'proposals'}</Text>
          </View>
          <View style={styles.placeholderButton} />
        </View>

        {/* FILTER TABS */}
        <View style={styles.filterContainer}>
          {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PROPOSALS LIST */}
        <FlatList
          data={filteredProposals}
          keyExtractor={(item) => item.id}
          renderItem={({ item: proposal }) => {
            const StatusIcon = getStatusIcon(proposal.status);
            return (
              <TouchableOpacity
                style={styles.proposalCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/proposal-details',
                    params: { id: proposal.id },
                  } as any)
                }
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle} numberOfLines={1}>
                      {proposal.project?.title || 'Unknown Project'}
                    </Text>
                    <View style={styles.metaRow}>
                      <Calendar size={13} color="#C2C2C8" strokeWidth={2} />
                      <Text style={styles.metaText}>{formatDate(proposal.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(proposal.status) }]}>
                    <StatusIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.statusText}>{proposal.status}</Text>
                  </View>
                </View>

                {/* Freelancer */}
                <View style={styles.freelancerRow}>
                  <View style={styles.freelancerIconBox}>
                    <User size={14} color="#444751" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.freelancerName}>
                    {proposal.freelancer?.userName || proposal.freelancer?.name || 'Unknown Freelancer'}
                  </Text>
                </View>

                {/* Cover Letter */}
                <Text style={styles.coverLetter} numberOfLines={2}>
                  {proposal.coverLetter}
                </Text>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.bidAmount}>
                    <DollarSign size={18} color="#444751" strokeWidth={2.5} />
                    <Text style={styles.bidAmountText}>${proposal.bidAmount.toFixed(2)}</Text>
                  </View>

                  {proposal.status === 'PENDING' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.rejectButton,
                          updatingProposalId === proposal.id && styles.disabledButton
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (updatingProposalId !== proposal.id) openConfirm('reject', proposal);
                        }}
                        disabled={updatingProposalId === proposal.id}
                      >
                        {updatingProposalId === proposal.id ? (
                          <ActivityIndicator size="small" color="#C2C2C8" />
                        ) : (
                          <>
                            <XCircle size={15} color="#C2C2C8" strokeWidth={2.5} />
                            <Text style={styles.rejectButtonText}>Reject</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.acceptButton,
                          updatingProposalId === proposal.id && styles.disabledButton
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (updatingProposalId !== proposal.id) openConfirm('accept', proposal);
                        }}
                        disabled={updatingProposalId === proposal.id}
                      >
                        {updatingProposalId === proposal.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <CheckCircle size={15} color="#FFFFFF" strokeWidth={2.5} />
                            <Text style={styles.acceptButtonText}>Accept</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor="#444751"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            error ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBox}>
                  <AlertCircle size={40} color="#C2C2C8" strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>Couldn't Load Proposals</Text>
                <Text style={styles.emptySubtitle}>{error}</Text>
                <TouchableOpacity style={styles.emptyActionBtn} onPress={fetchProposals}>
                  <Text style={styles.emptyActionText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBox}>
                  <FileText size={40} color="#C2C2C8" strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No Proposals Found</Text>
                <Text style={styles.emptySubtitle}>
                  {activeFilter === 'ALL'
                    ? "You don't have any proposals yet"
                    : `No ${activeFilter.toLowerCase()} proposals`}
                </Text>
              </View>
            )
          }
        />
      </SafeAreaView>

      {/* Result Modal */}
      <Modal visible={!!resultModal} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setResultModal(null)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()} 
            style={styles.resultModalCard}
          >
            <View style={styles.resultIconBox}>
              {resultModal?.type === 'success' ? (
                <CheckCircle size={48} color="#444751" strokeWidth={2} />
              ) : (
                <AlertCircle size={48} color="#C2C2C8" strokeWidth={2} />
              )}
            </View>
            <Text style={styles.resultModalTitle}>
              {resultModal?.type === 'success' ? 'Success!' : 'Error'}
            </Text>
            <Text style={styles.resultModalMessage}>{resultModal?.message}</Text>
            <TouchableOpacity
              style={styles.resultModalButton}
              onPress={() => setResultModal(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.resultModalButtonText}>OK</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Confirm Modal */}
      <Modal visible={!!confirmModal} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setConfirmModal(null)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()} 
            style={styles.confirmModalCard}
          >
            <Text style={styles.confirmModalTitle}>
              {confirmModal?.action === 'accept' ? 'Accept Proposal?' : 'Reject Proposal?'}
            </Text>
            <Text style={styles.confirmModalMessage}>
              {confirmModal?.action === 'accept'
                ? `Accept the proposal for "${confirmModal?.projectTitle}"? This will reject all other proposals.`
                : `Reject the proposal for "${confirmModal?.projectTitle}"?`}
            </Text>
            <View style={styles.confirmModalActions}>
              <TouchableOpacity 
                style={styles.confirmCancelButton} 
                onPress={() => setConfirmModal(null)} 
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmConfirmButton,
                  confirmModal?.action === 'reject' && styles.confirmRejectButton
                ]}
                onPress={() => {
                  if (confirmModal?.action === 'accept') handleAccept(confirmModal.proposalId);
                  else handleReject(confirmModal!.proposalId);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmConfirmText}>
                  {confirmModal?.action === 'accept' ? 'Accept' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F8',
  },

  // ========== HEADER ==========
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E4EA',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#282A32',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#C2C2C8',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  placeholderButton: {
    width: 42,
  },

  // ========== FILTERS ==========
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E4EA',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F4F4F8',
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  filterTabActive: {
    backgroundColor: '#444751',
    borderColor: '#444751',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C2C2C8',
    letterSpacing: 0.2,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // ========== LIST ==========
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // ========== PROPOSAL CARD ==========
  proposalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
    marginRight: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#C2C2C8',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  freelancerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  freelancerIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freelancerName: {
    fontSize: 14,
    color: '#C2C2C8',
    fontWeight: '600',
  },
  coverLetter: {
    fontSize: 14,
    color: '#444751',
    lineHeight: 20,
    marginBottom: 14,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E4EA',
  },
  bidAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bidAmountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#444751',
    letterSpacing: -0.3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  rejectButton: {
    backgroundColor: '#F4F4F8',
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C2C2C8',
    letterSpacing: 0.2,
  },
  acceptButton: {
    backgroundColor: '#444751',
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  disabledButton: {
    opacity: 0.5,
  },

  // ========== EMPTY STATE ==========
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#C2C2C8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: '500',
  },
  emptyActionBtn: {
    backgroundColor: '#444751',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // ========== MODALS ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(40, 42, 50, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 340,
  },
  resultIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  resultModalMessage: {
    fontSize: 14,
    color: '#C2C2C8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: '500',
  },
  resultModalButton: {
    backgroundColor: '#444751',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  resultModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  confirmModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    minWidth: 300,
    maxWidth: 360,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  confirmModalMessage: {
    fontSize: 14,
    color: '#C2C2C8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: '500',
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F4F4F8',
    borderWidth: 2,
    borderColor: '#E5E4EA',
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444751',
    letterSpacing: 0.2,
  },
  confirmConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#444751',
  },
  confirmRejectButton: {
    backgroundColor: '#C2C2C8',
  },
  confirmConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});