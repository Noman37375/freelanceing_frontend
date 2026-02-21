import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, DollarSign, FileText, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { Proposal } from '@/models/Project';
import { proposalService } from '@/services/projectService';
import { COLORS } from '@/utils/constants';

type ResultModal = { type: 'success' | 'error'; action: 'accept' | 'reject'; message: string } | null;
type ConfirmModal = 'accept' | 'reject' | null;

export default function ProposalDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [resultModal, setResultModal] = useState<ResultModal>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>(null);

  const fetchProposal = useCallback(async () => {
    if (!id) {
      setProposal(null);
      setError('Missing proposal id.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetched = await proposalService.getProposalById(id);
      setProposal(fetched);
    } catch (e: any) {
      setProposal(null);
      setError(e?.message || 'Failed to load proposal.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchProposal();
  }, [fetchProposal]);

  const handleAccept = useCallback(async () => {
    if (!id || updating) return;
    setConfirmModal(null);
    try {
      setUpdating(true);
      await proposalService.updateProposalStatus(id, 'ACCEPTED');
      await fetchProposal();
      setResultModal({ type: 'success', action: 'accept', message: 'Proposal accepted successfully.' });
    } catch (err: any) {
      setResultModal({ type: 'error', action: 'accept', message: err?.message || 'Failed to accept proposal.' });
    } finally {
      setUpdating(false);
    }
  }, [id, updating, fetchProposal]);

  const handleReject = useCallback(async () => {
    if (!id || updating) return;
    setConfirmModal(null);
    try {
      setUpdating(true);
      await proposalService.updateProposalStatus(id, 'REJECTED');
      await fetchProposal();
      setResultModal({ type: 'success', action: 'reject', message: 'Proposal rejected.' });
    } catch (err: any) {
      setResultModal({ type: 'error', action: 'reject', message: err?.message || 'Failed to reject proposal.' });
    } finally {
      setUpdating(false);
    }
  }, [id, updating, fetchProposal]);

  const createdLabel = useMemo(() => {
    if (!proposal?.createdAt) return null;
    const d = new Date(proposal.createdAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString();
  }, [proposal?.createdAt]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading proposal...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Couldn’t load proposal</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()} activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={fetchProposal} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (!proposal) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Proposal not found</Text>
          <Text style={styles.errorMessage}>The proposal may have been removed.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const title = proposal.project?.title || 'Proposal Details';
  const freelancerName =
    proposal.freelancer?.userName ||
    proposal.freelancer?.name ||
    (proposal.freelancer as { user_name?: string } | undefined)?.user_name ||
    'Freelancer';
  const statusColor =
    proposal.status === 'ACCEPTED' ? COLORS.success : proposal.status === 'REJECTED' ? COLORS.error : COLORS.accent;
  const StatusIcon = proposal.status === 'ACCEPTED' ? CheckCircle : proposal.status === 'REJECTED' ? XCircle : FileText;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <ArrowLeft size={22} color={COLORS.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.statusBadgeWrap}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
            <StatusIcon size={18} color={statusColor} strokeWidth={2} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{proposal.status}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <User size={20} color={COLORS.gray500} />
            <Text style={styles.rowLabel}>Freelancer</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {freelancerName}
            </Text>
          </View>

          <View style={[styles.row, styles.bidRow]}>
            <DollarSign size={20} color={COLORS.success} />
            <Text style={styles.rowLabel}>Bid</Text>
            <Text style={styles.bidValue}>${proposal.bidAmount.toFixed(2)}</Text>
          </View>

          {createdLabel && <Text style={styles.metaText}>Submitted {createdLabel}</Text>}
        </View>

        <Text style={styles.sectionTitle}>Cover Letter</Text>
        <View style={styles.card}>
          <Text style={styles.paragraph}>
            {proposal.coverLetter?.trim() ? proposal.coverLetter : 'No cover letter provided.'}
          </Text>
        </View>

        {proposal.status === 'PENDING' && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => setConfirmModal('reject')}
                disabled={updating}
                activeOpacity={0.8}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <XCircle size={18} color={COLORS.white} strokeWidth={2} />
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => setConfirmModal('accept')}
                disabled={updating}
                activeOpacity={0.8}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <CheckCircle size={18} color={COLORS.white} strokeWidth={2} />
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={!!resultModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setResultModal(null)} activeOpacity={1}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.resultModalCard}>
            {resultModal?.type === 'success' ? (
              <CheckCircle size={52} color={COLORS.success} style={styles.resultModalIcon} />
            ) : (
              <AlertCircle size={52} color={COLORS.error} style={styles.resultModalIcon} />
            )}
            <Text style={styles.resultModalTitle}>
              {resultModal?.type === 'success' ? 'Done' : 'Something went wrong'}
            </Text>
            <Text style={styles.resultModalMessage}>{resultModal?.message}</Text>
            <TouchableOpacity
              style={[styles.resultModalButton, resultModal?.type === 'error' && styles.resultModalButtonError]}
              onPress={() => setResultModal(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.resultModalButtonText}>OK</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={!!confirmModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setConfirmModal(null)} activeOpacity={1}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.confirmModalCard}>
            <Text style={styles.confirmModalTitle}>
              {confirmModal === 'accept' ? 'Accept proposal?' : 'Reject proposal?'}
            </Text>
            <Text style={styles.confirmModalMessage}>
              {confirmModal === 'accept'
                ? `This will accept the proposal for "${title}" and reject all other proposals for this project.`
                : `Reject the proposal for "${title}"?`}
            </Text>
            <View style={styles.confirmModalActions}>
              <TouchableOpacity style={styles.confirmCancelButton} onPress={() => setConfirmModal(null)} activeOpacity={0.8}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmConfirmButton, confirmModal === 'reject' && styles.confirmRejectButton]}
                onPress={() => (confirmModal === 'accept' ? handleAccept() : handleReject())}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmConfirmText}>{confirmModal === 'accept' ? 'Accept' : 'Reject'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.gray800,
    marginHorizontal: 12,
  },
  content: { padding: 20, paddingBottom: 48 },
  statusBadgeWrap: { marginBottom: 16 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusBadgeText: { fontSize: 14, fontWeight: '700' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.gray800,
    marginBottom: 10,
    marginTop: 18,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  rowLabel: { color: COLORS.gray500, fontSize: 13, fontWeight: '600', width: 80 },
  rowValue: {
    flex: 1,
    color: COLORS.gray800,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  bidRow: { marginBottom: 4 },
  bidValue: {
    flex: 1,
    color: COLORS.success,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'right',
  },
  metaText: { marginTop: 4, color: COLORS.gray500, fontSize: 12, fontWeight: '600' },
  paragraph: { color: COLORS.gray700, fontSize: 15, lineHeight: 22 },
  actionsSection: { marginTop: 8 },
  actionButtons: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rejectButton: { backgroundColor: COLORS.error },
  acceptButton: { backgroundColor: COLORS.success },
  actionButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 340,
  },
  resultModalIcon: { marginBottom: 16 },
  resultModalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.gray900, marginBottom: 8 },
  resultModalMessage: {
    fontSize: 15,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  resultModalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  resultModalButtonError: { backgroundColor: COLORS.error },
  resultModalButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  confirmModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    minWidth: 300,
    maxWidth: 360,
  },
  confirmModalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.gray900, marginBottom: 10, textAlign: 'center' },
  confirmModalMessage: { fontSize: 14, color: COLORS.gray600, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  confirmModalActions: { flexDirection: 'row', gap: 12 },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  confirmCancelText: { fontSize: 15, fontWeight: '700', color: COLORS.gray700 },
  confirmConfirmButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.success },
  confirmRejectButton: { backgroundColor: COLORS.error },
  confirmConfirmText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.gray50,
  },
  loadingText: { marginTop: 10, color: COLORS.gray500, fontSize: 14, fontWeight: '600' },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.gray50,
  },
  errorCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  errorTitle: { fontSize: 18, fontWeight: '800', color: COLORS.gray800, marginBottom: 6 },
  errorMessage: { fontSize: 14, color: COLORS.gray600, lineHeight: 20 },
  errorActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  secondaryButtonText: { color: COLORS.gray800, fontSize: 14, fontWeight: '800' },
});
