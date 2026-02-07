import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, DollarSign, User, TrendingUp } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, TYPOGRAPHY, GRADIENTS } from "@/constants/theme";

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
    statusColor = "#EA580C";
    statusBg = "#FFEDD5";
    statusText = project.proposalStatus ? project.proposalStatus.replace('_', ' ') : "Pending";
    statusGradient = ['#FFEDD5', '#FED7AA'];
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
});
