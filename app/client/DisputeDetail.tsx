import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, User, Calendar, DollarSign, CheckCircle2, XCircle, Clock, MessageSquare, HelpCircle, ShieldAlert, Lock, RefreshCw, ShieldCheck, ShieldOff } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { adminService } from '@/services/adminService';
import { disputeService } from '@/services/disputeService';
import { useAuth } from '@/contexts/AuthContext';

// Countdown helper
function formatCountdown(isoDeadline: string | null | undefined): string {
  if (!isoDeadline) return '';
  const diff = new Date(isoDeadline).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

const STAGE_ORDER = ['open', 'awaiting_response', 'under_review', 'mediation', 'resolved'];
const STAGE_LABELS: Record<string, string> = {
  open: 'Filed',
  awaiting_response: 'Response',
  under_review: 'Review',
  mediation: 'Mediation',
  resolved: 'Resolved',
};

export default function DisputeDetail() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [countdown, setCountdown] = useState('');

  const fetchDispute = useCallback(async () => {
    if (!id) return;
    try {
      const data = await adminService.getDisputeById(id);
      setDispute(data);

      try {
        const msgs = await disputeService.getMessages(id);
        const questions = (msgs || []).filter((m: any) => m.messageType === 'admin_question');
        setPendingQuestions(questions);
      } catch (_) {}
    } catch (error) {
      console.log("Dispute not found", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchDispute();
  }, [id]);

  // Tick countdown every minute
  useEffect(() => {
    if (!dispute) return;
    const deadline = dispute.responseDeadline || dispute.stageDeadline;
    if (!deadline) return;
    const tick = () => setCountdown(formatCountdown(deadline));
    tick();
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, [dispute?.responseDeadline, dispute?.stageDeadline]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!dispute) {
    return (
      <View style={styles.container}>
        <Text>Dispute not found</Text>
      </View>
    );
  }

  const isResolvedDispute = ['resolved', 'closed', 'denied', 'Resolved', 'Denied', 'Closed'].includes(dispute.status);
  const hasPendingQuestion = pendingQuestions.length > 0 && !isResolvedDispute;

  // Outcome: client wins on full_refund / partial_refund
  const resolutionType = dispute.resolutionType as string | undefined;
  let outcomeWon: boolean | null = null;
  if (isResolvedDispute && resolutionType) {
    outcomeWon = ['full_refund', 'partial_refund'].includes(resolutionType);
  }

  const hasMediationProposal = !!dispute.mediationRecommendation && !isResolvedDispute;
  const myAcceptance = dispute.clientAccepted; // client perspective
  const canActOnMediation = hasMediationProposal && myAcceptance === null;

  // Stage stepper
  const normalizedStatus = dispute.status?.toLowerCase().replace(/ /g, '_');
  const currentStageIdx = STAGE_ORDER.indexOf(normalizedStatus) >= 0
    ? STAGE_ORDER.indexOf(normalizedStatus)
    : 0;

  const handleMediation = async (accept: boolean) => {
    setActionLoading(true);
    try {
      if (accept) {
        await disputeService.acceptMediationProposal(dispute.id);
        Alert.alert('Accepted', 'You have accepted the mediation recommendation.');
      } else {
        await disputeService.rejectMediationProposal(dispute.id);
        Alert.alert('Rejected', 'Mediation rejected. The dispute has been escalated for admin arbitration.');
      }
      await fetchDispute();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit mediation response');
    } finally {
      setActionLoading(false);
    }
  };

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
          <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute Details</Text>
        <TouchableOpacity style={styles.backButton} onPress={fetchDispute}>
          <RefreshCw size={18} color="rgba(255,255,255,0.7)" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {getStatusIcon()}
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[styles.statusValue, { color: getStatusColor() }]}>{dispute.status}</Text>
            </View>
            {dispute.isEscalated && (
              <View style={styles.escalatedBadge}>
                <ShieldAlert size={12} color="#EF4444" />
                <Text style={styles.escalatedBadgeText}>ESCALATED</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stage Stepper */}
        {!isResolvedDispute && (
          <View style={styles.stepperCard}>
            {STAGE_ORDER.map((stage, idx) => {
              const isComplete = idx < currentStageIdx;
              const isActive = idx === currentStageIdx;
              return (
                <View key={stage} style={styles.stepperItem}>
                  <View style={[styles.stepDot, isComplete && styles.stepDotComplete, isActive && styles.stepDotActive]}>
                    {isComplete
                      ? <CheckCircle2 size={12} color="#FFFFFF" />
                      : <Text style={[styles.stepDotText, isActive && { color: '#FFFFFF' }]}>{idx + 1}</Text>
                    }
                  </View>
                  <Text style={[styles.stepLabel, isComplete && styles.stepLabelComplete, isActive && styles.stepLabelActive]}>
                    {STAGE_LABELS[stage]}
                  </Text>
                  {idx < STAGE_ORDER.length - 1 && (
                    <View style={[styles.stepLine, isComplete && styles.stepLineComplete]} />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Countdown Timer */}
        {!isResolvedDispute && countdown ? (
          <View style={[styles.countdownBanner, countdown === 'Expired' && styles.countdownExpired]}>
            <Clock size={14} color={countdown === 'Expired' ? '#B91C1C' : '#92400E'} strokeWidth={2} />
            <Text style={[styles.countdownText, countdown === 'Expired' && { color: '#B91C1C' }]}>
              {countdown === 'Expired' ? 'Deadline passed — pending escalation' : countdown}
            </Text>
          </View>
        ) : null}

        {/* Funds on Hold Banner */}
        {!isResolvedDispute && (
          <View style={styles.fundsHoldBanner}>
            <Lock size={14} color="#92400E" strokeWidth={2} />
            <Text style={styles.fundsHoldText}>Funds on hold — released after dispute resolution</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.projectTitleText}>{dispute.project?.title || 'Unknown Project'}</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <User size={16} color="#6B7280" />
                <Text style={styles.infoText}>
                  {dispute.freelancer?.user_name || dispute.freelancer?.userName || 'Unknown Freelancer'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <DollarSign size={16} color="#6B7280" />
                <Text style={styles.infoText}>${dispute.amount?.toFixed(2) || '0.00'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.infoText}>
                  {dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </Text>
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

        {/* Resolution Outcome */}
        {isResolvedDispute && outcomeWon !== null ? (
          <View style={styles.section}>
            <View style={[styles.outcomeCard, outcomeWon ? styles.outcomeWon : styles.outcomeLost]}>
              <View style={styles.outcomeRow}>
                {outcomeWon
                  ? <CheckCircle2 size={26} color="#10B981" />
                  : <XCircle size={26} color="#EF4444" />
                }
                <Text style={[styles.outcomeTitle, outcomeWon ? styles.outcomeTitleWon : styles.outcomeTitleLost]}>
                  {outcomeWon ? 'Resolved in Your Favour' : 'Resolved Against You'}
                </Text>
              </View>
              <Text style={styles.outcomeDesc}>
                {outcomeWon
                  ? 'The admin has decided to issue a refund. The disputed amount will be returned to you.'
                  : 'The admin decided to release payment to the freelancer. No refund will be issued.'}
              </Text>
              {dispute.resolutionDescription ? (
                <View style={styles.outcomeNote}>
                  <Text style={styles.outcomeNoteLabel}>ADMIN NOTES</Text>
                  <Text style={styles.outcomeNoteText}>{dispute.resolutionDescription}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Review</Text>
            <View style={styles.reviewCard}>
              {dispute.resolutionDescription ? (
                <Text style={styles.reviewMessage}>{dispute.resolutionDescription}</Text>
              ) : (['resolved', 'Resolved'].includes(dispute.status)) ? (
                <Text style={styles.reviewMessage}>This dispute has been resolved by admin.</Text>
              ) : (['closed', 'Denied', 'denied'].includes(dispute.status)) ? (
                <Text style={styles.reviewMessage}>This dispute has been closed by admin.</Text>
              ) : dispute.status === 'escalated' ? (
                <Text style={[styles.reviewMessage, { color: '#92400E' }]}>Your dispute has been escalated and is awaiting urgent admin review.</Text>
              ) : (
                <Text style={styles.reviewMessage}>Your dispute is under review. Our team will respond within 24-48 hours.</Text>
              )}
            </View>
          </View>
        )}

        {/* Mediation Recommendation */}
        {hasMediationProposal && (
          <View style={styles.section}>
            <View style={[styles.mediationCard, { borderColor: '#8B5CF6' }]}>
              <Text style={styles.mediationTitle}>Mediation Recommendation</Text>
              <Text style={styles.mediationBody}>{dispute.mediationRecommendation}</Text>
              {canActOnMediation && (
                <View style={styles.mediationButtons}>
                  <TouchableOpacity
                    style={[styles.mediationBtn, { backgroundColor: '#10B981' }]}
                    disabled={actionLoading}
                    onPress={() => Alert.alert('Accept Mediation', 'Accept this recommendation?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Accept', onPress: () => handleMediation(true) },
                    ])}
                  >
                    <ShieldCheck size={15} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.mediationBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.mediationBtn, { backgroundColor: '#EF4444' }]}
                    disabled={actionLoading}
                    onPress={() => Alert.alert('Reject Mediation', 'Rejecting escalates this dispute to admin arbitration.', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Reject', style: 'destructive', onPress: () => handleMediation(false) },
                    ])}
                  >
                    <ShieldOff size={15} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.mediationBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!canActOnMediation && myAcceptance !== null && (
                <View style={styles.mediationStatusRow}>
                  {myAcceptance ? <CheckCircle2 size={14} color="#10B981" /> : <XCircle size={14} color="#EF4444" />}
                  <Text style={styles.mediationStatusText}>
                    {myAcceptance ? 'You accepted this recommendation' : 'You rejected this recommendation'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Pending Admin Questions Banner — hidden on resolved/closed disputes */}
        {hasPendingQuestion && (
          <View style={styles.section}>
            {pendingQuestions.map((q: any) => (
              <TouchableOpacity
                key={q.id}
                style={styles.questionBanner}
                onPress={() => router.push({ pathname: '/resolution-center' as any, params: { disputeId: dispute.id } })}
                activeOpacity={0.85}
              >
                <View style={styles.questionBannerHeader}>
                  <View style={styles.questionBannerIconWrap}>
                    <HelpCircle size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.questionBannerLabel}>Admin has a question</Text>
                </View>
                <Text style={styles.questionBannerText} numberOfLines={3}>{q.content}</Text>
                <View style={styles.questionBannerCta}>
                  <MessageSquare size={14} color="#1D4ED8" />
                  <Text style={styles.questionBannerCtaText}>Tap to reply in Resolution Center</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.contactButton, hasPendingQuestion && styles.contactButtonUrgent]}
            onPress={() => router.push({ pathname: '/resolution-center' as any, params: { disputeId: dispute.id } })}
          >
            <MessageSquare size={18} color={hasPendingQuestion ? '#FFFFFF' : '#282A32'} />
            <Text style={[styles.contactButtonText, hasPendingQuestion && styles.contactButtonTextUrgent]}>
              {hasPendingQuestion ? 'Reply in Resolution Center' : 'Open Resolution Center'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2FB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingTop: 60,
    backgroundColor: '#1C1F2E',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2 },
  content: { flex: 1 },
  statusCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#1C1F2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#EEF0F6',
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  statusValue: { fontSize: 20, fontWeight: '800' },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#1C1F2E', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#1C1F2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEF0F6',
  },
  projectTitleText: { fontSize: 16, fontWeight: '700', color: '#1C1F2E', marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  reasonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#1C1F2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEF0F6',
  },
  reasonTitle: { fontSize: 15, fontWeight: '700', color: '#1C1F2E', marginBottom: 8 },
  reasonDescription: { fontSize: 14, color: '#64748B', lineHeight: 22 },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1C1F2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEF0F6',
  },
  reviewMessage: { fontSize: 14, color: '#64748B', lineHeight: 22 },
  actionButtons: { padding: 20, paddingBottom: 40 },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F0F2FB',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1C1F2E',
    shadowColor: '#1C1F2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  contactButtonText: { color: '#1C1F2E', fontSize: 15, fontWeight: '700' },
  contactButtonUrgent: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.3,
  },
  contactButtonTextUrgent: { color: '#FFFFFF' },

  // Stage stepper
  stepperCard: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#1C1F2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEF0F6',
  },
  stepperItem: { alignItems: 'center', flex: 1, position: 'relative' },
  stepDot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEF0F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  stepDotActive: { backgroundColor: '#1C1F2E' },
  stepDotComplete: { backgroundColor: '#10B981' },
  stepDotText: { fontSize: 10, fontWeight: '800', color: '#94A3B8' },
  stepLabel: { fontSize: 9, fontWeight: '600', color: '#94A3B8', textAlign: 'center' },
  stepLabelActive: { color: '#1C1F2E', fontWeight: '800' },
  stepLabelComplete: { color: '#10B981' },
  stepLine: { position: 'absolute', top: 14, right: -16, width: 32, height: 2, backgroundColor: '#EEF0F6' },
  stepLineComplete: { backgroundColor: '#10B981' },

  // Countdown
  countdownBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 8,
    backgroundColor: '#FFFBEB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  countdownExpired: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  countdownText: { fontSize: 13, fontWeight: '700', color: '#92400E' },

  // Funds on hold
  fundsHoldBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 16,
    backgroundColor: '#FFF7ED', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#FED7AA',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  fundsHoldText: { fontSize: 13, fontWeight: '600', color: '#92400E', flex: 1 },

  // Mediation
  mediationCard: {
    backgroundColor: '#FAFAFF', borderRadius: 16, padding: 18, borderWidth: 1.5,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mediationTitle: { fontSize: 12, fontWeight: '800', color: '#7C3AED', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  mediationBody: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 },
  mediationButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  mediationBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, flex: 1, justifyContent: 'center' },
  mediationBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  mediationStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  mediationStatusText: { fontSize: 13, color: '#374151', fontWeight: '600' },

  // Escalated badge on status card
  escalatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  escalatedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
  },

  // Admin question banner
  questionBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  questionBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  questionBannerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionBannerLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  questionBannerText: {
    fontSize: 14,
    color: '#1E3A5F',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 12,
  },
  questionBannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  questionBannerCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  // Resolution outcome card
  outcomeCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  outcomeWon: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  outcomeLost: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  outcomeTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  outcomeTitleWon: {
    color: '#15803D',
  },
  outcomeTitleLost: {
    color: '#B91C1C',
  },
  outcomeDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 8,
  },
  outcomeNote: {
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 10,
    padding: 12,
  },
  outcomeNoteLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  outcomeNoteText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});