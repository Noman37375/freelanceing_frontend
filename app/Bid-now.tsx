import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MoreVertical, ChevronDown, ChevronUp, CheckCircle } from "lucide-react-native";
import { projectService, proposalService } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@/models/Project";
import { MapPin, DollarSign, Calendar } from "lucide-react-native";

const timeAgo = (timestamp?: string) => {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `Posted ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `Posted ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

type BidType = "milestone" | "project";

interface MilestoneRow {
  id: string;
  description: string;
  dueDate: string;
  amount: string;
}

export default function BidNow() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [bidType, setBidType] = useState<BidType>("milestone");
  const [projectAmount, setProjectAmount] = useState<string>("");
  const [milestones, setMilestones] = useState<MilestoneRow[]>([
    { id: "1", description: "Down Payment", dueDate: "", amount: "" },
  ]);
  const [coverLetter, setCoverLetter] = useState<string>("");

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await projectService.getProjectById(id);
        setProject(data || null);
      } catch (err: any) {
        console.error("Failed to fetch project for bidding", err);
        Alert.alert("Error", err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: "",
        dueDate: "",
        amount: "",
      },
    ]);
  };

  const updateMilestone = (id: string, field: keyof MilestoneRow, value: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const getTotalAmount = (): number => {
    if (bidType === "project") {
      const n = parseFloat(projectAmount);
      return isNaN(n) ? 0 : n;
    }
    return milestones.reduce((sum, m) => {
      const n = parseFloat(m.amount);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!id) return Alert.alert("Error", "Missing project ID");
    const total = getTotalAmount();
    if (total <= 0) {
      return Alert.alert("Error", "Please enter a valid bid amount");
    }
    if (!coverLetter.trim()) {
      return Alert.alert("Error", "Please write a cover letter");
    }
    if (!user || user.role !== "Freelancer") {
      return Alert.alert("Error", "Only freelancers can submit proposals");
    }

    try {
      setSubmitting(true);
      await proposalService.createProposal(id, {
        coverLetter: coverLetter.trim(),
        bidAmount: total,
      });
      Alert.alert("Success", "Your proposal has been submitted successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error("Proposal submission error", err);
      Alert.alert("Error", err.message || "Unable to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#444751" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.wrapper}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header: back left, title center, menu right */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#282A32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Proposal</Text>
          {/* <TouchableOpacity style={styles.menuButton}>
            <MoreVertical size={22} color="#282A32" />
          </TouchableOpacity> */}
        </View>

        {/* Apply to – left-aligned */}
        <View style={styles.applyToCard}>
          <Text style={styles.applyToLabel}>Apply to</Text>
          <Text style={styles.applyToTitle} numberOfLines={showDetails ? undefined : 3}>
            {project?.title || "Project"}
          </Text>
          <Text style={styles.applyToMeta}>{timeAgo(project?.createdAt)}</Text>
          <View style={styles.applyToMetaRow}>
            <Text style={styles.applyToMetaLine2}>Payment Verified</Text>
            <CheckCircle size={16} color="#282A32" style={styles.checkIcon} />
          </View>
          <TouchableOpacity
            style={styles.showDetailsRow}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={styles.showDetailsText}>Show Details</Text>
            {showDetails ? (
              <ChevronUp size={18} color="#282A32" />
            ) : (
              <ChevronDown size={18} color="#282A32" />
            )}
          </TouchableOpacity>

          {showDetails && project && (
            <View style={styles.detailsBlock}>
              {project.description ? (
                <>
                  <Text style={styles.detailsHeading}>Job Description</Text>
                  <Text style={styles.detailsText}>{project.description}</Text>
                </>
              ) : null}
              <View style={styles.detailsGrid}>
                {project.budget != null && (
                  <View style={styles.detailsGridItem}>
                    <DollarSign size={18} color="#282A32" />
                    <Text style={styles.detailsGridLabel}>Budget</Text>
                    <Text style={styles.detailsGridValue}>${project.budget}</Text>
                  </View>
                )}
                {project.duration != null && project.duration !== "" && (
                  <View style={styles.detailsGridItem}>
                    <Calendar size={18} color="#282A32" />
                    <Text style={styles.detailsGridLabel}>Duration</Text>
                    <Text style={styles.detailsGridValue}>{project.duration}</Text>
                  </View>
                )}
                {project.location != null && project.location !== "" && (
                  <View style={styles.detailsGridItem}>
                    <MapPin size={18} color="#282A32" />
                    <Text style={styles.detailsGridLabel}>Location</Text>
                    <Text style={styles.detailsGridValue}>{project.location}</Text>
                  </View>
                )}
              </View>
              {(project.tags?.length ?? 0) > 0 && (
                <>
                  <Text style={styles.detailsHeading}>Skills Required</Text>
                  <View style={styles.tagsWrap}>
                    {project.tags.map((tag, i) => (
                      <View key={i} style={styles.detailTag}>
                        <Text style={styles.detailTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        {/* Project Bid – section title left, radios in one row */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Bid</Text>
          <View style={styles.radioGroupRow}>
            <TouchableOpacity
              style={styles.radioRow}
              onPress={() => setBidType("milestone")}
            >
              <View style={[styles.radioOuter, bidType === "milestone" && styles.radioOuterSelected]}>
                <View style={[styles.radioInner, bidType === "milestone" && styles.radioInnerSelected]} />
              </View>
              <Text style={[styles.radioLabel, bidType !== "milestone" && styles.radioLabelMuted]}>By milestone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioRow}
              onPress={() => setBidType("project")}
            >
              <View style={[styles.radioOuter, bidType === "project" && styles.radioOuterSelected]}>
                <View style={[styles.radioInner, bidType === "project" && styles.radioInnerSelected]} />
              </View>
              <Text style={[styles.radioLabel, bidType !== "project" && styles.radioLabelMuted]}>By project</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bidDesc}>
            Divide the project into smaller segments, called milestones. You'll be paid for milestones as they are completed and approved.
          </Text>
        </View>

        {/* Project Milestone – Descriptions full width, Due Date & Amount side by side */}
        {bidType === "milestone" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Milestone</Text>
            {milestones.map((m) => (
              <View key={m.id} style={styles.milestoneCard}>
                <TextInput
                  style={[styles.input, styles.milestoneDescInput]}
                  placeholder="Descriptions"
                  placeholderTextColor="#94A3B8"
                  value={m.description}
                  onChangeText={(v) => updateMilestone(m.id, "description", v)}
                />
                <View style={styles.milestoneRow}>
                  <TextInput
                    style={[styles.input, styles.milestoneDateInput]}
                    placeholder="Due Date"
                    placeholderTextColor="#94A3B8"
                    value={m.dueDate}
                    onChangeText={(v) => updateMilestone(m.id, "dueDate", v)}
                  />
                  <TextInput
                    style={[styles.input, styles.milestoneAmountInput]}
                    placeholder="Amount"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={m.amount}
                    onChangeText={(v) => updateMilestone(m.id, "amount", v)}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addMilestoneBtn} onPress={addMilestone}>
              <Text style={styles.addMilestoneText}>Add milestone</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bid Amount (USD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 290"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={projectAmount}
              onChangeText={setProjectAmount}
            />
          </View>
        )}

        {/* Cover Letter – left-aligned */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <TextInput
            style={[styles.input, styles.coverLetterInput]}
            placeholder="Write your cover letter or use AI helps"
            placeholderTextColor="#94A3B8"
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Send Proposal – full width, black, centered text */}
        <TouchableOpacity
          style={[styles.sendBtn, submitting && styles.sendBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>Send Proposal</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: { padding: 8, minWidth: 40 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#282A32", textAlign: "center" },
  menuButton: { padding: 8, minWidth: 40, alignItems: "flex-end" },

  applyToCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  applyToLabel: { fontSize: 12, color: "#64748B", fontWeight: "600", marginBottom: 8 },
  applyToTitle: { fontSize: 16, fontWeight: "700", color: "#282A32", marginBottom: 8 },
  applyToMeta: { fontSize: 13, color: "#64748B", marginBottom: 4 },
  applyToMetaRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  applyToMetaLine2: { fontSize: 13, color: "#64748B" },
  checkIcon: { marginLeft: 6 },
  showDetailsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  showDetailsText: { fontSize: 14, color: "#282A32", fontWeight: "600" },

  detailsBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  detailsHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#282A32",
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  detailsGridItem: {
    minWidth: "28%",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  detailsGridLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },
  detailsGridValue: { fontSize: 14, fontWeight: "700", color: "#282A32", marginTop: 2 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  detailTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailTagText: { fontSize: 12, fontWeight: "600", color: "#475569" },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#282A32", marginBottom: 12 },
  radioGroupRow: { flexDirection: "row", alignItems: "center", gap: 24, marginBottom: 12 },
  radioRow: { flexDirection: "row", alignItems: "center" },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  radioOuterSelected: { borderColor: "#282A32" },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "transparent",
  },
  radioInnerSelected: { backgroundColor: "#282A32" },
  radioLabel: { fontSize: 15, color: "#282A32", fontWeight: "500" },
  radioLabelMuted: { color: "#94A3B8" },
  bidDesc: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
    marginTop: 4,
  },

  milestoneCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  milestoneDescInput: { marginBottom: 12 },
  milestoneRow: { flexDirection: "row", gap: 12 },
  milestoneDateInput: { flex: 1 },
  milestoneAmountInput: { flex: 1 },
  addMilestoneBtn: { marginTop: 8 },
  addMilestoneText: { fontSize: 14, color: "#282A32", fontWeight: "600" },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#FFF",
    fontSize: 15,
    color: "#282A32",
  },
  coverLetterInput: { height: 120, paddingTop: 14 },

  sendBtn: {
    backgroundColor: "#282A32",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  sendBtnDisabled: { opacity: 0.7 },
  sendBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
