import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, Bell, LayoutDashboard } from "lucide-react-native";
import WorkCard from "@/components/WorkCard";
import { projectService, proposalService } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { Project, Proposal } from "@/models/Project";
import { useRouter } from "expo-router";
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from "@/constants/theme";

const SKELETON_CARD_COUNT = 3;

function SkeletonWorkCard({ opacity }: { opacity: Animated.Value }) {
  return (
    <View style={skeletonStyles.card}>
      <Animated.View style={[skeletonStyles.line, skeletonStyles.titleLine, { opacity }]} />
      <Animated.View style={[skeletonStyles.line, skeletonStyles.metaLine, { opacity }]} />
      <View style={skeletonStyles.cardFooter}>
        <Animated.View style={[skeletonStyles.line, skeletonStyles.footerLine, { opacity }]} />
      </View>
    </View>
  );
}

function MyWorkSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, useNativeDriver: true, duration: 600 }),
        Animated.timing(opacity, { toValue: 0.4, useNativeDriver: true, duration: 600 }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <View style={skeletonStyles.wrapper}>
      <View style={[styles.statsCard, skeletonStyles.statCardSkeleton]}>
        <View style={skeletonStyles.statLeft}>
          <Animated.View style={[skeletonStyles.line, skeletonStyles.statLabelLine, { opacity }]} />
          <Animated.View style={[skeletonStyles.line, skeletonStyles.statValueLine, { opacity }]} />
        </View>
        <Animated.View style={[skeletonStyles.statIconSkeleton, { opacity }]} />
      </View>
      {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
        <SkeletonWorkCard key={i} opacity={opacity} />
      ))}
    </View>
  );
}

export default function MyWorkScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"Active" | "Completed" | "Proposals">("Active");
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "Proposals") {
        const proposalsData = await proposalService.getMyProposals();
        console.log("[MyWork] Proposals fetched:", proposalsData.length, proposalsData);
        setProposals(proposalsData);
        setProjects([]);
      } else {
        const status = activeTab === "Active" ? "IN_PROGRESS" : "COMPLETED";
        console.log("[MyWork] Fetching projects with freelancerId:", user?.id, "status:", status);
        const projectsData = await projectService.getProjects({
          freelancerId: user?.id,
          status: status as any,
        });
        console.log("[MyWork] Projects fetched:", projectsData.length, projectsData);
        setProjects(projectsData);
        setProposals([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayProjects =
    activeTab === "Proposals"
      ? proposals.map((p) => ({
          id: p.id,
          title: p.project?.title || "Unknown Project",
          client: p.project?.client?.userName || (p.project?.client as any)?.user_name || "Unknown Client",
          budget: `$${(p.bidAmount || 0).toFixed(2)}`,
          deadline: p.project?.duration || "N/A",
          location: p.project?.location || "Remote",
          status: p.status === "ACCEPTED" ? "inProgress" : "proposal",
          proposalStatus:
            p.status === "ACCEPTED" ? "shortlisted" : p.status === "PENDING" ? "submitted" : "rejected",
          milestones: [],
        }))
      : projects.map((p) => ({
          id: p.id,
          title: p.title,
          client: p.client?.userName || (p.client as any)?.user_name || "Unknown Client",
          budget: `$${(p.budget || 0).toFixed(2)}`,
          deadline: p.duration || "N/A",
          location: p.location || "Remote",
          progress: p.progress || 0,
          status:
            p.status?.toUpperCase() === "IN_PROGRESS"
              ? "inProgress"
              : p.status?.toUpperCase() === "COMPLETED"
                ? "completed"
                : "available",
          milestones: [],
        }));

  const getStats = () => {
    if (activeTab === "Active") {
      const total = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
      return { label: "Current Earnings", value: `$${total.toLocaleString()}`, color: "#4F46E5" };
    }
    if (activeTab === "Completed") {
      const total = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
      return { label: "Lifetime Earnings", value: `$${total.toLocaleString()}`, color: "#10B981" };
    }
    const shortlisted = proposals.filter((p) => p.status === "ACCEPTED").length;
    return { label: "Shortlisted Bids", value: shortlisted.toString(), color: "#F59E0B" };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Work</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statInfo}>
          <Text style={styles.statLabel}>{stats.label}</Text>
          <Text style={[styles.statValue, { color: stats.color }]}>{stats.value}</Text>
        </View>
        <View style={styles.statRight}>
          <Text style={styles.statCount}>
            {activeTab === "Proposals" ? proposals.length : projects.length}{" "}
            {activeTab === "Proposals" ? "Proposals" : "Projects"}
          </Text>
          <View style={[styles.statIconBg, { backgroundColor: stats.color + "20" }]}>
            <LayoutDashboard size={20} color={stats.color} />
          </View>
        </View>
      </View>

      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          {(["Active", "Completed", "Proposals"] as const).map((key) => {
            const isActive = activeTab === key;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                style={[
                  styles.tabChip,
                  isActive && styles.tabChipActive,
                ]}
                onPress={() => setActiveTab(key)}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    isActive && styles.tabChipTextActive,
                  ]}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.contentBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#4F46E5" />
        }
      >
        {loading ? (
          <MyWorkSkeleton />
        ) : displayProjects.length > 0 ? (
          displayProjects.map((project) => (
            <View key={project.id} style={styles.cardWrapper}>
              <WorkCard project={project as any} type={activeTab.toLowerCase()} />
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Briefcase size={32} color="#64748B" />
            </View>
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>
              Items in the "{activeTab}" category will appear here once available.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 26,
    // fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: "#1E293B",
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },

  statsCard: {
    backgroundColor: "#FFF",
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    marginHorizontal: 20,
    marginBottom: SPACING.m,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  statInfo: { flex: 1 },
  statLabel: {
    color: "#64748B",
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize["3xl"],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.xs,
  },
  statRight: { alignItems: "flex-end" },
  statCount: {
    color: "#64748B",
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.s,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.m,
    justifyContent: "center",
    alignItems: "center",
  },

  tabBarWrapper: {
    marginBottom: 12,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  tabChipActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  tabChipTextActive: {
    color: "#FFFFFF",
  },

  contentBody: { flex: 1 },
  cardWrapper: {
    backgroundColor: "#FFF",
    borderRadius: BORDER_RADIUS.l,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  emptyState: { marginTop: SPACING.xxl, alignItems: "center" },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: "#1E293B",
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: "#64748B",
    marginTop: SPACING.s,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});

const skeletonStyles = StyleSheet.create({
  wrapper: { paddingBottom: 24 },
  statCardSkeleton: {},
  statLeft: { flex: 1 },
  statLabelLine: { height: 12, width: 100, marginBottom: 8, borderRadius: 6 },
  statValueLine: { height: 24, width: 120, borderRadius: 6 },
  statIconSkeleton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.m,
    backgroundColor: "#E2E8F0",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: BORDER_RADIUS.l,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: SPACING.m,
    marginBottom: SPACING.m,
  },
  line: { backgroundColor: "#E2E8F0", borderRadius: 6 },
  titleLine: { height: 18, width: "85%", marginBottom: 12 },
  metaLine: { height: 14, width: "60%", marginBottom: 12 },
  cardFooter: { marginTop: 4 },
  footerLine: { height: 12, width: 80 },
});
