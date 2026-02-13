import React, { useCallback, useEffect, useState } from 'react';
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
    useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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
import { Project } from '@/models/Project';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import newly created components
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminAnalyticsOverview from '@/components/admin/AdminAnalyticsOverview';
import AdminProfileCard from '@/components/admin/AdminProfileCard';
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
    const [activeProjects, setActiveProjects] = useState<Project[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarVisible, setSidebarVisible] = useState(isDesktop);

    // Update sidebar visibility when screen size changes
    useEffect(() => {
        setSidebarVisible(isDesktop);
    }, [isDesktop]);

    const loadStats = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const [statsData, projectsData] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getAllProjects(),
            ]);
            setStats(statsData);
            const active = (projectsData || []).filter(
                (p: Project) =>
                    p.status === 'ACTIVE' ||
                    p.status === 'IN_PROGRESS' ||
                    (typeof p.status === 'string' && ['open', 'in_progress'].includes(p.status.toLowerCase()))
            );
            setActiveProjects(active);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Refetch stats when screen is focused (e.g. returning from manage-services)
    useFocusEffect(
        useCallback(() => {
            loadStats(false);
        }, [loadStats])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats(false);
        setRefreshing(false);
    };

    const activeProjectsForTable = activeProjects.map((p) => {
        const client = p.client as { user_name?: string; userName?: string } | undefined;
        const clientName = client?.userName ?? client?.user_name ?? 'Unknown';
        return {
            id: p.id,
            clientName,
            projectName: p.title,
            price: `$${typeof p.budget === 'number' ? p.budget.toLocaleString() : p.budget ?? '0'}`,
            deliveredIn: p.duration ?? p.deadline ?? '—',
            progress: p.status === 'COMPLETED' ? 100 : p.freelancerId ? 50 : 0,
        };
    });

    const handleLogout = async () => {
        await logout();
        router.replace('/login' as any);
    };

    const StatusItems: any[] = [
        { id: '1', title: 'Chinese Translator', subTitle: 'Tech Troopsy (Jurong East, Singapore)', type: 'Remote', date: 'Applied on Jan 22', status: 'Applied' },
        { id: '2', title: 'Frontend Developer', subTitle: 'PT Nirala Digital (South Jakarta)', type: 'Freelance', date: 'Applied on Jan 09', status: 'Not selected' },
        { id: '3', title: 'Website Designer', subTitle: 'Verganis Studio (Sydney, Australia)', type: '3 months contract', date: 'Applied on Dec 29', status: 'Interview' },
    ];

    const ManagementCards = [
        { title: 'Freelancers', icon: Users, color: '#282A32', route: '/(admin)/manage-freelancers', count: stats?.totalFreelancers || 0 },
        { title: 'Clients', icon: UserCheck, color: '#F59E0B', route: '/(admin)/manage-clients', count: stats?.totalClients || 0 },
        { title: 'Services', icon: Layers, color: '#10B981', route: '/(admin)/manage-services', count: stats?.totalServices ?? 0 },
        { title: 'Notifications', icon: Bell, color: '#444751', route: '/(admin)/manage-notifications', count: 0 },
        { title: 'Projects', icon: Briefcase, color: '#444751', route: '/(admin)/manage-projects', count: stats?.activeProjects || 0 },
        { title: 'Disputes', icon: Activity, color: '#444751', route: '/(admin)/manage-disputes', count: stats?.totalDisputes ?? 0 },
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
            paddingBottom: isMobile ? 24 : 24,
        },
        topBar: {
            height: isMobile ? 64 : 80,
            paddingHorizontal: isMobile ? 16 : 24,
        },
    };

    return (
        <View style={styles.outerContainer}>
            <StatusBar barStyle="dark-content" />

            {/* Sidebar overlay: tablet only (when sidebar open) */}
            {isTablet && sidebarVisible && (
                <TouchableOpacity
                    style={styles.sidebarOverlay}
                    activeOpacity={1}
                    onPress={() => setSidebarVisible(false)}
                />
            )}

            {/* Sidebar: desktop always; tablet when open; mobile uses bottom bar instead */}
            {isDesktop && (
                <View style={styles.desktopSidebar}>
                    <AdminSidebar onLogout={handleLogout} />
                </View>
            )}
            {isTablet && sidebarVisible && (
                <View style={styles.mobileSidebar}>
                    <AdminSidebar onLogout={handleLogout} />
                </View>
            )}

            <SafeAreaView style={styles.container} edges={isMobile ? ['top'] : undefined}>
                {/* Header Bar */}
                <View style={[styles.topBar, dynamicStyles.topBar]}>
                    <View style={styles.topBarLeft}>
                        {isTablet && (
                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={() => setSidebarVisible(!sidebarVisible)}
                            >
                                <Menu size={24} color="#444751" />
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
                            <Bell size={20} color="#444751" />
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
                                            <FileText size={16} color="#444751" />
                                            <Text style={styles.reportButtonText}>Download report</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <View style={[styles.chartsGrid, dynamicStyles.chartsGrid]}>
                                <AdminAnalyticsOverview stats={stats} isMobile={isMobile} />
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
                                        Active projects <Text style={styles.countText}>({activeProjects.length})</Text>
                                    </Text>
                                   
                                </View>

                                <View style={styles.projectsCard}>
                                    <AdminActivityTable projects={activeProjectsForTable} />
                                </View>
                            </View>

                        </View>

                        {/* Right Column (Profile & Activity) */}
                        {/* <View style={isMobile ? {} : styles.rightColumn}>
                            <AdminProfileCard
                                name={user?.userName || 'Admin'}
                                role="System Administrator"
                                location="Platform Control Center"
                                avatarUrl={undefined}
                            />
                            <View style={{ height: 24 }} />
                            <AdminApplicationStatus items={StatusItems} />
                        </View> */}
                    </View>
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
        backgroundColor: '#444751',
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
        color: '#444751',
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
        color: '#444751',
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
        color: '#444751',
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
        color: '#444751',
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
        color: '#444751',
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
        color: '#444751',
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
        color: '#444751',
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94A3B8',
    },
    projectsSection: {
        marginBottom: 32,
    },
});
