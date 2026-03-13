// app/add-milestones.tsx
import React, { useState, useRef, useEffect } from "react";
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
import { milestoneService, projectService } from "@/services/projectService";
import { COLORS } from "@/utils/constants";
import { formatCurrency } from "@/utils/helpers";

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
  const params = useLocalSearchParams<{ projectId: string; budget?: string; currency?: string }>();
  const projectId = params.projectId;
  const budgetFromParams = params.budget != null ? parseFloat(decodeURIComponent(params.budget)) : NaN;
  const currencyFromParams = params.currency ? decodeURIComponent(params.currency) : "USD";

  const [totalBudget, setTotalBudget] = useState<number>(Number.isFinite(budgetFromParams) ? budgetFromParams : 0);
  const [currency, setCurrency] = useState<string>(currencyFromParams);
  const [numberOfMilestones, setNumberOfMilestones] = useState<string>("3");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(!Number.isFinite(budgetFromParams));

  const titleRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  const N = Math.max(1, Math.min(50, parseInt(numberOfMilestones, 10) || 1));
  const equalShare = totalBudget > 0 && N > 0 ? totalBudget / N : 0;
  const canAddMore = milestones.length < N;

  // If budget/currency not in params, fetch project
  useEffect(() => {
    if (!projectId || Number.isFinite(budgetFromParams)) {
      if (!Number.isFinite(budgetFromParams)) setProjectLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setProjectLoading(true);
        const project = await projectService.getProjectById(projectId);
        if (!cancelled && project) {
          setTotalBudget(Number(project.budget) || 0);
          setCurrency(project.currency || "USD");
        }
      } catch {
        if (!cancelled) setTotalBudget(0);
      } finally {
        if (!cancelled) setProjectLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId, budgetFromParams]);

  if (!projectId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Project ID is missing!</Text>
      </View>
    );
  }

  // Add a milestone — each gets the same equal share (totalBudget / N)
  const handleAddMilestone = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Milestone title is required.");
      return;
    }
    if (equalShare <= 0) {
      Alert.alert("Error", "Set project budget and number of milestones for equal division.");
      return;
    }
    if (!canAddMore) {
      Alert.alert("Limit reached", `You set ${N} milestones. Add no more or change the number above.`);
      return;
    }

    setLoading(true);
    try {
      const newMilestone = await milestoneService.createMilestone(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        orderIndex: milestones.length + 1,
        amount: equalShare,
      });

      setMilestones((prev) => [...prev, newMilestone]);
      setTitle("");
      setDescription("");
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

        {projectLoading ? (
          <Text style={styles.helperText}>Loading project...</Text>
        ) : totalBudget > 0 ? (
          <>
            <View style={styles.budgetCard}>
              <Text style={styles.budgetLabel}>Project budget</Text>
              <Text style={styles.budgetAmount}>{formatCurrency(totalBudget, currency)}</Text>
              <View style={styles.numberOfMilestonesRow}>
                <Text style={styles.numberRowLabel}>Number of milestones</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="e.g. 3"
                  value={numberOfMilestones}
                  onChangeText={(t) => setNumberOfMilestones(t.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              {N >= 1 && equalShare > 0 && (
                <Text style={styles.budgetHelper}>
                  Each milestone: {formatCurrency(equalShare, currency)} (same amount for all {N})
                </Text>
              )}
            </View>
          </>
        ) : null}

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

        {totalBudget > 0 && equalShare > 0 && (
          <View style={styles.autoAmountRow}>
            <Text style={styles.autoAmountLabel}>Amount per milestone (equal split)</Text>
            <Text style={styles.autoAmountValue}>{formatCurrency(equalShare, currency)}</Text>
            <Text style={styles.autoAmountHint}>
              Every milestone gets the same amount. {milestones.length} of {N} added.
            </Text>
          </View>
        )}

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
          style={[styles.addButton, (loading || !canAddMore) && styles.disabledButton]}
          onPress={handleAddMilestone}
          disabled={loading || !canAddMore}
        >
          <Text style={styles.addButtonText}>
            {loading ? "Adding..." : !canAddMore ? `${N} milestones added` : "Add Milestone"}
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
                  {item.amount != null && item.amount > 0 && (
                    <Text style={styles.milestoneAmount}>{formatCurrency(item.amount, currency)} escrow</Text>
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
  budgetCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  budgetLabel: { fontSize: 12, fontWeight: "600", color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  budgetAmount: { fontSize: 20, fontWeight: "800", color: "#10B981", marginBottom: 12 },
  numberOfMilestonesRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  numberRowLabel: { fontSize: 14, fontWeight: "600", color: COLORS.gray700 },
  numberInput: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: COLORS.gray900, minWidth: 56 },
  budgetHelper: { fontSize: 13, color: COLORS.gray600, fontWeight: "500" },
  autoAmountRow: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  autoAmountLabel: { fontSize: 12, fontWeight: "700", color: "#065F46", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  autoAmountValue: { fontSize: 18, fontWeight: "800", color: "#047857", marginBottom: 4 },
  autoAmountHint: { fontSize: 13, color: "#047857", fontWeight: "500" },
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