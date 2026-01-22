import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, CheckCircle, FileText, Bell, Search, LayoutDashboard, Filter } from "lucide-react-native";
import WorkCard from "@/components/WorkCard";
import { projectService } from "@/services/projectService";
import { proposalService } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@/models/Project";
import { Proposal } from "@/models/Project";

export default function MyWorkScreen() {
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
        setProposals(proposalsData);
        setProjects([]);
      } else {
        const status = activeTab === "Active" ? "ACTIVE" : "COMPLETED";
        const projectsData = await projectService.getProjects({
          freelancerId: user?.id,
          status: status as any,
        });
        setProjects(projectsData);
        setProposals([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayProjects = activeTab === "Proposals"
    ? proposals.map(p => ({
      id: p.id,
      title: p.project?.title || 'Unknown Project',
      client: p.project?.client?.userName || 'Unknown Client',
      budget: `$${p.bidAmount.toFixed(2)}`,
      deadline: p.project?.duration || 'N/A',
      location: p.project?.location || 'Remote',
      status: p.status === 'ACCEPTED' ? 'inProgress' : 'proposal',
      proposalStatus: p.status === 'ACCEPTED' ? 'shortlisted' : p.status === 'PENDING' ? 'submitted' : 'rejected',
      milestones: [],
    }))
    : projects.map(p => ({
      id: p.id,
      title: p.title,
      client: p.client?.userName || 'Unknown Client',
      budget: `$${p.budget.toFixed(2)}`,
      deadline: p.duration || 'N/A',
      location: p.location || 'Remote',
      status: p.status === 'ACTIVE' ? 'inProgress' : p.status === 'COMPLETED' ? 'completed' : 'available',
      milestones: [],
    }));

  const getStats = () => {
    if (activeTab === "Active") {
      const total = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
      return { label: "Current Earnings", value: `$${total.toFixed(2)}`, color: "#4F46E5" };
    }
    if (activeTab === "Completed") {
      const total = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
      return { label: "Lifetime Earnings", value: `$${total.toFixed(2)}`, color: "#10B981" };
    }
    const shortlisted = proposals.filter((p) => p.status === "ACCEPTED").length;
    return { label: "Shortlisted Bids", value: shortlisted.toString(), color: "#F59E0B" };
  };

  const stats = getStats();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Dynamic Background Element - Matching Home Screen */}
      <View style={styles.topGradient} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSubtitle}>Freelancer Portal</Text>
              <Text style={styles.headerTitle}>My Workspace</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconCircle}>
                <Search size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle}>
                <Filter size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>{stats.label}</Text>
              <Text style={[styles.statValue, { color: stats.color }]}>{stats.value}</Text>
            </View>
            <View style={styles.statRight}>
              <Text style={styles.statCount}>
                {activeTab === "Proposals" ? proposals.length : projects.length} {activeTab === "Proposals" ? "Proposals" : "Projects"}
              </Text>
              <View style={[styles.statIconBg, { backgroundColor: stats.color + '15' }]}>
                <LayoutDashboard size={20} color={stats.color} />
              </View>
            </View>
          </View>

          {/* Tab Bar */}
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
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.contentBody}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#4F46E5" />
            }
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
              </View>
            ) : displayProjects.length > 0 ? (
              displayProjects.map((project) => (
                <WorkCard
                  key={project.id}
                  project={project as any}
                  type={activeTab.toLowerCase()}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                  <Briefcase size={32} color="#CBD5E1" />
                </View>
                <Text style={styles.emptyText}>No {activeTab.toLowerCase()} items</Text>
                <Text style={styles.emptySubtext}>Your projects will appear here once you start working.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: '#1E1B4B', // Deep Indigo
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerContent: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, marginBottom: 24 },
  headerSubtitle: { color: "#C7D2FE", fontSize: 13, fontWeight: "600", letterSpacing: 0.5, marginBottom: 4 },
  headerTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "800" },

  headerIcons: { flexDirection: "row", gap: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: "center",
    alignItems: "center"
  },

  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 24,
  },
  statInfo: {},
  statLabel: { color: "#64748B", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  statValue: { fontSize: 32, fontWeight: "800", marginTop: 4 },

  statRight: { alignItems: 'flex-end', justifyContent: 'center' },
  statCount: { color: "#64748B", fontSize: 14, fontWeight: "600", marginBottom: 8 },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabBar: { flexDirection: "row", gap: 12 },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: { color: "#C7D2FE", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "#1E1B4B", fontWeight: "700" },

  contentBody: { flex: 1 },
  scrollContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },

  emptyState: { marginTop: 60, alignItems: "center" },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  emptySubtext: { fontSize: 14, color: "#94A3B8", marginTop: 8, textAlign: 'center', maxWidth: 240 },

  loadingContainer: { padding: 60, alignItems: "center", justifyContent: "center" },
});
