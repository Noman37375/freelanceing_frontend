import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Filter, MapPin, Clock, X, ChevronDown, SlidersHorizontal } from "lucide-react-native";
import ProjectCard from "@/components/ProjectCard";
import { projectService } from "@/services/projectService";
import { Project } from "@/models/Project";
import { useRouter } from "expo-router";

export default function ProjectsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [postedWithin, setPostedWithin] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");

  const categories = ["All", "Design", "Development", "Writing", "Marketing", "Data"];

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const filters: any = { status: 'ACTIVE' };
      if (selectedCategory !== 'All') {
        filters.category = selectedCategory;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }
      if (location) {
        // Note: Location filter might need backend support
      }
      const fetchedProjects = await projectService.getProjects(filters);
      setProjects(fetchedProjects);
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
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const timeAgo = (timestamp: string) => {
    const diffDays = Math.round((new Date().getTime() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays}d ago`;
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      project.category === selectedCategory ||
      project.tags?.some((tag) =>
        tag.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    const matchesLocation = location
      ? project.location?.toLowerCase().includes(location.toLowerCase())
      : true;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBackground} />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Discover</Text>
            <Text style={styles.headerTitle}>Available Tasks</Text>
          </View>
          <TouchableOpacity style={styles.headerIconButton} onPress={() => setShowFilter(true)}>
            <SlidersHorizontal size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar - Floating Style */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by service or title..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Project List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.projectsList} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.resultsText}>{filteredProjects.length} available tasks</Text>
          {filteredProjects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No projects found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          ) : (
            filteredProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() => router.push(`/project-details?id=${project.id}` as any)}
              >
                <View style={styles.projectCardContainer}>
                  <ProjectCard project={project} />
                  <View style={styles.projectMeta}>
                    {project.location && (
                      <View style={styles.metaItem}>
                        <MapPin size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{project.location}</Text>
                      </View>
                    )}
                    {project.createdAt && (
                      <View style={styles.metaItem}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{timeAgo(project.createdAt)}</Text>
                      </View>
                    )}
                    <Text style={styles.proposalsText}>{project.bidsCount || 0} bids</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refine Search</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)} style={styles.closeCircle}>
                <X size={20} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Location</Text>
            <View style={styles.modalInputWrapper}>
              <MapPin size={18} color="#94A3B8" />
              <TextInput style={styles.modalInput} placeholder="e.g. Remote" value={location} onChangeText={setLocation} />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearBtn} onPress={() => {setLocation(""); setSelectedCategory("All");}}>
                <Text style={styles.clearBtnText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilter(false)}>
                <Text style={styles.applyBtnText}>Show Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  topBackground: {
    position: 'absolute',
    top: 0,
    height: 200,
    width: '100%',
    backgroundColor: '#1E1B4B',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerSubtitle: { color: '#C7D2FE', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#FFFFFF" },
  headerIconButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrapper: { paddingHorizontal: 20, marginTop: 5 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#111827" },
  categoriesContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
  },
  categoriesContent: { paddingHorizontal: 16, gap: 10 },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  categoryButtonActive: { backgroundColor: "#3B82F6" },
  categoryText: { fontSize: 15, fontWeight: "500", color: "#6B7280" },
  categoryTextActive: { color: "#FFFFFF" },
  projectsList: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },
  resultsText: { fontSize: 16, color: "#6B7280", marginVertical: 16 },
  projectCardContainer: { marginBottom: 16 },
  projectMeta: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#6B7280" },
  proposalsText: { fontSize: 12, color: "#3B82F6", fontWeight: "500", marginLeft: "auto" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  filterSheet: { 
    backgroundColor: "#fff", 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 20, 
    maxHeight: "85%",
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#CBD5E1",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#1E293B" },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalLabel: { fontSize: 15, fontWeight: "600", color: "#475569", marginTop: 20, marginBottom: 8 },
  modalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalInput: { flex: 1, fontSize: 15, color: "#1E293B" },
  modalActions: { 
    flexDirection: "row", 
    gap: 12, 
    marginTop: 32,
  },
  clearBtn: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: "#F1F5F9", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  clearBtnText: { color: "#475569", fontWeight: "600", fontSize: 15 },
  applyBtn: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: "#3B82F6", 
    alignItems: "center",
  },
  applyBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  loadingText: { marginTop: 12, color: "#6B7280", fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#374151", marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: "#6B7280" },
});
