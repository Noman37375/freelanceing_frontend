import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Search,
    ChevronRight,
    ChevronLeft,
    AlertTriangle,
    TrendingUp,
    Clock,
    CheckCircle,
    ShieldAlert,
} from 'lucide-react-native';
import DisputeStatusBadge from '@/components/dispute/DisputeStatusBadge';
import { disputeService } from '@/services/disputeService';
import { adminService } from '@/services/adminService';
import type { Dispute, DisputeStatus } from '@/models/Dispute';
import { normalizeDisputeStatus } from '@/utils/statusHelper';
import { DISPUTE_STATUSES } from '@/utils/constants';

export default function ManageDisputes() {
    const router = useRouter();
    const [disputes, setDisputes] = useState<any[]>([]);
    const [filteredDisputes, setFilteredDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<DisputeStatus | 'all' | 'escalated_flag'>('all');

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        resolved: 0,
        escalated: 0,
        escalationRate: 0,
        slaBreachCount: 0,
        avgResolutionTime: 0,
    });

    useEffect(() => {
        loadDisputes();
    }, []);

    useEffect(() => {
        filterDisputes();
    }, [disputes, searchQuery, statusFilter]);

    const loadDisputes = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);

            const [data, statsData] = await Promise.all([
                adminService.getAllDisputes(),
                adminService.getDisputeStats().catch(() => null),
            ]);

            const PRIORITY_RANK: Record<string, number> = { urgent: 1, high: 2, medium: 3, low: 4 };
            const sorted = [...data].sort((a, b) => {
                // Escalated disputes (flag) always sort to top
                const aEscalated = a.isEscalated ? 0 : 1;
                const bEscalated = b.isEscalated ? 0 : 1;
                if (aEscalated !== bEscalated) return aEscalated - bEscalated;

                const aPriority = PRIORITY_RANK[a.priority] ?? 5;
                const bPriority = PRIORITY_RANK[b.priority] ?? 5;
                if (aPriority !== bPriority) return aPriority - bPriority;

                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setDisputes(sorted);

            if (statsData) {
                setStats({
                    total: statsData.total ?? data.length,
                    open: statsData.open ?? 0,
                    resolved: statsData.resolved ?? 0,
                    escalated: statsData.escalated ?? data.filter((d: any) => d.isEscalated).length,
                    escalationRate: statsData.escalationRate ?? 0,
                    slaBreachCount: statsData.slaBreachCount ?? 0,
                    avgResolutionTime: statsData.avgResolutionDays ?? 0,
                });
            } else {
                const escalatedCount = data.filter((d: any) => d.isEscalated).length;
                calculateStats(data, escalatedCount);
            }
        } catch (error: any) {
            console.error('Failed to load disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadDisputes(false);
        setRefreshing(false);
    }, []);

    const calculateStats = (data: any[], escalatedCount?: number) => {
        const openStatuses = [DISPUTE_STATUSES.OPEN, DISPUTE_STATUSES.UNDER_REVIEW, DISPUTE_STATUSES.MEDIATION];
        const resolvedStatuses = [DISPUTE_STATUSES.RESOLVED];

        const total = data.length;
        const open = data.filter((d) => openStatuses.includes(normalizeDisputeStatus(d.status))).length;
        const resolved = data.filter((d) => resolvedStatuses.includes(normalizeDisputeStatus(d.status))).length;
        const escalated = escalatedCount ?? data.filter((d: any) => d.isEscalated).length;

        const resolvedWithDates = data.filter(
            (d) => resolvedStatuses.includes(normalizeDisputeStatus(d.status)) && d.resolvedAt && d.createdAt
        );
        const avgMs =
            resolvedWithDates.length > 0
                ? resolvedWithDates.reduce((sum: number, d: any) => {
                      return sum + (new Date(d.resolvedAt).getTime() - new Date(d.createdAt).getTime());
                  }, 0) / resolvedWithDates.length
                : 0;
        const avgResolutionTime = parseFloat((avgMs / (1000 * 60 * 60 * 24)).toFixed(1));

        const escalationRate = total > 0 ? parseFloat(((escalated / total) * 100).toFixed(1)) : 0;
        const cutoff48h = Date.now() - 48 * 60 * 60 * 1000;
        const slaBreachCount = data.filter((d: any) =>
            normalizeDisputeStatus(d.status) === 'open' && new Date(d.createdAt).getTime() < cutoff48h
        ).length;
        setStats({ total, open, resolved, escalated, escalationRate, slaBreachCount, avgResolutionTime });
    };

    // Map DB statuses (both legacy PascalCase and new snake_case) to filter values
    /*const normalizeStatus = (status: string): string => {
        const map: Record<string, string> = {
            Pending: 'open',
            'Under Review': 'under_review',
            Resolved: 'resolved',
            Denied: 'closed',
            Closed: 'closed',
        };
        return map[status] || status;
    };*/

    const filterDisputes = () => {
        let filtered = [...disputes];

        if (statusFilter === 'escalated_flag') {
            filtered = filtered.filter((d) => d.isEscalated);
        } else if (statusFilter !== 'all') {
            filtered = filtered.filter((d) => normalizeDisputeStatus(d.status) === statusFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (d) =>
                    d.id?.toLowerCase().includes(query) ||
                    d.project?.title?.toLowerCase().includes(query) ||
                    d.description?.toLowerCase().includes(query) ||
                    d.client?.user_name?.toLowerCase().includes(query) ||
                    d.freelancer?.user_name?.toLowerCase().includes(query)
            );
        }

        setFilteredDisputes(filtered);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return '#EF4444';
            case 'high':
                return '#F59E0B';
            case 'medium':
                return '#282A32';
            default:
                return '#64748B';
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
        <View style={styles.statCard}>
            <View style={[styles.statCardAccent, { backgroundColor: color }]} />
            <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
                <Icon size={18} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{title}</Text>
            {trend && (
                <View style={styles.trendBadge}>
                    <TrendingUp size={10} color="#10B981" />
                    <Text style={styles.trendText}>{trend}</Text>
                </View>
            )}
        </View>
    );

    // Lifecycle: Open → Under Review → Mediation → Resolved
    const statusFilters: Array<{ label: string; value: DisputeStatus | 'all' | 'escalated_flag'; hint: string; urgent?: boolean }> = [
        { label: 'All', value: 'all', hint: 'All disputes' },
        { label: '🚨 Escalated', value: 'escalated_flag', hint: 'Flagged as urgent', urgent: true },
        { label: 'Open', value: 'open', hint: 'New — awaiting admin' },
        { label: 'Under Review', value: 'under_review', hint: 'Admin investigating' },
        { label: 'Mediation', value: 'mediation', hint: 'Awaiting party responses' },
        { label: 'Resolved', value: 'resolved', hint: 'Decision made' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <ChevronLeft size={22} color="#475569" strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Disputes</Text>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Statistics Cards */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Disputes"
                        value={stats.total}
                        icon={AlertTriangle}
                        color="#444751"
                    />
                    <StatCard
                        title="Open Cases"
                        value={stats.open}
                        icon={Clock}
                        color="#F59E0B"
                    />
                    <StatCard
                        title="Escalated"
                        value={stats.escalated}
                        icon={ShieldAlert}
                        color="#EF4444"
                    />
                    <StatCard
                        title="Resolved"
                        value={stats.resolved}
                        icon={CheckCircle}
                        color="#10B981"
                    />
                    <StatCard
                        title="Escalation Rate"
                        value={`${stats.escalationRate}%`}
                        icon={TrendingUp}
                        color="#8B5CF6"
                    />
                    <StatCard
                        title="SLA Breaches"
                        value={stats.slaBreachCount}
                        icon={AlertTriangle}
                        color="#F59E0B"
                    />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Search size={20} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by ID, project, or description..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Status Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                >
                    {statusFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter.value}
                            style={[
                                styles.filterChip,
                                filter.urgent && styles.filterChipUrgent,
                                statusFilter === filter.value && (filter.urgent ? styles.filterChipUrgentActive : styles.filterChipActive),
                            ]}
                            onPress={() => setStatusFilter(filter.value)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    filter.urgent && styles.filterChipTextUrgent,
                                    statusFilter === filter.value && styles.filterChipTextActive,
                                ]}
                            >
                                {filter.label}
                            </Text>
                            {statusFilter === filter.value && (
                                <Text style={styles.filterChipHint}>{filter.hint}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Disputes List */}
                <View style={styles.disputesList}>
                    <Text style={styles.listTitle}>
                        {filteredDisputes.length} Dispute{filteredDisputes.length !== 1 ? 's' : ''}
                    </Text>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#444751" />
                        </View>
                    ) : filteredDisputes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <AlertTriangle size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No disputes found</Text>
                            <Text style={styles.emptySubtext}>
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'All disputes will appear here'}
                            </Text>
                        </View>
                    ) : (
                        filteredDisputes.map((dispute) => (
                            <TouchableOpacity
                                key={dispute.id}
                                style={[styles.disputeCard, dispute.isEscalated && styles.disputeCardEscalated]}
                                onPress={() =>
                                    router.push({
                                        pathname: '/(admin)/dispute-detail/[id]' as any,
                                        params: { id: dispute.id },
                                    })
                                }
                                activeOpacity={0.75}
                            >
                                {/* Priority/escalation left accent strip */}
                                <View
                                    style={[
                                        styles.disputeCardStrip,
                                        {
                                            backgroundColor: dispute.isEscalated
                                                ? '#EF4444'
                                                : getPriorityColor(dispute.priority),
                                        },
                                    ]}
                                />

                                <View style={styles.disputeCardInner}>
                                    <View style={styles.disputeHeader}>
                                        <View style={styles.disputeHeaderLeft}>
                                            <Text style={styles.disputeId}>#{dispute.id.slice(0, 8)}</Text>
                                            {dispute.isEscalated && (
                                                <View style={styles.escalatedBadge}>
                                                    <ShieldAlert size={10} color="#EF4444" />
                                                    <Text style={styles.escalatedBadgeText}>ESCALATED</Text>
                                                </View>
                                            )}
                                            {dispute.priority && !dispute.isEscalated && (
                                                <View
                                                    style={[
                                                        styles.priorityBadge,
                                                        { backgroundColor: `${getPriorityColor(dispute.priority)}15` },
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.priorityText,
                                                            { color: getPriorityColor(dispute.priority) },
                                                        ]}
                                                    >
                                                        {dispute.priority.toUpperCase()}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <DisputeStatusBadge status={dispute.status} size="small" />
                                    </View>

                                    <Text style={styles.disputeTitle} numberOfLines={1}>
                                        {dispute.project?.title || 'Untitled Dispute'}
                                    </Text>

                                    <View style={styles.disputeDetails}>
                                        <View style={styles.amountPill}>
                                            <Text style={styles.amountPillText}>
                                                ${dispute.amount?.toFixed(2) || '0.00'}
                                            </Text>
                                        </View>
                                        <View style={styles.disputeDetail}>
                                            <Text style={styles.disputeDetailLabel}>Created:</Text>
                                            <Text style={styles.disputeDetailValue}>{formatDate(dispute.createdAt)}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.disputeParties}>
                                        <View style={styles.partyChip}>
                                            <Text style={styles.partyChipRole}>Client</Text>
                                            <Text style={styles.partyChipName}>{dispute.client?.user_name || '—'}</Text>
                                        </View>
                                        <Text style={styles.partyVs}>vs</Text>
                                        <View style={styles.partyChip}>
                                            <Text style={styles.partyChipRole}>Freelancer</Text>
                                            <Text style={styles.partyChipName}>{dispute.freelancer?.user_name || '—'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.disputeFooter}>
                                        <Text style={styles.viewDetails}>View Details</Text>
                                        <ChevronRight size={16} color="#444751" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#282A32',
    },
    content: {
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    statCardAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#282A32',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 6,
    },
    trendText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#10B981',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#282A32',
    },
    filtersContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterChipActive: {
        backgroundColor: '#444751',
        borderColor: '#444751',
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
    },
    filterChipHint: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '600',
        marginTop: 2,
    },
    filterChipUrgent: {
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    filterChipUrgentActive: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    filterChipTextUrgent: {
        color: '#EF4444',
    },
    disputesList: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#282A32',
        marginBottom: 16,
    },
    loadingContainer: {
        padding: 60,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        padding: 60,
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
    disputeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    disputeCardEscalated: {
        borderColor: '#FBBF24',
        borderWidth: 1.5,
        backgroundColor: '#FFFBEB',
    },
    disputeCardStrip: {
        width: 4,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    disputeCardInner: {
        flex: 1,
        padding: 16,
    },
    escalatedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    escalatedBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#EF4444',
        letterSpacing: 0.4,
    },
    disputeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    disputeHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    disputeId: {
        fontSize: 13,
        fontWeight: '700',
        color: '#444751',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    disputeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#282A32',
        marginBottom: 12,
    },
    disputeDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    amountPill: {
        backgroundColor: '#ECFDF5',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    amountPillText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#059669',
    },
    disputeDetail: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    disputeDetailLabel: {
        fontSize: 12,
        color: '#94A3B8',
    },
    disputeDetailValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    disputeParties: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginBottom: 12,
    },
    partyChip: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flex: 1,
    },
    partyChipRole: {
        fontSize: 9,
        fontWeight: '800',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    partyChipName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#282A32',
    },
    partyVs: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
    },
    disputeFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
    },
    viewDetails: {
        fontSize: 13,
        fontWeight: '700',
        color: '#444751',
    },
});
