import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MoreVertical } from 'lucide-react-native';

interface StatusItem {
    id: string;
    title: string;
    subTitle: string;
    type: string;
    date: string;
    status: 'Interview' | 'Applied' | 'Not selected';
}

interface AdminApplicationStatusProps {
    items: StatusItem[];
}

export default function AdminApplicationStatus({ items }: AdminApplicationStatusProps) {
    const getStatusStyles = (status: StatusItem['status']) => {
        switch (status) {
            case 'Interview': return { color: '#059669', bg: '#D1FAE5' };
            case 'Applied': return { color: '#D97706', bg: '#FEF3C7' };
            case 'Not selected': return { color: '#DC2626', bg: '#FEE2E2' };
            default: return { color: '#64748B', bg: '#F1F5F9' };
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Application status</Text>
                <TouchableOpacity>
                    <MoreVertical size={20} color="#94A3B8" />
                </TouchableOpacity>
            </View>

            <View style={styles.list}>
                {items.map((item) => {
                    const statusStyle = getStatusStyles(item.status);
                    return (
                        <View key={item.id} style={styles.item}>
                            <View style={styles.itemHeader}>
                                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                    <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
                                    <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status}</Text>
                                </View>
                                <Text style={styles.date}>{item.date}</Text>
                            </View>

                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemSubTitle}>{item.subTitle}</Text>

                            <View style={styles.tags}>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>{item.type}</Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>Contract</Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        flex: 1,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#282A32',
    },
    list: {
        gap: 24,
    },
    item: {
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
        paddingBottom: 20,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    date: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '600',
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#282A32',
        marginBottom: 4,
    },
    itemSubTitle: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 12,
    },
    tags: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tagText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '700',
    },
});
