import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Filter, Plus, ArrowLeft } from 'lucide-react-native';
import ProjectCard from './components/ProjectCard';
import { useRouter } from 'expo-router';

const PROJECTS_DATA = [
  { id: '1', title: 'Mobile App UI/UX Design', budget: '$2,500', status: 'In Progress' as const, freelancer: 'Sarah Johnson', deadline: 'Dec 20, 2025' },
  { id: '2', title: 'E-commerce Website Development', budget: '$5,000', status: 'Active' as const, freelancer: 'Michael Chen', deadline: 'Dec 28, 2025' },
  { id: '3', title: 'Logo Design & Branding', budget: '$800', status: 'Completed' as const, freelancer: 'Emma Davis', deadline: 'Dec 10, 2025' },
  { id: '4', title: 'SEO Optimization & Content Writing', budget: '$1,200', status: 'In Progress' as const, freelancer: 'David Wilson', deadline: 'Dec 18, 2025' },
  { id: '5', title: 'Social Media Marketing Campaign', budget: '$1,800', status: 'Active' as const, freelancer: 'Lisa Anderson', deadline: 'Dec 25, 2025' },
  { id: '6', title: 'WordPress Blog Setup', budget: '$600', status: 'Completed' as const, freelancer: 'Robert Taylor', deadline: 'Dec 5, 2025' },
  { id: '7', title: 'Video Editing for YouTube', budget: '$900', status: 'Pending' as const, deadline: 'Dec 15, 2025' },
];

export default function Projects() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Projects</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#3B82F6" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>5</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>4</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>3</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Projects List */}
      <ScrollView style={styles.projectsList} showsVerticalScrollIndicator={false}>
        <View style={styles.projectsContent}>
          {PROJECTS_DATA.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              budget={project.budget}
              status={project.status}
              freelancer={project.freelancer}
              deadline={project.deadline}
              onPress={() =>
                router.push({
                  pathname: '/client/ProjectDetail',
                  params: { id: project.id },
                })
              }
 // <-- Connected to ProjectDetail
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: { flexDirection: 'row', padding: 20, gap: 12 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#1F2937' },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  projectsList: { flex: 1 },
  projectsContent: { padding: 20, paddingTop: 0 },
});

