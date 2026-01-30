import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Edit2, Shield, Mail, Calendar, MapPin, Award } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AdminProfileCard from '@/components/admin/AdminProfileCard';

export default function AdminProfilePage() {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Settings</Text>
                <View style={{ width: 40 }} />
            </View> */}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <AdminProfileCard
                    name={user?.userName || 'Admin User'}
                    role="System Administrator"
                    location="Platform HQ"
                    avatarUrl={user?.profileImage}
                />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Mail size={18} color="#6366F1" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Email Address</Text>
                                <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Shield size={18} color="#6366F1" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Account Role</Text>
                                <Text style={styles.infoValue}>{user?.role || 'Admin'}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                            <View style={styles.iconBox}>
                                <Calendar size={18} color="#6366F1" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Joined Date</Text>
                                <Text style={styles.infoValue}>
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'January 2024'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Administrator Access</Text>
                    <View style={styles.permissionsGrid}>
                        {[
                            { label: 'Manage Users', icon: Award },
                            { label: 'Dispute Settlement', icon: Shield },
                            { label: 'Platform Reports', icon: Edit2 },
                            { label: 'System Config', icon: MapPin },
                        ].map((item, index) => (
                            <View key={index} style={styles.permissionItem}>
                                <item.icon size={20} color="#6366F1" />
                                <Text style={styles.permissionLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Edit Global Settings</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFD',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 16,
        paddingLeft: 4,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    permissionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    permissionItem: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center',
        gap: 10,
    },
    permissionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        textAlign: 'center',
    },
    saveButton: {
        marginTop: 40,
        backgroundColor: '#1E293B',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 15,
    },
});
