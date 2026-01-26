import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  AlertTriangle, 
  ChevronDown, 
  Info,
  Send
} from 'lucide-react-native';

// Enum for Dispute Reasons
const DISPUTE_REASONS = [
  { label: 'Payment Issue', value: 'PAYMENT_ISSUE' },
  { label: 'Work Quality', value: 'WORK_QUALITY' },
  { label: 'Deadline Missed', value: 'DEADLINE_MISSED' },
  { label: 'Scope Change', value: 'SCOPE_CHANGE' },
];

export default function AddDispute() {
  const router = useRouter();
  const { project_id, project_title } = useLocalSearchParams();

  // User Input State
  const [reason, setReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSubmit = () => {
    if (!reason || !description.trim()) {
      Alert.alert('Missing Info', 'Please select a reason and provide a description.');
      return;
    }

    // This matches your Schema's Auto Fields
    const disputePayload = {
      id: `DISP-${Math.floor(1000 + Math.random() * 9000)}`, // Generated
      project_id: project_id,
      raised_by: 'current_user_id', // Linked to user session
      against_user: 'other_party_id', // Linked to project context
      reason: reason,
      description: description,
      status: 'PENDING',
      resolved_by: null,
      created_at: new Date().toISOString(),
      resolved_at: null,
    };

    console.log('Submitting Dispute:', disputePayload);
    Alert.alert('Dispute Raised', 'The admin team will review this case shortly.');
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raise a Dispute</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* WARNING CARD */}
        <View style={styles.warningCard}>
          <AlertTriangle size={20} color="#B45309" />
          <Text style={styles.warningText}>
            Raising a dispute will pause remaining payments for: {"\n"}
            <Text style={{ fontWeight: '800' }}>{project_title || 'Current Project'}</Text>
          </Text>
        </View>

        {/* REASON SELECTOR (ENUM) */}
        <Text style={styles.label}>DISPUTE REASON</Text>
        <TouchableOpacity 
          style={styles.dropdown} 
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={[styles.dropdownValue, !reason && { color: '#94A3B8' }]}>
            {reason ? DISPUTE_REASONS.find(r => r.value === reason)?.label : 'Select a reason...'}
          </Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdownMenu}>
            {DISPUTE_REASONS.map((item) => (
              <TouchableOpacity 
                key={item.value} 
                style={styles.dropdownItem}
                onPress={() => {
                  setReason(item.value);
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* DESCRIPTION AREA */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the issue in detail. Provide dates, specific missed milestones, or quality concerns..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={6}
          maxLength={500}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <Info size={16} color="#6366F1" />
          <Text style={styles.infoText}>
            Our admin team typically responds to disputes within 24-48 hours.
          </Text>
        </View>
      </ScrollView>

      {/* SUBMIT BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Send size={18} color="#FFF" />
          <Text style={styles.submitBtnText}>Submit Dispute</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20, 
    backgroundColor: '#FFF' 
  },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  scrollContent: { padding: 24 },
  warningCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFBEB', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#FEF3C7', 
    gap: 12, 
    marginBottom: 24 
  },
  warningText: { flex: 1, color: '#92400E', fontSize: 13, lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 1, marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontSize: 11, color: '#94A3B8' },
  dropdown: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    marginBottom: 8 
  },
  dropdownValue: { fontSize: 15, color: '#1E293B', fontWeight: '600' },
  dropdownMenu: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    overflow: 'hidden',
    marginBottom: 20 
  },
  dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemText: { fontSize: 15, color: '#475569', fontWeight: '500' },
  textArea: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    height: 150, 
    fontSize: 15, 
    color: '#1E293B',
    marginBottom: 20
  },
  infoBox: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  infoText: { fontSize: 12, color: '#6366F1', fontWeight: '600', flex: 1 },
  footer: { padding: 24, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  submitBtn: { 
    backgroundColor: '#6366F1', 
    height: 56, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10 
  },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});