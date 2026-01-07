import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, CheckCircle, FileText } from "lucide-react-native";
import WorkCard from "@/components/WorkCard";

interface Milestone {
  title: string;
  approvalStatus: "pending" | "approved" | "requested";
  priceUSD?: string;
}

interface Project {
  id: string;
  title: string;
  client?: string;
  budget?: string;
  deadline?: string;
  location?: string;
  status: "available" | "proposal" | "inProgress" | "completed";
  description?: string;
  milestones?: Milestone[];
  postedTime?: string;
  proposalStatus?: "submitted" | "shortlisted" | "rejected";
}

export default function MyWorkScreen() {
  const [activeTab, setActiveTab] = useState<"Active" | "Completed" | "Proposals">("Active");

  // 🔹 Static projects data
  const allProjects: Project[] = [
    {
      id: "1",
      title: "Mobile App Redesign",
      client: "Acme Corp",
      budget: "$1200",
      deadline: "Dec 2025",
      location: "Remote",
      status: "inProgress",
      milestones: [
        { title: "UI Design", approvalStatus: "approved", priceUSD: "$300" },
        { title: "Prototype", approvalStatus: "pending", priceUSD: "$200" },
      ],
    },
    {
      id: "2",
      title: "Website Development",
      client: "Globex Inc",
      budget: "$2000",
      deadline: "Nov 2025",
      location: "Remote",
      status: "completed",
      milestones: [
        { title: "Backend Setup", approvalStatus: "approved", priceUSD: "$1000" },
        { title: "Frontend Implementation", approvalStatus: "approved", priceUSD: "$1000" },
      ],
    },
    {
      id: "3",
      title: "Landing Page Proposal",
      client: "Soylent",
      budget: "$500",
      deadline: "Dec 2025",
      location: "Remote",
      status: "proposal",
      proposalStatus: "shortlisted",
      milestones: [],
    },
  ];

  const projects = allProjects.filter((p) => {
    if (activeTab === "Active") return p.status === "inProgress";
    if (activeTab === "Completed") return p.status === "completed";
    if (activeTab === "Proposals") return p.status === "proposal";
    return false;
  });

  const shortlistedCount = projects.filter((p) => p.proposalStatus === "shortlisted").length;

  const getStats = () => {
    if (activeTab === "Active") {
      const total = projects.reduce((sum, p) => {
        const earned = p.milestones?.filter((m) => m.approvalStatus === "approved").reduce((s, m) => s + Number(m.priceUSD?.replace("$", "") || 0), 0) || 0;
        return sum + earned;
      }, 0);
      return { label: "Total Earned (Approved)", value: `$${total}`, color: "#2563EB" };
    }

    if (activeTab === "Completed") {
      const total = projects.reduce((sum, p) => {
        const earned = p.milestones?.reduce((s, m) => s + Number(m.priceUSD?.replace("$", "") || 0), 0) || 0;
        return sum + earned;
      }, 0);
      return { label: "Total Earned", value: `$${total}`, color: "#10B981" };
    }

    return { label: "", value: "", color: "#F59E0B" };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Work</Text>
        <Text style={styles.headerSubtitle}>Track your active, completed, and proposed projects</Text>
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { borderLeftColor: stats.color }]}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{projects.length}</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>

        {activeTab !== "Proposals" && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: stats.color }]}>{stats.value}</Text>
            <Text style={styles.statLabel}>{stats.label}</Text>
          </View>
        )}

        {activeTab === "Proposals" && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#2563EB" }]}>{shortlistedCount}</Text>
            <Text style={styles.statLabel}>Shortlisted</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: "Active", icon: Briefcase, color: "#2563EB" },
          { key: "Completed", icon: CheckCircle, color: "#10B981" },
          { key: "Proposals", icon: FileText, color: "#F59E0B" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && { backgroundColor: tab.color }]}
              onPress={() => setActiveTab(tab.key as typeof activeTab)}
            >
              <Icon size={18} color={isActive ? "#fff" : tab.color} style={{ marginRight: 6 }} />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Projects List */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 80 }}>
        {projects.length > 0 ? (
          projects.map((project) => (
            <WorkCard key={project.id} project={project} type={activeTab.toLowerCase()} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} projects found</Text>
            <Text style={styles.emptySubtext}>Try switching tabs</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#111827" },
  headerSubtitle: { color: "#6B7280", fontSize: 14, marginTop: 4 },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700", color: "#111827" },
  statLabel: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginTop: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  tabText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  activeTabText: { color: "#FFFFFF" },

  scrollContainer: { flex: 1, paddingHorizontal: 18, paddingTop: 16 },
  emptyState: { marginTop: 60, alignItems: "center" },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#6B7280" },
  emptySubtext: { fontSize: 13, color: "#9CA3AF", marginTop: 6 },
});
