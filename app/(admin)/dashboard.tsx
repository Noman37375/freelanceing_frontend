import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Platform,
    StatusBar,
    TextInput,
    useWindowDimensions,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    Search,
    Bell,
    Menu,
    ChevronRight,
    Activity,
    Users,
    UserCheck,
    Briefcase,
    FileText,
    Layers
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, DashboardStats } from '@/services/adminService';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import newly created components
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminAnalyticsCard from '@/components/admin/AdminAnalyticsCard';
import AdminProfileCard from '@/components/admin/AdminProfileCard';
import AdminEarningReport from '@/components/admin/AdminEarningReport';
import AdminApplicationStatus from '@/components/admin/AdminApplicationStatus';
import AdminActivityTable from '@/components/admin/AdminActivityTable';

export default function AdminDashboard() {
    const router = useRouter();
    const { logout, user } = useAuth();
    const { width } = useWindowDimensions(); // Dynamic width for responsiveness
    const isDesktop = width > 1024;
    const isTablet = width > 768 && width <= 1024;
    const isMobile = width <= 768;

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [serviceCount, setServiceCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const [disputeCount, setDisputeCount] = useState(0);
    const [projects, setProjects] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarVisible, setSidebarVisible] = useState(isDesktop);
    const skeletonOpacity = useRef(new Animated.Value(0.4)).current;

    // Skeleton pulse animation
    useEffect(() => {
        if (!isLoading) return;
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(skeletonOpacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
                Animated.timing(skeletonOpacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [isLoading, skeletonOpacity]);

    // Update sidebar visibility when screen size changes
    useEffect(() => {
        setSidebarVisible(isDesktop);
    }, [isDesktop]);

    const loadStats = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const [statsData, services, notifications, disputes, projectsData] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getServiceCategories(),
                adminService.getSystemNotifications(),
                adminService.getAllDisputes(),
                adminService.getAllProjects(),
            ]);
            setStats(statsData);
            setServiceCount(services?.length ?? 0);
            setNotificationCount(notifications?.length ?? 0);
            setDisputeCount(disputes?.length ?? 0);
            setProjects(projectsData ?? []);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats(false);
        setRefreshing(false);
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/login' as any);
    };

    const StatusItems: any[] = [];

    const activeStatuses = ['ACTIVE', 'IN_PROGRESS', 'open', 'in_progress'];
    const ActiveProjects = projects
        .filter((p: any) => p.status && activeStatuses.includes(String(p.status)))
        .slice(0, 10)
        .map((p: any) => ({
            id: p.id,
            clientName: p.client?.user_name || p.client?.userName || '—',
            projectName: p.title || '—',
            price: typeof p.budget === 'number' ? `$${p.budget}` : `$${p.budget || 0}`,
            deliveredIn: p.deadline || p.duration || '—',
            progress: 0,
        }));

    const ManagementCards = [
        { title: 'Freelancers', icon: Users, color: '#3B82F6', route: '/(admin)/manage-freelancers', count: stats?.totalFreelancers ?? 0 },
        { title: 'Clients', icon: UserCheck, color: '#F59E0B', route: '/(admin)/manage-clients', count: stats?.totalClients ?? 0 },
        { title: 'Services', icon: Layers, color: '#10B981', route: '/(admin)/manage-services', count: serviceCount },
        { title: 'Notifications', icon: Bell, color: '#6366F1', route: '/(admin)/manage-notifications', count: notificationCount },
        { title: 'Projects', icon: Briefcase, color: '#EC4899', route: '/(admin)/manage-projects', count: stats?.activeProjects ?? 0 },
        { title: 'Disputes', icon: Activity, color: '#8B5CF6', route: '/(admin)/manage-disputes', count: disputeCount },
    ];

    // Dynamic styles based on screen size
    const dynamicStyles = {
        mainLayout: {
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 16 : 24,
        } as any,
        chartsGrid: {
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 16 : 20,
        } as any,
        managementCard: {
            flexBasis: isDesktop ? '23%' : isTablet ? '47%' : '100%',
        } as any,
        greetingHeader: {
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 12 : 0,
        } as any,
        greetingText: {
            fontSize: isMobile ? 22 : 28,
        },
        scrollContent: {
            padding: isMobile ? 16 : 24,
        },
        topBar: {
            height: isMobile ? 64 : 80,
            paddingHorizontal: isMobile ? 16 : 24,
        },
    };

    return (
        <View style={styles.outerContainer}>
            <StatusBar barStyle="dark-content" />

            {/* Sidebar Overlay for Mobile */}
            {!isDesktop && sidebarVisible && (
                <TouchableOpacity
                    style={styles.sidebarOverlay}
                    activeOpacity={1}
                    onPress={() => setSidebarVisible(false)}
                />
            )}

            {/* Sidebar */}
            {(sidebarVisible || isDesktop) && (
                <View style={isDesktop ? styles.desktopSidebar : styles.mobileSidebar}>
                    <AdminSidebar onLogout={handleLogout} />
                </View>
            )}

            <SafeAreaView style={styles.container}>
                {/* Header Bar */}
                <View style={[styles.topBar, dynamicStyles.topBar]}>
                    <View style={styles.topBarLeft}>
                        {!isDesktop && (
                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={() => setSidebarVisible(!sidebarVisible)}
                            >
                                <Menu size={24} color="#1E293B" />
                            </TouchableOpacity>
                        )}
                        <Text style={[styles.pageTitle, { fontSize: isMobile ? 20 : 24 }]}>Dashboard</Text>

                        {!isMobile && (
                            <View style={styles.companyToggleContainer}>
                                <Text style={styles.companyToggleLabel}>Company</Text>
                                <View style={styles.toggleSwitch}>
                                    <View style={styles.toggleCircle} />
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={styles.topBarRight}>
                        {!isMobile && (
                            <View style={[styles.searchContainer, { width: isDesktop ? 300 : 200 }]}>
                                <Search size={18} color="#94A3B8" />
                                <TextInput
                                    placeholder="Search"
                                    style={styles.searchInput}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        )}
                        <TouchableOpacity style={styles.notificationButton}>
                            <Bell size={20} color="#1E293B" />
                            <View style={styles.notifBadge} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={dynamicStyles.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    showsVerticalScrollIndicator={false}
                >
                    {isLoading ? (
                        <View style={dynamicStyles.mainLayout}>
                            <View style={isMobile ? {} : styles.leftColumn}>
                                {/* Skeleton: Greeting */}
                                <View style={[styles.greeting, { flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 12 }]}>
                                    <Animated.View style={[styles.skeletonLine, styles.skeletonGreeting, { opacity: skeletonOpacity }]} />
                                    {!isMobile && <Animated.View style={[styles.skeletonLine, styles.skeletonReportBtn, { opacity: skeletonOpacity }]} />}
                                </View>

                                {/* Skeleton: Charts row */}
                                <View style={[styles.chartsGrid, dynamicStyles.chartsGrid]}>
                                    <Animated.View style={[styles.skeletonCard, styles.skeletonAnalytics, { opacity: skeletonOpacity }]} />
                                    <Animated.View style={[styles.skeletonCard, styles.skeletonEarning, { opacity: skeletonOpacity }]} />
                                </View>

                                {/* Skeleton: Section header */}
                                <View style={styles.sectionHeader}>
                                    <Animated.View style={[styles.skeletonLine, styles.skeletonSectionTitle, { opacity: skeletonOpacity }]} />
                                </View>

                                {/* Skeleton: Management cards (6) */}
                                <View style={styles.managementGrid}>
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <Animated.View key={i} style={[styles.managementCard, dynamicStyles.managementCard, styles.skeletonManagementCard, { opacity: skeletonOpacity }]}>
                                            <View style={styles.skeletonIconBox} />
                                            <View style={styles.skeletonCardText}>
                                                <View style={styles.skeletonCount} />
                                                <View style={styles.skeletonLabel} />
                                            </View>
                                        </Animated.View>
                                    ))}
                                </View>

                                {/* Skeleton: Active projects section */}
                                <View style={styles.projectsSection}>
                                    <View style={styles.sectionHeader}>
                                        <Animated.View style={[styles.skeletonLine, styles.skeletonSectionTitle, { opacity: skeletonOpacity }]} />
                                    </View>
                                    <Animated.View style={[styles.projectsCard, styles.skeletonTable, { opacity: skeletonOpacity }]}>
                                        {[1, 2, 3, 4].map((i) => (
                                            <View key={i} style={styles.skeletonTableRow}>
                                                <View style={styles.skeletonTableCell} />
                                                <View style={styles.skeletonTableCell} />
                                                <View style={styles.skeletonTableCellShort} />
                                            </View>
                                        ))}
                                    </Animated.View>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={dynamicStyles.mainLayout}>
                            {/* Left Column (Main Stats) */}
                            <View style={isMobile ? {} : styles.leftColumn}>
                                <View style={styles.greeting}>
                                    <View style={dynamicStyles.greetingHeader}>
                                        <Text style={[styles.greetingText, dynamicStyles.greetingText]}>
                                            Welcome back, {user?.userName || 'Admin'}! 👋
                                        </Text>
                                        {!isMobile && (
                                            <TouchableOpacity style={styles.reportButton}>
                                                <FileText size={16} color="#6366F1" />
                                                <Text style={styles.reportButtonText}>Download report</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                <View style={[styles.chartsGrid, dynamicStyles.chartsGrid]}>
                                    <View style={{ flex: isMobile ? undefined : 1, width: isMobile ? '100%' : undefined }}>
                                        <AdminAnalyticsCard
                                            percentage={90}
                                            title="Analytics"
                                            subTitle="Performance"
                                            value={stats?.totalClients?.toString() ?? '0'}
                                            subValue={String((stats?.totalFreelancers ?? 0) + (stats?.totalClients ?? 0))}
                                        />
                                    </View>
                                    <View style={{ flex: isMobile ? undefined : 1.6, width: isMobile ? '100%' : undefined }}>
                                        <AdminEarningReport
                                            revenue={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
                                            trend="+2.3%"
                                        />
                                    </View>
                                </View>

                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { fontSize: isMobile ? 18 : 22 }]}>
                                        Management View
                                    </Text>
                                </View>

                                <View style={styles.managementGrid}>
                                    {ManagementCards.map((card) => (
                                        <TouchableOpacity
                                            key={card.title}
                                            style={[styles.managementCard, dynamicStyles.managementCard]}
                                            onPress={() => router.push(card.route as any)}
                                        >
                                            <View style={[styles.cardIconBox, { backgroundColor: `${card.color}15` }]}>
                                                <card.icon size={22} color={card.color} />
                                            </View>
                                            <View style={styles.cardInfo}>
                                                <Text style={styles.cardCount}>{card.count}</Text>
                                                <Text style={styles.cardTitle}>{card.title}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.projectsSection}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={[styles.sectionTitle, { fontSize: isMobile ? 18 : 22 }]}>
                                            Active projects <Text style={styles.countText}>({ActiveProjects.length})</Text>
                                        </Text>
                                    </View>

                                    <View style={styles.projectsCard}>
                                        <AdminActivityTable projects={ActiveProjects} />
                                    </View>
                                </View>

                            </View>

                            {/* Right Column */}
                            <View style={isMobile ? {} : styles.rightColumn}>
                                {StatusItems.length > 0 && <AdminApplicationStatus items={StatusItems} />}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
    },
    sidebarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 90,
    },
    desktopSidebar: {
        width: 240,
        height: '100%',
    },
    mobileSidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        width: 240,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 5, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 20 },
        }),
    },
    projectsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    container: {
        flex: 1,
        backgroundColor: '#FCFCFD',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    topBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    companyToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginLeft: 20,
    },
    companyToggleLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    toggleSwitch: {
        width: 40,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-end',
    },
    menuButton: {
        padding: 8,
    },
    pageTitle: {
        fontWeight: '800',
        color: '#1E293B',
    },
    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    notifBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    leftColumn: {
        flex: 2.5,
    },
    rightColumn: {
        flex: 1,
    },
    greeting: {
        marginBottom: 24,
    },
    greetingText: {
        fontWeight: '800',
        color: '#1E293B',
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    reportButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6366F1',
    },
    chartsGrid: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontWeight: '800',
        color: '#1E293B',
    },
    countText: {
        color: '#94A3B8',
        fontSize: 16,
        fontWeight: '600',
    },
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewMoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6366F1',
    },
    managementGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    managementCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    cardIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardCount: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94A3B8',
    },
    projectsSection: {
        marginBottom: 32,
    },
    // Skeleton styles
    skeletonLine: {
        backgroundColor: '#E2E8F0',
        borderRadius: 8,
    },
    skeletonGreeting: {
        height: 32,
        width: '70%',
        maxWidth: 320,
    },
    skeletonReportBtn: {
        height: 40,
        width: 160,
    },
    skeletonCard: {
        backgroundColor: '#E2E8F0',
        borderRadius: 16,
    },
    skeletonAnalytics: {
        flex: 1,
        minHeight: 140,
    },
    skeletonEarning: {
        flex: 1.6,
        minHeight: 140,
    },
    skeletonSectionTitle: {
        height: 24,
        width: 180,
    },
    skeletonManagementCard: {
        backgroundColor: '#E2E8F0',
    },
    skeletonIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#CBD5E1',
    },
    skeletonCardText: {
        flex: 1,
        gap: 8,
    },
    skeletonCount: {
        height: 22,
        width: 48,
        borderRadius: 6,
        backgroundColor: '#CBD5E1',
    },
    skeletonLabel: {
        height: 14,
        width: 72,
        borderRadius: 6,
        backgroundColor: '#CBD5E1',
    },
    skeletonTable: {
        backgroundColor: '#F1F5F9',
    },
    skeletonTableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        gap: 12,
    },
    skeletonTableCell: {
        flex: 1,
        height: 16,
        borderRadius: 6,
        backgroundColor: '#E2E8F0',
    },
    skeletonTableCellShort: {
        width: 80,
        height: 16,
        borderRadius: 6,
        backgroundColor: '#E2E8F0',
    },
});
