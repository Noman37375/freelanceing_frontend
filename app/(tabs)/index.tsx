// Freelancer Dashboard – light theme (no dummy data)

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, Filter, MapPin } from 'lucide-react-native';

import { storageGet } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';
import { projectService } from '@/services/projectService';
import { adminService } from '@/services/adminService';
import { Project } from '@/models/Project';

const timeAgo = (timestamp?: string) => {
  if (!timestamp) return '';
  const postedDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - postedDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `Posted ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `Posted ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return `Posted ${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkRole = async () => {
      const storedUser = await storageGet('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role?.toLowerCase() !== 'freelancer') {
          router.replace('../(client-tabs)');
        }
      }
    };
    checkRole();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesResult, projectsResult] = await Promise.allSettled([
        adminService.getServiceCategories(),
        projectService.getProjects({ status: 'ACTIVE', available: true }),
      ]);
      setCategories(servicesResult.status === 'fulfilled' ? (servicesResult.value || []) : []);
      setRecentProjects(projectsResult.status === 'fulfilled' ? (projectsResult.value || []) : []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToFindProjects = () => router.push('/find-projects');
  // Search stays on same page: filter projects locally (no redirect)
  const handleSearchSubmit = () => { /* no redirect */ };

  const DEFAULT_SERVICES = [
    { id: 'design', name: 'Design' },
    { id: 'development', name: 'Development' },
    { id: 'writing', name: 'Writing' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'data', name: 'Data' },
  ];
  const displayCategories = (categories && categories.length > 0) ? categories : DEFAULT_SERVICES;

  const q = (searchQuery || '').trim().toLowerCase();
  const filteredProjects = q
    ? recentProjects.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      )
    : recentProjects;

  const usernameHandle = user?.userName
    ? `@${user.userName.replace(/\s+/g, '').toLowerCase()}`
    : (user?.email ? `@${user.email.split('@')[0]}` : '');

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.skeletonLine, { width: 100, height: 20 }]} />
            </View>
            <View style={[styles.skeletonCircle, { width: 44, height: 44, borderRadius: 22 }]} />
          </View>
          <View style={[styles.skeletonLine, { width: 140, height: 24, marginBottom: 14 }]} />
          <View style={[styles.searchBar, styles.skeleton, { opacity: 0.7 }]} />
          <View style={styles.allServiceSection}>
            <View style={styles.allServiceHeader}>
              <View style={[styles.skeletonLine, { width: 100, height: 20 }]} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceScrollContent}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={styles.serviceGridItem}>
                  <View style={[styles.serviceIconCircle, styles.skeleton]} />
                  <View style={[styles.skeletonLine, { width: 40, height: 10, marginTop: 6, alignSelf: 'center' }]} />
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.skeletonLine, { width: 140, height: 22 }]} />
            </View>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.jobCard, styles.skeletonCard]}>
                <View style={[styles.skeletonLine, { width: 70, height: 14, marginBottom: 10 }]} />
                <View style={[styles.skeletonLine, { width: '90%', height: 18, marginBottom: 8 }]} />
                <View style={[styles.skeletonLine, { width: 100, height: 12, marginBottom: 12 }]} />
                <View style={styles.jobMetricsRow}>
                  <View style={[styles.jobMetricBox, styles.skeleton]} />
                  <View style={[styles.jobMetricBox, styles.skeleton]} />
                  <View style={[styles.jobMetricBox, styles.skeleton]} />
                </View>
                <View style={[styles.skeletonLine, { width: '100%', height: 14, marginBottom: 6 }]} />
                <View style={[styles.skeletonLine, { width: '70%', height: 14, marginBottom: 12 }]} />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <View style={[styles.skeletonLine, { width: 60, height: 24, borderRadius: 8 }]} />
                  <View style={[styles.skeletonLine, { width: 80, height: 24, borderRadius: 8 }]} />
                  <View style={[styles.skeletonLine, { width: 70, height: 24, borderRadius: 8 }]} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header: Hey + name (left), avatar + bell (right) – like reference */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.heyLabel}>Hey, </Text>
            <Text style={styles.headerName} numberOfLines={1}>
              {user?.userName || user?.email?.split('@')[0] || 'Freelancer'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => router.push('../notifications')}
            >
              <Bell size={22} color="#444751" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>
                    {(user?.userName || user?.email || 'F').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Section heading + single search bar (Search icon left, Filter icon right inside bar) */}
        <Text style={styles.findProjectsHeading}>Find a projects</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              underlineColorAndroid="transparent"
            />
            {/* <TouchableOpacity onPress={goToFindProjects} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Filter size={20} color="#94A3B8" />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* All Service – horizontal scroll, compact */}
        <View style={styles.allServiceSection}>
          <View style={styles.allServiceHeader}>
            <Text style={styles.allServiceTitle}>All Service</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.serviceScrollContent}
          >
            {displayCategories.map((cat: any) => (
                <TouchableOpacity
                  key={cat.id || cat.name || String(cat)}
                  style={styles.serviceGridItem}
                  onPress={() => router.push({ pathname: '/find-projects', params: { category: cat.name } })}
                  activeOpacity={0.8}
                >
                  <View style={styles.serviceIconCircle}>
                    {cat.image ? (
                      <Image source={{ uri: cat.image }} style={styles.serviceIconImage} />
                    ) : (
                      <View style={[styles.serviceIconPlaceholder, { backgroundColor: cat.color || '#282A32' }]}>
                        <Text style={styles.serviceIconLetter}>
                          {(cat.name || '?').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.serviceLabel} numberOfLines={1}>
                    {cat.name || 'Service'}
                  </Text>
                </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular projects – client project UI (no Payment Verified) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular projects</Text>
            {/* <TouchableOpacity onPress={goToFindProjects}>
              <Text style={styles.showMore}>View all</Text>
            </TouchableOpacity> */}
          </View>

          {filteredProjects.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery.trim() ? 'No projects match your search.' : 'No projects right now.'}
              </Text>
              {searchQuery.trim() ? null : (
                <TouchableOpacity style={styles.emptyBtn} onPress={goToFindProjects}>
                  <Text style={styles.emptyBtnText}>Find projects</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.jobCard}
                activeOpacity={0.95}
                onPress={() => router.push(`/project-details?id=${project.id}`)}
              >
                <View style={styles.jobCardLocation}>
                  <MapPin size={14} color="#64748B" />
                  <Text style={styles.jobCardLocationText}>{project.location || 'Remote'}</Text>
                </View>
                <Text style={styles.jobTitle} numberOfLines={2}>{project.title}</Text>
                <Text style={styles.jobPosted}>{timeAgo(project.createdAt)}</Text>
                <View style={styles.jobMetricsRow}>
                  <View style={styles.jobMetricBox}>
                    <Text style={styles.jobMetricValue}>${project.budget ?? '—'}</Text>
                    <Text style={styles.jobMetricLabel}>Fixed-price</Text>
                  </View>
                  <View style={styles.jobMetricBox}>
                    <Text style={styles.jobMetricValue}>{project.duration || '—'}</Text>
                    <Text style={styles.jobMetricLabel}>Duration</Text>
                  </View>
                  <View style={styles.jobMetricBox}>
                    <Text style={styles.jobMetricValue}>{project.bidsCount ?? 0} Proposal</Text>
                    <Text style={styles.jobMetricLabel}>Proposals</Text>
                  </View>
                </View>
                {project.description ? (
                  <Text style={styles.jobDetails} numberOfLines={2}>{project.description}</Text>
                ) : null}
                {(project.tags?.length ?? 0) > 0 ? (
                  <>
                    <Text style={styles.tagsLabel}>Tags</Text>
                    <View style={styles.tagsRow}>
                      {(project.tags || []).slice(0, 4).map((tag: string, i: number) => (
                        <View key={i} style={styles.tagChip}>
                          <Text style={styles.tagChipText} numberOfLines={1}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  heyLabel: { fontSize: 16, color: '#64748B', fontWeight: '500' },
  headerName: { fontSize: 18, fontWeight: '700', color: '#444751' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#282A32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },

  findProjectsHeading: { fontSize: 22, fontWeight: '700', color: '#444751', marginBottom: 14 },
  searchRow: { marginBottom: 24 },
  searchBar: {
    height: 52,
    backgroundColor: '#FFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#444751',
    paddingVertical: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    outlineStyle: 'none',
  },

  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#444751' },
  showMore: { fontSize: 14, color: '#64748B', fontWeight: '500' },

  allServiceSection: {
    marginBottom: 20,
  },
  allServiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  allServiceTitle: { fontSize: 18, fontWeight: '700', color: '#444751' },
  allServiceViewAll: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  serviceScrollContent: {
    flexDirection: 'row',
    paddingRight: 20,
    gap: 12,
  },
  serviceGridItem: {
    width: 64,
    alignItems: 'center',
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 6,
    backgroundColor: '#F1F5F9',
  },
  serviceIconImage: {
    width: '100%',
    height: '100%',
  },
  serviceIconPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceIconLetter: { fontSize: 18, fontWeight: '700', color: '#475569' },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444751',
    textAlign: 'center',
    maxWidth: 64,
  },
  allServiceEmpty: { color: '#64748B', fontSize: 13, paddingVertical: 8, paddingRight: 20 },

  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: { fontSize: 15, color: '#64748B', marginBottom: 12 },
  emptyBtn: { backgroundColor: '#282A32', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  emptyBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

  jobCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  jobCardLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  jobCardLocationText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  jobTitle: { fontSize: 16, fontWeight: '700', color: '#444751', marginBottom: 6 },
  jobPosted: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  jobMetricsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  jobMetricBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobMetricValue: { fontSize: 12, fontWeight: '700', color: '#444751' },
  jobMetricLabel: { fontSize: 10, color: '#64748B', marginTop: 2 },
  jobDetails: { fontSize: 13, color: '#64748B', marginBottom: 10, lineHeight: 18 },
  tagsLabel: { fontSize: 13, fontWeight: '600', color: '#444751', marginBottom: 6 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tagChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagChipText: { fontSize: 11, color: '#475569', maxWidth: 80 },

  skeleton: { backgroundColor: '#E2E8F0' },
  skeletonCard: { backgroundColor: '#FFF', borderColor: '#E2E8F0' },
  skeletonTextWrap: { marginLeft: 12, flex: 1 },
  skeletonLine: { backgroundColor: '#E2E8F0', borderRadius: 6 },
  skeletonCircle: { backgroundColor: '#E2E8F0' },
});
