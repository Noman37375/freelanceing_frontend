import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, DollarSign, User, TrendingUp, ListChecks } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, TYPOGRAPHY, GRADIENTS } from "@/constants/theme";
import { getProjectDisplayStatus, type Project } from "@/models/Project";

function milestonePhaseLabel(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "Open";
  if (s === "funded") return "Funded";
  if (s === "in_progress") return "In progress";
  if (s === "in_review" || s === "submitted") return "Submitted · awaiting client";
  if (s === "approved" || s === "released") return "Accepted";
  if (s === "disputed") return "Disputed";
  return status || "—";
}

function milestonePaymentLine(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "released" || s === "approved") {
    return "Accepted — platform pays freelancer";
  }
  if (s === "in_review" || s === "submitted") {
    return "Awaiting client accept or reject";
  }
  if (s === "pending") {
    return "Open — submit milestone from project";
  }
  if (s === "funded" || s === "in_progress") {
    return "Submit milestone when ready";
  }
  return "—";
}

export default function WorkCard({ project, type }: { project: any, type: string }) {
  const router = useRouter();

  const handlePress = () => {
    if (type === "active" || type === "inProgress") {
      router.push({ pathname: "/active-details", params: { id: project.id } });
    } else if (type === "completed") {
      router.push({ pathname: "/completed-details", params: { id: project.id } });
    } else if (type === "proposals") {
      router.push({ pathname: "/proposal-details", params: { id: project.id } });
    }
  };

  const progress = project.progress || 0;

  // Status Badge Logic
  let statusColor = "#64748B";
  let statusBg = "#F1F5F9";
  let statusText = project.status;
  let statusGradient = ['#F1F5F9', '#E2E8F0'];

  if (project.status === 'inProgress' || type === 'active') {
    statusColor = "#282A32";
    statusBg = "#EFF6FF";
    statusText = "In Progress";
    statusGradient = ['#DBEAFE', '#BFDBFE'];
  } else if (project.status === 'completed' || type === 'completed') {
    statusColor = "#16A34A";
    statusBg = "#DCFCE7";
    statusText = "Completed";
    statusGradient = ['#DCFCE7', '#BBF7D0'];
  } else if (type === 'proposals') {
    if (project.proposalStatus === 'Accepted') {
      statusColor = "#16A34A";
      statusBg = "#DCFCE7";
      statusText = "Accepted";
      statusGradient = ['#DCFCE7', '#BBF7D0'];
    } else if (project.proposalStatus === 'Rejected') {
      statusColor = "#DC2626";
      statusBg = "#FEE2E2";
      statusText = "Rejected";
      statusGradient = ['#FEE2E2', '#FECACA'];
    } else {
      statusColor = "#EA580C";
      statusBg = "#FFEDD5";
      statusText = "Pending";
      statusGradient = ['#FFEDD5', '#FED7AA'];
    }
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
          <View style={styles.clientRow}>
            <User size={12} color="#94A3B8" />
            <Text style={styles.client}>{project.client}</Text>
          </View>
          {(type === "active" || type === "completed") && project.projectStatus ? (
            <Text style={styles.projectStatusLine}>
              Project status:{" "}
              {getProjectDisplayStatus({ status: project.projectStatus } as Project)}
            </Text>
          ) : null}
        </View>
        <LinearGradient
          colors={statusGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusText}</Text>
        </LinearGradient>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <View style={styles.iconBg}>
            <DollarSign size={14} color={COLORS.success} />
          </View>
          <Text style={styles.detailValue}>{project.budget}</Text>
        </View>
        <View style={styles.detailItem}>
          <View style={styles.iconBg}>
            <Calendar size={14} color={COLORS.info} />
          </View>
          <Text style={styles.detailValue}>{project.deadline}</Text>
        </View>
      </View>

      {(type === "active" || type === "inProgress") && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressLabelContainer}>
              <TrendingUp size={14} color={COLORS.primary} />
              <Text style={styles.progressLabel}>Progress</Text>
            </View>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progress}%` }]}
            />
          </View>
        </View>
      )}

      {project.milestones?.length > 0 && (type === "active" || type === "completed") && (
        <View style={styles.milestoneSection}>
          <View style={styles.milestoneSectionHeader}>
            <ListChecks size={14} color="#64748B" />
            <Text style={styles.milestoneSectionTitle}>Milestones</Text>
          </View>
          {project.milestones.slice(0, 6).map((m: { id: string; title: string; status: string; amount?: number | null }) => (
            <View key={m.id} style={styles.milestoneRow}>
              <Text style={styles.milestoneTitle} numberOfLines={1}>
                {m.title}
              </Text>
              <Text style={styles.milestonePhase}>{milestonePhaseLabel(m.status)}</Text>
              <Text style={styles.milestonePayment}>{milestonePaymentLine(m.status)}</Text>
              {m.amount != null && m.amount > 0 ? (
                <Text style={styles.milestoneAmount}>${Number(m.amount).toFixed(2)}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.l,
    marginBottom: SPACING.m,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.m,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: "#444751",
    marginBottom: 4,
    marginRight: SPACING.s
  },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  client: { fontSize: TYPOGRAPHY.fontSize.sm, color: "#64748B" },
  projectStatusLine: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },

  badge: {
    paddingHorizontal: SPACING.m,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.m,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: "capitalize"
  },

  divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: SPACING.m },

  detailsRow: { flexDirection: "row", gap: SPACING.l, marginBottom: 4 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: SPACING.s },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.s,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailValue: {
    color: "#444751",
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold
  },

  progressSection: { marginTop: SPACING.m },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s
  },
  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: "#64748B",
    fontWeight: TYPOGRAPHY.fontWeight.semibold
  },
  progressPercent: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: BORDER_RADIUS.s,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: BORDER_RADIUS.s,
  },

  milestoneSection: {
    marginTop: SPACING.m,
    paddingTop: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  milestoneSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: SPACING.s,
  },
  milestoneSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  milestoneRow: {
    backgroundColor: "#F8FAFC",
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.s,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  milestoneTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: "#334155",
    marginBottom: 4,
  },
  milestonePhase: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
    marginBottom: 2,
  },
  milestonePayment: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
  },
  milestoneAmount: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    color: "#15803D",
  },
});
