import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { User, Bot, HelpCircle } from 'lucide-react-native';
import type { DisputeMessage } from '@/models/Dispute';

interface DisputeMessageThreadProps {
    messages: DisputeMessage[];
    currentUserId: string;
}

export default function DisputeMessageThread({ messages, currentUserId }: DisputeMessageThreadProps) {
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'client':
                return '#282A32';
            case 'freelancer':
                return '#10B981';
            case 'mediator':
            case 'admin':
                return '#444751';
            default:
                return '#64748B';
        }
    };

    const getRoleLabel = (role: string) => {
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    if (messages.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Bot size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Start the conversation by sending a message</Text>
            </View>
        );
    }

    const renderAdminQuestion = (message: DisputeMessage) => (
        <View key={message.id} style={styles.adminQuestionCard}>
            <View style={styles.adminQuestionHeader}>
                <View style={styles.adminQuestionIconWrap}>
                    <HelpCircle size={16} color="#1D4ED8" />
                </View>
                <Text style={styles.adminQuestionLabel}>Admin Question</Text>
                <Text style={styles.adminQuestionTime}>{formatTime(message.createdAt)}</Text>
            </View>
            <Text style={styles.adminQuestionText}>{message.content}</Text>
            <Text style={styles.adminQuestionNote}>Both parties have been notified to respond below.</Text>
        </View>
    );

    return (
        <ScrollView
            ref={scrollViewRef}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {messages.map((message) => {
                // Admin questions get a special full-width highlighted card
                if ((message as any).messageType === 'admin_question') {
                    return renderAdminQuestion(message);
                }

                const isCurrentUser = message.senderId === currentUserId;
                const isInternal = message.isInternal;
                const roleColor = getRoleColor(message.sender?.role || '');

                return (
                    <View
                        key={message.id}
                        style={[
                            styles.messageWrapper,
                            isCurrentUser ? styles.messageWrapperRight : styles.messageWrapperLeft,
                        ]}
                    >
                        {!isCurrentUser && (
                            <View style={[styles.avatar, { backgroundColor: `${roleColor}15` }]}>
                                <User size={18} color={roleColor} />
                            </View>
                        )}

                        <View style={styles.messageContent}>
                            {!isCurrentUser && (
                                <View style={styles.senderInfo}>
                                    <Text style={styles.senderName}>
                                        {message.sender?.user_name || message.sender?.name || message.sender?.userName || 'Unknown'}
                                    </Text>
                                    <View style={[styles.roleBadge, { backgroundColor: `${roleColor}15` }]}>
                                        <Text style={[styles.roleText, { color: roleColor }]}>
                                            {getRoleLabel(message.sender?.role || '')}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {isInternal && (
                                <View style={styles.internalBadge}>
                                    <Text style={styles.internalText}>Internal Note</Text>
                                </View>
                            )}

                            <View
                                style={[
                                    styles.messageBubble,
                                    isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
                                    isInternal && styles.messageBubbleInternal,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.messageText,
                                        isCurrentUser ? styles.messageTextRight : styles.messageTextLeft,
                                    ]}
                                >
                                    {message.content}
                                </Text>

                                {message.attachments && message.attachments.length > 0 && (
                                    <View style={styles.attachmentsContainer}>
                                        {message.attachments.map((attachment) => (
                                            <View key={attachment.id} style={styles.attachment}>
                                                {attachment.type === 'image' && attachment.url && (
                                                    <Image source={{ uri: attachment.url }} style={styles.attachmentImage} />
                                                )}
                                                <Text style={styles.attachmentName} numberOfLines={1}>
                                                    {attachment.name}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <Text
                                style={[
                                    styles.timestamp,
                                    isCurrentUser ? styles.timestampRight : styles.timestampLeft,
                                ]}
                            >
                                {formatTime(message.createdAt)}
                            </Text>
                        </View>

                        {isCurrentUser && (
                            <View style={[styles.avatar, styles.avatarRight, { backgroundColor: '#44475115' }]}>
                                <User size={18} color="#444751" />
                            </View>
                        )}
                    </View>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        gap: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 4,
    },
    messageWrapper: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 4,
    },
    messageWrapperLeft: {
        alignItems: 'flex-start',
    },
    messageWrapperRight: {
        alignItems: 'flex-end',
        flexDirection: 'row-reverse',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarRight: {
        backgroundColor: '#E5E4EA',
    },
    messageContent: {
        flex: 1,
        maxWidth: '75%',
    },
    senderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    senderName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#282A32',
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    internalBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    internalText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#92400E',
        textTransform: 'uppercase',
    },
    messageBubble: {
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
    },
    messageBubbleLeft: {
        backgroundColor: '#F1F5F9',
        borderTopLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    messageBubbleRight: {
        backgroundColor: '#282A32',
        borderTopRightRadius: 4,
    },
    messageBubbleInternal: {
        backgroundColor: '#FFFBEB',
        borderWidth: 1.5,
        borderColor: '#FDE68A',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    messageTextLeft: {
        color: '#282A32',
    },
    messageTextRight: {
        color: '#FFFFFF',
    },
    timestamp: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 4,
        fontWeight: '500',
    },
    timestampLeft: {
        textAlign: 'left',
    },
    timestampRight: {
        textAlign: 'right',
    },
    attachmentsContainer: {
        marginTop: 8,
        gap: 8,
    },
    attachment: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        padding: 8,
    },
    attachmentImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 6,
    },
    attachmentName: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Admin question card
    adminQuestionCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1.5,
        borderColor: '#93C5FD',
        marginBottom: 4,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    adminQuestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    adminQuestionIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    adminQuestionLabel: {
        flex: 1,
        fontSize: 11,
        fontWeight: '800',
        color: '#1D4ED8',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    adminQuestionTime: {
        fontSize: 11,
        color: '#93C5FD',
        fontWeight: '500',
    },
    adminQuestionText: {
        fontSize: 14,
        color: '#1E3A5F',
        lineHeight: 21,
        fontWeight: '600',
        marginBottom: 8,
    },
    adminQuestionNote: {
        fontSize: 11,
        color: '#60A5FA',
        fontStyle: 'italic',
    },
});
