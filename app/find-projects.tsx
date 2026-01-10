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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
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
    <SafeAreaView style={styles.container}>
      {/* 🔙 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Projects</Text>
      </View>

      {/* 🔎 Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search projects..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* 🎯 Filter Buttons */}
      <View style={styles.filterContainer}>
        {['All', 'Web Development', 'UI/UX Design', 'Mobile App', 'Backend'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filterType === type && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType(type)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === type && styles.filterButtonTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🧩 Project List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      ) : filteredProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No projects found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/project-details?id=${item.id}` as any)}>
              <ProjectCard project={item} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  searchContainer: { marginHorizontal: 16, marginBottom: 12 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  filterButton: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  filterButtonActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterButtonText: { color: '#374151', fontWeight: '600' },
  filterButtonTextActive: { color: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6B7280' },
});
