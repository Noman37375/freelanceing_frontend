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
    Filter,
    ChevronRight,
    ChevronLeft,
    AlertTriangle,
    TrendingUp,
    Clock,
    CheckCircle,
} from 'lucide-react-native';
import DisputeStatusBadge from '@/components/dispute/DisputeStatusBadge';
import { disputeService } from '@/services/disputeService';
import { adminService } from '@/services/adminService';
import type { Dispute, DisputeStatus } from '@/models/Dispute';

export default function ManageDisputes() {
    const router = useRouter();
    const [disputes, setDisputes] = useState<any[]>([]);
    const [filteredDisputes, setFilteredDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<DisputeStatus | 'all'>('all');

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        resolved: 0,
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
            setDisputes(data);

            if (statsData) {
                setStats({
                    total: statsData.total ?? data.length,
                    open: statsData.open ?? 0,
                    resolved: statsData.resolved ?? 0,
                    avgResolutionTime: statsData.avgResolutionDays ?? 0,
                });
            } else {
                calculateStats(data);
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

    const calculateStats = (data: any[]) => {
        const openStatuses = ['open', 'under_review', 'awaiting_response', 'mediation', 'escalated', 'Pending', 'Under Review'];
        const resolvedStatuses = ['resolved', 'Resolved'];

        const total = data.length;
        const open = data.filter((d) => openStatuses.includes(d.status)).length;
        const resolved = data.filter((d) => resolvedStatuses.includes(d.status)).length;

        const resolvedWithDates = data.filter(
            (d) => resolvedStatuses.includes(d.status) && d.resolvedAt && d.createdAt
        );
        const avgMs =
            resolvedWithDates.length > 0
                ? resolvedWithDates.reduce((sum: number, d: any) => {
                      return sum + (new Date(d.resolvedAt).getTime() - new Date(d.createdAt).getTime());
                  }, 0) / resolvedWithDates.length
                : 0;
        const avgResolutionTime = parseFloat((avgMs / (1000 * 60 * 60 * 24)).toFixed(1));

        setStats({ total, open, resolved, avgResolutionTime });
    };

    // Map DB statuses (both legacy PascalCase and new snake_case) to filter values
    const normalizeStatus = (status: string): string => {
        const map: Record<string, string> = {
            Pending: 'open',
            'Under Review': 'under_review',
            Resolved: 'resolved',
            Denied: 'closed',
            Closed: 'closed',
        };
        return map[status] || status;
    };

    const filterDisputes = () => {
        let filtered = [...disputes];

        // Filter by status using normalized comparison
        if (statusFilter !== 'all') {
            filtered = filtered.filter((d) => normalizeStatus(d.status) === statusFilter);
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
            <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
                <Icon size={20} color={color} />
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

    const statusFilters: Array<{ label: string; value: DisputeStatus | 'all' }> = [
        { label: 'All', value: 'all' },
        { label: 'Open', value: 'open' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Mediation', value: 'mediation' },
        { label: 'Resolved', value: 'resolved' },
        // { label: 'Escalated', value: 'escalated' },
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
                        trend="+5%"
                    />
                    <StatCard
                        title="Resolved"
                        value={stats.resolved}
                        icon={CheckCircle}
                        color="#10B981"
                    />
                    <StatCard
                        title="Avg. Resolution"
                        value={`${stats.avgResolutionTime}d`}
                        icon={TrendingUp}
                        color="#282A32"
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
                                statusFilter === filter.value && styles.filterChipActive,
                            ]}
                            onPress={() => setStatusFilter(filter.value)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    statusFilter === filter.value && styles.filterChipTextActive,
                                ]}
                            >
                                {filter.label}
                            </Text>
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
                                style={styles.disputeCard}
                                onPress={() =>
                                    router.push({
                                        pathname: '/(admin)/dispute-detail/[id]' as any,
                                        params: { id: dispute.id },
                                    })
                                }
                            >
                                <View style={styles.disputeHeader}>
                                    <View style={styles.disputeHeaderLeft}>
                                        <Text style={styles.disputeId}>#{dispute.id.slice(0, 8)}</Text>
                                        {dispute.priority && (
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
                                    <View style={styles.disputeDetail}>
                                        <Text style={styles.disputeDetailLabel}>Amount:</Text>
                                        <Text style={styles.disputeDetailValue}>
                                            ${dispute.amount?.toFixed(2) || '0.00'}
                                        </Text>
                                    </View>
                                    <View style={styles.disputeDetail}>
                                        <Text style={styles.disputeDetailLabel}>Created:</Text>
                                        <Text style={styles.disputeDetailValue}>{formatDate(dispute.createdAt)}</Text>
                                    </View>
                                </View>

                                <View style={styles.disputeParties}>
                                    <Text style={styles.partyText}>
                                        {dispute.client?.user_name || 'Client'} vs {dispute.freelancer?.user_name || 'Freelancer'}
                                    </Text>
                                </View>

                                <View style={styles.disputeFooter}>
                                    <Text style={styles.viewDetails}>View Details</Text>
                                    <ChevronRight size={16} color="#444751" />
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
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
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
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
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
        gap: 20,
        marginBottom: 12,
    },
    disputeDetail: {
        flexDirection: 'row',
        gap: 6,
    },
    disputeDetailLabel: {
        fontSize: 13,
        color: '#64748B',
    },
    disputeDetailValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#282A32',
    },
    disputeParties: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginBottom: 12,
    },
    partyText: {
        fontSize: 13,
        color: '#64748B',
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
