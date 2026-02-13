import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import {
    Briefcase,
    Users,
    UserCheck,
    Layers,
    AlertCircle,
    DollarSign,
    BarChart3,
    TrendingUp,
} from 'lucide-react-native';
import { DashboardStats } from '@/services/adminService';

interface AdminAnalyticsOverviewProps {
    stats: DashboardStats | null;
    isMobile?: boolean;
}

// Responsive breakpoints aligned with dashboard
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
};

const formatRevenue = (n: number) =>
    `$${typeof n === 'number' ? n.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}`;

export default function AdminAnalyticsOverview({ stats, isMobile: isMobileProp }: AdminAnalyticsOverviewProps) {
    const { width } = useWindowDimensions();
    const isMobile = isMobileProp ?? width <= MOBILE_BREAKPOINT;
    const isTablet = width > MOBILE_BREAKPOINT && width <= TABLET_BREAKPOINT;
    const isDesktop = width > TABLET_BREAKPOINT;

    const totalUsers = (stats?.totalClients ?? 0) + (stats?.totalFreelancers ?? 0);
    const projects = stats?.activeProjects ?? 0;
    const clients = stats?.totalClients ?? 0;
    const freelancers = stats?.totalFreelancers ?? 0;
    const revenue = stats?.totalRevenue ?? 0;
    const services = stats?.totalServices ?? 0;
    const disputes = stats?.totalDisputes ?? 0;

    const metrics: Array<{
        key: string;
        label: string;
        value: string;
        subLabel: string;
        icon: typeof Briefcase;
        color: string;
        bgColor: string;
    }> = [
        {
            key: 'projects',
            label: 'Active Projects',
            value: formatNumber(projects),
            subLabel: 'Currently running',
            icon: Briefcase,
            color: '#0F172A',
            bgColor: 'rgba(15, 23, 42, 0.08)',
        },
        {
            key: 'clients',
            label: 'Clients',
            value: formatNumber(clients),
            subLabel: 'Registered clients',
            icon: UserCheck,
            color: '#0D9488',
            bgColor: 'rgba(13, 148, 136, 0.12)',
        },
        {
            key: 'freelancers',
            label: 'Freelancers',
            value: formatNumber(freelancers),
            subLabel: 'Active talent',
            icon: Users,
            color: '#7C3AED',
            bgColor: 'rgba(124, 58, 237, 0.12)',
        },
        {
            key: 'revenue',
            label: 'Total Revenue',
            value: formatRevenue(revenue),
            subLabel: 'Platform earnings',
            icon: DollarSign,
            color: '#059669',
            bgColor: 'rgba(5, 150, 105, 0.12)',
        },
        {
            key: 'services',
            label: 'Services',
            value: formatNumber(services),
            subLabel: 'Categories',
            icon: Layers,
            color: '#2563EB',
            bgColor: 'rgba(37, 99, 235, 0.12)',
        },
        {
            key: 'disputes',
            label: 'Disputes',
            value: formatNumber(disputes),
            subLabel: 'Needs attention',
            icon: AlertCircle,
            color: disputes > 0 ? '#DC2626' : '#64748B',
            bgColor: disputes > 0 ? 'rgba(220, 38, 38, 0.1)' : 'rgba(100, 116, 139, 0.1)',
        },
    ];

    const cardGap = isMobile ? 10 : 16;
    const wrapperPadding = isMobile ? 16 : 24;
    const headerCol = isMobile;

    return (
        <View style={[styles.wrapper, { padding: wrapperPadding }]}>
            <View style={[styles.header, headerCol && styles.headerColumn]}>
                <View style={styles.headerLeft}>
                    <View style={[styles.headerIconWrap, isMobile && styles.headerIconWrapMobile]}>
                        <BarChart3 size={isMobile ? 20 : 22} color="#444751" />
                    </View>
                    <View style={styles.headerTextWrap}>
                        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
                            Platform Analytics
                        </Text>
                        <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]} numberOfLines={2}>
                            Key metrics at a glance — easy to judge & analyze
                        </Text>
                    </View>
                </View>
                <View style={[styles.summaryPill, isMobile && styles.summaryPillMobile]}>
                    <TrendingUp size={14} color="#059669" />
                    <Text style={[styles.summaryText, isMobile && styles.summaryTextMobile]}>
                        Total users: <Text style={styles.summaryBold}>{formatNumber(totalUsers)}</Text>
                    </Text>
                </View>
            </View>

            <View
                style={[
                    styles.grid,
                    !isMobile && { gap: cardGap },
                    isMobile && styles.gridMobile,
                ]}
            >
                {metrics.map((m) => {
                    const Icon = m.icon;
                    return (
                        <View
                            key={m.key}
                            style={[
                                styles.card,
                                isMobile && styles.cardMobile,
                                !isMobile && { flex: 1, minWidth: 140, maxWidth: 220 },
                            ]}
                        >
                            <View style={[styles.cardIconBox, { backgroundColor: m.bgColor }, isMobile && styles.cardIconBoxMobile]}>
                                <Icon size={isMobile ? 18 : 22} color={m.color} strokeWidth={2.2} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardValue, isMobile && styles.cardValueMobile]} numberOfLines={1}>
                                    {m.value}
                                </Text>
                                <Text style={[styles.cardLabel, isMobile && styles.cardLabelMobile]} numberOfLines={1}>
                                    {m.label}
                                </Text>
                                <Text style={[styles.cardSubLabel, isMobile && styles.cardSubLabelMobile]} numberOfLines={1}>
                                    {m.subLabel}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 8,
        width: '100%',
        alignSelf: 'stretch',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
    },
    headerColumn: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        flex: 1,
    },
    headerTextWrap: {
        flex: 1,
        minWidth: 0,
    },
    headerIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(68, 71, 81, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIconWrapMobile: {
        width: 40,
        height: 40,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#282A32',
        letterSpacing: -0.3,
    },
    sectionTitleMobile: {
        fontSize: 17,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
        marginTop: 2,
    },
    sectionSubtitleMobile: {
        fontSize: 12,
        marginTop: 1,
    },
    summaryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(5, 150, 105, 0.08)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
    },
    summaryPillMobile: {
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    summaryText: {
        fontSize: 13,
        color: '#047857',
        fontWeight: '600',
    },
    summaryTextMobile: {
        fontSize: 12,
    },
    summaryBold: {
        fontWeight: '800',
        color: '#065F46',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridMobile: {
        justifyContent: 'space-between',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FCFCFD',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardMobile: {
        width: '48%',
        padding: 12,
        borderRadius: 14,
        marginBottom: 10,
    },
    cardIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    cardIconBoxMobile: {
        width: 40,
        height: 40,
        borderRadius: 12,
        marginRight: 10,
    },
    cardContent: {
        flex: 1,
        minWidth: 0,
    },
    cardValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#282A32',
        letterSpacing: -0.5,
    },
    cardValueMobile: {
        fontSize: 17,
    },
    cardLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#444751',
        marginTop: 2,
    },
    cardLabelMobile: {
        fontSize: 12,
        marginTop: 1,
    },
    cardSubLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
        marginTop: 1,
    },
    cardSubLabelMobile: {
        fontSize: 10,
    },
});
