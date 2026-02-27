import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Animated, RefreshControl, Platform, StatusBar } from 'react-native';
import { Search, Filter, Plus, ChevronLeft, Calendar, DollarSign, Briefcase, X, TrendingUp, CheckCircle2, Clock } from 'lucide-react-native';
import ProjectCard from '@/components/ClientProjectCard';
import { useRouter } from 'expo-router';
import { projectService } from '@/services/projectService';
import { Project, getProjectDisplayStatus } from '@/models/Project';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const SKELETON_CARD_COUNT = 4;

function SkeletonCard({ opacity }: { opacity: Animated.Value }) {
  return (
    <View style={skeletonStyles.card}>
      <Animated.View style={[skeletonStyles.line, skeletonStyles.titleLine, { opacity }]} />
      <Animated.View style={[skeletonStyles.line, skeletonStyles.subLine, { opacity }]} />
      <View style={skeletonStyles.cardFooter}>
        <Animated.View style={[skeletonStyles.line, skeletonStyles.metaLine, { opacity }]} />
      </View>
    </View>
  );
}

function ProjectsListSkeleton() {
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
      <View style={styles.listContent}>
        {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
          <SkeletonCard key={i} opacity={opacity} />
        ))}
      </View>
    </View>
  );
}

export default function Projects() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const filters: any = { clientId: user.id };
      if (searchQuery) {
        filters.search = searchQuery;
      }
      const fetchedProjects = await projectService.getProjects(filters);
      setProjects(fetchedProjects);
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      setError(error?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user?.id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        fetchProjects();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'ACTIVE').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    cancelled: projects.filter(p => p.status === 'CANCELLED').length,
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* CLEAN HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={22} color="#282A32" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>My Projects</Text>
            <Text style={styles.headerSubtitle}>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/create-project' as any)}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#C2C2C8" strokeWidth={2.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects..."
              placeholderTextColor="#C2C2C8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              underlineColorAndroid="transparent"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* STATS CARDS */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Briefcase size={18} color="#444751" strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <TrendingUp size={18} color="#444751" strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <CheckCircle2 size={18} color="#444751" strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Clock size={18} color="#444751" strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{stats.cancelled}</Text>
              <Text style={styles.statLabel}>Closed</Text>
            </View>
          </View>
        </View>

        {/* PROJECTS LIST */}
        {loading ? (
          <ProjectsListSkeleton />
        ) : (
          <FlatList
            data={filteredProjects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProjectCard
                title={item.title}
                budget={`$${item.budget}`}
                status={getProjectDisplayStatus(item)}
                freelancer={item.freelancer?.userName}
                deadline={item.duration || 'Not specified'}
                totalBids={item.bidsCount ?? 0}
                onPress={() =>
                  router.push({
                    pathname: '/client/ProjectDetail' as any,
                    params: { id: item.id },
                  } as any)
                }
              />
            )}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor="#444751" 
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              error ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconBox}>
                    <Briefcase size={40} color="#C2C2C8" strokeWidth={1.5} />
                  </View>
                  <Text style={styles.emptyTitle}>Couldn't Load Projects</Text>
                  <Text style={styles.emptySubtitle}>{error}</Text>
                  <TouchableOpacity style={styles.emptyActionBtn} onPress={fetchProjects}>
                    <Text style={styles.emptyActionText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconBox}>
                    <Briefcase size={40} color="#C2C2C8" strokeWidth={1.5} />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'No Results Found' : 'No Projects Yet'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery 
                      ? 'Try adjusting your search terms' 
                      : 'Start by posting your first project'}
                  </Text>
                  {!searchQuery && (
                    <TouchableOpacity 
                      style={styles.emptyActionBtn} 
                      onPress={() => router.push('/create-project' as any)}
                    >
                      <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                      <Text style={styles.emptyActionText}>Post Project</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F8',
  },

  // ========== HEADER ==========
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E4EA',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#282A32',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#C2C2C8',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#444751',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ========== SEARCH SECTION ==========
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E4EA',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#282A32',
    fontWeight: '600',
    borderWidth: 0,
    borderColor: 'transparent',
    outlineStyle: 'none',
  },

  // ========== STATS SECTION ==========
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F4F4F8',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: '#C2C2C8',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // ========== PROJECTS LIST ==========
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },

  // ========== EMPTY STATE ==========
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
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
    color: '#C2C2C8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#444751',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

const skeletonStyles = StyleSheet.create({
  wrapper: { flex: 1 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  line: { backgroundColor: '#E5E4EA', borderRadius: 6 },
  titleLine: { height: 18, width: '85%', marginBottom: 12 },
  subLine: { height: 14, width: '55%', marginBottom: 16 },
  cardFooter: { marginTop: 4 },
  metaLine: { height: 12, width: 100 },
});