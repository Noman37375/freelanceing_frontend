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
                return '#282A32';
            case 'response_submitted':
            case 'evidence_added':
                return '#444751';
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
                                <View style={[styles.iconContainer, { backgroundColor: `${color}15`, borderColor: `${color}30`, borderWidth: 1.5 }]}>
                                    <Icon size={14} color={color} />
                                </View>
                                {!isLast && <View style={[styles.connector, { backgroundColor: `${color}30` }]} />}
                            </View>

                            <View style={styles.eventContent}>
                                <View style={styles.eventHeaderRow}>
                                    <Text style={styles.eventDescription}>{event.description}</Text>
                                    <Text style={styles.eventTime}>{formatDate(event.performedAt)}</Text>
                                </View>
                                <View style={styles.eventMeta}>
                                    <View style={[styles.performerBadge, { backgroundColor: `${color}12` }]}>
                                        <Text style={[styles.eventPerformer, { color }]}>{event.performedBy}</Text>
                                    </View>
                                </View>

                                {event.metadata && Object.keys(event.metadata).length > 0 && (
                                    <View style={styles.metadataContainer}>
                                        {Object.entries(event.metadata).map(([key, value]) => (
                                            <Text key={key} style={styles.metadataText}>
                                                <Text style={styles.metadataKey}>{key}:</Text> {String(value)}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    title: {
        fontSize: 15,
        fontWeight: '800',
        color: '#282A32',
        marginBottom: 18,
        letterSpacing: 0.2,
    },
    timeline: {
        maxHeight: 400,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 15,
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
        marginRight: 14,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    connector: {
        width: 2,
        flex: 1,
        marginTop: 4,
        borderRadius: 1,
    },
    eventContent: {
        flex: 1,
        paddingBottom: 4,
    },
    eventHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 6,
    },
    eventDescription: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: '#282A32',
        lineHeight: 19,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    performerBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    eventPerformer: {
        fontSize: 11,
        fontWeight: '700',
    },
    eventTime: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
        marginTop: 1,
    },
    metadataContainer: {
        marginTop: 8,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 10,
        gap: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    metadataKey: {
        fontWeight: '700',
        color: '#475569',
    },
    metadataText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});
