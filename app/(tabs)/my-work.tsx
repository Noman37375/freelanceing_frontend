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
import { Briefcase, CheckCircle, FileText, Bell, Search, LayoutDashboard } from "lucide-react-native";
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
      return { label: "Current Earnings", value: `$${total.toFixed(2)}`, color: "#6366F1" };
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
               <Text style={styles.statCount}>
                 {activeTab === "Proposals" ? proposals.length : projects.length} {activeTab === "Proposals" ? "Proposals" : "Projects"}
               </Text>
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
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchData} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
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
  loadingContainer: { padding: 60, alignItems: "center", justifyContent: "center" },
});