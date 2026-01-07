import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Filter, MapPin, Clock, X } from "lucide-react-native";
import ProjectCard from "@/components/ProjectCard";

export default function ProjectsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

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

  // 🔹 Static project data
  const STATIC_PROJECTS = [
    {
      id: "1",
      title: "React Native Mobile App",
      skills: ["Development", "UI/UX"],
      budget: "$500 - $1000",
      postedTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: "7 days",
      location: "Karachi",
      proposals: 5,
    },
    {
      id: "2",
      title: "Website Redesign",
      skills: ["Design", "Development"],
      budget: "$300 - $700",
      postedTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: "14 days",
      location: "Remote",
      proposals: 8,
    },
    {
      id: "3",
      title: "Backend API Development",
      skills: ["Development"],
      budget: "$400 - $800",
      postedTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: "10 days",
      location: "Lahore",
      proposals: 3,
    },
    {
      id: "4",
      title: "Content Writing for Blog",
      skills: ["Writing", "Marketing"],
      budget: "$100 - $300",
      postedTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: "3 days",
      location: "Remote",
      proposals: 12,
    },
  ];

  const [projects] = useState(STATIC_PROJECTS);

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
      project.skills?.some((skill) =>
        skill.toLowerCase().includes(selectedCategory.toLowerCase())
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
      <ScrollView style={styles.projectsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsText}>{filteredProjects.length} available tasks</Text>
        {filteredProjects.map((project) => (
          <View key={project.id} style={styles.projectCardContainer}>
            <ProjectCard project={project} showDetails />
            <View style={styles.projectMeta}>
              <View style={styles.metaItem}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.metaText}>{project.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.metaText}>{timeAgo(project.postedTime)}</Text>
              </View>
              <Text style={styles.proposalsText}>{project.proposals} proposals</Text>
            </View>
          </View>
        ))}
      </ScrollView>

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
});
