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
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, MapPin, X, SlidersHorizontal, ChevronLeft, MoreHorizontal } from "lucide-react-native";
import ProjectListCard from "@/components/ProjectListCard";
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
    if (!timestamp) return 'Recently';
    const diffMs = new Date().getTime() - new Date(timestamp).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Today' : `${diffDays}d ago`;
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
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top: light gray bg – back, title "Search", menu (three dots) */}
        <View style={styles.topSection}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Search</Text>
            {/* <TouchableOpacity style={styles.menuButton} onPress={() => setShowFilter(true)}>
              <MoreHorizontal size={22} color="#1E293B" />
            </TouchableOpacity> */}
          </View>

          {/* Search bar (light gray) + blue FAB on right */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Search size={20} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search jobs..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.fabFilter} onPress={() => setShowFilter(true)}>
              <SlidersHorizontal size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Bar */}
        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.activeChip,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === category && styles.activeChipText,
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
            <ActivityIndicator size="large" color="#282A32" />
            <Text style={styles.loadingText}>Fetching opportunities...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#282A32" />
            }
          >
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>{filteredProjects.length} projects found</Text>
            </View>

            {filteredProjects.length === 0 ? (
              <View style={styles.emptyCard}>
                <Search size={48} color="#E2E8F0" />
                <Text style={styles.emptyTitle}>No projects found</Text>
                <Text style={styles.emptySubtitle}>Try widening your search or category filters.</Text>
              </View>
            ) : (
              filteredProjects.map((project) => (
                <ProjectListCard
                  key={project.id}
                  project={project}
                  onPress={() => router.push(`/project-details?id=${project.id}` as any)}
                  noHorizontalMargin
                />
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* Filter Modal */}
        <Modal
          visible={showFilter}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFilter(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Refine Results</Text>
                <TouchableOpacity onPress={() => setShowFilter(false)} style={styles.closeBtn}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Remote, Europe"
                    placeholderTextColor="#94A3B8"
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={() => { setLocation(""); setSelectedCategory("All"); }}
                >
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilter(false)}>
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const LIGHT_BG = '#F1F5F9';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  topSection: {
    backgroundColor: LIGHT_BG,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: "800",
    color: "#1E293B",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#444751",
    fontWeight: '500'
  },
  categoriesWrapper: {
    marginBottom: 12,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activeChip: {
    backgroundColor: "#282A32",
    borderColor: '#282A32',
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B"
  },
  activeChipText: {
    color: "#FFFFFF"
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  resultsHeader: {
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: '600'
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.03)',
      },
    }),
  },
  cardInfoFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: -8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: '500'
  },
  bidText: {
    fontSize: 12,
    color: "#282A32",
    fontWeight: "700"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
    fontWeight: '500'
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#444751',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end"
  },
  filterSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#444751"
  },
  closeBtn: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#444751"
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: 'center',
  },
  resetBtnText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 15
  },
  applyBtn: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#282A32",
    alignItems: "center",
    justifyContent: 'center',
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15
  },
});
