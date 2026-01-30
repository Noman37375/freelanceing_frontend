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

    const [dispute, setDispute] = useState<Dispute | null>(null);
    const [messages, setMessages] = useState<DisputeMessage[]>([]);
    const [evidence, setEvidence] = useState<DisputeEvidence[]>([]);
    const [timeline, setTimeline] = useState<DisputeTimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadDisputeData();
    }, [disputeId]);

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

    const handleEscalate = () => {
        Alert.alert(
            'Escalate to Support',
            'Are you sure you want to escalate this dispute to support? A mediator will be assigned to review your case.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Escalate',
                    style: 'default',
                    onPress: async () => {
                        try {
                            await disputeService.escalateToSupport(dispute!.id, 'User requested escalation');

                            Alert.alert('Success', 'Dispute escalated to support team');
                            loadDisputeData();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to escalate dispute');
                        }
                    },
                },
            ]
        );
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
                    <ActivityIndicator size="large" color="#6366F1" />
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
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform?.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform?.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
                        <ArrowLeft size={24} color="#1E293B" />
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
                    {/* Dispute Info Card */}
                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Dispute Information</Text>

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                                <Briefcase size={18} color="#6366F1" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>PROJECT</Text>
                                <Text style={styles.infoValue}>{dispute.title || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                                <DollarSign size={18} color="#6366F1" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>DISPUTED AMOUNT</Text>
                                <Text style={styles.infoValue}>
                                    {dispute.currency} {dispute.amount.toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                                <Calendar size={18} color="#6366F1" />
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
                        <Text style={styles.sectionTitle}>Discussion</Text>
                        <View style={styles.messagesContainer}>
                            <DisputeMessageThread messages={messages} currentUserId={user?.id || ''} />
                        </View>
                    </View>

                    {/* Evidence Section */}
                    <EvidenceUploader
                        disputeId={dispute.id}
                        existingEvidence={evidence}
                        onUploadComplete={handleEvidenceUpload}
                    />

                    {/* Timeline Section */}
                    <DisputeTimeline events={timeline} />

                    {/* Escalate Button */}
                    {dispute.status !== 'escalated' && dispute.status !== 'resolved' && (
                        <TouchableOpacity style={styles.escalateButton} onPress={handleEscalate}>
                            <AlertTriangle size={20} color="#EF4444" />
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
        backgroundColor: '#F8FAFC',
    },
    keyboardAvoid: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerBackButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    headerRight: {
        marginLeft: 12,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
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
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    backButton: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    reasonContainer: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    reasonLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    reasonText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },
    messagesCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    messagesContainer: {
        height: 300,
    },
    escalateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        borderRadius: 16,
        paddingVertical: 16,
        marginTop: 16,
    },
    escalateButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#EF4444',
    },
    bottomSpacer: {
        height: 20,
    },
    messageInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    messageInput: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1E293B',
        maxHeight: 100,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
