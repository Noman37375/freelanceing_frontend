import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  User,
  DollarSign,
  MapPin,
  Calendar,
  TrendingUp,
  PlayCircle,
  Send,
  AlertCircle,
  Plus,
  Trash2,
  MessageCircle,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { projectService, milestoneService } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { Project, Milestone } from "@/models/Project";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label: "Not Started",       color: "#94A3B8", bg: "#F8FAFC", border: "#CBD5E1" },
  in_progress: { label: "In Progress",       color: "#4F46E5", bg: "#EEF2FF", border: "#818CF8" },
  submitted:   { label: "Awaiting Approval", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
  approved:    { label: "Approved",          color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
};

export default function ActiveDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Add milestone modal (Client)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);

  // Request changes modal (Client)
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [changesMessage, setChangesMessage] = useState("");
  const [sendingChanges, setSendingChanges] = useState(false);

  const isClient = user?.role === "Client";
  const isFreelancer = user?.role === "Freelancer";

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [projectData, milestonesData] = await Promise.all([
        projectService.getProjectById(id),
        milestoneService.getMilestones(id),
      ]);
      setProject(projectData);
      setMilestones(milestonesData);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load project");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // ── Freelancer: Start ──────────────────────────────────────────
  const handleStart = async (milestoneId: string) => {
    try {
      setActionLoading(milestoneId + "_start");
      const updated = await milestoneService.startMilestone(milestoneId);
      setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? updated : m)));
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to start milestone");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Freelancer: Submit ─────────────────────────────────────────
  // NOTE: Do NOT use Alert.alert with async callbacks — unreliable on RN.
  // Instead call API directly, show errors via Alert.
  const handleSubmit = async (milestoneId: string) => {
    try {
      setActionLoading(milestoneId + "_submit");
      const updated = await milestoneService.submitMilestone(milestoneId);
      setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? updated : m)));
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit milestone");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Client: Approve ────────────────────────────────────────────
  const handleApprove = async (milestoneId: string) => {
    try {
      setActionLoading(milestoneId + "_approve");
      const result = await milestoneService.approveMilestone(milestoneId);
      setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? result.milestone : m)));
      setProject((prev) => prev ? { ...prev, progress: result.progress } : prev);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to approve milestone");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Client: Request Changes ────────────────────────────────────
  const openChangesModal = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    setChangesMessage("");
    setShowChangesModal(true);
  };

  const handleRequestChanges = async () => {
    if (!changesMessage.trim() || !selectedMilestoneId) return;
    try {
      setSendingChanges(true);
      const updated = await milestoneService.requestChanges(selectedMilestoneId, changesMessage.trim());
      setMilestones((prev) => prev.map((m) => (m.id === selectedMilestoneId ? updated : m)));
      setShowChangesModal(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send change request");
    } finally {
      setSendingChanges(false);
    }
  };

  // ── Client: Add Milestone ──────────────────────────────────────
  const handleAddMilestone = async () => {
    if (!newTitle.trim() || !project) return;
    try {
      setAddingMilestone(true);
      const milestone = await milestoneService.createMilestone(project.id, {
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        dueDate: newDueDate.trim() || undefined,
        orderIndex: milestones.length,
      });
      setMilestones((prev) => [...prev, milestone]);
      setShowAddModal(false);
      setNewTitle(""); setNewDesc(""); setNewDueDate("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add milestone");
    } finally {
      setAddingMilestone(false);
    }
  };

  // ── Client: Delete Milestone ───────────────────────────────────
  const handleDelete = (milestoneId: string, title: string) => {
    Alert.alert("Delete Milestone", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // Sync delete — wrapped in separate async fn
          deleteMilestone(milestoneId);
        },
      },
    ]);
  };

  const deleteMilestone = async (milestoneId: string) => {
    try {
      await milestoneService.deleteMilestone(milestoneId);
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
      if (project) {
        const updated = await projectService.getProjectById(project.id);
        setProject(updated);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete milestone");
    }
  };

  // ── Loading / Error states ─────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#444751" />
        <Text style={styles.loadingText}>Loading project…</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centered}>
        <AlertCircle size={40} color="#CBD5E1" />
        <Text style={{ color: "#64748B", marginTop: 12 }}>Project not found</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = project.progress || 0;
  const approvedCount = milestones.filter((m) => m.status === "approved").length;
  const otherUser = isClient ? project.freelancer : project.client;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── DARK HEADER ── */}
      <View style={styles.darkHeader}>
        <SafeAreaView>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#F8FAFC" size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{project.title}</Text>
          </View>

          <View style={styles.summaryGrid}>
            {otherUser && (
              <View style={styles.summaryItem}>
                <User size={12} color="#C7D2FE" />
                <Text style={styles.summaryText}>{otherUser.userName || "—"}</Text>
              </View>
            )}
            <View style={styles.summaryItem}>
              <DollarSign size={12} color="#C7D2FE" />
              <Text style={styles.summaryText}>${project.budget}</Text>
            </View>
            {project.location ? (
              <View style={styles.summaryItem}>
                <MapPin size={12} color="#C7D2FE" />
                <Text style={styles.summaryText}>{project.location}</Text>
              </View>
            ) : null}
            {project.duration ? (
              <View style={styles.summaryItem}>
                <Calendar size={12} color="#C7D2FE" />
                <Text style={styles.summaryText}>{project.duration}</Text>
              </View>
            ) : null}
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <TrendingUp size={13} color="#A5B4FC" />
                <Text style={styles.progressLabel}>
                  {approvedCount}/{milestones.length} milestones approved
                </Text>
              </View>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={["#818CF8", "#6366F1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${Math.max(progress, 2)}%` as any }]}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ── CONTENT ── */}
      <ScrollView
        style={styles.contentBody}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#444751" />}
      >
        {/* Description */}
        <Text style={styles.sectionTitle}>Project Overview</Text>
        <View style={styles.descCard}>
          <Text style={styles.descText}>{project.description}</Text>
        </View>

        {/* Milestones header */}
        <View style={styles.milestoneTitleRow}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          {isClient && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
              <Plus size={15} color="#FFF" />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {milestones.length === 0 ? (
          <View style={styles.emptyBox}>
            <AlertCircle size={30} color="#CBD5E1" />
            <Text style={styles.emptyText}>
              {isClient
                ? "Add milestones to track project progress."
                : "No milestones yet. Client will add them."}
            </Text>
          </View>
        ) : (
          milestones.map((milestone) => {
            const cfg = STATUS_CONFIG[milestone.status] ?? STATUS_CONFIG.pending;
            const isLoadingAction = (key: string) => actionLoading === `${milestone.id}_${key}`;

            return (
              <View
                key={milestone.id}
                style={[styles.milestoneCard, { borderLeftColor: cfg.border }]}
              >
                {/* Card header */}
                <View style={styles.milestoneHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    {milestone.dueDate ? (
                      <View style={styles.dueDateRow}>
                        <Calendar size={11} color="#94A3B8" />
                        <Text style={styles.dueDateText}>Due: {milestone.dueDate}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    {milestone.status === "approved"    && <CheckCircle size={11} color={cfg.color} />}
                    {milestone.status === "submitted"   && <Clock       size={11} color={cfg.color} />}
                    {milestone.status === "in_progress" && <PlayCircle  size={11} color={cfg.color} />}
                    {milestone.status === "pending"     && <AlertCircle size={11} color={cfg.color} />}
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>

                {milestone.description ? (
                  <Text style={styles.milestoneDesc}>{milestone.description}</Text>
                ) : null}

                {/* ── Freelancer actions ── */}
                {isFreelancer && milestone.status === "pending" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#444751" }]}
                    onPress={() => handleStart(milestone.id)}
                    disabled={isLoadingAction("start")}
                    activeOpacity={0.8}
                  >
                    {isLoadingAction("start") ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <PlayCircle size={15} color="#FFF" />
                        <Text style={styles.actionBtnText}>Start Working</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {isFreelancer && milestone.status === "in_progress" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#4F46E5" }]}
                    onPress={() => handleSubmit(milestone.id)}
                    disabled={isLoadingAction("submit")}
                    activeOpacity={0.8}
                  >
                    {isLoadingAction("submit") ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Send size={15} color="#FFF" />
                        <Text style={styles.actionBtnText}>Submit for Approval</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {isFreelancer && milestone.status === "submitted" && (
                  <View style={styles.awaitingBadge}>
                    <Clock size={14} color="#D97706" />
                    <Text style={styles.awaitingText}>Submitted — awaiting client review</Text>
                  </View>
                )}

                {/* ── Client actions ── */}
                {isClient && milestone.status === "submitted" && (
                  <View style={styles.clientActionRow}>
                    <TouchableOpacity
                      style={[styles.clientBtn, styles.approveBtn]}
                      onPress={() => handleApprove(milestone.id)}
                      disabled={isLoadingAction("approve")}
                      activeOpacity={0.8}
                    >
                      {isLoadingAction("approve") ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <CheckCircle size={14} color="#FFF" />
                          <Text style={styles.clientBtnText}>Approve</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.clientBtn, styles.changesBtn]}
                      onPress={() => openChangesModal(milestone.id)}
                      activeOpacity={0.8}
                    >
                      <AlertCircle size={14} color="#444751" />
                      <Text style={[styles.clientBtnText, { color: "#444751" }]}>
                        Request Changes
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Delete button (client, non-approved) */}
                {isClient && milestone.status !== "approved" && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(milestone.id, milestone.title)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={13} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── ADD MILESTONE MODAL (Client) ── */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Milestone</Text>

            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Design Mockups"
              placeholderTextColor="#94A3B8"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, { height: 80, textAlignVertical: "top" }]}
              placeholder="What needs to be delivered?"
              placeholderTextColor="#94A3B8"
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />

            <Text style={styles.inputLabel}>Due Date (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              value={newDueDate}
              onChangeText={setNewDueDate}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#F1F5F9" }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={{ color: "#475569", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#282A32", opacity: !newTitle.trim() ? 0.5 : 1 }]}
                onPress={handleAddMilestone}
                disabled={addingMilestone || !newTitle.trim()}
              >
                {addingMilestone
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={{ color: "#FFF", fontWeight: "700" }}>Add Milestone</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── REQUEST CHANGES MODAL (Client) ── */}
      <Modal visible={showChangesModal} transparent animationType="slide" onRequestClose={() => setShowChangesModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Request Changes</Text>
            <Text style={styles.modalSubtitle}>
              Describe what changes are needed. A message will be sent to the freelancer automatically.
            </Text>

            <TextInput
              style={[styles.textInput, { height: 110, textAlignVertical: "top" }]}
              placeholder="e.g. Please update the color scheme and adjust the font sizes…"
              placeholderTextColor="#94A3B8"
              value={changesMessage}
              onChangeText={setChangesMessage}
              multiline
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#F1F5F9" }]}
                onPress={() => setShowChangesModal(false)}
              >
                <Text style={{ color: "#475569", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#0F172A", opacity: !changesMessage.trim() ? 0.5 : 1 }]}
                onPress={handleRequestChanges}
                disabled={sendingChanges || !changesMessage.trim()}
              >
                {sendingChanges
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={{ color: "#FFF", fontWeight: "700" }}>Send Request</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#282A32" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC", gap: 12 },
  loadingText: { color: "#94A3B8", fontSize: 14, marginTop: 8 },
  goBackBtn: { marginTop: 16, backgroundColor: "#282A32", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  goBackText: { color: "#FFF", fontWeight: "700" },

  // Header
  darkHeader: { paddingHorizontal: 20, paddingBottom: 22, backgroundColor: "#282A32" },
  navRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 12 },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#32343D",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#444751",
  },
  headerTitle: { fontSize: 19, fontWeight: "800", color: "#F8FAFC", flex: 1 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 14, gap: 8 },
  summaryItem: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#32343D",
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: "#444751",
  },
  summaryText: { color: "#E2E8F0", fontSize: 12, fontWeight: "600" },

  // Progress
  progressContainer: { marginTop: 16 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  progressLabel: { fontSize: 12, color: "#A5B4FC", fontWeight: "600" },
  progressPercent: { fontSize: 14, color: "#818CF8", fontWeight: "800" },
  progressBarBg: { height: 7, backgroundColor: "#3B3E4A", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 4 },

  // Content
  contentBody: { flex: 1, backgroundColor: "#F8FAFC", borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B", marginBottom: 10 },
  descCard: {
    backgroundColor: "#FFF", padding: 16, borderRadius: 16, marginBottom: 22,
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  descText: { fontSize: 14, color: "#475569", lineHeight: 22 },

  // Milestone section header
  milestoneTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#282A32", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
  },
  addBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },

  emptyBox: { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyText: { color: "#94A3B8", fontSize: 14, textAlign: "center", maxWidth: 260, lineHeight: 20 },

  // Milestone card
  milestoneCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  milestoneHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  milestoneTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  dueDateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  dueDateText: { fontSize: 11, color: "#94A3B8" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  milestoneDesc: { fontSize: 13, color: "#64748B", lineHeight: 19, marginBottom: 10, marginTop: 4 },

  // Freelancer buttons
  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 12, borderRadius: 12, marginTop: 6,
  },
  actionBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  awaitingBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 8, paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: "#FFFBEB", borderRadius: 10,
    borderWidth: 1, borderColor: "#FDE68A",
  },
  awaitingText: { color: "#D97706", fontSize: 13, fontWeight: "600" },

  // Client buttons
  clientActionRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  clientBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    paddingVertical: 11, borderRadius: 12,
  },
  approveBtn: { backgroundColor: "#16A34A" },
  changesBtn: { backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0" },
  clientBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },

  deleteBtn: { position: "absolute", top: 14, right: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 44,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: "#64748B", marginBottom: 16, lineHeight: 20 },
  inputLabel: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 6 },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: "#1E293B", marginBottom: 14,
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 6 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});
