import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Shield, LogOut, Briefcase, UserCheck, TrendingUp, DollarSign, Activity, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { adminService, DashboardStats } from '@/services/adminService';

export default function AdminDashboard() {
    const router = useRouter();
    const { logout, user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = useCallback(async () => {
        try {
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats');
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/login' as any);
    };

    const StatCard = ({ title, value, icon: Icon, color, subValue, delay }: any) => (
        <View style={styles.statCardWrapper}>
            <LinearGradient
                colors={['#1F1F1F', '#111']}
                style={styles.statCard}
            >
                <View style={[styles.statHeader]}>
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
            </LinearGradient>
        </View>
    );

    const MenuCard = ({ title, description, icon: Icon, color, route, count }: any) => (
        <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push(route)}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={['#1A1A1A', '#0F0F0F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuCardGradient}
            >
                <View style={[styles.menuIconContainer, { backgroundColor: `${color}15` }]}>
                    <Icon size={24} color={color} />
                </View>

                <View style={styles.menuInfo}>
                    <Text style={styles.menuTitle}>{title}</Text>
                    <Text style={styles.menuDescription}>{count} Active Records</Text>
                </View>

                <View style={styles.arrowButton}>
                    <ArrowRight size={20} color="#4B5563" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#111', '#000']}
                style={styles.header}
            >
                <View>
                    <Text style={styles.greeting}>Admin Portal</Text>
                    <Text style={styles.adminName}>Dashboard</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <LogOut size={20} color="#EF4444" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />}
            >
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats?.totalRevenue.toLocaleString() || '0'}`}
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
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.menuGrid}>
                    <MenuCard
                        title="Manage Freelancers"
                        description="View and manage freelancer profiles"
                        icon={Users}
                        color="#3B82F6"
                        route="/(admin)/manage-freelancers"
                        count={stats?.totalFreelancers || 0}
                    />
                    <MenuCard
                        title="Manage Clients"
                        description="View and verify client accounts"
                        icon={UserCheck}
                        color="#F59E0B"
                        route="/(admin)/manage-clients"
                        count={stats?.totalClients || 0}
                    />
                    <MenuCard
                        title="Manage Projects"
                        description="Monitor and moderate project listings"
                        icon={Briefcase}
                        color="#EC4899"
                        route="/(admin)/manage-projects"
                        count={stats?.activeProjects || 0}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
    },
    greeting: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    adminName: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    logoutButton: {
        padding: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        marginTop: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    statCardWrapper: {
        width: '48%',
    },
    statCard: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#222',
        minHeight: 130,
        justifyContent: 'space-between',
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
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 100,
    },
    trendText: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: '600',
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: '#9CA3AF',
        fontSize: 13,
    },
    menuGrid: {
        gap: 12,
    },
    menuCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1F1F1F',
    },
    menuCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuInfo: {
        flex: 1,
    },
    menuTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 4,
    },
    menuDescription: {
        color: '#6B7280',
        fontSize: 13,
    },
    arrowButton: {
        padding: 8,
    },
});
