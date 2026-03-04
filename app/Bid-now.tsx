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
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft, ChevronDown, ChevronUp, CheckCircle, Calendar,
} from "lucide-react-native";
import { projectService, proposalService } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@/models/Project";
import { formatCurrency } from "@/utils/helpers";
import { MapPin, DollarSign } from "lucide-react-native";

// ─── helpers ──────────────────────────────────────────────────────────────────

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

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BidNow() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [project, setProject]               = useState<Project | null>(null);
  const [loading, setLoading]               = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [showSuccessModal, setShowSuccess]  = useState(false);
  const [showDetails, setShowDetails]       = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [bidAmount, setBidAmount]   = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");

  // Fetch project
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await projectService.getProjectById(id);
        setProject(data || null);
        if (data?.budget && data.budget > 0) {
          setBidAmount(String(data.budget));
        }
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!id) return Alert.alert("Error", "Missing project ID");
    if (!user || user.role !== "Freelancer")
      return Alert.alert("Error", "Only freelancers can submit proposals");

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0)
      return Alert.alert("Validation Error", "Please enter a valid bid amount");

    if (!coverLetter.trim())
      return Alert.alert("Validation Error", "Please write a cover letter");

    try {
      setSubmitting(true);
      await proposalService.createProposal(id, {
        coverLetter: coverLetter.trim(),
        bidAmount: amount,
      });
      setShowSuccess(true);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Unable to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#444751" />
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#282A32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Proposal</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Apply-to card */}
        <View style={styles.applyToCard}>
          <Text style={styles.applyToLabel}>Apply to</Text>
          <Text style={styles.applyToTitle} numberOfLines={showDetails ? undefined : 3}>
            {project?.title || "Project"}
          </Text>
          <Text style={styles.applyToMeta}>{timeAgo(project?.createdAt)}</Text>
          <View style={styles.applyToMetaRow}>
            <Text style={styles.applyToMetaLine2}>Payment Verified</Text>
            <CheckCircle size={16} color="#282A32" style={{ marginLeft: 6 }} />
          </View>
          <TouchableOpacity style={styles.showDetailsRow} onPress={() => setShowDetails(!showDetails)}>
            <Text style={styles.showDetailsText}>Show Details</Text>
            {showDetails ? <ChevronUp size={18} color="#282A32" /> : <ChevronDown size={18} color="#282A32" />}
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
                    <Text style={styles.detailsGridValue}>{formatCurrency(project.budget, project.currency || "USD")}</Text>
                  </View>
                )}
                {!!project.duration && (
                  <View style={styles.detailsGridItem}>
                    <Calendar size={18} color="#282A32" />
                    <Text style={styles.detailsGridLabel}>Duration</Text>
                    <Text style={styles.detailsGridValue}>{project.duration}</Text>
                  </View>
                )}
                {!!project.location && (
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

        {/* Bid Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Bid</Text>
          <Text style={styles.bidDesc}>
            Enter the total amount you want to bid for this project. Milestones will be set by the client after your proposal is accepted.
          </Text>

          <View style={[
            styles.amountInputWrapper,
            submitAttempted && !(parseFloat(bidAmount) > 0) && styles.amountInputError,
          ]}>
            <Text style={styles.amountPrefix}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={bidAmount}
              onChangeText={setBidAmount}
            />
            {project?.currency && project.currency !== "USD" && (
              <Text style={styles.currencyLabel}>{project.currency}</Text>
            )}
          </View>
          {submitAttempted && !(parseFloat(bidAmount) > 0) && (
            <Text style={styles.fieldError}>Please enter a valid bid amount</Text>
          )}

          {/* Total display */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Bid</Text>
            <Text style={styles.totalValue}>
              {parseFloat(bidAmount) > 0
                ? formatCurrency(parseFloat(bidAmount), project?.currency || "USD")
                : "—"}
            </Text>
          </View>
        </View>

        {/* Cover Letter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <TextInput
            style={[
              styles.input,
              styles.coverLetterInput,
              submitAttempted && !coverLetter.trim() && styles.inputError,
            ]}
            placeholder="Write your cover letter here…"
            placeholderTextColor="#94A3B8"
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            textAlignVertical="top"
          />
          {submitAttempted && !coverLetter.trim() && (
            <Text style={styles.fieldError}>Cover letter is required</Text>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.sendBtn, submitting && styles.sendBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.sendBtnText}>Send Proposal</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Success modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowSuccess(false); router.replace("/(tabs)" as any); }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => { setShowSuccess(false); router.replace("/(tabs)" as any); }}
        >
          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()} style={styles.modalCard}>
            <CheckCircle size={56} color="#10B981" style={{ marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Proposal Sent!</Text>
            <Text style={styles.modalMessage}>
              Your proposal has been submitted successfully.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => { setShowSuccess(false); router.replace("/(tabs)" as any); }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingTop: 4,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#FFF", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },

  applyToCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  applyToLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "700", letterSpacing: 0.8, marginBottom: 6, textTransform: "uppercase" },
  applyToTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 6, lineHeight: 22 },
  applyToMeta: { fontSize: 12, color: "#94A3B8", marginBottom: 4 },
  applyToMetaRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  applyToMetaLine2: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  showDetailsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  showDetailsText: { fontSize: 14, color: "#282A32", fontWeight: "600" },

  detailsBlock: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  detailsHeading: { fontSize: 13, fontWeight: "700", color: "#1E293B", marginBottom: 6 },
  detailsText: { fontSize: 13, color: "#64748B", lineHeight: 20, marginBottom: 12 },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  detailsGridItem: { minWidth: "28%", backgroundColor: "#F8FAFC", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  detailsGridLabel: { fontSize: 10, color: "#94A3B8", marginTop: 4 },
  detailsGridValue: { fontSize: 13, fontWeight: "700", color: "#1E293B", marginTop: 2 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  detailTag: { backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  detailTagText: { fontSize: 12, fontWeight: "600", color: "#475569" },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B", marginBottom: 6 },
  bidDesc: { fontSize: 13, color: "#94A3B8", lineHeight: 19, marginBottom: 14 },

  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFF",
    height: 52,
    marginBottom: 6,
  },
  amountInputError: { borderColor: "#EF4444", borderWidth: 1.5 },
  amountPrefix: { fontSize: 16, fontWeight: "700", color: "#64748B", marginRight: 6 },
  amountInput: {
    fontSize: 18,
    color: "#1E293B",
    fontWeight: "700",
    flex: 1,
    paddingVertical: 0,
    borderWidth: 0,
    outlineStyle: "none" as any,
  },
  currencyLabel: { fontSize: 13, color: "#94A3B8", fontWeight: "600", marginLeft: 6 },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginTop: 12,
  },
  totalLabel: { fontSize: 13, color: "#94A3B8", fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  totalValue: { fontSize: 20, color: "#FFF", fontWeight: "800" },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    fontSize: 14,
    color: "#1E293B",
  },
  inputError: { borderColor: "#EF4444", borderWidth: 1.5 },
  fieldError: { color: "#EF4444", fontSize: 11, fontWeight: "600" as const, marginTop: 3 },
  coverLetterInput: { height: 120, paddingTop: 12, textAlignVertical: "top" },

  sendBtn: {
    backgroundColor: "#1E293B",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16, letterSpacing: 0.3 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCard: {
    backgroundColor: "#FFF", borderRadius: 20, padding: 28,
    alignItems: "center", minWidth: 280, maxWidth: 340,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
      android: { elevation: 12 },
    }),
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B", marginBottom: 8 },
  modalMessage: { fontSize: 15, color: "#64748B", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  modalButton: {
    backgroundColor: "#1E293B", paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 12, width: "100%", alignItems: "center",
  },
  modalButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
