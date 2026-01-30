import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    FileText,
    CreditCard,
    Settings,
    User,
    LogOut,
    PlusSquare,
    ChevronDown,
    Shield
} from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItemProps {
    icon: any;
    label: string;
    isActive?: boolean;
    onPress: () => void;
}

const SidebarItem = ({ icon: Icon, label, isActive, onPress }: SidebarItemProps) => (
    <TouchableOpacity
        style={[styles.item, isActive && styles.itemActive]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Icon size={20} color={isActive ? '#FFFFFF' : '#94A3B8'} />
        <Text style={[styles.itemText, isActive && styles.itemTextActive]}>{label}</Text>
    </TouchableOpacity>
);

export default function AdminSidebar({ onLogout }: { onLogout: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', route: '/(admin)/dashboard' },
        { icon: Users, label: 'Freelancers', route: '/(admin)/manage-freelancers' },
        { icon: User, label: 'Clients', route: '/(admin)/manage-clients' },
        { icon: FileText, label: 'Projects', route: '/(admin)/manage-projects' },
        { icon: MessageSquare, label: 'Disputes', route: '/(admin)/manage-disputes' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.logoBox}>
                    <PlusSquare size={24} color="#6366F1" />
                </View>
                <Text style={styles.logoText}>Admin.io</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Main Menu</Text>
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        isActive={pathname === item.route}
                        onPress={() => router.push(item.route as any)}
                    />
                ))}

                <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Preference</Text>
                <SidebarItem
                    icon={User}
                    label="Admin Profile"
                    isActive={pathname === '/(admin)/profile'}
                    onPress={() => router.push('/(admin)/profile' as any)}
                />
                {/* <SidebarItem icon={Settings} label="Settings" onPress={() => { }} /> */}
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.profileBox}>
                    <View style={styles.profileInfo}>
                        <View style={styles.sidebarAvatar}>
                            {user?.profileImage ? (
                                <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarPlaceholderText}>{user?.userName?.[0]?.toUpperCase() || 'A'}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName} numberOfLines={1}>{user?.userName || 'Admin'}</Text>
                            <Text style={styles.userRole}>{user?.role || 'System Admin'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.logoutSmall} onPress={onLogout}>
                        <LogOut size={16} color="#94A3B8" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 240,
        backgroundColor: '#0F172A', // Dark sidebar to match reference
        height: '100%',
        paddingVertical: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 40,
        gap: 12,
    },
    logoBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 12,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '800',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 16,
        paddingHorizontal: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        gap: 12,
    },
    itemActive: {
        backgroundColor: '#1E293B',
    },
    itemText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
    },
    itemTextActive: {
        color: '#FFFFFF',
    },
    footer: {
        marginTop: 'auto',
        paddingHorizontal: 12,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
    },
    profileBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#1E293B',
        borderRadius: 16,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    sidebarAvatar: {
        width: 36,
        height: 36,
        borderRadius: 10,
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarPlaceholderText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    userRole: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 1,
    },
    logoutSmall: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
});
