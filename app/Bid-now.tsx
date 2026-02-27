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
  ArrowLeft, ChevronDown, ChevronUp, CheckCircle,
  Calendar, Plus, Minus, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react-native";
import { projectService, proposalService } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@/models/Project";
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getDaysInMonth = (month: number, year: number) =>
  new Date(year, month + 1, 0).getDate();

// ─── DateField ────────────────────────────────────────────────────────────────

interface DateFieldProps {
  value: string;          // stored as "YYYY-MM-DD"
  onChange: (v: string) => void;
  placeholder?: string;
}

function DateField({ value, onChange, placeholder = "Due date" }: DateFieldProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const [open, setOpen] = useState(false);
  const [pMonth, setPMonth] = useState(today.getMonth());
  const [pDay,   setPDay]   = useState(today.getDate());
  const [pYear,  setPYear]  = useState(currentYear);

  const openPicker = () => {
    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      setPYear(y  || currentYear);
      setPMonth((m || 1) - 1);
      setPDay(d   || 1);
    } else {
      setPMonth(today.getMonth());
      setPDay(today.getDate());
      setPYear(currentYear);
    }
    setOpen(true);
  };

  const displayDate = value
    ? (() => {
        const [y, m, d] = value.split("-").map(Number);
        return `${String(d).padStart(2, "0")} ${MONTHS[(m || 1) - 1]?.slice(0, 3)} ${y}`;
      })()
    : "";

  const adjustMonth = (dir: 1 | -1) => setPMonth(m => (m + dir + 12) % 12);

  const adjustDay = (dir: 1 | -1) => {
    const max = getDaysInMonth(pMonth, pYear);
    setPDay(d => { let n = d + dir; return n < 1 ? max : n > max ? 1 : n; });
  };

  const adjustYear = (dir: 1 | -1) =>
    setPYear(y => {
      const n = y + dir;
      return n < currentYear ? currentYear : n > currentYear + 10 ? currentYear + 10 : n;
    });

  const handleDone = () => {
    const d = Math.min(pDay, getDaysInMonth(pMonth, pYear));
    onChange(`${pYear}-${String(pMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity style={df.field} onPress={openPicker} activeOpacity={0.75}>
        <Calendar size={14} color={displayDate ? "#444751" : "#94A3B8"} />
        <Text style={[df.fieldText, !displayDate && df.placeholder]} numberOfLines={1}>
          {displayDate || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={df.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={df.card}>
            <Text style={df.title}>Select Due Date</Text>

            {([
              { label: "Month", display: MONTHS[pMonth], onPrev: () => adjustMonth(-1), onNext: () => adjustMonth(1) },
              { label: "Day",   display: String(pDay).padStart(2, "0"), onPrev: () => adjustDay(-1), onNext: () => adjustDay(1) },
              { label: "Year",  display: String(pYear), onPrev: () => adjustYear(-1), onNext: () => adjustYear(1) },
            ] as const).map(row => (
              <View key={row.label} style={df.pickerRow}>
                <Text style={df.rowLabel}>{row.label}</Text>
                <View style={df.controls}>
                  <TouchableOpacity style={df.arrowBtn} onPress={row.onPrev}>
                    <ChevronLeft size={18} color="#444751" />
                  </TouchableOpacity>
                  <Text style={df.pickerValue}>{row.display}</Text>
                  <TouchableOpacity style={df.arrowBtn} onPress={row.onNext}>
                    <ChevronRight size={18} color="#444751" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={df.footer}>
              <TouchableOpacity style={df.cancelBtn} onPress={() => setOpen(false)}>
                <Text style={df.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={df.doneBtn} onPress={handleDone}>
                <Text style={df.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type BidType = "milestone" | "project";

interface MilestoneRow {
  id: string;
  description: string;
  dueDate: string;
  amount: string;
}

// ─── Split helper ─────────────────────────────────────────────────────────────

function distributeEqually(list: MilestoneRow[], total: number): MilestoneRow[] {
  if (total <= 0 || list.length === 0) return list;
  const base = Math.floor((total / list.length) * 100) / 100;
  const last = parseFloat((total - base * (list.length - 1)).toFixed(2));
  return list.map((m, i) => ({
    ...m,
    amount: i === list.length - 1 ? String(last) : String(base),
  }));
}

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

  const [bidType, setBidType]               = useState<BidType>("milestone");
  const [projectAmount, setProjectAmount]   = useState<string>("");
  const [milestones, setMilestones]         = useState<MilestoneRow[]>([
    { id: "1", description: "Down Payment", dueDate: "", amount: "" },
  ]);
  const [coverLetter, setCoverLetter]       = useState<string>("");

  // Fetch project
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await projectService.getProjectById(id);
        setProject(data || null);
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Auto-split when project loads (pre-fill the single starting milestone)
  useEffect(() => {
    if (project?.budget && project.budget > 0) {
      setMilestones(prev => distributeEqually(prev, project.budget));
    }
  }, [project]);

  // ── Milestone actions ──────────────────────────────────────────────────────

  const addMilestone = () => {
    const budget = project?.budget || 0;
    setMilestones(prev => {
      const next = [...prev, { id: Date.now().toString(), description: "", dueDate: "", amount: "" }];
      return budget > 0 ? distributeEqually(next, budget) : next;
    });
  };

  const removeMilestone = (removeId: string) => {
    const budget = project?.budget || 0;
    setMilestones(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter(m => m.id !== removeId);
      return budget > 0 ? distributeEqually(next, budget) : next;
    });
  };

  const removeLastMilestone = () => {
    setMilestones(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      const budget = project?.budget || 0;
      return budget > 0 ? distributeEqually(next, budget) : next;
    });
  };

  const updateMilestone = (milestoneId: string, field: keyof MilestoneRow, value: string) =>
    setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, [field]: value } : m));

  const handleSplitEqually = () => {
    const budget = project?.budget || 0;
    if (budget > 0) {
      setMilestones(prev => distributeEqually(prev, budget));
    }
  };

  // ── Total ──────────────────────────────────────────────────────────────────

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

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!id) return Alert.alert("Error", "Missing project ID");
    const total = getTotalAmount();
    if (total <= 0)           return Alert.alert("Error", "Please enter a valid bid amount");
    if (!coverLetter.trim())  return Alert.alert("Error", "Please write a cover letter");
    if (!user || user.role !== "Freelancer")
      return Alert.alert("Error", "Only freelancers can submit proposals");

    try {
      setSubmitting(true);
      await proposalService.createProposal(id, {
        coverLetter: coverLetter.trim(),
        bidAmount: total,
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

  const total = getTotalAmount();
  const hasBudget = (project?.budget || 0) > 0;

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
                    <Text style={styles.detailsGridValue}>${project.budget}</Text>
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

        {/* Bid type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Bid</Text>
          <View style={styles.radioGroupRow}>
            {(["milestone", "project"] as const).map(type => (
              <TouchableOpacity key={type} style={styles.radioRow} onPress={() => setBidType(type)}>
                <View style={[styles.radioOuter, bidType === type && styles.radioOuterSelected]}>
                  <View style={[styles.radioInner, bidType === type && styles.radioInnerSelected]} />
                </View>
                <Text style={[styles.radioLabel, bidType !== type && styles.radioLabelMuted]}>
                  {type === "milestone" ? "By milestone" : "By project"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.bidDesc}>
            Divide the project into smaller segments, called milestones. You'll be paid for each
            milestone as it is completed and approved.
          </Text>
        </View>

        {/* ─── Milestone mode ───────────────────────────────────────────── */}
        {bidType === "milestone" ? (
          <View style={styles.section}>

            {/* Section header + Split Equally */}
            <View style={styles.milestoneSectionHeader}>
              <Text style={styles.sectionTitle}>Project Milestones</Text>
              {hasBudget && (
                <TouchableOpacity style={styles.splitEquallyBtn} onPress={handleSplitEqually}>
                  <Text style={styles.splitEquallyText}>⟺ Split Equally</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Budget hint */}
            {hasBudget && (
              <View style={styles.budgetHint}>
                <DollarSign size={13} color="#4F46E5" />
                <Text style={styles.budgetHintText}>
                  Project budget: <Text style={styles.budgetHintBold}>${project!.budget}</Text>
                  {"  ·  "}
                  {milestones.length} milestone{milestones.length !== 1 ? "s" : ""}
                  {"  ·  "}
                  <Text style={styles.budgetHintBold}>${(project!.budget / milestones.length).toFixed(2)}</Text> each
                </Text>
              </View>
            )}

            {/* Milestone cards */}
            {milestones.map((m, index) => (
              <View key={m.id} style={styles.milestoneCard}>

                {/* Card header */}
                <View style={styles.milestoneCardHeader}>
                  <View style={styles.milestoneBadge}>
                    <Text style={styles.milestoneBadgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.milestoneCardTitle}>Milestone {index + 1}</Text>
                  {milestones.length > 1 && (
                    <TouchableOpacity
                      style={styles.milestoneDeleteBtn}
                      onPress={() => removeMilestone(m.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Description */}
                <TextInput
                  style={[styles.input, styles.milestoneDescInput]}
                  placeholder="What will be delivered in this milestone?"
                  placeholderTextColor="#94A3B8"
                  value={m.description}
                  onChangeText={v => updateMilestone(m.id, "description", v)}
                />

                {/* Due Date + Amount */}
                <View style={styles.milestoneRow}>
                  <View style={styles.milestoneDateWrapper}>
                    <DateField
                      value={m.dueDate}
                      onChange={d => updateMilestone(m.id, "dueDate", d)}
                    />
                  </View>
                  <View style={styles.milestoneAmountWrapper}>
                    <View style={styles.amountInputWrapper}>
                      <Text style={styles.amountPrefix}>$</Text>
                      <TextInput
                        style={styles.amountInput}
                        placeholder="0.00"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={m.amount}
                        onChangeText={v => updateMilestone(m.id, "amount", v)}
                      />
                    </View>
                  </View>
                </View>

              </View>
            ))}

            {/* Add / Remove buttons */}
            <View style={styles.milestoneActionsRow}>
              <TouchableOpacity style={styles.addMilestoneBtn} onPress={addMilestone}>
                <Plus size={16} color="#282A32" strokeWidth={2.5} />
                <Text style={styles.addMilestoneText}>Add</Text>
              </TouchableOpacity>

              {milestones.length > 1 && (
                <TouchableOpacity style={styles.removeMilestoneBtn} onPress={removeLastMilestone}>
                  <Minus size={16} color="#EF4444" strokeWidth={2.5} />
                  <Text style={styles.removeMilestoneText}>Remove Last</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Running total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Bid</Text>
              <Text style={styles.totalValue}>
                ${total.toFixed(2)}
              </Text>
            </View>

          </View>

        ) : (

          /* ─── Project mode ─────────────────────────────────────────────── */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bid Amount (USD)</Text>
            {hasBudget && (
              <Text style={styles.budgetRef}>Project budget: ${project!.budget}</Text>
            )}
            <View style={styles.amountInputWrapper}>
              <Text style={styles.amountPrefix}>$</Text>
              <TextInput
                style={[styles.amountInput, { flex: 1 }]}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={projectAmount}
                onChangeText={setProjectAmount}
              />
            </View>
          </View>
        )}

        {/* Cover Letter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <TextInput
            style={[styles.input, styles.coverLetterInput]}
            placeholder="Write your cover letter here…"
            placeholderTextColor="#94A3B8"
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            textAlignVertical="top"
          />
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

// ─── DateField styles ─────────────────────────────────────────────────────────

const df = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 11,
    backgroundColor: "#F8FAFC",
    flex: 1,
  },
  fieldText: { fontSize: 14, color: "#282A32", fontWeight: "500", flex: 1 },
  placeholder: { color: "#94A3B8", fontWeight: "400" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16 },
      android: { elevation: 10 },
    }),
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 20,
    textAlign: "center",
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    width: 52,
    letterSpacing: 0.3,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    gap: 12,
  },
  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    minWidth: 80,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "700", color: "#64748B" },
  doneBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#282A32",
    justifyContent: "center",
    alignItems: "center",
  },
  doneText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
});

// ─── Main styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },

  // Header
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

  // Apply-to card
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

  // Sections
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B" },
  budgetRef: { fontSize: 13, color: "#64748B", marginTop: 4, marginBottom: 10 },

  // Bid type
  radioGroupRow: { flexDirection: "row", alignItems: "center", gap: 24, marginTop: 12, marginBottom: 10 },
  radioRow: { flexDirection: "row", alignItems: "center" },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#CBD5E1", justifyContent: "center", alignItems: "center", marginRight: 8 },
  radioOuterSelected: { borderColor: "#282A32" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "transparent" },
  radioInnerSelected: { backgroundColor: "#282A32" },
  radioLabel: { fontSize: 15, color: "#1E293B", fontWeight: "600" },
  radioLabelMuted: { color: "#94A3B8" },
  bidDesc: { fontSize: 13, color: "#94A3B8", lineHeight: 19 },

  // Milestone section header
  milestoneSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  splitEquallyBtn: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  splitEquallyText: { fontSize: 12, fontWeight: "700", color: "#4F46E5" },

  // Budget hint
  budgetHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F0EEFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  budgetHintText: { fontSize: 12, color: "#6D28D9", fontWeight: "500" },
  budgetHintBold: { fontWeight: "800" },

  // Milestone cards
  milestoneCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  milestoneCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  milestoneBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#282A32",
    justifyContent: "center", alignItems: "center",
  },
  milestoneBadgeText: { fontSize: 11, fontWeight: "800", color: "#FFF" },
  milestoneCardTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B", flex: 1 },
  milestoneDeleteBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: "#FEF2F2",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#FECACA",
  },

  milestoneDescInput: { marginBottom: 10 },
  milestoneRow: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  milestoneDateWrapper: { flex: 1.2 },
  milestoneAmountWrapper: { flex: 1 },

  // Amount input
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F8FAFC",
    height: 44,
  },
  amountPrefix: { fontSize: 14, fontWeight: "700", color: "#64748B", marginRight: 4 },
  amountInput: {
    fontSize: 14,
    color: "#282A32",
    fontWeight: "600",
    flex: 1,
    paddingVertical: 0,
    borderWidth: 0,
    outlineStyle: "none" as any,
  },

  // Add / Remove action buttons
  milestoneActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  addMilestoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
  },
  addMilestoneText: { fontSize: 13, fontWeight: "700", color: "#282A32" },
  removeMilestoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFF5F5",
    borderWidth: 1.5,
    borderColor: "#FECACA",
    borderStyle: "dashed",
  },
  removeMilestoneText: { fontSize: 13, fontWeight: "700", color: "#EF4444" },

  // Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  totalLabel: { fontSize: 13, color: "#94A3B8", fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  totalValue: { fontSize: 20, color: "#FFF", fontWeight: "800" },

  // Shared input
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    fontSize: 14,
    color: "#1E293B",
  },
  coverLetterInput: { height: 120, paddingTop: 12, textAlignVertical: "top" },

  // Submit
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

  // Success modal
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
