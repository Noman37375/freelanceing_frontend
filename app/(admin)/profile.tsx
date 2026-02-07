import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Edit2, Shield, Mail, Calendar, MapPin, Award } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AdminProfileCard from '@/components/admin/AdminProfileCard';
import * as ImagePicker from 'expo-image-picker';

export default function AdminProfilePage() {
    const router = useRouter();
    const { user, updateProfile, refreshUser } = useAuth();

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedUserName, setEditedUserName] = useState(user?.userName || '');
    const [isSaving, setIsSaving] = useState(false);

    const defaultAvatar = user?.profileImage ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.userName || 'Admin User')}&background=4F46E5&color=fff&size=200`;

    const handleOpenEdit = () => {
        setEditedUserName(user?.userName || '');
        setEditModalVisible(true);
    };

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Allow access to your photos to change profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                setIsSaving(true);
                const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
                await updateProfile({ profileImage: base64Img } as any);
                await refreshUser();
                Alert.alert('Success', 'Profile photo updated and saved.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!editedUserName || editedUserName.trim().length < 3) {
            Alert.alert('Error', 'Name must be at least 3 characters long.');
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile({ userName: editedUserName.trim() } as any);
            await refreshUser();
            setEditModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#444751" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Settings</Text>
                <View style={{ width: 40 }} />
            </View> */}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <AdminProfileCard
                    name={user?.userName || 'Admin User'}
                    role="System Administrator"
                    // location="Platform HQ"   
                    avatarUrl={defaultAvatar}
                    onEditPress={handleOpenEdit}
                    onAvatarPress={handlePickImage}
                />

                <View style={styles.section}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Mail size={18} color="#444751" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Email Address</Text>
                                <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Shield size={18} color="#444751" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Account Role</Text>
                                <Text style={styles.infoValue}>{user?.role || 'Admin'}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                            <View style={styles.iconBox}>
                                <Calendar size={18} color="#444751" />
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
                                <item.icon size={20} color="#444751" />
                                <Text style={styles.permissionLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>

            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Admin Profile</Text>

                        <View style={styles.modalField}>
                            <Text style={styles.modalLabel}>Full Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editedUserName}
                                onChangeText={setEditedUserName}
                                placeholder="Enter admin name"
                                placeholderTextColor="#94A3B8"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.modalButtonPrimary, isSaving && { opacity: 0.7 }]}
                            onPress={handleSaveProfile}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.modalButtonPrimaryText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setEditModalVisible(false)}
                            disabled={isSaving}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        color: '#444751',
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
        backgroundColor: '#E5E4EA',
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
        color: '#444751',
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
        backgroundColor: '#444751',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 32,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#444751',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalField: {
        marginBottom: 20,
    },
    modalLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontSize: 14,
        color: '#282A32',
    },
    modalButtonPrimary: {
        backgroundColor: '#282A32',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    modalButtonPrimaryText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    modalButtonSecondary: {
        backgroundColor: '#E5E4EA',
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 8,
    },
    modalButtonSecondaryText: {
        color: '#282A32',
        fontSize: 14,
        fontWeight: '700',
    },
    modalCancel: {
        marginTop: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    },
});
