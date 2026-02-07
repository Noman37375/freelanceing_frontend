import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Platform, StatusBar } from 'react-native';
import { Briefcase, DollarSign, MessageSquare, AlertCircle, Plus, Search, ArrowRight, Wallet, UserCheck } from 'lucide-react-native';
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
        <ActivityIndicator size="large" color="#282A32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topGradient} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.userName || 'Client'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileCircle}
            onPress={() => router.push('/(client-tabs)/profile' as any)}
          >
            <UserCheck size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* STATS OVERVIEW */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statBox}
              activeOpacity={0.8}
              onPress={() => router.push('/(client-tabs)/projects' as any)}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E5E4EA' }]}>
                <Briefcase size={20} color="#282A32" />
              </View>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Projects</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statBox}
              activeOpacity={0.8}
              onPress={() => router.push('/client/Wallet' as any)}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Wallet size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>${(stats.totalSpent / 1000).toFixed(1)}K</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#282A32' }]}
              onPress={() => router.push('/create-project' as any)}
            >
              <Plus size={24} color="#FFF" />
              <Text style={styles.actionCardTitle}>Post Project</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#10B981' }]}
              onPress={() => router.push('/(client-tabs)/freelancers' as any)}
            >
              <Search size={24} color="#FFF" />
              <Text style={styles.actionCardTitle}>Find Talent</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECENT PROJECTS */}
        <View style={[styles.section, { flex: 1 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Projects</Text>
            <TouchableOpacity onPress={() => router.push('/(client-tabs)/projects' as any)}>
              <View style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>See all</Text>
                <ArrowRight size={14} color="#282A32" />
              </View>
            </TouchableOpacity>
          </View>

          {recentProjects.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>You haven't posted any projects yet.</Text>
              <Text style={styles.emptySubtitle}>Hire the best freelancers for your business.</Text>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => router.push('/create-project' as any)}
              >
                <Text style={styles.createBtnText}>Post a Project</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 300 : 260,
    backgroundColor: '#1E1B4B',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 14,
    color: '#C7D2FE',
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewAllText: {
    fontSize: 14,
    color: '#282A32',
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    height: 100,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionCardTitle: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#282A32',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  createBtn: {
    backgroundColor: '#282A32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
