import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    AlertTriangle,
    DollarSign,
    RotateCcw,
    Send,
    HelpCircle,
    PlayCircle,
    ShieldAlert,
    Clock,
} from 'lucide-react-native';
import DisputeStatusBadge from '@/components/dispute/DisputeStatusBadge';
import DisputeMessageThread from '@/components/dispute/DisputeMessageThread';
import DisputeTimeline from '@/components/dispute/DisputeTimeline';
import EvidenceUploader from '@/components/dispute/EvidenceUploader';
import SectionCard from '@/components/SectionCard';
import { adminService } from '@/services/adminService';
import { disputeService } from '@/services/disputeService';
import { useAuth } from '@/contexts/AuthContext';
import type { DisputeTimelineEvent } from '@/models/Dispute';
import { normalizeDisputeStatus } from '@/utils/statusHelper';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

interface BackendDispute {
    id: string;
    projectId: string;
    clientId: string;
    freelancerId: string;
    reason: string;
    subcategory?: string;
    description: string;
    amount: number;
    status: string;
    priority: string;
    assignedMediatorId?: string;
    resolutionType?: string;
    resolutionDescription?: string;
    resolvedBy?: string;
    resolvedAt?: string;
    isEscalated?: boolean;
    escalationReason?: string;
    escalatedAt?: string;
    stageDeadline?: string;
    responseDeadline?: string;
    mediationRecommendation?: string;
    clientAccepted?: boolean | null;
    freelancerAccepted?: boolean | null;
    respondentResponse?: string;
    createdAt: string;
    updatedAt: string;
    timeline?: DisputeTimelineEvent[];
    project?: { id: string; title: string; description?: string };
    client?: { id: string; user_name: string; email: string };
    freelancer?: { id: string; user_name: string; email: string };
    mediator?: { id: string; user_name?: string; userName?: string };
}

