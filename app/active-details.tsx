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
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatCurrency } from "@/utils/helpers";
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
  Lock,
  ShieldCheck,
  Ban,
  Star,
  Github,
  ExternalLink,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { projectService, milestoneService } from "@/services/projectService";
import { chatService } from "@/services/chatService";
import { reviewService } from "@/services/reviewService";
import { useAuth } from "@/contexts/AuthContext";
import { Project, Milestone } from "@/models/Project";

// ── Status display config ────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label: "Open",                color: "#475569", bg: "#F8FAFC", border: "#CBD5E1" },
  funded:      { label: "Funded",              color: "#0891B2", bg: "#ECFEFF", border: "#67E8F9" },
  in_progress: { label: "In Progress",         color: "#4F46E5", bg: "#EEF2FF", border: "#818CF8" },
  in_review:   { label: "In Review",           color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
  submitted:   { label: "Awaiting Approval",   color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
  approved:    { label: "Accepted",            color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
  released:    { label: "Accepted",            color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
  disputed:    { label: "Disputed",            color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
  changes_requested: { label: "Changes Requested", color: "#B45309", bg: "#FFFBEB", border: "#F59E0B" },
  rejected:    { label: "Rejected",            color: "#B91C1C", bg: "#FEF2F2", border: "#FCA5A5" },
};

// Returns a string like "3d 4h 12m" or "Expired" from a deadline ISO string
function formatCountdown(deadlineIso: string): string {
  const diff = new Date(deadlineIso).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

function normalizeRouteId(raw: string | string[] | undefined): string | undefined {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

export default function ActiveDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = normalizeRouteId(params.id);
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [localRejectionMessages, setLocalRejectionMessages] = useState<Record<string, string>>({});
  const [chatRejectionMessages, setChatRejectionMessages] = useState<Record<string, string>>({});

  // countdown tick (re-renders once per minute for review timers)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Add milestone modal (Client)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);

  // Request changes modal (Client)
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [changesMessage, setChangesMessage] = useState("");
  const [sendingChanges, setSendingChanges] = useState(false);

  // Submit modal (Freelancer)
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitMilestoneId, setSubmitMilestoneId] = useState<string | null>(null);
  const [submitGithubUrl, setSubmitGithubUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Review modal (Client, shown after milestone approval)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewFreelancerId, setReviewFreelancerId] = useState<string | null>(null);

  const roleLower = (user?.role || "").toLowerCase();
  const isClient = roleLower === "client";
  const isFreelancer = roleLower === "freelancer";

  const fetchData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const [projectData, milestonesData] = await Promise.all([
        projectService.getProjectById(id),
        milestoneService.getMilestones(id),
      ]);
      setProject(projectData);
      setMilestones(milestonesData);

      // Backend currently sends rejection reason in chat, not on milestone payload.
      // Recover latest "changes requested" messages from project chat for freelancer view.
      if (isFreelancer && projectData?.client?.id) {
        try {
          const chatMessages = await chatService.getMessages(projectData.client.id, projectData.id, 120, 0);
          const nextMap: Record<string, string> = {};
          const byTitle = new Map<string, string>();

          chatMessages.forEach((msg) => {
            const text = String(msg?.message || "");
            const match = text.match(/changes requested for milestone\s+"([^"]+)"\s*:\s*(.+)$/i);
            if (match) {
              const title = match[1]?.trim().toLowerCase();
              const reason = match[2]?.trim();
              if (title && reason && !byTitle.has(title)) {
                byTitle.set(title, reason);
              }
            }
          });

          milestonesData.forEach((m) => {
            const reason = byTitle.get(String(m.title || "").trim().toLowerCase());
            if (reason) nextMap[m.id] = reason;
          });

          setChatRejectionMessages(nextMap);
        } catch {
          setChatRejectionMessages({});
        }
      } else {
        setChatRejectionMessages({});
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load project");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, isFreelancer]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getRejectionMessage = (milestone: Milestone): string | undefined => {
    const fromApi = (
      milestone.changeRequestMessage ||
      milestone.rejectionReason ||
      milestone.feedback ||
      (milestone as any).requestChangesMessage ||
      (milestone as any).clientFeedback ||
      (milestone as any).changesMessage
    );
    const normalized = typeof fromApi === "string" ? fromApi.trim() : "";
    if (normalized) return normalized;
    if (chatRejectionMessages[milestone.id]) return chatRejectionMessages[milestone.id];
    return localRejectionMessages[milestone.id];
  };

  // ── Freelancer: Open submit modal ─────────────────────────────
  const handleSubmit = (milestoneId: string) => {
    setSubmitMilestoneId(milestoneId);
    setSubmitGithubUrl("");
    setShowSubmitModal(true);
  };

  /** Submit allowed for pending / funded / in_progress (client already paid platform). */
  const handleBeginSubmitWork = (milestoneId: string) => {
    const m = milestones.find((x) => x.id === milestoneId);
    if (!m) return;
    const rejectedMessage = getRejectionMessage(m);
    if (m.status === "pending" || m.status === "funded" || m.status === "in_progress") {
      handleSubmit(milestoneId);
      return;
    }
    if ((m.status === "in_review" || m.status === "submitted") && rejectedMessage) {
      handleSubmit(milestoneId);
      return;
    }
    if (m.status === "in_review" || m.status === "submitted") {
      Alert.alert("Already submitted", "Wait for the client to accept or reject.");
      return;
    }
    Alert.alert("Cannot submit", "This milestone cannot be submitted in its current state.");
  };

  // ── Freelancer: Confirm submit with GitHub URL ─────────────────
  const handleConfirmSubmit = async () => {
    if (!submitMilestoneId) return;
    const url = submitGithubUrl.trim();
    if (url && !/^https?:\/\/(www\.)?github\.com\/.+/.test(url)) {
      Alert.alert("Invalid URL", "Please enter a valid GitHub URL (https://github.com/...)");
      return;
    }
    try {
      setSubmitting(true);
      const updated = await milestoneService.submitMilestone(submitMilestoneId, url || undefined);
      setMilestones((prev) => prev.map((m) => (m.id === submitMilestoneId ? updated : m)));
      setLocalRejectionMessages((prev) => {
        const next = { ...prev };
        delete next[submitMilestoneId];
        return next;
      });
      setShowSubmitModal(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit milestone");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Client: Approve ────────────────────────────────────────────
  const handleApprove = async (milestoneId: string) => {
    try {
      setActionLoading(milestoneId + "_approve");
      const result = await milestoneService.approveMilestone(milestoneId);
      setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? result.milestone : m)));
      setProject((prev) => prev ? { ...prev, progress: result.progress } : prev);
      // Prompt client to leave a review for the freelancer
      if (project?.freelancer?.id) {
        setReviewFreelancerId(project.freelancer.id);
        setReviewRating(0);
        setReviewComment('');
        setShowReviewModal(true);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to accept milestone");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Client: Submit Review ──────────────────────────────────────
  const handleSubmitReview = async () => {
    if (!project || !reviewFreelancerId || reviewRating === 0) return;
    try {
      setReviewLoading(true);
      await reviewService.createReview({
        projectId: project.id,
        revieweeId: reviewFreelancerId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setShowReviewModal(false);
      Alert.alert('Thank you!', 'Your review has been submitted.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
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
      setLocalRejectionMessages((prev) => ({
        ...prev,
        [selectedMilestoneId]: changesMessage.trim(),
      }));
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
    const parsedAmount = parseFloat(newAmount);
    if (newAmount && (isNaN(parsedAmount) || parsedAmount <= 0)) {
      Alert.alert("Error", "Amount must be a positive number");
      return;
    }
    try {
      setAddingMilestone(true);
      const milestone = await milestoneService.createMilestone(project.id, {
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        dueDate: newDueDate.trim() || undefined,
        orderIndex: milestones.length,
        amount: newAmount ? parsedAmount : undefined,
      });
      setMilestones((prev) => [...prev, milestone]);
      setShowAddModal(false);
      setNewTitle(""); setNewDesc(""); setNewDueDate(""); setNewAmount("");
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
        onPress: () => deleteMilestone(milestoneId),
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

  // ── Loading / Error ────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#444751" />
        <Text style={styles.loadingText}>Loading project…</Text>
      </View>
    );
  }

  if (!id) {
    return (
      <View style={styles.centered}>
        <AlertCircle size={40} color="#CBD5E1" />
        <Text style={{ color: "#64748B", marginTop: 12, textAlign: "center", paddingHorizontal: 24 }}>
          Missing project id. Use a link like /active-details?id=YOUR_PROJECT_ID
        </Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
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
  const doneCount = milestones.filter((m) => m.status === "released" || m.status === "approved").length;
  const otherUser = isClient ? project.freelancer : project.client;

  const canDelete = (status: Milestone["status"]) =>
    status === "pending"; // only delete unfunded milestones

  const isInReview = (status: Milestone["status"]) =>
    status === "in_review" || status === "submitted";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── DARK HEADER ── */}
      <View style={styles.darkHeader}>
        <SafeAreaView>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(tabs)/my-work")}>
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
              <Text style={styles.summaryText}>{formatCurrency(project.budget, project.currency || 'USD')}</Text>
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
                  {doneCount}/{milestones.length} milestones released
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

        {user && !isClient && !isFreelancer ? (
          <Text style={styles.roleHintPlain}>Sign in as the freelancer or client for this project.</Text>
        ) : null}

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
            const rejectionMessage = getRejectionMessage(milestone);
            const canResubmit =
              milestone.status === "pending" ||
              milestone.status === "funded" ||
              milestone.status === "in_progress" ||
              ((milestone.status === "in_review" || milestone.status === "submitted") && !!rejectionMessage);

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
                    {/* Escrow amount badge */}
                    {milestone.amount ? (
                      <View style={styles.amountRow}>
                        <DollarSign size={11} color="#0891B2" />
                        <Text style={styles.amountText}>
                          ${milestone.amount.toFixed(2)} milestone amount
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                    {milestone.status === "released" || milestone.status === "approved"
                      ? <CheckCircle size={11} color={cfg.color} />
                      : milestone.status === "in_review" || milestone.status === "submitted"
                      ? <Clock size={11} color={cfg.color} />
                      : milestone.status === "in_progress"
                      ? <PlayCircle size={11} color={cfg.color} />
                      : milestone.status === "funded"
                      ? <Lock size={11} color={cfg.color} />
                      : milestone.status === "disputed"
                      ? <Ban size={11} color={cfg.color} />
                      : <AlertCircle size={11} color={cfg.color} />
                    }
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>

                {milestone.description ? (
                  <Text style={styles.milestoneDesc}>{milestone.description}</Text>
                ) : null}

                {/* GitHub link (shown when submitted) */}
                {milestone.submissionGithubUrl && isInReview(milestone.status) && (
                  <TouchableOpacity
                    style={styles.githubLinkRow}
                    onPress={() => Linking.openURL(milestone.submissionGithubUrl!)}
                    activeOpacity={0.7}
                  >
                    <Github size={13} color="#1E293B" />
                    <Text style={styles.githubLinkText} numberOfLines={1}>{milestone.submissionGithubUrl}</Text>
                    <ExternalLink size={12} color="#94A3B8" />
                  </TouchableOpacity>
                )}

                {/* Review countdown (for in_review milestones) */}
                {isInReview(milestone.status) && milestone.reviewDeadline ? (
                  <View style={styles.countdownBadge}>
                    <Clock size={13} color="#D97706" />
                    <Text style={styles.countdownText}>
                      Auto-release: {formatCountdown(milestone.reviewDeadline)}
                    </Text>
                  </View>
                ) : null}

                {/* Disputed notice */}
                {milestone.status === "disputed" && (
                  <View style={styles.disputedBadge}>
                    <Ban size={13} color="#DC2626" />
                    <Text style={styles.disputedText}>Funds frozen — dispute in progress</Text>
                  </View>
                )}

                {/* Freelancer-visible rejection feedback */}
                {isFreelancer && rejectionMessage ? (
                  <View style={styles.rejectionNoteBadge}>
                    <AlertCircle size={13} color="#B91C1C" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rejectionNoteTitle}>Client rejected this submission</Text>
                      <Text style={styles.rejectionNoteText}>{rejectionMessage}</Text>
                    </View>
                  </View>
                ) : null}

                {/* ── Client: pending but no amount — optional nudge ── */}
                {isClient && milestone.status === "pending" && (!milestone.amount || milestone.amount <= 0) && (
                  <Text style={styles.noAmountHint}>Optional: set a milestone amount for reference.</Text>
                )}

                {/* ── Client: Accept / Reject (submitted work) ── */}
                {isClient && isInReview(milestone.status) && (
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
                          <ShieldCheck size={14} color="#FFF" />
                          <Text style={styles.clientBtnText}>Accept</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.clientBtn, styles.changesBtn]}
                      onPress={() => openChangesModal(milestone.id)}
                      activeOpacity={0.8}
                    >
                      <AlertCircle size={14} color="#444751" />
                      <Text style={[styles.clientBtnText, { color: "#444751" }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* ── Freelancer: submit milestone (client already paid platform) ── */}
                {isFreelancer && canResubmit && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#4F46E5" }]}
                    onPress={() => handleBeginSubmitWork(milestone.id)}
                    activeOpacity={0.8}
                  >
                    <>
                      <Send size={15} color="#FFF" />
                      <Text style={styles.actionBtnText}>Submit milestone</Text>
                    </>
                  </TouchableOpacity>
                )}

                {/* ── Freelancer: awaiting review ── */}
                {isFreelancer && isInReview(milestone.status) && !rejectionMessage && (
                  <View style={styles.awaitingBadge}>
                    <Clock size={14} color="#D97706" />
                    <Text style={styles.awaitingText}>Submitted — awaiting client review</Text>
                  </View>
                )}

                {/* ── Freelancer: payment pending admin release ── */}
                {isFreelancer && (milestone.status === "released" || milestone.status === "approved") && (
                  <View style={styles.adminPendingBadge}>
                    <DollarSign size={14} color="#4F46E5" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.adminPendingTitle}>Payment Pending Admin Release</Text>
                      <Text style={styles.adminPendingDesc}>Email sent to admin — you will be contacted once payment is processed.</Text>
                    </View>
                  </View>
                )}

                {/* ── Delete button (client, only on unfunded milestones) ── */}
                {isClient && canDelete(milestone.status) && (
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

      {/* ── SUBMIT MILESTONE MODAL (Freelancer) ── */}
      <Modal visible={showSubmitModal} transparent animationType="slide" onRequestClose={() => setShowSubmitModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit milestone</Text>
            <Text style={styles.modalSubtitle}>
              Optional GitHub link. The client will accept or reject. The platform owner is emailed to pay you.
            </Text>

            <Text style={styles.inputLabel}>GitHub URL (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://github.com/your-repo/..."
              placeholderTextColor="#94A3B8"
              value={submitGithubUrl}
              onChangeText={setSubmitGithubUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#F1F5F9" }]}
                onPress={() => setShowSubmitModal(false)}
              >
                <Text style={{ color: "#475569", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#4F46E5" }]}
                onPress={handleConfirmSubmit}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={{ color: "#FFF", fontWeight: "700" }}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

            <Text style={styles.inputLabel}>Amount ($)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 500"
              placeholderTextColor="#94A3B8"
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="decimal-pad"
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

      {/* ── REVIEW MODAL (Client, after milestone approval) ── */}
      <Modal visible={showReviewModal} transparent animationType="slide" onRequestClose={() => setShowReviewModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Your Experience</Text>
            <Text style={styles.modalSubtitle}>
              How was working with this freelancer? Your feedback helps the community.
            </Text>

            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Star
                    size={36}
                    color={star <= reviewRating ? "#F59E0B" : "#CBD5E1"}
                    fill={star <= reviewRating ? "#F59E0B" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Comment (optional)</Text>
            <TextInput
              style={[styles.textInput, { height: 100, textAlignVertical: "top" }]}
              placeholder="Share your experience with this freelancer..."
              placeholderTextColor="#94A3B8"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#F1F5F9" }]}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={{ color: "#475569", fontWeight: "700" }}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#F59E0B", opacity: reviewRating === 0 ? 0.5 : 1 }]}
                onPress={handleSubmitReview}
                disabled={reviewLoading || reviewRating === 0}
              >
                {reviewLoading
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={{ color: "#FFF", fontWeight: "700" }}>Submit Review</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── REJECT MILESTONE MODAL (Client) ── */}
      <Modal visible={showChangesModal} transparent animationType="slide" onRequestClose={() => setShowChangesModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject milestone</Text>
            <Text style={styles.modalSubtitle}>
              Tell the freelancer why this submission is rejected. They can submit again after making updates.
            </Text>

            <TextInput
              style={[styles.textInput, { height: 110, textAlignVertical: "top" }]}
              placeholder="Reason for rejection…"
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
                style={[styles.modalBtn, { backgroundColor: "#B91C1C", opacity: !changesMessage.trim() ? 0.5 : 1 }]}
                onPress={handleRequestChanges}
                disabled={sendingChanges || !changesMessage.trim()}
              >
                {sendingChanges
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Text style={{ color: "#FFF", fontWeight: "700" }}>Confirm reject</Text>}
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
  roleHintPlain: { color: "#64748B", fontSize: 14, textAlign: "center", lineHeight: 20, paddingHorizontal: 24 },

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
  amountRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  amountText: { fontSize: 11, color: "#0891B2", fontWeight: "700" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  milestoneDesc: { fontSize: 13, color: "#64748B", lineHeight: 19, marginBottom: 10, marginTop: 4 },

  // GitHub link
  githubLinkRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 8, paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: "#F8FAFC", borderRadius: 10,
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  githubLinkText: { flex: 1, fontSize: 12, color: "#1E293B", fontWeight: "600" },

  // Countdown
  countdownBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 8, paddingVertical: 7, paddingHorizontal: 12,
    backgroundColor: "#FFFBEB", borderRadius: 10,
    borderWidth: 1, borderColor: "#FDE68A",
  },
  countdownText: { color: "#D97706", fontSize: 12, fontWeight: "600" },

  // Disputed
  disputedBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 8, paddingVertical: 7, paddingHorizontal: 12,
    backgroundColor: "#FEF2F2", borderRadius: 10,
    borderWidth: 1, borderColor: "#FCA5A5",
  },
  disputedText: { color: "#DC2626", fontSize: 12, fontWeight: "600" },
  rejectionNoteBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  rejectionNoteTitle: { color: "#B91C1C", fontSize: 12, fontWeight: "800", marginBottom: 2 },
  rejectionNoteText: { color: "#991B1B", fontSize: 12, lineHeight: 17 },

  // No amount hint
  noAmountHint: { fontSize: 12, color: "#94A3B8", fontStyle: "italic", marginTop: 8 },

  // Action buttons (freelancer)
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

  adminPendingBadge: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    marginTop: 10, paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: "#EEF2FF", borderRadius: 10,
    borderWidth: 1, borderColor: "#818CF8",
  },
  adminPendingTitle: { color: "#4F46E5", fontSize: 13, fontWeight: "700", marginBottom: 2 },
  adminPendingDesc: { color: "#6366F1", fontSize: 11, lineHeight: 16 },

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
  starRow: { flexDirection: "row", gap: 14, justifyContent: "center", marginVertical: 20 },
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
