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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Briefcase, CheckCircle, FileText, Bell, Search, LayoutDashboard, Filter, ChevronLeft } from "lucide-react-native";
import WorkCard from "@/components/WorkCard";
import { projectService, proposalService } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { Project, Proposal } from "@/models/Project";
import { useRouter } from "expo-router";

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
      return { label: "Current Earnings", value: `$${total.toLocaleString()}`, color: "#0F172A" };
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topGradient} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>My Workspace</Text>
            <Text style={styles.headerSubtitle}>Manage your tasks and earnings</Text>
          </View>
          <TouchableOpacity style={styles.iconCircle}>
            <Filter size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsWrapper}>
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
                  activeOpacity={0.8}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ScrollView
          style={styles.contentBody}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#0F172A" />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0F172A" />
            </View>
          ) : displayProjects.length > 0 ? (
            displayProjects.map((project) => (
              <View key={project.id} style={styles.cardWrapper}>
                <WorkCard
                  project={project as any}
                  type={activeTab.toLowerCase()}
                />
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Briefcase size={32} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubtext}>Items in the "{activeTab}" category will appear here once available.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#1E1B4B',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF"
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#C7D2FE',
    fontWeight: '500'
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: "center",
    alignItems: "center"
  },
  statsWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4
  },
  statRight: {
    alignItems: 'flex-end',
  },
  statCount: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: "row",
    gap: 10,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tabText: {
    color: "#C7D2FE",
    fontSize: 13,
    fontWeight: "700"
  },
  tabTextActive: {
    color: "#1E1B4B",
  },
  contentBody: {
    flex: 1,
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.03)',
      },
    }),
  },
  emptyState: {
    marginTop: 60,
    alignItems: "center"
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B"
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center"
  },
});