export default function AdminDisputeDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();

    const [dispute, setDispute] = useState<BackendDispute | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [evidence, setEvidence] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolvingAction, setResolvingAction] = useState<'refund_client' | 'release_to_freelancer' | null>(null);
    const [resolveError, setResolveError] = useState('');
    const [resolveSuccess, setResolveSuccess] = useState('');
    const [resolutionDescription, setResolutionDescription] = useState('');

    // Ask question state
    const [questionText, setQuestionText] = useState('');
    const [sendingQuestion, setSendingQuestion] = useState(false);
    const [questionError, setQuestionError] = useState('');
    const [questionSuccess, setQuestionSuccess] = useState('');

    // Start review state
    const [startingReview, setStartingReview] = useState(false);

    // Mediation recommendation state
    const [mediationText, setMediationText] = useState('');
    const [sendingMediation, setSendingMediation] = useState(false);
    const [mediationError, setMediationError] = useState('');
    const [mediationSuccess, setMediationSuccess] = useState('');

    useEffect(() => {
        loadDispute();
    }, [id]);

    const loadDispute = async () => {
        try {
            setLoading(true);
            const data = await adminService.getDisputeById(id);
            setDispute(data);

            try {
                const msgs = await disputeService.getMessages(id);
                setMessages(msgs || []);
            } catch (e) {
                console.warn('Failed to load messages:', e);
            }

            try {
                const evd = await disputeService.getEvidence(id);
                setEvidence(evd || []);
            } catch (e) {
                console.warn('Failed to load evidence:', e);
            }
        } catch (error: any) {
            console.error('Failed to load dispute:', error);
            Alert.alert('Error', 'Failed to load dispute details');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (action: 'refund_client' | 'release_to_freelancer') => {
        if (!dispute) return;
        setResolveError('');
        setResolveSuccess('');

        if (!resolutionDescription.trim()) {
            setResolveError('Please provide a resolution description before proceeding.');
            return;
        }

        const type = action === 'refund_client' ? 'full_refund' : 'payment_release';
        const label = action === 'refund_client' ? 'Refund issued to client' : 'Payment released to freelancer';

        try {
            setResolvingAction(action);
            await adminService.resolveDispute(dispute.id, {
                type,
                description: resolutionDescription,
                decision: 'resolve',
            });
            setResolveSuccess(`Dispute resolved — ${label}.`);
            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            setResolveError(error?.message || 'Failed to resolve dispute. Please try again.');
        } finally {
            setResolvingAction(null);
        }
    };

    const handleStartReview = async () => {
        if (!dispute) return;
        try {
            setStartingReview(true);
            await adminService.startDisputeReview(dispute.id);
            await loadDispute();
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to start review');
        } finally {
            setStartingReview(false);
        }
    };

    const handleAskQuestion = async () => {
        if (!dispute) return;
        setQuestionError('');
        setQuestionSuccess('');

        if (!questionText.trim()) {
            setQuestionError('Please enter a question before sending.');
            return;
        }

        try {
            setSendingQuestion(true);
            const newMsg = await adminService.askDisputeQuestion(dispute.id, questionText.trim());
            setQuestionText('');
            setQuestionSuccess('Question sent. Both client and freelancer have been notified.');
            // Optimistically add to messages
            if (newMsg) {
                setMessages((prev) => [...prev, newMsg]);
            } else {
                // Reload messages to pick up the new question
                const msgs = await disputeService.getMessages(dispute.id);
                setMessages(msgs || []);
            }
            setTimeout(() => setQuestionSuccess(''), 4000);
        } catch (error: any) {
            setQuestionError(error?.message || 'Failed to send question. Please try again.');
        } finally {
            setSendingQuestion(false);
        }
    };

    const handleSendMediationRecommendation = async () => {
        if (!dispute) return;
        setMediationError('');
        setMediationSuccess('');

        if (!mediationText.trim()) {
            setMediationError('Please enter a recommendation before sending.');
            return;
        }

        try {
            setSendingMediation(true);
            await adminService.setMediationRecommendation(dispute.id, mediationText.trim());
            setMediationText('');
            setMediationSuccess('Recommendation sent. Both parties have been notified and must accept or reject.');
            await loadDispute();
            setTimeout(() => setMediationSuccess(''), 5000);
        } catch (e: any) {
            setMediationError(e?.message || 'Failed to send recommendation');
        } finally {
            setSendingMediation(false);
        }
    };

    const handleUpdatePriority = async (priority: 'low' | 'medium' | 'high' | 'urgent') => {
        if (!dispute) return;
        try {
            await adminService.updateDisputePriority(dispute.id, priority);
            Alert.alert('Success', `Priority updated to ${priority}`);
            loadDispute();
        } catch {
            Alert.alert('Error', 'Failed to update priority');
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.secondary} />
                    <Text style={styles.loadingText}>Loading dispute...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!dispute) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <AlertTriangle size={48} color={COLORS.error} />
                    <Text style={styles.errorText}>Dispute not found</Text>
                    <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()}>
                        <Text style={styles.goBackButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const priorities: Array<{ label: string; value: 'low' | 'medium' | 'high' | 'urgent'; color: string }> = [
        { label: 'Low', value: 'low', color: '#64748B' },
        { label: 'Medium', value: 'medium', color: '#3B82F6' },
        { label: 'High', value: 'high', color: '#F59E0B' },
        { label: 'Urgent', value: 'urgent', color: '#EF4444' },
    ];

    const normalizedStatus = normalizeDisputeStatus(dispute.status);
    const isResolved = ['resolved', 'closed'].includes(normalizedStatus);

    // SLA breach: dispute is still open/under_review and was created >48h ago
    const is48hBreached = ['open', 'under_review'].includes(normalizedStatus) && dispute.createdAt &&
        (Date.now() - new Date(dispute.createdAt).getTime() > 48 * 60 * 60 * 1000);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
                    <ArrowLeft size={22} color={COLORS.secondaryDark} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Dispute Details</Text>
                    <Text style={styles.headerSubtitle}>#{dispute.id.slice(0, 8)}</Text>
                </View>
                <DisputeStatusBadge status={dispute.status} size="small" />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Core Info — Project Title, Amount, Dispute Reason */}
                <SectionCard title="Dispute Overview">
                    <View style={styles.coreInfoRow}>
                        <View style={styles.coreInfoItem}>
                            <Text style={styles.coreLabel}>PROJECT</Text>
                            <Text style={styles.coreValue} numberOfLines={2}>
                                {dispute.project?.title || 'Untitled Project'}
                            </Text>
                        </View>
                        <View style={[styles.coreInfoItem, styles.coreInfoItemRight]}>
                            <Text style={styles.coreLabel}>AMOUNT</Text>
                            <Text style={[styles.coreValue, styles.amountValue]}>
                                ${dispute.amount?.toFixed(2) ?? '0.00'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.coreDivider} />

                    <View>
                        <Text style={styles.coreLabel}>DISPUTE REASON</Text>
                        <Text style={styles.coreValue}>
                            {dispute.reason?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Not specified'}
                        </Text>
                    </View>

                    <View style={styles.coreDivider} />

                    <View style={styles.coreInfoRow}>
                        <View style={styles.coreInfoItem}>
                            <Text style={styles.coreLabel}>CLIENT</Text>
                            <Text style={styles.coreValue}>{dispute.client?.user_name || 'N/A'}</Text>
                            {dispute.client?.email ? (
                                <Text style={styles.coreSubValue}>{dispute.client.email}</Text>
                            ) : null}
                        </View>
                        <View style={[styles.coreInfoItem, styles.coreInfoItemRight]}>
                            <Text style={styles.coreLabel}>FREELANCER</Text>
                            <Text style={styles.coreValue}>{dispute.freelancer?.user_name || 'N/A'}</Text>
                            {dispute.freelancer?.email ? (
                                <Text style={styles.coreSubValue}>{dispute.freelancer.email}</Text>
                            ) : null}
                        </View>
                    </View>

                    {dispute.description ? (
                        <>
                            <View style={styles.coreDivider} />
                            <Text style={styles.coreLabel}>DESCRIPTION</Text>
                            <Text style={styles.descriptionText}>{dispute.description}</Text>
                        </>
                    ) : null}
                </SectionCard>

                {/* Escalation Alert — shown when user flagged as urgent */}
                {dispute.isEscalated && (
                    <View style={styles.escalationCard}>
                        <View style={styles.escalationStrip} />
                        <View style={styles.escalationBody}>
                            <View style={styles.escalationHeader}>
                                <View style={styles.escalationIconWrap}>
                                    <ShieldAlert size={16} color="#EF4444" />
                                </View>
                                <Text style={styles.escalationTitle}>Flagged as Urgent by Party</Text>
                            </View>
                            {dispute.escalationReason ? (
                                <>
                                    <Text style={styles.escalationLabel}>REASON PROVIDED</Text>
                                    <Text style={styles.escalationReason}>{dispute.escalationReason}</Text>
                                </>
                            ) : null}
                            {dispute.escalatedAt ? (
                                <Text style={styles.escalationDate}>
                                    Escalated on {formatDate(dispute.escalatedAt)}
                                </Text>
                            ) : null}
                        </View>
                    </View>
                )}

                {/* SLA Breach Warning */}
                {is48hBreached && (
                    <View style={styles.slaBanner}>
                        <View style={styles.slaBannerStrip} />
                        <View style={styles.slaBannerContent}>
                            <Clock size={15} color="#92400E" />
                            <Text style={styles.slaBannerText}>
                                SLA Breach: This dispute has been open for over 48 hours without admin action.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Start Review CTA — shown only on newly opened disputes */}
                {normalizedStatus === 'open' && (
                    <SectionCard title="Action Required">
                        <Text style={styles.reviewHintText}>
                            This dispute is waiting for admin attention. Click "Start Review" to notify both parties and begin the review process.
                        </Text>
                        <TouchableOpacity
                            style={[styles.startReviewButton, startingReview && styles.actionButtonDisabled]}
                            onPress={handleStartReview}
                            disabled={startingReview}
                        >
                            {startingReview ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <PlayCircle size={18} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Start Review</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </SectionCard>
                )}

                {/* Activity Timeline */}
                <View style={styles.timelineWrapper}>
                    <DisputeTimeline events={dispute.timeline ?? []} />
                </View>

                {/* Priority Management */}
                <SectionCard title="Priority Management">
                    <View style={styles.priorityButtons}>
                        {priorities.map((p) => {
                            const isActive = dispute.priority === p.value;
                            return (
                                <TouchableOpacity
                                    key={p.value}
                                    style={[
                                        styles.priorityButton,
                                        isActive && {
                                            backgroundColor: p.color,
                                            borderColor: p.color,
                                            shadowColor: p.color,
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 4,
                                            elevation: 3,
                                        },
                                    ]}
                                    onPress={() => handleUpdatePriority(p.value)}
                                    activeOpacity={0.75}
                                >
                                    <Text
                                        style={[
                                            styles.priorityButtonText,
                                            { color: isActive ? '#FFFFFF' : p.color },
                                        ]}
                                    >
                                        {p.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </SectionCard>

                {/* Evidence — read-only view of all submitted files, labelled by party */}
                <View style={styles.evidenceWrapper}>
                    <EvidenceUploader
                        disputeId={dispute.id}
                        existingEvidence={evidence}
                        readOnly
                        clientId={dispute.clientId}
                        freelancerId={dispute.freelancerId}
                    />
                </View>

                {/* Resolution Info (if already resolved) */}
                {dispute.resolutionDescription ? (
                    <SectionCard title="Resolution">
                        <View>
                            <Text style={styles.coreLabel}>TYPE</Text>
                            <Text style={styles.coreValue}>
                                {dispute.resolutionType?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.coreDivider} />
                        <Text style={styles.coreLabel}>DESCRIPTION</Text>
                        <Text style={styles.descriptionText}>{dispute.resolutionDescription}</Text>
                        {dispute.resolvedAt ? (
                            <>
                                <View style={styles.coreDivider} />
                                <Text style={styles.coreLabel}>RESOLVED AT</Text>
                                <Text style={styles.coreValue}>{formatDate(dispute.resolvedAt)}</Text>
                            </>
                        ) : null}
                    </SectionCard>
                ) : null}

                {/* Mediation Recommendation — issue a proposal for both parties to accept/reject */}
                {!isResolved && (
                    <SectionCard title="Mediation Recommendation">
                        {dispute.mediationRecommendation ? (
                            <View style={styles.existingMediation}>
                                <Text style={styles.coreLabel}>CURRENT RECOMMENDATION</Text>
                                <Text style={styles.descriptionText}>{dispute.mediationRecommendation}</Text>
                                <View style={styles.mediationAcceptanceRow}>
                                    {[
                                        { label: 'CLIENT', accepted: dispute.clientAccepted },
                                        { label: 'FREELANCER', accepted: dispute.freelancerAccepted },
                                    ].map((party) => {
                                        const chipColor = party.accepted === true ? '#10B981' : party.accepted === false ? '#EF4444' : '#94A3B8';
                                        const chipBg = party.accepted === true ? '#ECFDF5' : party.accepted === false ? '#FEF2F2' : '#F8FAFC';
                                        const chipBorder = party.accepted === true ? '#A7F3D0' : party.accepted === false ? '#FECACA' : '#E2E8F0';
                                        const chipLabel = party.accepted === true ? 'Accepted' : party.accepted === false ? 'Rejected' : 'Pending';
                                        return (
                                            <View key={party.label} style={styles.mediationAcceptItem}>
                                                <Text style={styles.coreLabel}>{party.label}</Text>
                                                <View style={[styles.acceptanceChip, { backgroundColor: chipBg, borderColor: chipBorder }]}>
                                                    <Text style={[styles.acceptanceChipText, { color: chipColor }]}>{chipLabel}</Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                                <View style={styles.coreDivider} />
                                <Text style={[styles.coreLabel, { marginBottom: 8 }]}>ISSUE UPDATED RECOMMENDATION</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.questionInput}
                                placeholder="e.g. We recommend a 50% partial refund given the partial completion of deliverables..."
                                placeholderTextColor="#94A3B8"
                                value={mediationText}
                                onChangeText={(t) => {
                                    setMediationText(t);
                                    if (mediationError) setMediationError('');
                                }}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {mediationError ? (
                            <View style={styles.inlineBannerError}>
                                <Text style={styles.inlineBannerText}>{mediationError}</Text>
                            </View>
                        ) : null}

                        {mediationSuccess ? (
                            <View style={styles.inlineBannerSuccess}>
                                <Text style={styles.inlineBannerText}>{mediationSuccess}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.questionSendButton, { backgroundColor: '#7C3AED' }, sendingMediation && styles.actionButtonDisabled]}
                            onPress={handleSendMediationRecommendation}
                            disabled={sendingMediation}
                        >
                            {sendingMediation ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.actionButtonText}>Send Recommendation to Both Parties</Text>
                            )}
                        </TouchableOpacity>
                    </SectionCard>
                )}

                {/* Ask Question — admin can ask a question; both parties get notified */}
                {!isResolved && (
                    <SectionCard title="Ask a Question">
                        <View style={styles.questionHint}>
                            <HelpCircle size={14} color="#1D4ED8" />
                            <Text style={styles.questionHintText}>
                                Your question will be visible to both the client and freelancer, and they will each receive a notification.
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <TextInput
                                style={styles.questionInput}
                                placeholder="e.g. Can you please provide a screenshot of the agreed deliverables?"
                                placeholderTextColor="#94A3B8"
                                value={questionText}
                                onChangeText={(t) => {
                                    setQuestionText(t);
                                    if (questionError) setQuestionError('');
                                }}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {questionError ? (
                            <View style={styles.inlineBannerError}>
                                <Text style={styles.inlineBannerText}>{questionError}</Text>
                            </View>
                        ) : null}

                        {questionSuccess ? (
                            <View style={styles.inlineBannerSuccess}>
                                <Text style={styles.inlineBannerText}>{questionSuccess}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.questionSendButton, sendingQuestion && styles.actionButtonDisabled]}
                            onPress={handleAskQuestion}
                            disabled={sendingQuestion}
                        >
                            {sendingQuestion ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <HelpCircle size={17} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Send Question to Both Parties</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </SectionCard>
                )}

                {/* Resolution Decision — shown only for unresolved disputes */}
                {!isResolved && (
                    <SectionCard title="Resolution Decision">
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Admin Notes / Resolution Description *</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Explain your resolution decision..."
                                placeholderTextColor="#94A3B8"
                                value={resolutionDescription}
                                onChangeText={setResolutionDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {resolveError ? (
                            <View style={styles.inlineBannerError}>
                                <Text style={styles.inlineBannerText}>{resolveError}</Text>
                            </View>
                        ) : null}

                        {resolveSuccess ? (
                            <View style={styles.inlineBannerSuccess}>
                                <Text style={styles.inlineBannerText}>{resolveSuccess}</Text>
                            </View>
                        ) : null}

                        <View style={styles.actionButtons}>
                            {/* Refund Client */}
                            <TouchableOpacity
                                style={[styles.actionButton, styles.refundButton, resolvingAction !== null && styles.actionButtonDisabled]}
                                onPress={() => handleResolve('refund_client')}
                                disabled={resolvingAction !== null}
                            >
                                {resolvingAction === 'refund_client' ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <RotateCcw size={18} color="#FFFFFF" />
                                        <Text style={styles.actionButtonText}>Refund Client</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Release to Freelancer */}
                            <TouchableOpacity
                                style={[styles.actionButton, styles.releaseButton, resolvingAction !== null && styles.actionButtonDisabled]}
                                onPress={() => handleResolve('release_to_freelancer')}
                                disabled={resolvingAction !== null}
                            >
                                {resolvingAction === 'release_to_freelancer' ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <DollarSign size={18} color="#FFFFFF" />
                                        <Text style={styles.actionButtonText}>Release to Freelancer</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </SectionCard>
                )}

                {/* Message Thread — admin intervention at the bottom */}
                <SectionCard title={`Messages (${messages.length})`}>
                    <View style={styles.messagesContainer}>
                        {messages.length > 0 ? (
                            <DisputeMessageThread
                                messages={messages}
                                currentUserId={user?.id || ''}
                            />
                        ) : (
                            <View style={styles.emptyMessages}>
                                <Send size={32} color="#CBD5E1" />
                                <Text style={styles.emptyMessagesText}>No messages yet</Text>
                                <Text style={styles.emptyMessagesSubtext}>
                                    Messages between parties will appear here
                                </Text>
                            </View>
                        )}
                    </View>
                </SectionCard>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    headerBackButton: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.m,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    headerCenter: {
        flex: 1,
        marginLeft: SPACING.m,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.extrabold,
        color: COLORS.secondaryDark,
    },
    headerSubtitle: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: '#64748B',
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        marginTop: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.l,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.m,
    },
    loadingText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: '#64748B',
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxl,
        gap: SPACING.m,
    },
    errorText: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.secondaryDark,
    },
    goBackButton: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        borderRadius: BORDER_RADIUS.m,
    },
    goBackButtonText: {
        color: COLORS.white,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        fontSize: TYPOGRAPHY.fontSize.base,
    },

    // Escalation alert card
    escalationCard: {
        backgroundColor: '#FEF2F2',
        borderRadius: 16,
        marginBottom: SPACING.l,
        borderWidth: 1.5,
        borderColor: '#FECACA',
        overflow: 'hidden',
        flexDirection: 'row',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    escalationStrip: {
        width: 4,
        backgroundColor: '#EF4444',
    },
    escalationBody: {
        flex: 1,
        padding: 16,
    },
    escalationIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    escalationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    escalationTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#B91C1C',
        flex: 1,
    },
    escalationLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#EF4444',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    escalationReason: {
        fontSize: 14,
        color: '#7F1D1D',
        lineHeight: 20,
        marginBottom: 8,
    },
    escalationDate: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '600',
        marginTop: 4,
    },

    // Core info inside SectionCard
    coreInfoRow: {
        flexDirection: 'row',
    },
    coreInfoItem: {
        flex: 1,
    },
    coreInfoItemRight: {
        marginLeft: SPACING.m,
    },
    coreLabel: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontWeight: TYPOGRAPHY.fontWeight.extrabold,
        color: '#94A3B8',
        letterSpacing: TYPOGRAPHY.letterSpacing.wide,
        marginBottom: SPACING.xs,
    },
    coreValue: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.secondaryDark,
    },
    amountValue: {
        fontSize: TYPOGRAPHY.fontSize.md,
        color: COLORS.success,
    },
    coreSubValue: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: '#64748B',
        marginTop: 2,
    },
    coreDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: SPACING.m,
    },
    descriptionText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: '#475569',
        lineHeight: 22,
        marginTop: SPACING.xs,
    },

    // Timeline wrapper (uses its own internal card styling)
    timelineWrapper: {
        marginBottom: SPACING.l,
    },

    // Evidence wrapper (uses its own internal card styling)
    evidenceWrapper: {
        marginBottom: SPACING.l,
    },

    // Priority
    priorityButtons: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: SPACING.s + 4,
        borderRadius: BORDER_RADIUS.s,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    priorityButtonText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
    },

    // Start review section
    reviewHintText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: '#475569',
        lineHeight: 20,
        marginBottom: SPACING.m,
    },
    startReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.s,
        paddingVertical: SPACING.m + 2,
        borderRadius: BORDER_RADIUS.m,
        backgroundColor: '#D97706',
        borderTopWidth: 1,
        borderTopColor: '#F59E0B',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },

    // Ask question section
    questionHint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.s,
        backgroundColor: '#EFF6FF',
        borderRadius: BORDER_RADIUS.s,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    questionHintText: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: '#1D4ED8',
        lineHeight: 18,
    },
    questionInput: {
        backgroundColor: '#FAFBFC',
        borderRadius: BORDER_RADIUS.m,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m + 2,
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.secondaryDark,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        minHeight: 90,
        lineHeight: 22,
    },
    questionSendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.s,
        paddingVertical: SPACING.m + 2,
        borderRadius: BORDER_RADIUS.m,
        backgroundColor: '#1D4ED8',
        borderTopWidth: 1,
        borderTopColor: '#3B82F6',
        shadowColor: '#1D4ED8',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },

    // Resolution form
    inputGroup: {
        marginBottom: SPACING.m,
    },
    inputLabel: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.secondaryDark,
        marginBottom: SPACING.s,
    },
    textArea: {
        backgroundColor: '#FAFBFC',
        borderRadius: BORDER_RADIUS.m,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m + 2,
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.secondaryDark,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        minHeight: 110,
        lineHeight: 22,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginTop: SPACING.s,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.s,
        paddingVertical: SPACING.m + 2,
        borderRadius: BORDER_RADIUS.m,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 4,
    },
    actionButtonDisabled: {
        opacity: 0.55,
    },
    refundButton: {
        backgroundColor: '#7C3AED',
        borderTopWidth: 1,
        borderTopColor: '#9F6EFF',
    },
    releaseButton: {
        backgroundColor: '#059669',
        borderTopWidth: 1,
        borderTopColor: '#10B981',
    },
    actionButtonText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.extrabold,
        color: COLORS.white,
        letterSpacing: 0.3,
    },
    inlineBannerError: {
        backgroundColor: '#FEF2F2',
        borderRadius: BORDER_RADIUS.s,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s + 4,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#FECACA',
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
    },
    inlineBannerSuccess: {
        backgroundColor: '#F0FDF4',
        borderRadius: BORDER_RADIUS.s,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s + 4,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    inlineBannerText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: '#1E293B',
        lineHeight: 18,
    },

    // Messages
    messagesContainer: {
        minHeight: 80,
        maxHeight: 320,
    },
    emptyMessages: {
        alignItems: 'center',
        paddingVertical: SPACING.l,
        gap: SPACING.s,
    },
    emptyMessagesText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: '#64748B',
    },
    emptyMessagesSubtext: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: '#94A3B8',
        textAlign: 'center',
    },

    bottomSpacer: {
        height: SPACING.xxl,
    },

    // SLA breach banner
    slaBanner: {
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#FCD34D',
        overflow: 'hidden',
        flexDirection: 'row',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    slaBannerStrip: {
        width: 4,
        backgroundColor: '#F59E0B',
    },
    slaBannerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
    },
    slaBannerText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
        color: '#92400E',
        lineHeight: 18,
    },

    // Mediation acceptance chips
    acceptanceChip: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        marginTop: 4,
    },
    acceptanceChipText: {
        fontSize: 12,
        fontWeight: '700',
    },

    // Mediation recommendation
    existingMediation: {
        marginBottom: SPACING.m,
    },
    mediationAcceptanceRow: {
        flexDirection: 'row',
        gap: SPACING.l,
        marginTop: SPACING.m,
    },
    mediationAcceptItem: {
        flex: 1,
    },
    mediationAcceptValue: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
});
