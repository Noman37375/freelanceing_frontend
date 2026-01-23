import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Briefcase, DollarSign, MessageSquare, AlertCircle, Plus, Search } from 'lucide-react-native';
import StatsCard from '@/components/ClientStatsCard';
import ProjectCard from '@/components/ClientProjectCard';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { projectService } from '@/services/projectService';
import { Project, getProjectDisplayStatus } from '@/models/Project';
import { disputeService } from '@/services/disputeService';
import { COLORS } from '@/utils/constants';

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

  // Fetch client's projects
  const fetchProjects = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const fetchedProjects = await projectService.getProjects({ clientId: user.id });
      setProjects(fetchedProjects);
      
      // Fetch disputes count
      const disputes = await disputeService.getMyDisputes();
      
      // Calculate stats
      const total = fetchedProjects.length;
      const totalSpent = fetchedProjects
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + (p.budget || 0), 0);
      
      setStats({
        total,
        totalSpent,
        messages: 0, // TODO: Implement when messages API is ready
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

  // Get recent projects (last 3)
  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.userName || 'Client'}</Text>
        </View>
      </View>

      {/* OVERVIEW STATS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(client-tabs)/projects' as any)}
          >
            <StatsCard
              title="Projects"
              value={stats.total.toString()}
              icon={Briefcase}
              iconColor={COLORS.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/client/Wallet' as any)}
          >
            <StatsCard
              title="Total Spent"
              value={`$${(stats.totalSpent / 1000).toFixed(1)}K`}
              icon={DollarSign}
              iconColor={COLORS.success}
            />
          </TouchableOpacity>

          <View style={{ opacity: 0.55 }}>
            <StatsCard
              title="Messages"
              value={stats.messages.toString()}
              icon={MessageSquare}
              iconColor={COLORS.accent}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/client/Disputes' as any)}
          >
            <StatsCard
              title="Disputes"
              value={stats.disputes.toString()}
              icon={AlertCircle}
              iconColor={COLORS.error}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/create-project' as any)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: COLORS.primary }]}>
              <Plus size={24} color={COLORS.white} strokeWidth={2} />
            </View>
            <Text style={styles.actionTitle}>Post Project</Text>
            <Text style={styles.actionSubtitle}>Find the right talent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(client-tabs)/freelancers' as any)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: COLORS.success }]}>
              <Search size={24} color={COLORS.white} strokeWidth={2} />
            </View>
            <Text style={styles.actionTitle}>Find Freelancers</Text>
            <Text style={styles.actionSubtitle}>Browse top talent</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RECENT PROJECTS */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity onPress={() => router.push('/(client-tabs)/projects' as any)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentProjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No projects yet</Text>
            <Text style={styles.emptySubtext}>Create your first project to get started!</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/create-project' as any)}
            >
              <Text style={styles.createButtonText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentProjects.map((project) => (
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
          ))
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 3,
  },
  greeting: { fontSize: 14, color: COLORS.gray500, fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '700', color: COLORS.gray800, marginTop: 4 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray800, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAllText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
  },
  actionIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, marginBottom: 4, textAlign: 'center' },
  actionSubtitle: { fontSize: 12, color: COLORS.gray500, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.gray100 },
  loadingText: { marginTop: 12, color: COLORS.gray500, fontSize: 14 },
  emptyContainer: { 
    backgroundColor: COLORS.white, 
    borderRadius: 12, 
    padding: 24, 
    alignItems: 'center',
    marginTop: 8,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.gray700, marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: COLORS.gray500, marginBottom: 16, textAlign: 'center' },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
