import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LayoutDashboard, User, LogOut } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AdminBottomBarProps {
    onLogout: () => void;
}

export default function AdminBottomBar({ onLogout }: AdminBottomBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const bottomInset = Math.max(insets.bottom, 8);

    const isDashboard = pathname === '/(admin)/dashboard' || pathname === '/dashboard';
    const isProfile = pathname === '/(admin)/profile' || pathname === '/profile';

    const items = [
        {
            icon: LayoutDashboard,
            label: 'Home',
            route: '/(admin)/dashboard',
            isActive: isDashboard,
        },
        {
            icon: User,
            label: 'Profile',
            route: '/(admin)/profile',
            isActive: isProfile,
        },
    ];

    return (
        <View style={[styles.container, { paddingBottom: bottomInset }]}>
            <View style={styles.bar}>
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <TouchableOpacity
                            key={item.label}
                            style={[styles.tab, item.isActive && styles.tabActive]}
                            onPress={() => router.push(item.route as any)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconWrap, item.isActive && styles.iconWrapActive]}>
                                <Icon
                                    size={22}
                                    color={item.isActive ? '#FFFFFF' : '#64748B'}
                                    strokeWidth={2.2}
                                />
                            </View>
                            <Text style={[styles.label, item.isActive && styles.labelActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
                <TouchableOpacity
                    style={styles.tab}
                    onPress={onLogout}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconWrapLogout}>
                        <LogOut size={22} color="#DC2626" strokeWidth={2.2} />
                    </View>
                    <Text style={styles.labelLogout}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
        paddingHorizontal: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: { elevation: 8 },
        }),
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
    },
    tabActive: {},
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        marginBottom: 4,
    },
    iconWrapActive: {
        backgroundColor: '#282A32',
    },
    iconWrapLogout: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    labelActive: {
        color: '#282A32',
    },
    labelLogout: {
        fontSize: 12,
        fontWeight: '700',
        color: '#DC2626',
    },
});
