import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, AlertCircle, DollarSign, Briefcase } from 'lucide-react-native';
import { disputeService } from '@/services/disputeService';
import EvidenceUploader from '@/components/dispute/EvidenceUploader';
import type { DisputeEvidence, DisputeReason } from '@/models/Dispute';

export default function CreateDispute() {
    const router = useRouter();
    const { projectId: initialProjectId, projectTitle: initialProjectTitle } = useLocalSearchParams<{ projectId?: string; projectTitle?: string }>();

    const [title, setTitle] = useState(initialProjectTitle || '');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState<DisputeReason>('quality_issues');
    const [evidence, setEvidence] = useState<DisputeEvidence[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const disputeReasons: Array<{ label: string; value: DisputeReason }> = [
        { label: 'Quality Issues', value: 'quality_issues' },
        { label: 'Missed Deadline', value: 'missed_deadline' },
        { label: 'Scope Creep', value: 'scope_creep' },
        { label: 'Payment Delay', value: 'payment_delay' },
        { label: 'Communication Issues', value: 'communication_issues' },
        { label: 'Other', value: 'other' },
    ];

    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('Error', 'Please provide a description of the issue');
            return;
        }

        if (!amount || isNaN(parseFloat(amount))) {
            Alert.alert('Error', 'Please provide a valid dispute amount');
            return;
        }

        try {
            setIsSubmitting(true);

            // Simulation: Create dispute
            await disputeService.createDispute({
                projectId: initialProjectId || 'default-id',
                reason,
                description,
                amount: parseFloat(amount),
            });

            Alert.alert('Success', 'Dispute created successfully. You can now chat with the other party in the Resolution Center.', [
                { text: 'OK', onPress: () => router.replace('/FDisputes' as any) }
            ]);
        } catch (error: any) {
            console.error('Failed to create dispute:', error);
            Alert.alert('Error', error.message || 'Failed to create dispute');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEvidenceUpload = (newEvidence: DisputeEvidence) => {
        setEvidence([...evidence, newEvidence]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ArrowLeft size={24} color="#282A32" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Open a Dispute</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Project Details</Text>
                        <View style={styles.infoRow}>
                            <Briefcase size={18} color="#444751" />
                            <Text style={styles.projectTitle}>{initialProjectTitle || 'Select Project'}</Text>
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Reason for Dispute</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reasonsScroll}>
                            {disputeReasons.map((r) => (
                                <TouchableOpacity
                                    key={r.value}
                                    style={[styles.reasonChip, reason === r.value && styles.reasonChipActive]}
                                    onPress={() => setReason(r.value)}
                                >
                                    <Text style={[styles.reasonChipText, reason === r.value && styles.reasonChipTextActive]}>
                                        {r.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Disputed Amount ($)</Text>
                        <View style={styles.inputWrapper}>
                            <DollarSign size={18} color="#94A3B8" />
                            <TextInput
                                style={styles.input}
                                value={amount}
                                onChangeText={setAmount}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.label}>Detailed Description</Text>
                        <TextInput
                            style={styles.textArea}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Explain the issue in detail..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.formSection}>
                        <EvidenceUploader
                            disputeId="new"
                            existingEvidence={evidence}
                            onUploadComplete={handleEvidenceUpload}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Create Dispute</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.spacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#282A32' },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    formSection: { marginBottom: 25 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
    label: { fontSize: 15, fontWeight: '700', color: '#282A32', marginBottom: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16 },
    projectTitle: { fontSize: 16, fontWeight: '700', color: '#282A32' },
    reasonsScroll: { flexDirection: 'row', marginHorizontal: -5 },
    reasonChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, backgroundColor: '#F1F5F9', marginHorizontal: 5, borderWidth: 1, borderColor: '#E2E8F0' },
    reasonChipActive: { backgroundColor: '#444751', borderColor: '#444751' },
    reasonChipText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    reasonChipTextActive: { color: '#FFFFFF' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 12 },
    input: { flex: 1, fontSize: 16, fontWeight: '600', color: '#282A32' },
    textArea: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 15, fontSize: 16, color: '#282A32', minHeight: 120 },
    submitButton: { backgroundColor: '#444751', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 10, shadowColor: '#444751', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    submitButtonDisabled: { opacity: 0.6 },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    spacer: { height: 40 }
});
