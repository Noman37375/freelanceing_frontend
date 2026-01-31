import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Switch, Platform, StatusBar } from 'react-native';
import { Trash2, Edit2, X, ChevronLeft } from 'lucide-react-native';
import { adminService } from '@/services/adminService';
import { ClientProfile } from '@/models/User';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ManageClients() {
    const router = useRouter();
    const [clients, setClients] = useState<ClientProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<ClientProfile | null>(null);
    const [editUserName, setEditUserName] = useState('');
    const [editIsVerified, setEditIsVerified] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadClients = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getUsersByRole('client');
            setClients(data as ClientProfile[]);
        } catch (error) {
            Alert.alert('Error', 'Failed to load clients');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    const handleDelete = async (id: string, userName: string) => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`Are you sure you want to delete ${userName}?`);
            if (confirmed) {
                try {
                    setDeletingId(id);
                    await adminService.deleteUser(id);
                    setClients(prev => prev.filter(u => u.id !== id));
                } catch (error) {
                    Alert.alert('Error', 'Failed to delete client');
                } finally {
                    setDeletingId(null);
                }
            }
        } else {
            Alert.alert(
                'Delete Client',
                `Are you sure you want to delete ${userName}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                setDeletingId(id);
                                await adminService.deleteUser(id);
                                setClients(prev => prev.filter(u => u.id !== id));
                            } catch (error) {
                                Alert.alert('Error', 'Failed to delete client');
                            } finally {
                                setDeletingId(null);
                            }
                        }
                    },
                ]
            );
        }
    };

    const handleEdit = (user: ClientProfile) => {
        setEditingUser(user);
        setEditUserName(user.userName);
        setEditIsVerified(user.isVerified);
        setEditModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!editingUser) return;
        try {
            setIsActionLoading(true);
            const updatedUser = await adminService.updateUser(editingUser.id, {
                userName: editUserName,
                isVerified: editIsVerified
            });

            setClients(prev => prev.map(u => u.id === editingUser.id ? (updatedUser as ClientProfile) : u));
            setEditModalVisible(false);
            Alert.alert('Success', 'Client updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update client');
        } finally {
            setIsActionLoading(false);
        }
    };

    const renderItem = ({ item }: { item: ClientProfile }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.userName?.[0] || '?'}</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{item.userName}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                    </View>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={() => handleEdit(item)}
                        style={styles.iconButton}
                        disabled={!!deletingId}
                    >
                        <Edit2 size={18} color={deletingId ? "#CBD5E1" : "#4F46E5"} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id, item.userName)}
                        style={styles.iconButton}
                        disabled={!!deletingId}
                    >
                        {deletingId === item.id ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <Trash2 size={18} color={deletingId ? "#CBD5E1" : "#EF4444"} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.bioText} numberOfLines={2}>
                    {item.bio || item.about || 'No bio provided'}
                </Text>
            </View>

            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, item.isVerified ? styles.activeBadge : styles.suspendedBadge]}>
                    <Text style={[styles.statusText, item.isVerified ? styles.activeText : styles.suspendedText]}>
                        {item.isVerified ? 'Verified' : 'Unverified'}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <ChevronLeft size={22} color="#475569" strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Clients</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <FlatList
                    data={clients}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No clients found.</Text>
                        </View>
                    }
                />
            )}

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Client</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editUserName}
                                onChangeText={setEditUserName}
                                placeholder="Enter username"
                                placeholderTextColor="#94A3B8"
                            />
                        </View>

                        <View style={styles.switchContainer}>
                            <View>
                                <Text style={styles.label}>Verified Status</Text>
                                <Text style={styles.switchHelp}>Toggle to verify this client</Text>
                            </View>
                            <Switch
                                value={editIsVerified}
                                onValueChange={setEditIsVerified}
                                trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                                thumbColor={Platform.OS === 'ios' ? undefined : '#FFF'}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, isActionLoading && styles.disabledButton]}
                            onPress={handleUpdate}
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
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
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
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
        color: '#1E293B',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingTop: 5,
    },
    emptyContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#D97706',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userName: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: '700',
    },
    email: {
        color: '#64748B',
        fontSize: 13,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardBody: {
        marginBottom: 12,
    },
    bioText: {
        color: '#475569',
        fontSize: 14,
        lineHeight: 20,
    },
    cardFooter: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    activeBadge: {
        backgroundColor: '#ECFDF5',
    },
    suspendedBadge: {
        backgroundColor: '#FEF2F2',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    activeText: {
        color: '#10B981',
    },
    suspendedText: {
        color: '#EF4444',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
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
            }
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: '#1E293B',
        fontSize: 20,
        fontWeight: '800',
    },
    closeButton: {
        padding: 4,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: '#475569',
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '700',
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        color: '#1E293B',
        fontSize: 15,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
    },
    switchHelp: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    saveButton: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#4F46E5',
                shadowOpacity: 0.2,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
            },
            android: {
                elevation: 6,
            },
            web: {
                boxShadow: '0px 4px 10px rgba(79, 70, 229, 0.2)',
            }
        }),
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.6,
    },
});
