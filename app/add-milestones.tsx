// app/add-milestones.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { milestoneService } from "@/services/projectService";
import { COLORS } from "@/utils/constants";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  orderIndex?: number;
  amount?: number;
}

export default function AddMilestonesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const titleRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  if (!projectId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Project ID is missing!</Text>
      </View>
    );
  }

  // Add a milestone
  const handleAddMilestone = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Milestone title is required.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (amount && (isNaN(parsedAmount) || parsedAmount <= 0)) {
      Alert.alert("Error", "Amount must be a positive number.");
      return;
    }

    setLoading(true);
    try {
      const newMilestone = await milestoneService.createMilestone(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        orderIndex: milestones.length + 1,
        amount: amount ? parsedAmount : undefined,
      });

      setMilestones((prev) => [...prev, newMilestone]);
      setTitle("");
      setDescription("");
      setAmount("");
      titleRef.current?.focus();
    } catch (error: any) {
      console.error("Failed to add milestone:", error);
      Alert.alert("Error", error.message || "Failed to add milestone");
    } finally {
      setLoading(false);
    }
  };

  // Finish adding milestones
  const handleFinish = () => {
    if (milestones.length === 0) {
      Alert.alert("Error", "You must add at least one milestone.");
      return;
    }

    // Navigate back to client dashboard or project details
    router.replace("/(client-tabs)"); // Adjust this route if needed
  };

  // Delete milestone
  const handleDeleteMilestone = async (id: string) => {
    try {
      await milestoneService.deleteMilestone(id);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    } catch (error: any) {
      console.error("Failed to delete milestone:", error);
      Alert.alert("Error", error.message || "Failed to delete milestone");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Add Milestones</Text>

        {/* Milestone Form */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Milestone Title *</Text>
          <TextInput
            ref={titleRef}
            style={styles.input}
            placeholder="e.g. Design Homepage"
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Amount ($) — Escrow Value</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 500"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            ref={descriptionRef}
            style={[styles.input, styles.textArea]}
            placeholder="Details about this milestone"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.addButton, loading && styles.disabledButton]}
          onPress={handleAddMilestone}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>
            {loading ? "Adding..." : "Add Milestone"}
          </Text>
        </TouchableOpacity>

        {/* Milestone List */}
        <Text style={styles.subHeading}>Current Milestones</Text>
        {milestones.length === 0 ? (
          <Text style={styles.helperText}>No milestones added yet.</Text>
        ) : (
          <FlatList
            data={milestones}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.milestoneCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.milestoneTitle}>{item.title}</Text>
                  {item.amount && (
                    <Text style={styles.milestoneAmount}>${item.amount.toFixed(2)} escrow</Text>
                  )}
                  {item.description && (
                    <Text style={styles.milestoneDesc}>{item.description}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteMilestone(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Finish Button */}
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: COLORS.gray900 },
  subHeading: { fontSize: 18, fontWeight: "600", marginTop: 30, marginBottom: 10, color: COLORS.gray900 },
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.gray700, marginBottom: 6 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 12, padding: 12, fontSize: 16, color: COLORS.gray900 },
  textArea: { height: 100, textAlignVertical: "top" },
  addButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 20 },
  addButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
  disabledButton: { opacity: 0.6 },
  helperText: { fontSize: 14, color: COLORS.gray500, fontStyle: "italic" },
  milestoneCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.gray200 },
  milestoneTitle: { fontSize: 16, fontWeight: "600", color: COLORS.gray900 },
  milestoneAmount: { fontSize: 13, fontWeight: "700", color: "#0891B2", marginTop: 2 },
  milestoneDesc: { fontSize: 14, color: COLORS.gray700, marginTop: 4 },
  deleteText: { color: COLORS.error, fontWeight: "700", marginLeft: 12 },
  finishButton: { backgroundColor: COLORS.success, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 20 },
  finishButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
  errorText: { fontSize: 16, fontWeight: "700", color: COLORS.error, textAlign: "center", marginTop: 40 },
});