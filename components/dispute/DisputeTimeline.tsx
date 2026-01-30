import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import {
    FileText,
    MessageSquare,
    Upload,
    UserPlus,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from 'lucide-react-native';
import type { DisputeTimelineEvent } from '@/models/Dispute';

interface DisputeTimelineProps {
    events: DisputeTimelineEvent[];
}

export default function DisputeTimeline({ events }: DisputeTimelineProps) {
    const getEventIcon = (type: DisputeTimelineEvent['type']) => {
        switch (type) {
            case 'created':
                return FileText;
            case 'response_submitted':
                return MessageSquare;
            case 'evidence_added':
                return Upload;
            case 'mediator_assigned':
                return UserPlus;
            case 'resolution_proposed':
                return AlertTriangle;
            case 'resolved':
                return CheckCircle;
            case 'closed':
                return XCircle;
            default:
                return FileText;
        }
    };

    const getEventColor = (type: DisputeTimelineEvent['type']) => {
        switch (type) {
            case 'created':
                return '#3B82F6';
            case 'response_submitted':
            case 'evidence_added':
                return '#8B5CF6';
            case 'mediator_assigned':
                return '#F59E0B';
            case 'resolution_proposed':
                return '#EC4899';
            case 'resolved':
                return '#10B981';
            case 'closed':
                return '#64748B';
            default:
                return '#94A3B8';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const minutes = Math.floor(diffInHours * 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            });
        }
    };

    if (events.length === 0) {
        return (
            <View style={styles.emptyState}>
                <FileText size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No activity yet</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Activity Timeline</Text>
            <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
                {events.map((event, index) => {
                    const Icon = getEventIcon(event.type);
                    const color = getEventColor(event.type);
                    const isLast = index === events.length - 1;

                    return (
                        <View key={event.id} style={styles.eventContainer}>
                            <View style={styles.eventLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                                    <Icon size={16} color={color} />
                                </View>
                                {!isLast && <View style={styles.connector} />}
                            </View>

                            <View style={styles.eventContent}>
                                <Text style={styles.eventDescription}>{event.description}</Text>
                                <View style={styles.eventMeta}>
                                    <Text style={styles.eventPerformer}>{event.performedBy}</Text>
                                    <Text style={styles.eventDot}>•</Text>
                                    <Text style={styles.eventTime}>{formatDate(event.performedAt)}</Text>
                                </View>

                                {event.metadata && Object.keys(event.metadata).length > 0 && (
                                    <View style={styles.metadataContainer}>
                                        {Object.entries(event.metadata).map(([key, value]) => (
                                            <Text key={key} style={styles.metadataText}>
                                                {key}: {String(value)}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 16,
    },
    timeline: {
        maxHeight: 400,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 16,
    },
    eventContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    eventLeft: {
        alignItems: 'center',
        marginRight: 16,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    connector: {
        width: 2,
        flex: 1,
        backgroundColor: '#E2E8F0',
        marginTop: 4,
    },
    eventContent: {
        flex: 1,
        paddingBottom: 4,
    },
    eventDescription: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 6,
        lineHeight: 20,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    eventPerformer: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6366F1',
    },
    eventDot: {
        fontSize: 12,
        color: '#CBD5E1',
    },
    eventTime: {
        fontSize: 12,
        color: '#94A3B8',
    },
    metadataContainer: {
        marginTop: 8,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 10,
        gap: 4,
    },
    metadataText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});
