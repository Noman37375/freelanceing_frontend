import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Platform } from 'react-native';
import { FileText, CheckCircle, XCircle, Clock, DollarSign, User, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { projectService, proposalService } from '@/services/projectService';
import { Proposal } from '@/models/Project';
import { COLORS } from '@/utils/constants';
import ScreenHeader from '@/components/ScreenHeader';

export default function Proposals() {
  const router = useRouter();
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [updatingProposalId, setUpdatingProposalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (updatingProposalId) {
      return; // Prevent double clicks
    }

    try {
      setUpdatingProposalId(proposalId);
      await proposalService.updateProposalStatus(proposalId, 'ACCEPTED');
      Alert.alert('Success', 'Proposal accepted successfully');
      await fetchProposals(); // Refresh the list
      // Switch to ACCEPTED tab to show the accepted proposal
      setActiveFilter('ACCEPTED');
    } catch (error: any) {
      console.error('[Proposals] Error accepting proposal:', error);
      Alert.alert('Error', error.message || 'Failed to accept proposal');
    } finally {
      setUpdatingProposalId(null);
    }
  };

  const handleReject = async (proposalId: string) => {
    if (updatingProposalId) {
      return; // Prevent double clicks
    }

    try {
      setUpdatingProposalId(proposalId);
      await proposalService.updateProposalStatus(proposalId, 'REJECTED');
      Alert.alert('Success', 'Proposal rejected');
      await fetchProposals(); // Refresh the list
      // Switch to REJECTED tab to show the rejected proposal
      setActiveFilter('REJECTED');
    } catch (error: any) {
      console.error('[Proposals] Error rejecting proposal:', error);
      Alert.alert('Error', error.message || 'Failed to reject proposal');
    } finally {
      setUpdatingProposalId(null);
    }
  };

  const filteredProposals = activeFilter === 'ALL'
    ? proposals
    : proposals.filter(p => p.status === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return COLORS.success;
      case 'REJECTED':
        return COLORS.error;
      case 'PENDING':
        return COLORS.accent;
      default:
        return COLORS.gray500;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return CheckCircle;
      case 'REJECTED':
        return XCircle;
      case 'PENDING':
        return Clock;
      default:
        return Clock;
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
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading proposals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Proposals"
        subtitle={`${filteredProposals.length} proposal${filteredProposals.length !== 1 ? 's' : ''}`}
      />

      {/* Filter Tabs */}
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
            {activeFilter === filter && (
              <View style={[styles.filterIndicator, { backgroundColor: getStatusColor(filter) }]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Proposals List */}
      <FlatList
        data={filteredProposals}
        keyExtractor={(item) => item.id}
        renderItem={({ item: proposal }) => {
          const StatusIcon = getStatusIcon(proposal.status);
          return (
            <TouchableOpacity
              style={styles.proposalCard}
              onPress={() =>
                router.push({
                  pathname: '/proposal-details',
                  params: { id: proposal.id },
                } as any)
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectTitle} numberOfLines={1}>
                    {proposal.project?.title || 'Unknown Project'}
                  </Text>
                  <View style={styles.metaRow}>
                    <Calendar size={14} color={COLORS.gray500} strokeWidth={2} />
                    <Text style={styles.metaText}>{formatDate(proposal.createdAt)}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(proposal.status) + '20' }]}>
                  <StatusIcon size={16} color={getStatusColor(proposal.status)} strokeWidth={2} />
                  <Text style={[styles.statusText, { color: getStatusColor(proposal.status) }]}>
                    {proposal.status}
                  </Text>
                </View>
              </View>

              <View style={styles.freelancerInfo}>
                <User size={16} color={COLORS.gray500} strokeWidth={2} />
                <Text style={styles.freelancerName}>
                  {proposal.freelancer?.userName || proposal.freelancer?.name || 'Unknown Freelancer'}
                </Text>
              </View>

              <Text style={styles.coverLetter} numberOfLines={2}>
                {proposal.coverLetter}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.bidAmount}>
                  <DollarSign size={18} color={COLORS.success} strokeWidth={2} />
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
                      onPress={async (e) => {
                        e.stopPropagation();
                        if (updatingProposalId === proposal.id) {
                          return;
                        }

                        // For web, use window.confirm instead of Alert.alert
                        if (typeof window !== 'undefined') {
                          const confirmed = window.confirm('Are you sure you want to reject this proposal?');
                          if (confirmed) {
                            await handleReject(proposal.id);
                          }
                        } else {
                          // For native, use Alert.alert
                          Alert.alert(
                            'Reject Proposal',
                            'Are you sure you want to reject this proposal?',
                            [
                              {
                                text: 'Cancel',
                                style: 'cancel'
                              },
                              {
                                text: 'Reject',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await handleReject(proposal.id);
                                  } catch (err) {
                                    console.error('[Proposals] Error in Reject callback:', err);
                                  }
                                }
                              },
                            ],
                            { cancelable: true }
                          );
                        }
                      }}
                      disabled={updatingProposalId === proposal.id}
                    >
                      {updatingProposalId === proposal.id ? (
                        <ActivityIndicator size="small" color={COLORS.error} />
                      ) : (
                        <>
                          <XCircle size={16} color={COLORS.error} strokeWidth={2} />
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
                      onPress={async (e) => {
                        e.stopPropagation();
                        if (updatingProposalId === proposal.id) {
                          return;
                        }

                        // For web, use window.confirm instead of Alert.alert
                        if (typeof window !== 'undefined') {
                          const confirmed = window.confirm('Are you sure you want to accept this proposal? This will reject all other proposals for this project.');
                          if (confirmed) {
                            await handleAccept(proposal.id);
                          }
                        } else {
                          // For native, use Alert.alert
                          Alert.alert(
                            'Accept Proposal',
                            'Are you sure you want to accept this proposal? This will reject all other proposals for this project.',
                            [
                              {
                                text: 'Cancel',
                                style: 'cancel'
                              },
                              {
                                text: 'Accept',
                                style: 'default',
                                onPress: async () => {
                                  try {
                                    await handleAccept(proposal.id);
                                  } catch (err) {
                                    console.error('[Proposals] Error in Accept callback:', err);
                                  }
                                }
                              },
                            ],
                            { cancelable: true }
                          );
                        }
                      }}
                      disabled={updatingProposalId === proposal.id}
                    >
                      {updatingProposalId === proposal.id ? (
                        <ActivityIndicator size="small" color={COLORS.success} />
                      ) : (
                        <>
                          <CheckCircle size={16} color={COLORS.success} strokeWidth={2} />
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Couldn’t load proposals</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchProposals} activeOpacity={0.85}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <FileText size={64} color={COLORS.gray400} strokeWidth={1.5} />
              <Text style={styles.emptyText}>No proposals found</Text>
              <Text style={styles.emptySubtext}>
                {activeFilter === 'ALL'
                  ? "You don't have any proposals yet"
                  : `No ${activeFilter.toLowerCase()} proposals`}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray500,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
  filterTabActive: {
    backgroundColor: COLORS.gray100,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray500,
  },
  filterTextActive: {
    color: COLORS.gray800,
    fontWeight: '600',
  },
  filterIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    borderRadius: 2,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray800,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray500,
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  errorTitle: { fontSize: 16, fontWeight: '800', color: COLORS.gray800, marginBottom: 6, textAlign: 'center' },
  errorMessage: { fontSize: 14, color: COLORS.gray600, lineHeight: 20, textAlign: 'center' },
  retryButton: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  proposalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
      },
    }),
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
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  freelancerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  freelancerName: {
    fontSize: 14,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  coverLetter: {
    fontSize: 14,
    color: COLORS.gray700,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  bidAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bidAmountText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.success,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: COLORS.errorLight,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  acceptButton: {
    backgroundColor: COLORS.successLight,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
