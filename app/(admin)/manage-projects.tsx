import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Platform, StatusBar } from 'react-native';
import { Trash2, Edit2, X, Check, ChevronLeft, Calendar, DollarSign } from 'lucide-react-native';
import { adminService } from '@/services/adminService';
import { Project } from '@/models/Project';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ManageProjects() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editBudget, setEditBudget] = useState('');
    const [editStatus, setEditStatus] = useState<'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ACTIVE');
    const [isActionLoading, setIsLoadingAction] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getAllProjects();
            setProjects(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleDelete = async (id: string, title: string) => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
            if (confirmed) {
                try {
                    setDeletingId(id);
                    await adminService.deleteProject(id);
                    setProjects(prev => prev.filter(p => p.id !== id));
                } catch (error) {
                    Alert.alert('Error', 'Failed to delete project');
                } finally {
                    setDeletingId(null);
                }
            }
        } else {
            Alert.alert(
                'Delete Project',
                `Are you sure you want to delete "${title}"?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                setDeletingId(id);
                                await adminService.deleteProject(id);
                                setProjects(prev => prev.filter(p => p.id !== id));
                            } catch (error) {
                                Alert.alert('Error', 'Failed to delete project');
                            } finally {
                                setDeletingId(null);
                            }
                        }
                    },
                ]
            );
        }
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setEditTitle(project.title);
        setEditBudget(project.budget.toString());
        setEditStatus(project.status);
        setEditModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!editingProject) return;
        try {
            setIsLoadingAction(true);
            const updatedProject = await adminService.updateProject(editingProject.id, {
                title: editTitle,
                budget: parseFloat(editBudget),
                status: editStatus
            });

            setProjects(prev => prev.map(p => p.id === editingProject.id ? updatedProject : p));
            setEditModalVisible(false);
            Alert.alert('Success', 'Project updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update project');
        } finally {
            setIsLoadingAction(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { bg: '#ECFDF5', text: '#10B981' };
            case 'COMPLETED': return { bg: '#E5E4EA', text: '#282A32' };
            case 'CANCELLED': return { bg: '#FEF2F2', text: '#EF4444' };
            default: return { bg: '#F8FAFC', text: '#64748B' };
        }
    };

    const formatStatus = (status: string) => {
        return status.replace('_', ' ').toUpperCase();
    };

    const renderItem = ({ item }: { item: Project }) => {
        const statusStyle = getStatusStyle(item.status);
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.budgetRow}>
                            <Text style={styles.budgetAmount}>${item.budget}</Text>
                            <Text style={styles.budgetLabel}>Budget</Text>
                        </View>
                    </View>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            onPress={() => handleEdit(item)}
                            style={styles.iconButton}
                            disabled={!!deletingId}
                        >
                            <Edit2 size={18} color={deletingId ? "#CBD5E1" : "#282A32"} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDelete(item.id, item.title)}
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

                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                <View style={styles.tagsContainer}>
                    {item.skills?.slice(0, 3).map((skill, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{skill}</Text>
                        </View>
                    ))}
                    {(item.skills?.length || 0) > 3 && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>+{(item.skills?.length || 0) - 3}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {formatStatus(item.status)}
                        </Text>
                    </View>
                    <View style={styles.dateRow}>
                        <Calendar size={12} color="#94A3B8" />
                        <Text style={styles.dateText}>
                            {new Date(item.createdAt || '').toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <ChevronLeft size={22} color="#475569" strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Projects</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#282A32" />
                </View>
            ) : (
                <FlatList
                    data={projects}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No projects found.</Text>
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
                            <Text style={styles.modalTitle}>Edit Project</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                                <X size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                value={editTitle}
                                onChangeText={setEditTitle}
                                placeholder="Project Title"
                                placeholderTextColor="#94A3B8"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Max Budget ($)</Text>
                            <TextInput
                                style={styles.input}
                                value={editBudget}
                                onChangeText={setEditBudget}
                                placeholder="500"
                                keyboardType="numeric"
                                placeholderTextColor="#94A3B8"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Status</Text>
                            <View style={styles.statusOptions}>
                                {['ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => {
                                    const style = getStatusStyle(status);
                                    return (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                styles.statusOption,
                                                editStatus === status && { borderColor: style.text, backgroundColor: style.bg }
                                            ]}
                                            onPress={() => setEditStatus(status as any)}
                                        >
                                            <Text style={[
                                                styles.statusOptionText,
                                                editStatus === status && { color: style.text }
                                            ]}>
                                                {formatStatus(status)}
                                            </Text>
                                            {editStatus === status && (
                                                <Check size={16} color={style.text} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
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
        color: '#444751',
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
    title: {
        color: '#444751',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    budgetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    budgetAmount: {
        color: '#10B981',
        fontWeight: '800',
        fontSize: 14,
    },
    budgetLabel: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 8,
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    description: {
        color: '#64748B',
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    tag: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '700',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '500',
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
        color: '#444751',
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
        color: '#444751',
        fontSize: 15,
    },
    saveButton: {
        backgroundColor: '#282A32',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#282A32',
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
    statusOptions: {
        gap: 8,
    },
    statusOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
    },
    statusOptionText: {
        color: '#475569',
        fontSize: 14,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.6,
    },
});
