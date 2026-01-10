import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Briefcase, DollarSign, MessageSquare, AlertCircle, Plus, Search, LogOut } from 'lucide-react-native';
import StatsCard from './components/StatsCard';
import ProjectCard from './components/ProjectCard';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { projectService } from '@/services/projectService';
import { Project } from '@/models/Project';

export default function ClientHome() {
  const router = useRouter();
  const { logout, user } = useAuth();
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
      
      // Calculate stats
      const total = fetchedProjects.length;
      const totalSpent = fetchedProjects
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + (p.budget || 0), 0);
      
      setStats({
        total,
        totalSpent,
        messages: 0, // TODO: Implement when messages API is ready
        disputes: 0, // TODO: Implement when disputes API is ready
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

  const handleLogout = async () => {
    await logout(); // clears storage + user
    router.replace('/login'); // go to login screen
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
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
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.userName || 'Client'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* OVERVIEW STATS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/client/Projects')}
          >
            <StatsCard
              title="Projects"
              value={stats.total.toString()}
              icon={Briefcase}
              iconColor="#3B82F6"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/client/Wallet')}
          >
            <StatsCard
              title="Total Spent"
              value={`$${(stats.totalSpent / 1000).toFixed(1)}K`}
              icon={DollarSign}
              iconColor="#10B981"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              // TODO: Navigate to messages when implemented
              Alert.alert('Coming Soon', 'Messages feature coming soon!');
            }}
          >
            <StatsCard
              title="Messages"
              value={stats.messages.toString()}
              icon={MessageSquare}
              iconColor="#F59E0B"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/client/Disputes')}
          >
            <StatsCard
              title="Disputes"
              value={stats.disputes.toString()}
              icon={AlertCircle}
              iconColor="#EF4444"
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
            onPress={() => router.push('/create-project')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#3B82F6' }]}>
              <Plus size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.actionTitle}>Post Project</Text>
            <Text style={styles.actionSubtitle}>Find the right talent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/client/Freelancers')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#10B981' }]}>
              <Search size={24} color="#FFFFFF" strokeWidth={2} />
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
          <TouchableOpacity onPress={() => router.push('/client/Projects')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentProjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No projects yet</Text>
            <Text style={styles.emptySubtext}>Create your first project to get started!</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/create-project')}
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
              status={project.status === 'ACTIVE' ? 'Active' : project.status === 'COMPLETED' ? 'Completed' : project.status === 'CANCELLED' ? 'Cancelled' : 'In Progress'}
              freelancer={project.freelancer?.userName}
              deadline={project.duration || 'Not specified'}
              onPress={() =>
                router.push({
                  pathname: '/client/ProjectDetail',
                  params: { id: project.id },
                })
              }
            />
          ))
        )}

      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 3,
  },
  greeting: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginTop: 4 },
  logoutButton: { padding: 8, borderRadius: 8, backgroundColor: '#FEE2E2' },

  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAllText: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },

  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
  },
  actionIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4, textAlign: 'center' },
  actionSubtitle: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  emptyContainer: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 24, 
    alignItems: 'center',
    marginTop: 8,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#6B7280', marginBottom: 16, textAlign: 'center' },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
