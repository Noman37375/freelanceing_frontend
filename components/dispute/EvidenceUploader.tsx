import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform, ActivityIndicator, Linking } from 'react-native';
import { File, Image as ImageIcon, Video, X, Check, ExternalLink } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { disputeService } from '@/services/disputeService';
import type { DisputeEvidence } from '@/models/Dispute';

interface EvidenceUploaderProps {
    disputeId: string;
    existingEvidence: DisputeEvidence[];
    onUploadComplete?: (evidence: DisputeEvidence) => void;
    onDeleteEvidence?: (evidenceId: string) => void;
    readOnly?: boolean;
    clientId?: string;
    freelancerId?: string;
}

export default function EvidenceUploader({
    disputeId,
    existingEvidence,
    onUploadComplete,
    onDeleteEvidence,
    readOnly = false,
    clientId,
    freelancerId,
}: EvidenceUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<any>(null);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant photo library access to upload images');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                handleFileSelected({
                    uri: result.assets[0].uri,
                    name: result.assets[0].fileName || 'image.jpg',
                    type: 'image',
                    mimeType: result.assets[0].mimeType || 'image/jpeg',
                });
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets[0]) {
                const file = result.assets[0];
                handleFileSelected({
                    uri: file.uri,
                    name: file.name,
                    type: 'document',
                    mimeType: file.mimeType || 'application/pdf',
                });
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleFileSelected = (file: any) => {
        setSelectedFile(file);
    };

    const uploadFile = async () => {
        if (!selectedFile) return;
        // Skip real upload when creating a new dispute (no ID yet)
        if (disputeId === 'new') {
            const staged: DisputeEvidence = {
                id: Date.now().toString(),
                type: selectedFile.type,
                name: selectedFile.name,
                url: selectedFile.uri,
                description: '',
                uploadedBy: 'pending',
                uploadedAt: new Date().toISOString(),
            };
            onUploadComplete?.(staged);
            setSelectedFile(null);
            return;
        }

        setUploading(true);
        try {
            const uploaded = await disputeService.uploadEvidence(disputeId, {
                uri: selectedFile.uri,
                name: selectedFile.name,
                mimeType: selectedFile.mimeType || (selectedFile.type === 'image' ? 'image/jpeg' : 'application/pdf'),
                description: '',
            });

            const newEvidence: DisputeEvidence = {
                id: uploaded?.id || Date.now().toString(),
                type: selectedFile.type,
                name: uploaded?.fileName || selectedFile.name,
                url: uploaded?.fileUrl || selectedFile.uri,
                description: uploaded?.description || '',
                uploadedBy: uploaded?.uploadedBy || '',
                uploadedAt: uploaded?.createdAt || new Date().toISOString(),
            };

            onUploadComplete?.(newEvidence);
            setSelectedFile(null);
            Alert.alert('Success', 'Evidence uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            Alert.alert('Error', 'Failed to upload evidence. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (type: DisputeEvidence['type']) => {
        switch (type) {
            case 'image':
            case 'screenshot':
                return ImageIcon;
            case 'video':
                return Video;
            default:
                return File;
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Evidence & Attachments</Text>

            {/* Upload Buttons — hidden in read-only mode */}
            {!readOnly && (
                <View style={styles.uploadButtons}>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={uploading}>
                        <ImageIcon size={20} color="#444751" />
                        <Text style={styles.uploadButtonText}>Upload Image</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.uploadButton} onPress={pickDocument} disabled={uploading}>
                        <File size={20} color="#444751" />
                        <Text style={styles.uploadButtonText}>Upload PDF</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Selected File Preview */}
            {!readOnly && selectedFile && (
                <View style={styles.selectedFileContainer}>
                    <View style={styles.selectedFileHeader}>
                        <Text style={styles.selectedFileTitle}>Selected File</Text>
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                            <X size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.selectedFileContent}>
                        {selectedFile.type === 'image' && (
                            <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
                        )}
                        <Text style={styles.fileName} numberOfLines={1}>
                            {selectedFile.name}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.confirmButton, uploading && styles.confirmButtonDisabled]}
                        onPress={uploadFile}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Check size={18} color="#FFFFFF" />
                                <Text style={styles.confirmButtonText}>Confirm Upload</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Existing Evidence List */}
            {existingEvidence.length > 0 && (
                <View style={styles.evidenceList}>
                    <Text style={styles.evidenceListTitle}>Uploaded Evidence ({existingEvidence.length})</Text>
                    {existingEvidence.map((evidence) => {
                        const Icon = getFileIcon(evidence.type);
                        const isRemoteUrl = evidence.url && (evidence.url.startsWith('http://') || evidence.url.startsWith('https://'));

                        const handleOpen = () => {
                            if (!isRemoteUrl) {
                                Alert.alert('Not available', 'This file was uploaded before remote storage was configured and cannot be opened remotely.');
                                return;
                            }
                            Linking.openURL(evidence.url).catch(() => {
                                Alert.alert('Error', 'Could not open the file. Please try again.');
                            });
                        };

                        return (
                            <TouchableOpacity key={evidence.id} style={styles.evidenceItem} onPress={handleOpen} activeOpacity={0.7}>
                                <View style={styles.evidenceIcon}>
                                    <Icon size={18} color="#444751" />
                                </View>
                                <View style={styles.evidenceInfo}>
                                    <Text style={styles.evidenceName} numberOfLines={1}>
                                        {evidence.name}
                                    </Text>
                                    <View style={styles.evidenceMeta}>
                                        {(clientId || freelancerId) && evidence.uploadedBy && (
                                            <Text style={[
                                                styles.evidencePartyLabel,
                                                evidence.uploadedBy === clientId && styles.evidencePartyClient,
                                                evidence.uploadedBy === freelancerId && styles.evidencePartyFreelancer,
                                            ]}>
                                                {evidence.uploadedBy === clientId ? 'CLIENT' :
                                                 evidence.uploadedBy === freelancerId ? 'FREELANCER' : 'PARTY'}
                                            </Text>
                                        )}
                                        <Text style={styles.evidenceDate}>
                                            {new Date(evidence.uploadedAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                {onDeleteEvidence ? (
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation?.();
                                            Alert.alert(
                                                'Delete Evidence',
                                                'Are you sure you want to delete this evidence?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Delete',
                                                        style: 'destructive',
                                                        onPress: () => onDeleteEvidence(evidence.id),
                                                    },
                                                ]
                                            );
                                        }}
                                    >
                                        <X size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                ) : (
                                    <ExternalLink size={16} color={isRemoteUrl ? '#444751' : '#CBD5E1'} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: '#282A32',
        marginBottom: 16,
    },
    uploadButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    uploadButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#E5E4EA',
        borderRadius: 12,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#C7D2FE',
        borderStyle: 'dashed',
    },
    uploadButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#444751',
    },
    selectedFileContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    selectedFileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    selectedFileTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    selectedFileContent: {
        marginBottom: 12,
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        marginBottom: 8,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#282A32',
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#444751',
        borderRadius: 12,
        paddingVertical: 12,
    },
    confirmButtonDisabled: {
        opacity: 0.6,
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    evidenceList: {
        gap: 12,
    },
    evidenceListTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
    },
    evidenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    evidenceIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#E5E4EA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    evidenceInfo: {
        flex: 1,
    },
    evidenceName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#282A32',
        marginBottom: 2,
    },
    evidenceDate: {
        fontSize: 12,
        color: '#94A3B8',
    },
    evidenceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    evidencePartyLabel: {
        fontSize: 10,
        fontWeight: '800',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        color: '#64748B',
    },
    evidencePartyClient: {
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
    },
    evidencePartyFreelancer: {
        backgroundColor: '#F0FDF4',
        color: '#15803D',
    },
});
