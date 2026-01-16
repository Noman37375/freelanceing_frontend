// ProjectsScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Filter, MapPin, Clock, X, ChevronDown, SlidersHorizontal } from "lucide-react-native";
import ProjectCard from "@/components/ProjectCard";

export default function ProjectsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [location, setLocation] = useState("");

  const categories = ["All", "Design", "Development", "Writing", "Marketing", "Data"];

  const STATIC_PROJECTS = [
    { id: "1", title: "React Native Mobile App", skills: ["Development", "UI/UX"], budget: "$500 - $1000", postedTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), deadline: "7 days", location: "Karachi", proposals: 5 },
    { id: "2", title: "Website Redesign", skills: ["Design", "Development"], budget: "$300 - $700", postedTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), deadline: "14 days", location: "Remote", proposals: 8 },
    { id: "3", title: "Backend API Development", skills: ["Development"], budget: "$400 - $800", postedTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), deadline: "10 days", location: "Lahore", proposals: 3 },
  ];

  const timeAgo = (timestamp: string) => {
    const diffDays = Math.round((new Date().getTime() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays}d ago`;
  };

  const filteredProjects = STATIC_PROJECTS.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || project.skills?.some(s => s.includes(selectedCategory));
    return matchesSearch && matchesCategory;
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

        {/* Categories Pills */}
        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryPill, selectedCategory === category && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main List */}
        <ScrollView style={styles.projectsList} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.listHeader}>
            <Text style={styles.resultsCount}>{filteredProjects.length} tasks found</Text>
            <TouchableOpacity style={styles.sortToggle}>
              <Text style={styles.sortToggleText}>Newest first</Text>
              <ChevronDown size={14} color="#6366F1" />
            </TouchableOpacity>
          </View>

          {filteredProjects.map((project) => (
            <View key={project.id} style={styles.projectCardWrapper}>
              <ProjectCard project={project} showDetails />
              <View style={styles.projectFooter}>
                <View style={styles.metaGroup}>
                  <View style={styles.badge}>
                    <MapPin size={12} color="#64748B" />
                    <Text style={styles.badgeText}>{project.location}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Clock size={12} color="#64748B" />
                    <Text style={styles.badgeText}>{timeAgo(project.postedTime)}</Text>
                  </View>
                </View>
                <Text style={styles.proposalCount}>{project.proposals} proposals</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Modern Filter Modal */}
      <Modal visible={showFilter} transparent animationType="slide">
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 55,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#1E293B", fontWeight: '500' },
  categoriesWrapper: { paddingVertical: 20 },
  categoriesContent: { paddingHorizontal: 20, gap: 8 },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: { backgroundColor: "#4F46E5", borderColor: '#4F46E5' },
  categoryText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  categoryTextActive: { color: "#FFFFFF" },
  projectsList: { flex: 1, paddingHorizontal: 20 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  resultsCount: { fontSize: 14, fontWeight: "700", color: "#64748B" },
  sortToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortToggleText: { fontSize: 14, color: '#6366F1', fontWeight: '600' },
  projectCardWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaGroup: { flexDirection: 'row', gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  proposalCount: { fontSize: 12, color: "#4F46E5", fontWeight: "700" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.5)", justifyContent: "flex-end" },
  filterSheet: { backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B" },
  closeCircle: { backgroundColor: '#F1F5F9', padding: 8, borderRadius: 20 },
  modalLabel: { fontSize: 14, fontWeight: "700", color: "#475569", marginBottom: 10 },
  modalInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#E2E8F0', height: 50, marginBottom: 25 },
  modalInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B' },
  modalActions: { flexDirection: "row", gap: 15 },
  clearBtn: { flex: 1, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 16, backgroundColor: '#F1F5F9' },
  applyBtn: { flex: 2, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 16, backgroundColor: '#4F46E5' },
  clearBtnText: { color: "#475569", fontWeight: "700" },
  applyBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});