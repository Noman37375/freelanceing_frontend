import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, Platform, StatusBar } from 'react-native';
import { Bell, ArrowLeft, Send, X, ChevronRight, Clock, Info, ShieldAlert, Zap, Edit2, Trash2 } from 'lucide-react-native';
import { adminService } from '@/services/adminService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ManageNotifications() {
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingNotification, setEditingNotification] = useState<any | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('system'); // system, alert, promo
    const [isActionLoading, setIsActionLoading] = useState(false);

    const loadHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getSystemNotifications();
            setHistory(data || []);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load notification history');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleSave = async () => {
        if (!title || !message) {
            Alert.alert('Error', 'Please enter title and message');
            return;
        }

        try {
            setIsActionLoading(true);
            const data = { title, message, type };

            if (editingNotification) {
                await adminService.updateSystemNotification(editingNotification.id, data);
                Alert.alert('Success', 'Notification updated');
            } else {
                await adminService.sendSystemNotification(data);
                Alert.alert('Success', 'Notification sent to all users');
            }

            setModalVisible(false);
            loadHistory();
            resetForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to save notification');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const performDelete = async () => {
            try {
                await adminService.deleteSystemNotification(id);
                setHistory(prev => prev.filter(n => n.id !== id));
            } catch (error) {
                Alert.alert('Error', 'Failed to delete notification');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Delete this notification?')) performDelete();
        } else {
            Alert.alert('Delete', 'Delete this notification?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: performDelete }
            ]);
        }
    };

    const handleEdit = (notification: any) => {
        setEditingNotification(notification);
        setTitle(notification.title);
        setMessage(notification.message);
        setType(notification.type);
        setModalVisible(true);
    };

    const resetForm = () => {
        setTitle('');
        setMessage('');
        setType('system');
        setEditingNotification(null);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <ShieldAlert size={20} color="#EF4444" />;
            case 'promo': return <Zap size={20} color="#F59E0B" />;
            default: return <Info size={20} color="#6366F1" />;
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.notifCard}>
            <View style={styles.notifHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'alert' ? '#FEF2F2' : (item.type === 'promo' ? '#FFFBEB' : '#EEF2FF') }]}>
                    {getIcon(item.type)}
                    <Text style={[styles.typeText, { color: item.type === 'alert' ? '#EF4444' : (item.type === 'promo' ? '#B45309' : '#4F46E5') }]}>
                        {item.type.toUpperCase()}
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.timeRow}>
                        <Clock size={12} color="#94A3B8" />
                        <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => handleEdit(item)}>
                            <Edit2 size={16} color="#4F46E5" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)}>
                            <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <Text style={styles.notifTitle}>{item.title}</Text>
            <Text style={styles.notifMsg}>{item.message}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.topGradient} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <Text style={styles.headerSubtitle}>Broadcast messages to users</Text>
                </View>
                <TouchableOpacity
                    style={styles.plusButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Send size={20} color="#4F46E5" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFF" />
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<Text style={styles.listLabel}>Sent History</Text>}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Bell size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No notifications sent yet.</Text>
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
                            <Text style={styles.modalTitle}>{editingNotification ? 'Edit Message' : 'Broadcast Message'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Notification Title</Text>
                                <TextInput
                                    style={styles.input}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="e.g. System Update"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Message Content</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder="Details of the announcement..."
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <Text style={styles.label}>Notification Type</Text>
                            <View style={styles.typeSelector}>
                                {['system', 'alert', 'promo'].map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeOption, type === t && styles.typeSelected]}
                                        onPress={() => setType(t)}
                                    >
                                        <Text style={[styles.typeOptionText, type === t && styles.typeSelectedText]}>
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.sendButton, isActionLoading && styles.disabledBtn]}
                                onPress={handleSave}
                                disabled={isActionLoading}
                            >
                                {isActionLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={styles.sendBtnText}>{editingNotification ? 'Update Notification' : 'Send Notification'}</Text>
                                        <Send size={18} color="#FFF" />
                                    </>
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
        height: 180,
        backgroundColor: '#1E1B4B',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 25,
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
    plusButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: 20 },
    listLabel: { fontSize: 14, fontWeight: '800', color: '#FFF', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    notifCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 3 },
        }),
    },
    notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    actions: { flexDirection: 'row', gap: 10, marginLeft: 8 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    typeText: { fontSize: 10, fontWeight: '800' },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
    notifTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
    notifMsg: { fontSize: 14, color: '#64748B', lineHeight: 20 },
    emptyContainer: { alignItems: 'center', marginTop: 100, backgroundColor: '#FFF', padding: 40, borderRadius: 24 },
    emptyText: { marginTop: 16, color: '#94A3B8', fontWeight: '500' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 15, color: '#1E293B' },
    textArea: { height: 100, textAlignVertical: 'top' },
    typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 30 },
    typeOption: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    typeSelected: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5', borderWidth: 2 },
    typeOptionText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
    typeSelectedText: { color: '#4F46E5' },
    sendButton: { backgroundColor: '#4F46E5', flexDirection: 'row', gap: 8, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    sendBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    disabledBtn: { opacity: 0.6 },
});
