import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Platform, Animated, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Briefcase, UserCheck, TrendingUp, DollarSign, Activity, ArrowRight, LogOut, Bell } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, DashboardStats } from '@/services/adminService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
    const router = useRouter();
    const { logout, user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pulseAnim = React.useRef(new Animated.Value(0.3)).current;

    const loadStats = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (error) {
            // Silently ignore or handle error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.7,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        loadStats();
    }, [loadStats, pulseAnim]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats(false);
        setRefreshing(false);
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/login' as any);
    };

    const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
        <View style={styles.statCardWrapper}>
            <View style={styles.statCard}>
                <View style={styles.statHeader}>
                    <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                        <Icon size={20} color={color} />
                    </View>
                    {subValue && (
                        <View style={styles.trendBadge}>
                            <TrendingUp size={12} color="#10B981" />
                            <Text style={styles.trendText}>{subValue}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{title}</Text>
            </View>
        </View>
    );

    const MenuCard = ({ title, description, icon: Icon, color, route, count }: any) => (
        <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push(route)}
            activeOpacity={0.7}
        >
            <View style={styles.menuCardContent}>
                <View style={[styles.menuIconContainer, { backgroundColor: `${color}15` }]}>
                    <Icon size={24} color={color} />
                </View>

                <View style={styles.menuInfo}>
                    <Text style={styles.menuTitle}>{title}</Text>
                    <Text style={styles.menuDescription}>{count} Active Records</Text>
                </View>

                <View style={styles.arrowContainer}>
                    <ArrowRight size={20} color="#94A3B8" />
                </View>
            </View>
        </TouchableOpacity>
    );

    const StatCardSkeleton = () => (
        <View style={styles.statCardWrapper}>
            <Animated.View style={[styles.statCard, { opacity: pulseAnim }]}>
                <View style={styles.statHeader}>
                    <View style={[styles.iconBox, { backgroundColor: '#E2E8F0' }]} />
                </View>
                <View style={[styles.skeletonText, { width: '60%', height: 24, marginBottom: 8 }]} />
                <View style={[styles.skeletonText, { width: '40%', height: 14 }]} />
            </Animated.View>
        </View>
    );

    const MenuCardSkeleton = () => (
        <Animated.View style={[styles.menuCard, { opacity: pulseAnim, padding: 16, flexDirection: 'row', alignItems: 'center' }]}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#E2E8F0', marginRight: 16 }]} />
            <View style={{ flex: 1 }}>
                <View style={[styles.skeletonText, { width: '50%', height: 18, marginBottom: 8 }]} />
                <View style={[styles.skeletonText, { width: '30%', height: 14 }]} />
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Dynamic Background Element */}
            <View style={styles.topGradient} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greetingText}>Admin Portal</Text>
                        <Text style={styles.userNameText}>Dashboard Overview</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity onPress={handleLogout} style={styles.iconCircle}>
                            <LogOut size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {isLoading ? (
                        <>
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Total Revenue"
                                value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
                                icon={DollarSign}
                                color="#10B981"
                                subValue="+12%"
                            />
                            <StatCard
                                title="Active Projects"
                                value={stats?.activeProjects || '0'}
                                icon={Activity}
                                color="#8B5CF6"
                            />
                            <StatCard
                                title="Freelancers"
                                value={stats?.totalFreelancers || '0'}
                                icon={Users}
                                color="#3B82F6"
                            />
                            <StatCard
                                title="Clients"
                                value={stats?.totalClients || '0'}
                                icon={UserCheck}
                                color="#F59E0B"
                            />
                        </>
                    )}
                </View>

                <Text style={styles.sectionTitle}>Management View</Text>
                <View style={styles.menuGrid}>
                    {isLoading ? (
                        <>
                            <MenuCardSkeleton />
                            <MenuCardSkeleton />
                            <MenuCardSkeleton />
                        </>
                    ) : (
                        <>
                            <MenuCard
                                title="Freelancers"
                                description="View and manage freelancer profiles"
                                icon={Users}
                                color="#3B82F6"
                                route="/(admin)/manage-freelancers"
                                count={stats?.totalFreelancers || 0}
                            />
                            <MenuCard
                                title="Clients"
                                description="View and verify client accounts"
                                icon={UserCheck}
                                color="#F59E0B"
                                route="/(admin)/manage-clients"
                                count={stats?.totalClients || 0}
                            />
                            <MenuCard
                                title="Projects"
                                description="Monitor and moderate project listings"
                                icon={Briefcase}
                                color="#EC4899"
                                route="/(admin)/manage-projects"
                                count={stats?.activeProjects || 0}
                            />
                        </>
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
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 240,
        backgroundColor: '#1E1B4B', // Deep Indigo
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    greetingText: {
        color: '#C7D2FE',
        fontSize: 14,
        fontWeight: '500',
    },
    userNameText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 10,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCardWrapper: {
        width: '48%',
    },
    statCard: {
        padding: 16,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.95)',
        minHeight: 130,
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
            },
        }),
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: '#f2fbf6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 100,
    },
    trendText: {
        color: '#1dbf73',
        fontSize: 10,
        fontWeight: '600',
    },
    statValue: {
        color: '#1E293B',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 16,
        marginTop: 8,
    },
    menuGrid: {
        gap: 12,
    },
    menuCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
    },
    menuCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuInfo: {
        flex: 1,
    },
    menuTitle: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    menuDescription: {
        color: '#94A3B8',
        fontSize: 13,
    },
    arrowContainer: {
        padding: 4,
    },
    skeletonText: {
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
    },
});
