import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, CheckCircle, FileText, Bell, Search, LayoutDashboard } from "lucide-react-native";
import WorkCard from "@/components/WorkCard";

interface Milestone {
  title: string;
  approvalStatus: "pending" | "approved" | "requested";
  priceUSD?: string;
}

interface Project {
  id: string;
  title: string;
  client: string; // Made mandatory to match detail screens
  budget: string; // Made mandatory
  deadline: string; 
  location: string; // Added mandatory location
  status: "available" | "proposal" | "inProgress" | "completed";
  description?: string;
  milestones?: Milestone[];
  postedTime?: string;
  proposalStatus?: "submitted" | "shortlisted" | "rejected";
}

export default function MyWorkScreen() {
  const [activeTab, setActiveTab] = useState<"Active" | "Completed" | "Proposals">("Active");

  // 🔹 UPDATED DATA: Added Location and synced names with Detail screens
  const allProjects: Project[] = [
    {
      id: "1",
      title: "Mobile App Redesign",
      client: "Acme Corp",
      budget: "$1200",
      deadline: "Dec 2025",
      location: "Remote", // Matches details logic
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
      location: "New York, US", // Matches details logic
      status: "completed",
      milestones: [
        { title: "Backend Setup", approvalStatus: "approved", priceUSD: "$1000" },
        { title: "Frontend Implementation", approvalStatus: "approved", priceUSD: "$1000" },
      ],
    },
    {
      id: "3",
      title: "Landing Page Proposal",
      client: "Soylent Corp",
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

  const getStats = () => {
    if (activeTab === "Active") {
      const total = projects.reduce((sum, p) => {
        const earned = p.milestones?.filter((m) => m.approvalStatus === "approved")
          .reduce((s, m) => s + Number(m.priceUSD?.replace("$", "") || 0), 0) || 0;
        return sum + earned;
      }, 0);
      return { label: "Current Earnings", value: `$${total}`, color: "#6366F1" };
    }
    if (activeTab === "Completed") {
      const total = projects.reduce((sum, p) => {
        const earned = p.milestones?.reduce((s, m) => s + Number(m.priceUSD?.replace("$", "") || 0), 0) || 0;
        return sum + earned;
      }, 0);
      return { label: "Lifetime Earnings", value: `$${total}`, color: "#10B981" };
    }
    const shortlisted = projects.filter((p) => p.proposalStatus === "shortlisted").length;
    return { label: "Shortlisted Bids", value: shortlisted.toString(), color: "#F59E0B" };
  };

  const stats = getStats();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerBackground}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSubtitle}>Freelancer Portal</Text>
              <Text style={styles.headerTitle}>My Workspace</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconCircle}><Search size={20} color="#F8FAFC" /></TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle}><Bell size={20} color="#F8FAFC" /></TouchableOpacity>
            </View>
          </View>

          {/* DYNAMIC STATS CARD (Changes Indigo/Green/Orange) */}
          <View style={[styles.statsCard, { backgroundColor: stats.color, shadowColor: stats.color }]}>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>{stats.label}</Text>
              <Text style={styles.statValue}>{stats.value}</Text>
            </View>
            <View style={styles.statRight}>
               <Text style={styles.statCount}>{projects.length} Projects</Text>
               <LayoutDashboard size={20} color="rgba(255,255,255,0.7)" />
            </View>
          </View>

          <View style={styles.tabBar}>
            {[
              { key: "Active", icon: Briefcase },
              { key: "Completed", icon: CheckCircle },
              { key: "Proposals", icon: FileText },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tabItem}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.key}</Text>
                  {isActive && <View style={[styles.activeIndicator, { backgroundColor: stats.color }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentBody}>
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {projects.length > 0 ? (
            projects.map((project) => (
              <WorkCard 
                key={project.id} 
                project={project} 
                type={activeTab.toLowerCase()} 
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} items</Text>
              <Text style={styles.emptySubtext}>Your projects will appear here</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  headerBackground: { paddingHorizontal: 20, paddingBottom: 5 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  headerSubtitle: { color: "#94A3B8", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2 },
  headerTitle: { color: "#F8FAFC", fontSize: 28, fontWeight: "900" },
  headerIcons: { flexDirection: "row", gap: 10 },
  iconCircle: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#334155" },

  statsCard: { 
    marginTop: 20, 
    borderRadius: 24, 
    padding: 24, 
    flexDirection: "row", 
    alignItems: "center",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10
  },
  statInfo: { flex: 1 },
  statLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  statValue: { color: "#FFFFFF", fontSize: 32, fontWeight: "900", marginTop: 4 },
  statRight: { alignItems: 'flex-end', justifyContent: 'center' },
  statCount: { color: "#FFF", fontSize: 14, fontWeight: "700", marginBottom: 4 },

  tabBar: { flexDirection: "row", marginTop: 25, gap: 28 },
  tabItem: { paddingVertical: 10, position: 'relative' },
  tabText: { color: "#64748B", fontSize: 15, fontWeight: "700" },
  tabTextActive: { color: "#F8FAFC", fontWeight: "900" },
  activeIndicator: { position: "absolute", bottom: 0, left: 0, right: 0, height: 4, borderRadius: 2 },

  contentBody: { flex: 1, backgroundColor: "#F8FAFC", borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: 15 },
  scrollContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 25 },
  emptyState: { marginTop: 80, alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  emptySubtext: { fontSize: 14, color: "#94A3B8", marginTop: 8 },
});