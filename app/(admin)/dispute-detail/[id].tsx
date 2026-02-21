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
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    UserPlus,
    AlertTriangle,
    DollarSign,
} from 'lucide-react-native';
import DisputeStatusBadge from '@/components/dispute/DisputeStatusBadge';
import DisputeMessageThread from '@/components/dispute/DisputeMessageThread';
import EvidenceUploader from '@/components/dispute/EvidenceUploader';
import { disputeService } from '@/services/disputeService';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/contexts/AuthContext';
import type { DisputeResolution } from '@/models/Dispute';

interface BackendDispute {
    id: string;
    projectId: string;
    clientId: string;
    freelancerId: string;
    reason: string;
    description: string;
    amount: number;
    status: string;
    priority: string;
    assignedMediatorId?: string;
    resolutionType?: string;
    resolutionDescription?: string;
    resolutionTerms?: string[];
    resolvedBy?: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
    project?: { id: string; title: string; description?: string };
    client?: { id: string; user_name: string; email: string };
    freelancer?: { id: string; user_name: string; email: string };
    mediator?: { id: string; user_name: string };
}

export default function AdminDisputeDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();

    const [dispute, setDispute] = useState<BackendDispute | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [evidence, setEvidence] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(false);

    // Resolution form state
    const [resolutionType, setResolutionType] = useState<DisputeResolution['type']>('no_refund');
    const [resolutionAmount, setResolutionAmount] = useState('');
    const [resolutionDescription, setResolutionDescription] = useState('');
    const [resolutionTerms, setResolutionTerms] = useState('');

    useEffect(() => {
        loadDispute();
    }, [id]);

    const loadDispute = async () => {
        try {
            setLoading(true);
            const data = await disputeService.getDisputeById(id);
            setDispute(data);
            
            // Load messages and evidence
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

    const handleResolve = async (decision: 'resolve' | 'deny') => {
        if (!dispute) return;

        if (decision === 'resolve' && !resolutionDescription.trim()) {
            Alert.alert('Required', 'Please provide a resolution description');
            return;
        }

        Alert.alert(
            decision === 'resolve' ? 'Resolve Dispute' : 'Deny Dispute',
            `Are you sure you want to ${decision} this dispute?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: decision === 'resolve' ? 'Resolve' : 'Deny',
                    style: decision === 'resolve' ? 'default' : 'destructive',
                    onPress: async () => {
                        try {
                            setResolving(true);

                            await adminService.resolveDispute(dispute.id, {
                                type: resolutionType,
                                amount: resolutionAmount ? parseFloat(resolutionAmount) : undefined,
                                description: resolutionDescription,
                                terms: resolutionTerms.split('\n').filter(t => t.trim()),
                                decision: decision
                            });

                            Alert.alert(
                                'Success',
                                `Dispute ${decision === 'resolve' ? 'resolved' : 'denied'} successfully`
                            );
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', `Failed to ${decision} dispute`);
                        } finally {
                            setResolving(false);
                        }
                    },
                },
            ]
        );
    };

    const handleAssignMediator = async () => {
        if (!dispute) return;
        try {
            await adminService.assignMediator(dispute.id, user?.id || '');
            Alert.alert('Success', 'You have been assigned as the mediator');
            loadDispute();
        } catch (error) {
            Alert.alert('Error', 'Failed to assign mediator');
        }
    };

    const handleUpdatePriority = async (priority: 'low' | 'medium' | 'high' | 'urgent') => {
        if (!dispute) return;
        try {
            await adminService.updateDisputePriority(dispute.id, priority);
            Alert.alert('Success', `Priority updated to ${priority}`);
            loadDispute();
        } catch (error) {
            Alert.alert('Error', 'Failed to update priority');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#444751" />
                    <Text style={styles.loadingText}>Loading dispute...</Text>
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

    const resolutionTypes: Array<{ label: string; value: DisputeResolution['type'] }> = [
        { label: 'Full Refund', value: 'full_refund' },
        { label: 'Partial Refund', value: 'partial_refund' },
        { label: 'No Refund', value: 'no_refund' },
        { label: 'Additional Work', value: 'additional_work' },
        { label: 'Payment Release', value: 'payment_release' },
        { label: 'Custom', value: 'custom' },
    ];

    const priorities: Array<{ label: string; value: 'low' | 'medium' | 'high' | 'urgent' }> = [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#282A32" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Dispute Details</Text>
                    <Text style={styles.headerSubtitle}>#{dispute.id.slice(0, 8)}</Text>
                </View>
                <DisputeStatusBadge status={dispute.status} size="small" />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Dispute Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Dispute Information</Text>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>PROJECT</Text>
                            <Text style={styles.infoValue}>{dispute.project?.title || 'N/A'}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>AMOUNT</Text>
                            <Text style={styles.infoValue}>
                                ${dispute.amount?.toFixed(2) || '0.00'}
                            </Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>CLIENT</Text>
                            <Text style={styles.infoValue}>{dispute.client?.user_name || 'N/A'}</Text>
                            <Text style={styles.infoSubValue}>{dispute.client?.email || ''}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>FREELANCER</Text>
                            <Text style={styles.infoValue}>{dispute.freelancer?.user_name || 'N/A'}</Text>
                            <Text style={styles.infoSubValue}>{dispute.freelancer?.email || ''}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>REASON</Text>
                            <Text style={styles.infoValue}>{dispute.reason?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>CREATED</Text>
                            <Text style={styles.infoValue}>{formatDate(dispute.createdAt)}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>PRIORITY</Text>
                            <Text style={styles.infoValue}>{(dispute.priority || 'medium').toUpperCase()}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>STATUS</Text>
                            <Text style={styles.infoValue}>{(dispute.status || 'Pending').toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.descriptionContainer}>
                        <Text style={styles.infoLabel}>DESCRIPTION</Text>
                        <Text style={styles.descriptionText}>{dispute.description || 'No description provided'}</Text>
                    </View>
                </View>

                {/* Priority Management */}
                <View style={styles.actionCard}>
                    <Text style={styles.sectionTitle}>Priority Management</Text>
                    <View style={styles.priorityButtons}>
                        {priorities.map((p) => (
                            <TouchableOpacity
                                key={p.value}
                                style={[
                                    styles.priorityButton,
                                    dispute.priority === p.value && styles.priorityButtonActive,
                                ]}
                                onPress={() => handleUpdatePriority(p.value)}
                            >
                                <Text
                                    style={[
                                        styles.priorityButtonText,
                                        dispute.priority === p.value && styles.priorityButtonTextActive,
                                    ]}
                                >
                                    {p.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Messages */}
                <View style={styles.messagesCard}>
                    <Text style={styles.sectionTitle}>Messages ({messages.length})</Text>
                    <View style={styles.messagesContainer}>
                        {messages.length > 0 ? (
                            <DisputeMessageThread messages={messages} currentUserId={user?.id || ''} />
                        ) : (
                            <Text style={styles.emptyText}>No messages yet</Text>
                        )}
                    </View>
                </View>

                {/* Evidence */}
                <EvidenceUploader
                    disputeId={dispute.id}
                    existingEvidence={evidence}
                    onUploadComplete={() => loadDispute()}
                />

                {/* Resolution Info (if resolved) */}
                {dispute.resolutionDescription && (
                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Resolution</Text>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>TYPE</Text>
                            <Text style={styles.infoValue}>{dispute.resolutionType?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</Text>
                        </View>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.infoLabel}>DESCRIPTION</Text>
                            <Text style={styles.descriptionText}>{dispute.resolutionDescription}</Text>
                        </View>
                        {dispute.resolvedAt && (
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>RESOLVED AT</Text>
                                <Text style={styles.infoValue}>{formatDate(dispute.resolvedAt)}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Resolution Form */}
                {dispute.status !== 'resolved' && dispute.status !== 'closed' && dispute.status !== 'Resolved' && dispute.status !== 'Denied' && (
                    <View style={styles.resolutionCard}>
                        <Text style={styles.sectionTitle}>Resolution Decision</Text>

                        <Text style={styles.inputLabel}>Resolution Type</Text>
                        <View style={styles.resolutionTypeGrid}>
                            {resolutionTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.resolutionTypeButton,
                                        resolutionType === type.value && styles.resolutionTypeButtonActive,
                                    ]}
                                    onPress={() => setResolutionType(type.value)}
                                >
                                    <Text
                                        style={[
                                            styles.resolutionTypeText,
                                            resolutionType === type.value && styles.resolutionTypeTextActive,
                                        ]}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {(resolutionType === 'partial_refund' || resolutionType === 'full_refund') && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Refund Amount</Text>
                                <View style={styles.amountInputContainer}>
                                    <DollarSign size={20} color="#64748B" />
                                    <TextInput
                                        style={styles.amountInput}
                                        placeholder="0.00"
                                        placeholderTextColor="#94A3B8"
                                        value={resolutionAmount}
                                        onChangeText={setResolutionAmount}
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Resolution Description *</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Explain the resolution decision..."
                                placeholderTextColor="#94A3B8"
                                value={resolutionDescription}
                                onChangeText={setResolutionDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Terms (one per line)</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Enter resolution terms..."
                                placeholderTextColor="#94A3B8"
                                value={resolutionTerms}
                                onChangeText={setResolutionTerms}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.denyButton]}
                                onPress={() => handleResolve('deny')}
                                disabled={resolving}
                            >
                                <XCircle size={20} color="#FFFFFF" />
                                <Text style={styles.actionButtonText}>Deny Dispute</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.resolveButton]}
                                onPress={() => handleResolve('resolve')}
                                disabled={resolving}
                            >
                                {resolving ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <CheckCircle size={20} color="#FFFFFF" />
                                        <Text style={styles.actionButtonText}>Resolve Dispute</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

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
        color: '#282A32',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
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
        color: '#282A32',
    },
    backButton: {
        backgroundColor: '#444751',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
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
        color: '#282A32',
        marginBottom: 16,
    },
    infoGrid: {
        gap: 16,
    },
    infoItem: {
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#282A32',
    },
    infoSubValue: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    descriptionContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    descriptionText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },
    actionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    priorityButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    priorityButtonActive: {
        backgroundColor: '#444751',
        borderColor: '#444751',
    },
    priorityButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    priorityButtonTextActive: {
        color: '#FFFFFF',
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
        minHeight: 100,
        maxHeight: 300,
    },
    emptyText: {
        fontSize: 14,
        color: '#94A3B8',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    resolutionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#282A32',
        marginBottom: 8,
    },
    resolutionTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    resolutionTypeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    resolutionTypeButtonActive: {
        backgroundColor: '#E5E4EA',
        borderColor: '#444751',
    },
    resolutionTypeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    resolutionTypeTextActive: {
        color: '#444751',
    },
    inputGroup: {
        marginBottom: 16,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    amountInput: {
        flex: 1,
        fontSize: 15,
        color: '#282A32',
        fontWeight: '600',
    },
    textArea: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#282A32',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        minHeight: 100,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    denyButton: {
        backgroundColor: '#EF4444',
    },
    resolveButton: {
        backgroundColor: '#10B981',
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    bottomSpacer: {
        height: 20,
    },
});
