import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ProjectCard from '@/components/ProjectCard';
import { projectService } from '@/services/projectService';
import { Project } from '@/models/Project';

export default function FindProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const filters: any = { status: 'ACTIVE' };
      if (filterType !== 'All') {
        filters.category = filterType;
      }
      if (searchText) {
        filters.search = searchText;
      }
      const fetchedProjects = await projectService.getProjects(filters);
      setProjects(fetchedProjects);
      setFilteredProjects(fetchedProjects);
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      Alert.alert('Error', error.message || 'Failed to load projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 🔍 Search & filter logic
  useEffect(() => {
    let result = projects.filter((p) =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );

    if (filterType !== 'All') {
      result = result.filter((p) => p.category === filterType);
    }

    setFilteredProjects(result);
  }, [searchText, filterType, projects]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* 🔙 Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Projects</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 🔎 Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBarWrapper}>
            <Search size={20} color="#94A3B8" />
            <TextInput
              placeholder="Search projects..."
              placeholderTextColor="#94A3B8"
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* 🎯 Filter Buttons (Horizontal Scroll) */}
        <View style={styles.filterSection}>
          <FlatList
            horizontal
            data={['All', 'Web Development', 'UI/UX Design', 'Mobile App', 'Backend', 'Data Science']}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterListContent}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === item && styles.filterButtonActive,
                ]}
                onPress={() => setFilterType(item)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === item && styles.filterButtonTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 🧩 Project List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Searching available projects...</Text>
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Search size={40} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyText}>No projects found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProjects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: 20, marginBottom: 4 }}>
                <ProjectCard project={item} />
              </View>
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4F46E5']}
                tintColor="#4F46E5"
              />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },

  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(100, 116, 139, 0.05)',
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },

  filterSection: {
    marginBottom: 10,
    height: 44,
  },
  filterListContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  filterButtonText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#FFFFFF'
  },

  listContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#64748B', fontSize: 14, fontWeight: '500' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -40 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#94A3B8' },
});
