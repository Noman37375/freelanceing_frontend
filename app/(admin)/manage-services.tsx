import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Platform, StatusBar, Image, ScrollView } from 'react-native';
import { Trash2, Edit2, X, ChevronLeft, Plus, Image as ImageIcon, Box } from 'lucide-react-native';
import { adminService } from '@/services/adminService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ManageServices() {
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<any | null>(null);

    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [color, setColor] = useState('#6366F1');

    const [isActionLoading, setIsActionLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadServices = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getServiceCategories();
            setServices(data || []);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load services');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    const handleSave = async () => {
        if (!name || !icon || !imageUrl) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            setIsActionLoading(true);
            const serviceData = { name, icon, image: imageUrl, color };

            if (editingService) {
                await adminService.updateServiceCategory(editingService.id, serviceData);
                Alert.alert('Success', 'Service category updated');
            } else {
                await adminService.createServiceCategory(serviceData);
                Alert.alert('Success', 'Service category created');
            }

            setModalVisible(false);
            loadServices();
            resetForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to save service category');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async (id: string, serviceName: string) => {
        const performDelete = async () => {
            try {
                setDeletingId(id);
                await adminService.deleteServiceCategory(id);
                setServices(prev => prev.filter(s => s.id !== id));
            } catch (error) {
                Alert.alert('Error', 'Failed to delete service');
            } finally {
                setDeletingId(null);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(`Delete ${serviceName}?`)) performDelete();
        } else {
            Alert.alert('Delete', `Delete ${serviceName}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: performDelete }
            ]);
        }
    };

    const handleEdit = (service: any) => {
        setEditingService(service);
        setName(service.name);
        setIcon(service.icon);
        setImageUrl(service.image);
        setColor(service.color || '#6366F1');
        setModalVisible(true);
    };

    const resetForm = () => {
        setName('');
        setIcon('');
        setImageUrl('');
        setColor('#6366F1');
        setEditingService(null);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardOverlay}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBadge, { backgroundColor: item.color || '#6366F1' }]}>
                        <Box size={16} color="#FFF" />
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity
                            onPress={() => handleEdit(item)}
                            style={styles.actionBtn}
                        >
                            <Edit2 size={14} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDelete(item.id, item.name)}
                            style={[styles.actionBtn, styles.deleteBtn]}
                        >
                            <Trash2 size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceIcon}>{item.icon}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.topGradient} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Services</Text>
                    <Text style={styles.headerSubtitle}>Manage homepage categories</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        resetForm();
                        setModalVisible(true);
                    }}
                >
                    <Plus size={20} color="#4F46E5" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFF" />
                </View>
            ) : (
                <FlatList
                    data={services}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No services found.</Text>
                        </View>
                    }
                />
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingService ? 'Edit Category' : 'Add Service Category'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Category Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g. Web Development"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Icon Name (Lucide)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={icon}
                                    onChangeText={setIcon}
                                    placeholder="e.g. Code, PenTool, Smartphone"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Background Image URL</Text>
                                <TextInput
                                    style={styles.input}
                                    value={imageUrl}
                                    onChangeText={setImageUrl}
                                    placeholder="Unsplash URL"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Theme Color (Hex)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={color}
                                    onChangeText={setColor}
                                    placeholder="#6366F1"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, isActionLoading && styles.disabledBtn]}
                                onPress={handleSave}
                                disabled={isActionLoading}
                            >
                                {isActionLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>
                                        {editingService ? 'Update Category' : 'Create Category'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 140,
        backgroundColor: '#1E1B4B',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
    headerSubtitle: { fontSize: 13, color: '#C7D2FE' },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 15 },
    columnWrapper: { justifyContent: 'space-between' },
    card: {
        width: '48%',
        height: 160,
        borderRadius: 20,
        marginBottom: 15,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 5 },
        }),
    },
    cardImage: { width: '100%', height: '100%', position: 'absolute' },
    cardOverlay: {
        flex: 1,
        backgroundColor: 'rgba(30, 27, 75, 0.4)',
        padding: 12,
        justifyContent: 'space-between',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    iconBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    cardFooter: { gap: 2 },
    serviceName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    serviceIcon: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#64748B', fontWeight: '500' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    modalForm: { flex: 1 },
    cardActions: { flexDirection: 'row', gap: 6 },
    actionBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
    deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.8)' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 15 },
    saveButton: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    disabledBtn: { opacity: 0.6 },
});
