import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Calendar, DollarSign, User, Briefcase, FileText, HelpCircle, MessageSquare, ShieldCheck, ShieldOff, ShieldAlert, Lock, RefreshCw } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { disputeService } from '@/services/disputeService';
import { useAuth } from '@/contexts/AuthContext';

// Countdown helper — returns "Xd Xh Xm" or "Expired"
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

export default function FDisputeDetail() {
  const router = useRouter();
  const { user } = useAuth();
  // Support both: passing a full dispute JSON (legacy) or just an ID
  const params = useLocalSearchParams<{ dispute?: string; id?: string }>();
  const seedId = params.id || (params.dispute ? (() => { try { return JSON.parse(params.dispute!).id; } catch { return null; } })() : null);

  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [countdown, setCountdown] = useState('');

  const fetchDispute = useCallback(async () => {
    if (!seedId) { setLoading(false); return; }
    try {
      const data = await disputeService.getDisputeById(seedId);
      setDispute(data);
    } catch {
      // Fall back to seed data if available
      if (params.dispute) {
        try { setDispute(JSON.parse(params.dispute)); } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, [seedId]);

  useEffect(() => { fetchDispute(); }, [fetchDispute]);

  useEffect(() => {
    if (!dispute?.id) return;
    disputeService.getMessages(dispute.id)
      .then((msgs: any[]) => {
        setPendingQuestions((msgs || []).filter((m: any) => m.messageType === 'admin_question'));
      })
      .catch(() => {});
  }, [dispute?.id]);

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
        <ActivityIndicator size="large" color="#282A32" style={{ marginTop: 100 }} />
      </View>
    );
  }

  if (!dispute) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 40, color: '#6B7280' }}>No dispute data found.</Text>
      </View>
    );
  }

  const clientName = dispute.client?.user_name || dispute.client?.userName || 'Unknown Client';
  const projectTitle = dispute.project?.title || 'Unknown Project';
  const reason = dispute.reason;
  const status = dispute.status;
  const isResolvedDispute = ['resolved', 'closed', 'denied', 'Resolved', 'Denied', 'Closed'].includes(status);
  const hasPendingQuestion = pendingQuestions.length > 0 && !isResolvedDispute;
  const resolutionType = dispute.resolutionType as string | undefined;
  let outcomeWon: boolean | null = null;
  if (isResolvedDispute && resolutionType) {
    outcomeWon = resolutionType === 'payment_release';
  }
  const createdDate = dispute.createdAt
    ? new Date(dispute.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';
  const amount = dispute.amount;

  // Is this user the respondent (non-filer) in this dispute? Filer is the one who created — for freelancers, they can respond
  const isFreelancer = user?.role === 'Freelancer' || user?.activeRole === 'Freelancer';
  const canRespond = isFreelancer && status === 'open' && !dispute.respondentResponse;
  const hasMediationProposal = !!dispute.mediationRecommendation && !isResolvedDispute;
  const myAcceptance = isFreelancer ? dispute.freelancerAccepted : dispute.clientAccepted;
  const canActOnMediation = hasMediationProposal && myAcceptance === null;

  // Determine current stage index for stepper
  const normalizedStatus = status?.toLowerCase().replace(/ /g, '_');
  const currentStageIdx = STAGE_ORDER.indexOf(normalizedStatus) >= 0
    ? STAGE_ORDER.indexOf(normalizedStatus)
    : 0;

  const getStatusConfig = (s: string) => {
    switch (s) {
      case 'Pending':
      case 'open': return { color: '#F59E0B', bg: '#FFFBEB', icon: <Clock size={20} color="#F59E0B" /> };
      case 'Resolved':
      case 'resolved': return { color: '#10B981', bg: '#ECFDF5', icon: <CheckCircle2 size={20} color="#10B981" /> };
      case 'Denied':
      case 'denied':
      case 'closed': return { color: '#EF4444', bg: '#FEF2F2', icon: <XCircle size={20} color="#EF4444" /> };
      case 'mediation': return { color: '#8B5CF6', bg: '#F5F3FF', icon: <ShieldAlert size={20} color="#8B5CF6" /> };
      case 'under_review':
      case 'awaiting_response': return { color: '#3B82F6', bg: '#EFF6FF', icon: <Clock size={20} color="#3B82F6" /> };
      default: return { color: '#64748B', bg: '#F1F5F9', icon: <Clock size={20} color="#64748B" /> };
    }
  };

  const statusConfig = getStatusConfig(status);

  const handleRespond = async (response: 'accepted' | 'rejected' | 'counter') => {
    setActionLoading(true);
    try {
      await disputeService.respondToDispute(dispute.id, response);
      await fetchDispute();
      Alert.alert('Response Submitted', 'Your response has been recorded.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit response');
    } finally {
      setActionLoading(false);
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#282A32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Case Details</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchDispute}>
          <RefreshCw size={18} color="#6B7280" />
        </TouchableOpacity>
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
          <Text style={styles.statusSubText}>Reference ID: #DISP-{dispute.id || '001'}</Text>
          {dispute.isEscalated && (
            <View style={styles.escalatedBadge}>
              <ShieldAlert size={12} color="#EF4444" />
              <Text style={styles.escalatedBadgeText}>ESCALATED</Text>
            </View>
          )}
        </View>

        {/* STAGE STEPPER */}
        {!isResolvedDispute && (
          <View style={styles.stepperCard}>
            {STAGE_ORDER.map((stage, idx) => {
              const isComplete = idx < currentStageIdx;
              const isActive = idx === currentStageIdx;
              return (
                <View key={stage} style={styles.stepperItem}>
                  <View style={[
                    styles.stepDot,
                    isComplete && styles.stepDotComplete,
                    isActive && styles.stepDotActive,
                  ]}>
                    {isComplete
                      ? <CheckCircle2 size={14} color="#FFFFFF" />
                      : <Text style={[styles.stepDotText, isActive && { color: '#FFFFFF' }]}>{idx + 1}</Text>
                    }
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    isComplete && styles.stepLabelComplete,
                    isActive && styles.stepLabelActive,
                  ]}>
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

        {/* COUNTDOWN TIMER */}
        {!isResolvedDispute && countdown ? (
          <View style={[styles.countdownBanner, countdown === 'Expired' && styles.countdownExpired]}>
            <Clock size={14} color={countdown === 'Expired' ? '#B91C1C' : '#92400E'} />
            <Text style={[styles.countdownText, countdown === 'Expired' && { color: '#B91C1C' }]}>
              {countdown === 'Expired' ? 'Deadline passed — pending escalation' : countdown}
            </Text>
          </View>
        ) : null}

        {/* FUNDS ON HOLD BANNER */}
        {!isResolvedDispute && (
          <View style={styles.fundsHoldBanner}>
            <Lock size={14} color="#92400E" />
            <Text style={styles.fundsHoldText}>Funds on hold — released after dispute resolution</Text>
          </View>
        )}

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
              <Text style={styles.value}>${typeof amount === 'number' ? amount.toFixed(2) : amount || '0.00'}</Text>
            </View>
          </View>

          {dispute.subcategory ? (
            <View style={styles.infoRow}>
              <View style={styles.iconBg}><FileText size={18} color="#444751" /></View>
              <View>
                <Text style={styles.label}>CATEGORY</Text>
                <Text style={styles.value}>{dispute.subcategory}</Text>
              </View>
            </View>
          ) : null}

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
          {dispute.description ? (
            <Text style={[styles.reasonBody, { marginTop: 8, color: '#94A3B8' }]}>{dispute.description}</Text>
          ) : null}
        </View>

        {/* RESPONDENT RESPONSE SECTION */}
        {canRespond && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Your Response</Text>
            <Text style={[styles.reasonBody, { marginBottom: 16 }]}>
              The client has opened a dispute. Please review the details and submit your response.
            </Text>
            <View style={styles.responseButtons}>
              <TouchableOpacity
                style={[styles.responseBtn, styles.responseBtnAccept]}
                onPress={() => Alert.alert('Accept Claim', 'Do you accept the client\'s dispute claim?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Accept', onPress: () => handleRespond('accepted') },
                ])}
                disabled={actionLoading}
              >
                <CheckCircle2 size={16} color="#FFFFFF" />
                <Text style={styles.responseBtnText}>Accept Claim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.responseBtn, styles.responseBtnReject]}
                onPress={() => Alert.alert('Reject Claim', 'Do you reject the client\'s dispute claim?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reject', onPress: () => handleRespond('rejected') },
                ])}
                disabled={actionLoading}
              >
                <XCircle size={16} color="#FFFFFF" />
                <Text style={styles.responseBtnText}>Reject Claim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.responseBtn, styles.responseBtnCounter]}
                onPress={() => handleRespond('counter')}
                disabled={actionLoading}
              >
                <MessageSquare size={16} color="#1D4ED8" />
                <Text style={[styles.responseBtnText, { color: '#1D4ED8' }]}>Counter Offer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* RESPONDENT RESPONSE STATUS */}
        {dispute.respondentResponse && !canRespond && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Response Status</Text>
            <View style={styles.responseStatusRow}>
              {dispute.respondentResponse === 'accepted' && <CheckCircle2 size={18} color="#10B981" />}
              {dispute.respondentResponse === 'rejected' && <XCircle size={18} color="#EF4444" />}
              {dispute.respondentResponse === 'counter' && <MessageSquare size={18} color="#1D4ED8" />}
              <Text style={styles.responseStatusText}>
                {dispute.respondentResponse === 'accepted' && 'You accepted the dispute claim'}
                {dispute.respondentResponse === 'rejected' && 'You rejected the dispute claim'}
                {dispute.respondentResponse === 'counter' && 'You submitted a counter-offer (open in Resolution Center)'}
              </Text>
            </View>
          </View>
        )}

        {/* MEDIATION RECOMMENDATION */}
        {hasMediationProposal && (
          <View style={[styles.sectionCard, { borderColor: '#8B5CF6', borderWidth: 1.5 }]}>
            <Text style={[styles.sectionTitle, { color: '#7C3AED' }]}>Mediation Recommendation</Text>
            <Text style={styles.reasonBody}>{dispute.mediationRecommendation}</Text>
            {canActOnMediation && (
              <View style={[styles.responseButtons, { marginTop: 16 }]}>
                <TouchableOpacity
                  style={[styles.responseBtn, styles.responseBtnAccept]}
                  onPress={() => Alert.alert('Accept Mediation', 'Do you accept this mediation recommendation?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Accept', onPress: () => handleMediation(true) },
                  ])}
                  disabled={actionLoading}
                >
                  <ShieldCheck size={16} color="#FFFFFF" />
                  <Text style={styles.responseBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.responseBtn, styles.responseBtnReject]}
                  onPress={() => Alert.alert('Reject Mediation', 'Rejecting will escalate this dispute to admin arbitration.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reject', style: 'destructive', onPress: () => handleMediation(false) },
                  ])}
                  disabled={actionLoading}
                >
                  <ShieldOff size={16} color="#FFFFFF" />
                  <Text style={styles.responseBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
            {!canActOnMediation && myAcceptance !== null && (
              <View style={styles.responseStatusRow}>
                {myAcceptance ? <CheckCircle2 size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
                <Text style={styles.responseStatusText}>
                  {myAcceptance ? 'You accepted this recommendation' : 'You rejected this recommendation'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Resolution Outcome Card */}
        {isResolvedDispute && outcomeWon !== null && (
          <View style={[styles.outcomeCard, outcomeWon ? styles.outcomeWon : styles.outcomeLost]}>
            <View style={styles.outcomeRow}>
              {outcomeWon
                ? <ShieldCheck size={28} color="#15803D" />
                : <ShieldOff size={28} color="#B91C1C" />
              }
              <Text style={[styles.outcomeTitle, outcomeWon ? styles.outcomeTitleWon : styles.outcomeTitleLost]}>
                {outcomeWon ? 'Resolved in Your Favour' : 'Resolved Against You'}
              </Text>
            </View>
            <Text style={styles.outcomeDesc}>
              {outcomeWon
                ? 'The admin decided to release payment to you. Funds will be transferred to your account.'
                : 'The admin decided to issue a refund to the client. No payment will be released for this dispute.'}
            </Text>
            {dispute.resolutionDescription ? (
              <View style={styles.outcomeNote}>
                <Text style={styles.outcomeNoteLabel}>ADMIN NOTES</Text>
                <Text style={styles.outcomeNoteText}>{dispute.resolutionDescription}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Pending Admin Questions Banner */}
        {hasPendingQuestion && pendingQuestions.map((q: any) => (
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

        {/* OPEN RESOLUTION CENTER BUTTON */}
        <TouchableOpacity
          style={[styles.supportButton, hasPendingQuestion && styles.supportButtonUrgent]}
          onPress={() => router.push({ pathname: '/resolution-center' as any, params: { disputeId: dispute.id } })}
        >
          <Text style={[styles.supportButtonText, hasPendingQuestion && styles.supportButtonTextUrgent]}>
            {hasPendingQuestion ? 'Reply in Resolution Center' : 'Open Resolution Center'}
          </Text>
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
  refreshButton: {
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
    marginBottom: 16,
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

  // Stage stepper
  stepperCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperItem: { alignItems: 'center', flex: 1, position: 'relative' },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  stepDotActive: { backgroundColor: '#282A32' },
  stepDotComplete: { backgroundColor: '#10B981' },
  stepDotText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  stepLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8', textAlign: 'center' },
  stepLabelActive: { color: '#282A32', fontWeight: '800' },
  stepLabelComplete: { color: '#10B981' },
  stepLine: {
    position: 'absolute',
    top: 14, right: -16,
    width: 32, height: 2,
    backgroundColor: '#E2E8F0',
  },
  stepLineComplete: { backgroundColor: '#10B981' },

  // Countdown
  countdownBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFBEB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#FCD34D', marginBottom: 12,
  },
  countdownExpired: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  countdownText: { fontSize: 13, fontWeight: '700', color: '#92400E' },

  // Funds on hold
  fundsHoldBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF7ED', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#FED7AA', marginBottom: 16,
  },
  fundsHoldText: { fontSize: 13, fontWeight: '600', color: '#92400E', flex: 1 },

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
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#282A32', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },

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

  reasonHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  reasonBody: { fontSize: 15, color: '#475569', lineHeight: 24 },

  // Respondent response buttons
  responseButtons: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  responseBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    flex: 1, justifyContent: 'center',
  },
  responseBtnAccept: { backgroundColor: '#10B981' },
  responseBtnReject: { backgroundColor: '#EF4444' },
  responseBtnCounter: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  responseBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  responseStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  responseStatusText: { fontSize: 14, color: '#475569', fontWeight: '600', flex: 1 },

  supportButton: {
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  supportButtonText: { color: '#444751', fontWeight: '800', fontSize: 15 },
  supportButtonUrgent: { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' },
  supportButtonTextUrgent: { color: '#FFFFFF' },

  // Admin question banner
  questionBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  questionBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  questionBannerIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#1D4ED8', justifyContent: 'center', alignItems: 'center',
  },
  questionBannerLabel: { fontSize: 14, fontWeight: '800', color: '#1D4ED8' },
  questionBannerText: { fontSize: 15, color: '#1E3A5F', lineHeight: 22, fontWeight: '500', marginBottom: 12 },
  questionBannerCta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  questionBannerCtaText: { fontSize: 13, fontWeight: '700', color: '#1D4ED8' },

  // Escalated badge
  escalatedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, marginTop: 8,
  },
  escalatedBadgeText: { fontSize: 10, fontWeight: '800', color: '#EF4444', letterSpacing: 0.5 },

  // Resolution outcome card
  outcomeCard: { borderRadius: 20, padding: 20, borderWidth: 1.5, marginBottom: 20 },
  outcomeWon: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  outcomeLost: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  outcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  outcomeTitle: { fontSize: 17, fontWeight: '800', flexShrink: 1 },
  outcomeTitleWon: { color: '#15803D' },
  outcomeTitleLost: { color: '#B91C1C' },
  outcomeDesc: { fontSize: 14, lineHeight: 22, color: '#374151', marginBottom: 4 },
  outcomeNote: { marginTop: 12, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 10, padding: 12 },
  outcomeNoteLabel: { fontSize: 11, fontWeight: '800', color: '#6B7280', letterSpacing: 0.8, marginBottom: 4 },
  outcomeNoteText: { fontSize: 14, color: '#374151', lineHeight: 20 },
});
