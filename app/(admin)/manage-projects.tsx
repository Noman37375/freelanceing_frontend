import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Platform } from 'react-native';
import { Trash2, Edit2, X, Check } from 'lucide-react-native';
import { adminService } from '@/services/adminService';
import { Project } from '@/models/Project';

export default function ManageProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editBudget, setEditBudget] = useState('');
    const [editStatus, setEditStatus] = useState<'open' | 'in_progress' | 'completed' | 'cancelled'>('open');

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
                    await adminService.deleteProject(id);
                    setProjects(prev => prev.filter(p => p.id !== id));
                } catch (error) {
                    Alert.alert('Error', 'Failed to delete project');
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
                                await adminService.deleteProject(id);
                                setProjects(prev => prev.filter(p => p.id !== id));
                            } catch (error) {
                                Alert.alert('Error', 'Failed to delete project');
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
        setEditBudget(project.budget.max.toString());
        setEditStatus(project.status as any);
        setEditModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!editingProject) return;
        try {
            const updatedProject = await adminService.updateProject(editingProject.id, {
                title: editTitle,
                budget: { ...editingProject.budget, min: parseFloat(editBudget) * 0.5, max: parseFloat(editBudget) },
                status: editStatus
            });

            setProjects(prev => prev.map(p => p.id === editingProject.id ? updatedProject : p));
            setEditModalVisible(false);
            Alert.alert('Success', 'Project updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update project');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return '#10B981';
            case 'in_progress': return '#F59E0B';
            case 'completed': return '#3B82F6';
            case 'cancelled': return '#EF4444';
            default: return '#9CA3AF';
        }
    };

    const formatStatus = (status: string) => {
        return status.replace('_', ' ').toUpperCase();
    };

    const renderItem = ({ item }: { item: Project }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>Budget: ${item.budget.max}</Text>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
                        <Edit2 size={20} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.title)} style={styles.iconButton}>
                        <Trash2 size={20} color="#d9534f" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

            <View style={styles.tagsContainer}>
                {item.skills?.map((skill, index) => (
                    <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{skill}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {formatStatus(item.status)}
                    </Text>
                </View>
                <Text style={styles.dateText}>
                    {new Date(item.createdAt || '').toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1dbf73" />
                </View>
            ) : (
                <FlatList
                    data={projects}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No projects found.</Text>
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
                            <Text style={styles.modalTitle}>Edit Project</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <X size={24} color="#62646a" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                value={editTitle}
                                onChangeText={setEditTitle}
                                placeholder="Project Title"
                                placeholderTextColor="#95979d"
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
                                placeholderTextColor="#95979d"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Status</Text>
                            <View style={styles.statusOptions}>
                                {['open', 'in_progress', 'completed', 'cancelled'].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        style={[
                                            styles.statusOption,
                                            editStatus === status && { borderColor: getStatusColor(status), backgroundColor: `${getStatusColor(status)}10` }
                                        ]}
                                        onPress={() => setEditStatus(status as any)}
                                    >
                                        <Text style={[
                                            styles.statusOptionText,
                                            editStatus === status && { color: getStatusColor(status) }
                                        ]}>
                                            {formatStatus(status)}
                                        </Text>
                                        {editStatus === status && (
                                            <Check size={16} color={getStatusColor(status)} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
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
        backgroundColor: '#f7f7f7',
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
        color: '#62646a',
        textAlign: 'center',
        marginTop: 32,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e4e5e7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        color: '#222325',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: '#1dbf73',
        fontWeight: '600',
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 8,
    },
    iconButton: {
        padding: 6,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    description: {
        color: '#62646a',
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        backgroundColor: '#f5f7f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        color: '#62646a',
        fontSize: 12,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateText: {
        color: '#95979d',
        fontSize: 12,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: '#222325',
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: '#62646a',
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e4e5e7',
        borderRadius: 8,
        padding: 12,
        color: '#222325',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#1dbf73',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
        borderColor: '#e4e5e7',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    statusOptionText: {
        color: '#62646a',
        fontSize: 14,
        fontWeight: '600',
    },
});
