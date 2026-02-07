import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Platform, StatusBar, Image, ScrollView } from 'react-native';
import { Trash2, Edit2, X, ChevronLeft, Plus, Box, LayoutGrid } from 'lucide-react-native';
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

    const [isActionLoading, setIsActionLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadServices = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getServiceCategories();
            setServices(data || []);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error?.message ?? 'Failed to load services');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    const handleSave = async () => {
        if (!name || !imageUrl) {
            Alert.alert('Error', 'Please fill name and image URL');
            return;
        }

        try {
            setIsActionLoading(true);
            const serviceData = { name, image: imageUrl };

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
        } catch (error: any) {
            const msg = error?.message ?? 'Failed to save service category';
            Alert.alert('Error', msg);
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
            } catch (error: any) {
                Alert.alert('Error', error?.message ?? 'Failed to delete service');
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
        setImageUrl(service.image || '');
        setModalVisible(true);
    };

    const resetForm = () => {
        setName('');
        setImageUrl('');
        setEditingService(null);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => handleEdit(item)}
        >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardOverlay}>
                <View style={styles.cardHeader}>
                    <View style={styles.layoutIconWrap}>
                        <LayoutGrid size={18} color="#FFF" strokeWidth={2} />
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity
                            onPress={(e) => { e?.stopPropagation?.(); handleEdit(item); }}
                            style={styles.actionBtn}
                            activeOpacity={0.8}
                        >
                            <Edit2 size={16} color="#FFF" strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={(e) => { e?.stopPropagation?.(); handleDelete(item.id, item.name); }}
                            style={[styles.actionBtn, styles.deleteBtn]}
                            activeOpacity={0.8}
                        >
                            <Trash2 size={16} color="#FFF" strokeWidth={2} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.serviceName} numberOfLines={2}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <ChevronLeft size={22} color="#475569" strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Service categories</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        resetForm();
                        setModalVisible(true);
                    }}
                    activeOpacity={0.8}
                >
                    <Plus size={20} color="#FFF" strokeWidth={2.5} />
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#444751" />
                    <Text style={styles.loadingText}>Loading categories…</Text>
                </View>
            ) : (
                <FlatList
                    data={services}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, services.length === 0 && styles.listContentEmpty]}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={services.length > 0 ? <View style={styles.listHeader}><Text style={styles.listHeaderText}>{services.length} categor{services.length === 1 ? 'y' : 'ies'}</Text></View> : null}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconWrap}>
                                <Box size={48} color="#94A3B8" strokeWidth={1.5} />
                            </View>
                            <Text style={styles.emptyTitle}>No categories yet</Text>
                            <Text style={styles.emptyText}>Add a service category to show on the homepage.</Text>
                            <TouchableOpacity style={styles.emptyButton} onPress={() => { resetForm(); setModalVisible(true); }}>
                                <Plus size={20} color="#FFF" />
                                <Text style={styles.emptyButtonText}>Add category</Text>
                            </TouchableOpacity>
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
                    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{editingService ? 'Edit Category' : 'Add Service Category'}</Text>
                                <Text style={styles.modalSubtitle}>{editingService ? 'Update details below' : 'New category will appear on the homepage'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                                <X size={22} color="#64748B" strokeWidth={2} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Category Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g. Web Development"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Image URL</Text>
                                <TextInput
                                    style={styles.input}
                                    value={imageUrl}
                                    onChangeText={setImageUrl}
                                    placeholder="https://images.unsplash.com/..."
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveButton, isActionLoading && styles.disabledBtn]}
                                    onPress={handleSave}
                                    disabled={isActionLoading}
                                    activeOpacity={0.85}
                                >
                                    {isActionLoading ? (
                                        <ActivityIndicator color="#FFF" size="small" />
                                    ) : (
                                        <Text style={styles.saveBtnText}>
                                            {editingService ? 'Update' : 'Create'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
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
        color: '#444751',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#282A32',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 15, color: '#64748B', fontWeight: '500' },
    listContent: { padding: 20, paddingTop: 8, paddingBottom: 24 },
    listContentEmpty: { flexGrow: 1 },
    listHeader: { marginBottom: 12, paddingHorizontal: 2 },
    listHeaderText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
    columnWrapper: { justifyContent: 'space-between', marginBottom: 14 },
    card: {
        width: '48%',
        height: 172,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10 },
            android: { elevation: 4 },
        }),
    },
    cardImage: { width: '100%', height: '100%', position: 'absolute', backgroundColor: '#E2E8F0' },
    cardOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        padding: 14,
        justifyContent: 'flex-start',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(99, 102, 241, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    layoutIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.22)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardFooter: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        gap: 4,
    },
    serviceName: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
    cardActions: { flexDirection: 'row', gap: 8 },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.22)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.88)' },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#E5E4EA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#444751', marginBottom: 8 },
    emptyText: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#282A32',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
    },
    emptyButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 28,
        maxHeight: '88%',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#444751' },
    modalSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
    modalCloseBtn: { padding: 4 },
    modalForm: { flex: 1 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#444751',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#282A32',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    cancelButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    cancelButtonText: { color: '#475569', fontWeight: '700', fontSize: 16 },
    disabledBtn: { opacity: 0.6 },
});
