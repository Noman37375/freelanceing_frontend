import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { FileText, CheckCircle, XCircle, Clock, DollarSign, User, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { projectService, proposalService } from '@/services/projectService';
import { Proposal } from '@/models/Project';

export default function Proposals() {
  const router = useRouter();
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [updatingProposalId, setUpdatingProposalId] = useState<string | null>(null);

  const fetchProposals = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
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
      Alert.alert('Error', error.message || 'Failed to load proposals');
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
        return '#10B981';
      case 'REJECTED':
        return '#EF4444';
      case 'PENDING':
        return '#F59E0B';
      default:
        return '#6B7280';
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
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading proposals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Proposals</Text>
        <Text style={styles.headerSubtitle}>
          {filteredProposals.length} proposal{filteredProposals.length !== 1 ? 's' : ''}
        </Text>
      </View>

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredProposals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={64} color="#9CA3AF" strokeWidth={1.5} />
            <Text style={styles.emptyText}>No proposals found</Text>
            <Text style={styles.emptySubtext}>
              {activeFilter === 'ALL' 
                ? 'You don\'t have any proposals yet'
                : `No ${activeFilter.toLowerCase()} proposals`}
            </Text>
          </View>
        ) : (
          filteredProposals.map((proposal) => {
            const StatusIcon = getStatusIcon(proposal.status);
            return (
              <TouchableOpacity
                key={proposal.id}
                style={styles.proposalCard}
                onPress={() => router.push({
                  pathname: '/proposal-details',
                  params: { id: proposal.id },
                } as any)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle} numberOfLines={1}>
                      {proposal.project?.title || 'Unknown Project'}
                    </Text>
                    <View style={styles.metaRow}>
                      <Calendar size={14} color="#6B7280" strokeWidth={2} />
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
                  <User size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.freelancerName}>
                    {proposal.freelancer?.userName || proposal.freelancer?.name || 'Unknown Freelancer'}
                  </Text>
                </View>

                <Text style={styles.coverLetter} numberOfLines={2}>
                  {proposal.coverLetter}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.bidAmount}>
                    <DollarSign size={18} color="#10B981" strokeWidth={2} />
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
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <>
                            <XCircle size={16} color="#EF4444" strokeWidth={2} />
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
                          <ActivityIndicator size="small" color="#10B981" />
                        ) : (
                          <>
                            <CheckCircle size={16} color="#10B981" strokeWidth={2} />
                            <Text style={styles.acceptButtonText}>Accept</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
  filterTabActive: {
    backgroundColor: '#F3F4F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#1F2937',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  proposalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#1F2937',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
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
    color: '#6B7280',
    fontWeight: '500',
  },
  coverLetter: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bidAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bidAmountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
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
    backgroundColor: '#FEE2E2',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  acceptButton: {
    backgroundColor: '#D1FAE5',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
