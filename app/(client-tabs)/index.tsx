import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform, StatusBar, Image } from 'react-native';
import { Briefcase, DollarSign, MessageSquare, AlertCircle, Plus, Search, ArrowRight, Wallet, UserCheck, TrendingUp, Clock, CheckCircle2, Sparkles } from 'lucide-react-native';
import StatsCard from '@/components/ClientStatsCard';
import ProjectCard from '@/components/ClientProjectCard';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { projectService } from '@/services/projectService';
import { Project, getProjectDisplayStatus } from '@/models/Project';
import { disputeService } from '@/services/disputeService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClientHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalSpent: 0,
    messages: 0,
    disputes: 0,
  });

  const defaultAvatar = user?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.userName || "Client")}&background=444751&color=fff&size=200`;

  const fetchProjects = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const fetchedProjects = await projectService.getProjects({ clientId: user.id });
      setProjects(fetchedProjects);

      const disputes = await disputeService.getMyDisputes();

      const total = fetchedProjects.length;
      const totalSpent = fetchedProjects
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + (p.budget || 0), 0);

      setStats({
        total,
        totalSpent,
        messages: 0,
        disputes: disputes.length,
      });
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#444751" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* CLEAN HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: defaultAvatar }} style={styles.avatar} />
            <View style={styles.headerInfo}>
              <Text style={styles.greeting}>Welcome back</Text>
              <Text style={styles.userName}>{user?.userName || 'Client'}</Text>
            </View>
          </View>
          {/* <TouchableOpacity 
            style={styles.notifBtn}
            onPress={() => router.push('/(client-tabs)/profile' as any)}
          >
            <UserCheck size={22} color="#282A32" strokeWidth={2.5} />
          </TouchableOpacity> */}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#444751" />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* STATS OVERVIEW */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OVERVIEW</Text>
            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={styles.statCard}
                activeOpacity={0.7}
                onPress={() => router.push('/(client-tabs)/projects' as any)}
              >
                <View style={styles.statIconBox}>
                  <Briefcase size={20} color="#444751" strokeWidth={2.5} />
                </View>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Projects</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                activeOpacity={0.7}
                onPress={() => router.push('/client/Wallet' as any)}
              >
                <View style={styles.statIconBox}>
                  <Wallet size={20} color="#444751" strokeWidth={2.5} />
                </View>
                <Text style={styles.statValue}>${(stats.totalSpent / 1000).toFixed(1)}K</Text>
                <Text style={styles.statLabel}>Spent</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                activeOpacity={0.7}
              >
                <View style={styles.statIconBox}>
                  <TrendingUp size={20} color="#444751" strokeWidth={2.5} />
                </View>
                <Text style={styles.statValue}>{Math.round(stats.total * 0.8)}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                activeOpacity={0.7}
              >
                <View style={styles.statIconBox}>
                  <CheckCircle2 size={20} color="#444751" strokeWidth={2.5} />
                </View>
                <Text style={styles.statValue}>{Math.round(stats.total * 0.2)}</Text>
                <Text style={styles.statLabel}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.primaryActionCard}
                onPress={() => router.push('/create-project' as any)}
                activeOpacity={0.8}
              >
                <View style={styles.actionIconCircle}>
                  <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Post Project</Text>
                  <Text style={styles.actionSubtitle}>Hire talented freelancers</Text>
                </View>
                <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionCard}
                onPress={() => router.push('/(client-tabs)/freelancers' as any)}
                activeOpacity={0.8}
              >
                <View style={styles.secondaryIconCircle}>
                  <Search size={24} color="#444751" strokeWidth={2.5} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.secondaryActionTitle}>Find Talent</Text>
                  <Text style={styles.secondaryActionSubtitle}>Browse freelancers</Text>
                </View>
                <ArrowRight size={20} color="#444751" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          {/* RECENT PROJECTS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>RECENT PROJECTS</Text>
              <TouchableOpacity 
                style={styles.viewAllBtn}
                onPress={() => router.push('/(client-tabs)/projects' as any)}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <ArrowRight size={16} color="#444751" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {recentProjects.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBox}>
                  <Briefcase size={40} color="#C2C2C8" strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No Projects Yet</Text>
                <Text style={styles.emptySubtitle}>Start by posting your first project and connect with talented freelancers</Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => router.push('/create-project' as any)}
                >
                  <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.emptyActionText}>Post Your First Project</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.projectsList}>
                {recentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    title={project.title}
                    budget={`$${project.budget}`}
                    status={getProjectDisplayStatus(project)}
                    freelancer={project.freelancer?.userName}
                    deadline={project.duration || 'Not specified'}
                    onPress={() =>
                      router.push({
                        pathname: '/client/ProjectDetail' as any,
                        params: { id: project.id },
                      } as any)
                    }
                  />
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F8',
  },

  // ========== HEADER ==========
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E4EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E4EA',
  },
  headerInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C2C2C8',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#282A32',
    letterSpacing: -0.3,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ========== SCROLL CONTENT ==========
  scrollContent: {
    paddingBottom: 30,
  },

  // ========== SECTIONS ==========
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C2C2C8',
    letterSpacing: 1.8,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4F4F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444751',
    letterSpacing: 0.2,
  },

  // ========== STATS GRID ==========
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C2C2C8',
    letterSpacing: 0.2,
  },

  // ========== QUICK ACTIONS ==========
  actionsRow: {
    gap: 12,
  },
  primaryActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444751',
    borderRadius: 18,
    padding: 18,
    gap: 14,
    marginBottom: 12,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  actionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.1,
  },

  secondaryActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  secondaryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  secondaryActionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#C2C2C8',
    letterSpacing: 0.1,
  },

  // ========== PROJECTS LIST ==========
  projectsList: {
    gap: 12,
  },

  // ========== EMPTY STATE ==========
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C2C2C8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#444751',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});