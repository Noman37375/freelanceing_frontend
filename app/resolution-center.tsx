import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Send,
    AlertTriangle,
    DollarSign,
    Calendar,
    User,
    Briefcase,
    HelpCircle,
    CheckCircle2,
    XCircle,
    ShieldAlert,
    X,
    Clock,
    Lock,
} from 'lucide-react-native';
import DisputeStatusBadge from '@/components/dispute/DisputeStatusBadge';
import DisputeMessageThread from '@/components/dispute/DisputeMessageThread';
import EvidenceUploader from '@/components/dispute/EvidenceUploader';
import DisputeTimeline from '@/components/dispute/DisputeTimeline';
import { disputeService } from '@/services/disputeService';
import { useAuth } from '@/contexts/AuthContext';
import type { Dispute, DisputeMessage, DisputeEvidence, DisputeTimelineEvent } from '@/models/Dispute';

export default function ResolutionCenter() {
    const router = useRouter();
    const { orderId, disputeId } = useLocalSearchParams<{ orderId: string; disputeId?: string }>();
    const { user } = useAuth();

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/FDisputes' as any);
        }
    };

    const [dispute, setDispute] = useState<Dispute | null>(null);
    const [messages, setMessages] = useState<DisputeMessage[]>([]);
    const [evidence, setEvidence] = useState<DisputeEvidence[]>([]);
    const [timeline, setTimeline] = useState<DisputeTimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);
    const [escalateModalVisible, setEscalateModalVisible] = useState(false);
    const [escalateReason, setEscalateReason] = useState('');
    const [escalating, setEscalating] = useState(false);
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        loadDisputeData();
    }, [disputeId]);

    // Countdown timer — must be before any early returns (Rules of Hooks)
    useEffect(() => {
        const deadline = (dispute as any)?.responseDeadline || (dispute as any)?.stageDeadline;
        const resolved = ['resolved', 'closed', 'denied', 'Resolved', 'Denied', 'Closed'].includes(dispute?.status ?? '');
        if (!deadline || resolved) return;
        const calc = () => {
            const diff = new Date(deadline).getTime() - Date.now();
            if (diff <= 0) { setCountdown('Expired'); return; }
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            if (d > 0) setCountdown(`${d}d ${h}h remaining`);
            else if (h > 0) setCountdown(`${h}h ${m}m remaining`);
            else setCountdown(`${m}m remaining`);
        };
        calc();
        const t = setInterval(calc, 60_000);
        return () => clearInterval(t);
    }, [(dispute as any)?.responseDeadline, (dispute as any)?.stageDeadline, dispute?.status]);

    const loadDisputeData = async () => {
        try {
            setLoading(true);

            if (disputeId) {
                // Load existing dispute
                const disputeData = await disputeService.getDisputeById(disputeId);
                setDispute(disputeData);

                // Load messages, evidence, and timeline
                // Load messages, evidence, and timeline
                const [messagesData, evidenceData, timelineData] = await Promise.all([
                    disputeService.getMessages(disputeId),
                    disputeService.getEvidence(disputeId),
                    disputeService.getTimeline(disputeId)
                ]);

                setMessages(messagesData);
                setEvidence(evidenceData);
                setTimeline(timelineData);
            }
        } catch (error: any) {
            console.error('Failed to load dispute:', error);
            Alert.alert('Error', 'Failed to load dispute information');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !dispute) return;

        try {
            setSending(true);

            const newMessage = await disputeService.sendMessage(dispute.id, messageText);

            setMessages([...messages, newMessage]);
            setMessageText('');
        } catch (error: any) {
            console.error('Failed to send message:', error);
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleEvidenceUpload = (newEvidence: DisputeEvidence) => {
        setEvidence([...evidence, newEvidence]);

        // Add timeline event
        const timelineEvent: DisputeTimelineEvent = {
            id: Date.now().toString(),
            type: 'evidence_added',
            description: `${user?.userName} uploaded new evidence: ${newEvidence.name}`,
            performedBy: user?.userName || 'You',
            performedAt: new Date().toISOString(),
        };
        setTimeline([...timeline, timelineEvent]);
    };

    const handleEscalate = () => setEscalateModalVisible(true);

    const submitEscalation = async () => {
        if (!escalateReason.trim()) {
            Alert.alert('Required', 'Please explain why you are escalating this dispute.');
            return;
        }
        try {
            setEscalating(true);
            await disputeService.escalateToSupport(dispute!.id, escalateReason.trim());
            setEscalateModalVisible(false);
            setEscalateReason('');
            await loadDisputeData();
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to escalate dispute');
        } finally {
            setEscalating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#444751" />
                    <Text style={styles.loadingText}>Loading dispute information...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!dispute) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <AlertTriangle size={48} color="#EF4444" />
                    <Text style={styles.errorText}>Dispute not found</Text>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Determine resolution outcome for the current user
    const resolutionType = (dispute as any).resolutionType as string | undefined;
    const isResolved = ['resolved', 'closed', 'denied', 'Resolved', 'Denied', 'Closed'].includes(dispute.status);
    const isClient = dispute.client?.id === user?.id;
    const isFreelancer = dispute.freelancer?.id === user?.id;
    let outcomeWon: boolean | null = null;
    if (isResolved && resolutionType) {
        if (isClient) {
            outcomeWon = ['full_refund', 'partial_refund'].includes(resolutionType);
        } else if (isFreelancer) {
            outcomeWon = resolutionType === 'payment_release';
        }
    }

    const alreadyEscalated = (dispute as any).isEscalated === true;
    const canEscalate = !isResolved && !alreadyEscalated;

    return (
        <SafeAreaView style={styles.container}>
            {/* Escalation Modal */}
            <Modal
                visible={escalateModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEscalateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconWrap}>
                                <ShieldAlert size={18} color="#EF4444" />
                            </View>
                            <Text style={styles.modalTitle}>Escalate to Support</Text>
                            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setEscalateModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <X size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalBody}>
                            Escalating flags this dispute as urgent and puts it at the top of the admin queue. Please describe why the current process isn't working so the admin can act quickly.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. The other party is not responding and the deadline has passed..."
                            placeholderTextColor="#94A3B8"
                            value={escalateReason}
                            onChangeText={setEscalateReason}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={500}
                        />
                        <Text style={styles.modalCharCount}>{escalateReason.length}/500</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEscalateModalVisible(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSubmitBtn, escalating && { opacity: 0.6 }]}
                                onPress={submitEscalation}
                                disabled={escalating}
                            >
                                {escalating ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.modalSubmitText}>Escalate Now</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform?.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform?.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerBackButton} onPress={handleBack} activeOpacity={0.7}>
                        <ArrowLeft size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Resolution Center</Text>
                        <Text style={styles.headerSubtitle}>Dispute #{dispute.id.slice(0, 8)}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <DisputeStatusBadge status={dispute.status} size="small" />
                    </View>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Countdown Timer */}
                    {!isResolved && countdown ? (
                        <View style={[styles.rcCountdownBanner, countdown === 'Expired' && styles.rcCountdownExpired]}>
                            <View style={[styles.bannerStrip, { backgroundColor: countdown === 'Expired' ? '#EF4444' : '#F59E0B' }]} />
                            <View style={styles.bannerContent}>
                                <Clock size={14} color={countdown === 'Expired' ? '#B91C1C' : '#92400E'} />
                                <Text style={[styles.rcCountdownText, countdown === 'Expired' && { color: '#B91C1C' }]}>
                                    {countdown === 'Expired' ? 'Deadline passed — pending escalation' : countdown}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    {/* Funds On Hold Banner */}
                    {!isResolved && (
                        <View style={styles.rcFundsHoldBanner}>
                            <View style={[styles.bannerStrip, { backgroundColor: '#F97316' }]} />
                            <View style={styles.bannerContent}>
                                <Lock size={14} color="#92400E" />
                                <Text style={styles.rcFundsHoldText}>Funds on hold — released after dispute resolution</Text>
                            </View>
                        </View>
                    )}

                    {/* Admin question banner — shown only on active disputes with pending questions */}
                    {!['resolved', 'closed', 'denied', 'Resolved', 'Denied', 'Closed'].includes(dispute.status) &&
                     messages.filter((m: any) => m.messageType === 'admin_question').length > 0 && (
                        <View style={styles.pendingQuestionBanner}>
                            <View style={styles.pendingQuestionBannerHeader}>
                                <View style={styles.pendingQuestionIconWrap}>
                                    <HelpCircle size={18} color="#FFFFFF" />
                                </View>
                                <Text style={styles.pendingQuestionBannerTitle}>Admin is waiting for your response</Text>
                            </View>
                            <Text style={styles.pendingQuestionBannerBody}>
                                Review the question highlighted in blue below and type your reply in the message box.
                            </Text>
                        </View>
                    )}

                    {/* Dispute Info Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.cardTitleRow}>
                            <View style={styles.cardTitleAccent} />
                            <Text style={styles.sectionTitle}>Dispute Information</Text>
                        </View>
                        <View style={styles.cardTitleDivider} />

                        <View style={styles.infoRow}>
                            <View style={[styles.infoIconContainer, { backgroundColor: '#F1F5F9' }]}>
                                <Briefcase size={17} color="#475569" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>PROJECT</Text>
                                <Text style={styles.infoValue}>{dispute.title || dispute.projectId || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={[styles.infoIconContainer, { backgroundColor: '#ECFDF5' }]}>
                                <DollarSign size={17} color="#10B981" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>DISPUTED AMOUNT</Text>
                                <Text style={[styles.infoValue, styles.infoValueAmount]}>
                                    ${dispute.amount?.toFixed(2) || '0.00'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={[styles.infoIconContainer, { backgroundColor: '#EFF6FF' }]}>
                                <Calendar size={17} color="#3B82F6" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>CREATED</Text>
                                <Text style={styles.infoValue}>{formatDate(dispute.createdAt)}</Text>
                            </View>
                        </View>

                        <View style={styles.reasonContainer}>
                            <Text style={styles.reasonLabel}>REASON</Text>
                            <Text style={styles.reasonText}>{dispute.description}</Text>
                        </View>
                    </View>

                    {/* Messages Section */}
                    <View style={styles.messagesCard}>
                        <View style={styles.cardTitleRow}>
                            <View style={styles.cardTitleAccent} />
                            <Text style={styles.sectionTitle}>Discussion</Text>
                        </View>
                        <View style={styles.cardTitleDivider} />
                        <View style={styles.messagesContainer}>
                            <DisputeMessageThread messages={messages} currentUserId={user?.id || ''} />
                        </View>
                    </View>

                    {/* Evidence Section */}
                    <EvidenceUploader
                        disputeId={dispute.id}
                        existingEvidence={evidence}
                        onUploadComplete={handleEvidenceUpload}
                        clientId={(dispute as any).clientId}
                        freelancerId={(dispute as any).freelancerId}
                    />

                    {/* Timeline Section */}
                    <DisputeTimeline events={timeline} />

                    {/* Resolution Outcome Card */}
                    {isResolved && outcomeWon !== null && (
                        <View style={[styles.outcomeCard, outcomeWon ? styles.outcomeWon : styles.outcomeLost]}>
                            <View style={styles.outcomeIconRow}>
                                <View style={[styles.outcomeIconCircle, { backgroundColor: outcomeWon ? '#D1FAE5' : '#FEE2E2', borderColor: outcomeWon ? '#6EE7B7' : '#FCA5A5' }]}>
                                    {outcomeWon
                                        ? <CheckCircle2 size={24} color="#10B981" />
                                        : <XCircle size={24} color="#EF4444" />
                                    }
                                </View>
                                <Text style={[styles.outcomeTitle, outcomeWon ? styles.outcomeTitleWon : styles.outcomeTitleLost]}>
                                    {outcomeWon ? 'Resolved in Your Favour' : 'Resolved Against You'}
                                </Text>
                            </View>
                            <Text style={styles.outcomeDesc}>
                                {outcomeWon
                                    ? isClient
                                        ? 'The admin has decided to issue a refund. The disputed amount will be returned to you.'
                                        : 'The admin has decided to release the payment to you. The funds will be credited to your wallet.'
                                    : isClient
                                        ? 'The admin decided to release payment to the freelancer. No refund will be issued.'
                                        : 'The admin decided to refund the client. The disputed amount will be returned to them.'
                                }
                            </Text>
                            {(dispute as any).resolutionDescription ? (
                                <View style={styles.outcomeNote}>
                                    <Text style={styles.outcomeNoteLabel}>ADMIN NOTES</Text>
                                    <Text style={styles.outcomeNoteText}>{(dispute as any).resolutionDescription}</Text>
                                </View>
                            ) : null}
                        </View>
                    )}

                    {/* Escalated State Card — shown when user has flagged as urgent */}
                    {alreadyEscalated && (
                        <View style={styles.escalatedCard}>
                            <View style={styles.escalatedStrip} />
                            <View style={styles.escalatedBody}>
                                <View style={styles.escalatedHeader}>
                                    <View style={styles.escalatedIconWrap}>
                                        <ShieldAlert size={16} color="#F59E0B" />
                                    </View>
                                    <Text style={styles.escalatedTitle}>Escalated — Urgent Review</Text>
                                </View>
                                <Text style={styles.escalatedBodyText}>
                                    This dispute has been flagged for urgent admin attention and is at the top of the review queue. You will be notified as soon as a decision is made.
                                </Text>
                                {(dispute as any).escalationReason ? (
                                    <View style={styles.escalatedReasonBox}>
                                        <Text style={styles.escalatedReasonLabel}>YOUR REASON</Text>
                                        <Text style={styles.escalatedReasonText}>{(dispute as any).escalationReason}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    )}

                    {/* Escalate Button — hidden once escalated or resolved */}
                    {canEscalate && (
                        <TouchableOpacity style={styles.escalateButton} onPress={handleEscalate} activeOpacity={0.75}>
                            <View style={styles.escalateBtnIconWrap}>
                                <ShieldAlert size={17} color="#EF4444" />
                            </View>
                            <Text style={styles.escalateButtonText}>Escalate to Support</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Message Input */}
                {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                    <View style={styles.messageInputContainer}>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Type your message..."
                            placeholderTextColor="#94A3B8"
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
                            onPress={handleSendMessage}
                            disabled={!messageText.trim() || sending}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Send size={20} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2FB',
    },
    keyboardAvoid: {
        flex: 1,
    },

    // ─── Header ───────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#1C1F2E',
        shadowColor: '#1C1F2E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    headerBackButton: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    headerCenter: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.55)',
        fontWeight: '600',
        marginTop: 1,
    },
    headerRight: {
        marginLeft: 12,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 18,
    },

    // ─── Loading / Error ──────────────────────────────────────────────────────
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 15,
        color: '#64748B',
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 16,
    },
    errorText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#282A32',
    },
    backButton: {
        backgroundColor: '#1C1F2E',
        paddingHorizontal: 24,
        paddingVertical: 13,
        borderRadius: 14,
        marginTop: 8,
        shadowColor: '#1C1F2E',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },

    // ─── Shared banner helpers ────────────────────────────────────────────────
    bannerStrip: {
        width: 4,
    },
    bannerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },

    // ─── Countdown banner ─────────────────────────────────────────────────────
    rcCountdownBanner: {
        flexDirection: 'row',
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FCD34D',
        marginBottom: 10,
        overflow: 'hidden',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    rcCountdownExpired: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
    rcCountdownText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#92400E' },

    // ─── Funds on hold banner ─────────────────────────────────────────────────
    rcFundsHoldBanner: {
        flexDirection: 'row',
        backgroundColor: '#FFF7ED',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FED7AA',
        marginBottom: 14,
        overflow: 'hidden',
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 1,
    },
    rcFundsHoldText: { fontSize: 13, fontWeight: '600', color: '#92400E', flex: 1 },

    // ─── Pending admin question banner ────────────────────────────────────────
    pendingQuestionBanner: {
        backgroundColor: '#1E40AF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#1D4ED8',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    pendingQuestionBannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    pendingQuestionIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    pendingQuestionBannerTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    pendingQuestionBannerBody: {
        fontSize: 13,
        color: '#BFDBFE',
        lineHeight: 19,
    },

    // ─── Card shared helpers ──────────────────────────────────────────────────
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    cardTitleAccent: {
        width: 3,
        height: 18,
        borderRadius: 2,
        backgroundColor: '#5B5FEF',
    },
    cardTitleDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },

    // ─── Dispute info card ────────────────────────────────────────────────────
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EEF0F6',
        shadowColor: '#1C1F2E',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#1C1F2E',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    infoIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        marginBottom: 3,
        letterSpacing: 0.6,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#282A32',
    },
    infoValueAmount: {
        color: '#059669',
        fontSize: 16,
    },
    reasonContainer: {
        marginTop: 4,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    reasonLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        marginBottom: 8,
        letterSpacing: 0.6,
    },
    reasonText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },

    // ─── Messages card ────────────────────────────────────────────────────────
    messagesCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EEF0F6',
        shadowColor: '#1C1F2E',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    messagesContainer: {
        height: 300,
    },

    // ─── Escalate button ──────────────────────────────────────────────────────
    escalateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FEF2F2',
        borderWidth: 1.5,
        borderColor: '#FECACA',
        borderRadius: 16,
        paddingVertical: 15,
        marginTop: 16,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    escalateBtnIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    escalateButtonText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#DC2626',
    },
    bottomSpacer: {
        height: 24,
    },

    // ─── Message input bar ────────────────────────────────────────────────────
    messageInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEF0F6',
        shadowColor: '#1C1F2E',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 5,
    },
    messageInput: {
        flex: 1,
        backgroundColor: '#F5F6FA',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 11,
        fontSize: 15,
        color: '#1C1F2E',
        maxHeight: 100,
        borderWidth: 1.5,
        borderColor: '#EEF0F6',
        lineHeight: 21,
    },
    sendButton: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#5B5FEF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#5B5FEF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    sendButtonDisabled: {
        opacity: 0.45,
    },

    // ─── Escalation Modal ─────────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: 40,
    },
    modalHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E8F0',
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
    },
    modalIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    modalTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '800',
        color: '#282A32',
    },
    modalCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    modalBody: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 21,
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: '#FAFBFC',
        borderRadius: 14,
        padding: 14,
        fontSize: 14,
        color: '#282A32',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        minHeight: 110,
        textAlignVertical: 'top',
        lineHeight: 21,
    },
    modalCharCount: {
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'right',
        marginTop: 6,
        marginBottom: 18,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    modalCancelText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748B',
    },
    modalSubmitBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: '#DC2626',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EF4444',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    modalSubmitText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
    },

    // ─── Resolution outcome card ──────────────────────────────────────────────
    outcomeCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    outcomeWon: {
        backgroundColor: '#F0FDF4',
        borderColor: '#86EFAC',
    },
    outcomeLost: {
        backgroundColor: '#FFF1F2',
        borderColor: '#FECDD3',
    },
    outcomeIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    outcomeIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    outcomeTitle: {
        fontSize: 16,
        fontWeight: '800',
        flex: 1,
    },
    outcomeTitleWon: {
        color: '#15803D',
    },
    outcomeTitleLost: {
        color: '#B91C1C',
    },
    outcomeDesc: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 21,
    },
    outcomeNote: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.07)',
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 10,
        padding: 12,
        marginTop: 16,
    },
    outcomeNoteLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    outcomeNoteText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },

    // ─── Escalated state card ─────────────────────────────────────────────────
    escalatedCard: {
        backgroundColor: '#FFFBEB',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FDE68A',
        overflow: 'hidden',
        flexDirection: 'row',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    escalatedStrip: {
        width: 4,
        backgroundColor: '#F59E0B',
    },
    escalatedBody: {
        flex: 1,
        padding: 16,
    },
    escalatedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    escalatedIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    escalatedTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#92400E',
        flex: 1,
    },
    escalatedBodyText: {
        fontSize: 13,
        color: '#78350F',
        lineHeight: 20,
    },
    escalatedReasonBox: {
        marginTop: 10,
        backgroundColor: 'rgba(217,119,6,0.08)',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    escalatedReasonLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#92400E',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    escalatedReasonText: {
        fontSize: 13,
        color: '#78350F',
        lineHeight: 18,
    },
});
