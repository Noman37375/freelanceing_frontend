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
import { Search, Filter, MapPin, Clock, X } from "lucide-react-native";
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

  const categories = [
    "All",
    "Design",
    "Development",
    "Writing",
    "Marketing",
    "Data",
  ];

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
    const postedDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - postedDate.getTime();

    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffHours < 1) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
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

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setPostedWithin("");
    setDuration("");
    setSelectedCategory("All");
    setLocation("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Tasks</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(true)}
        >
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search available tasks..."
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
                onPress={() => router.push(`/project-details?id=${project.id}`)}
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
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter location"
                value={location}
                onChangeText={setLocation}
              />

              <Text style={styles.modalLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.optionButton, selectedCategory === cat && styles.optionActive]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.optionText, selectedCategory === cat && styles.optionTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilter(false)}>
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  filterButton: { padding: 8 },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
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
  filterModal: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  modalLabel: { fontSize: 15, fontWeight: "500", color: "#374151", marginTop: 16, marginBottom: 6 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 10, fontSize: 15 },
  optionButton: { backgroundColor: "#F3F4F6", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  optionActive: { backgroundColor: "#3B82F6" },
  optionText: { color: "#374151", fontSize: 14 },
  optionTextActive: { color: "#fff" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  resetBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: "#E5E7EB", marginRight: 10, alignItems: "center" },
  applyBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: "#3B82F6", alignItems: "center" },
  resetText: { color: "#111827", fontWeight: "500" },
  applyText: { color: "#fff", fontWeight: "500" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  loadingText: { marginTop: 12, color: "#6B7280", fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#374151", marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: "#6B7280" },
});
