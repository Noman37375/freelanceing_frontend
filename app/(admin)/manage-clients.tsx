import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Switch, Platform } from 'react-native';
import { Trash2, Edit2, X } from 'lucide-react-native';
import { adminService } from '@/services/adminService';
import { User, ClientProfile } from '@/models/User';

export default function ManageClients() {
    const [clients, setClients] = useState<ClientProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<ClientProfile | null>(null);
    const [editName, setEditName] = useState('');
    const [editIsVerified, setEditIsVerified] = useState(false);

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

    const handleDelete = async (id: string, name: string) => {
        console.log('[ManageClients] Requesting delete:', id, name);
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`Are you sure you want to delete ${name}?`);
            if (confirmed) {
                try {
                    console.log('[ManageClients] Confirmed delete (Web)');
                    await adminService.deleteUser(id);
                    setClients(prev => prev.filter(u => u.id !== id));
                    console.log('[ManageClients] Local state updated after delete');
                } catch (error) {
                    console.error('[ManageClients] Delete error:', error);
                    Alert.alert('Error', 'Failed to delete client');
                }
            }
        } else {
            Alert.alert(
                'Delete Client',
                `Are you sure you want to delete ${name}?`,
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => console.log('[ManageClients] Delete cancelled') },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                console.log('[ManageClients] Confirmed delete (Native)');
                                await adminService.deleteUser(id);
                                setClients(prev => prev.filter(u => u.id !== id));
                            } catch (error) {
                                Alert.alert('Error', 'Failed to delete client');
                            }
                        }
                    },
                ]
            );
        }
    };

    const handleEdit = (user: ClientProfile) => {
        setEditingUser(user);
        setEditName(user.name);
        setEditIsVerified(user.isVerified);
        setEditModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!editingUser) return;
        try {
            const updatedUser = await adminService.updateUser(editingUser.id, {
                name: editName,
                isVerified: editIsVerified
            });

            setClients(prev => prev.map(u => u.id === editingUser.id ? (updatedUser as ClientProfile) : u));
            setEditModalVisible(false);
            Alert.alert('Success', 'Client updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update client');
        }
    };

    const renderItem = ({ item }: { item: ClientProfile }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.name?.[0] || '?'}</Text>
                    </View>
                    <View>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.role}>{item.email}</Text>
                    </View>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
                        <Edit2 size={20} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.iconButton}>
                        <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.aboutText} numberOfLines={2}>
                    {item.companyName || 'No company info'}
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
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#A855F7" />
                </View>
            ) : (
                <FlatList
                    data={clients}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No clients found.</Text>
                    }
                />
            )}

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Client</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <X size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Enter name"
                                placeholderTextColor="#666"
                            />
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.label}>Verified Status</Text>
                            <Switch
                                value={editIsVerified}
                                onValueChange={setEditIsVerified}
                                trackColor={{ false: '#333', true: '#10B981' }}
                                thumbColor={editIsVerified ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    emptyText: {
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 32,
    },
    card: {
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222',
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
        backgroundColor: '#F59E0B20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#F59E0B',
        fontSize: 18,
        fontWeight: 'bold',
    },
    name: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    role: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    cardBody: {
        marginBottom: 12,
    },
    aboutText: {
        color: '#D1D5DB',
        fontSize: 14,
    },
    cardFooter: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    activeBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    suspendedBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeText: {
        color: '#10B981',
    },
    suspendedText: {
        color: '#EF4444',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: '#9CA3AF',
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        padding: 12,
        color: '#fff',
        fontSize: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    saveButton: {
        backgroundColor: '#A855F7',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
