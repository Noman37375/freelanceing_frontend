import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ProjectCard from '@/components/ProjectCard';

export default function FindProjectsScreen() {
  const router = useRouter();

  // 🔹 Static project data
  const STATIC_PROJECTS = [
    {
      id: '1',
      title: 'React Native Mobile App',
      client: { name: 'Tech Startup' },
      budgetMin: 300,
      budgetMax: 600,
      postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      skills: ['React Native', 'JavaScript', 'UI/UX', 'API Integration'],
      description: 'Build a modern mobile app with React Native.',
      status: 'available',
      category: ['Mobile App', 'UI/UX Design'],
    },
    {
      id: '2',
      title: 'Website Redesign',
      client: { name: 'Design Agency' },
      budgetMin: 200,
      budgetMax: 500,
      postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      skills: ['HTML', 'CSS', 'JavaScript', 'UI/UX'],
      description: 'Redesign an existing website to modern standards.',
      status: 'available',
      category: ['Web Development', 'UI/UX Design'],
    },
    {
      id: '3',
      title: 'Backend API Development',
      client: { name: 'SaaS Company' },
      budgetMin: 400,
      budgetMax: 800,
      postedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      skills: ['Node.js', 'Express', 'MongoDB', 'API'],
      description: 'Develop RESTful APIs for a SaaS platform.',
      status: 'available',
      category: ['Backend', 'Web Development'],
    },
    {
      id: '4',
      title: 'E-commerce Mobile App',
      client: { name: 'Retail Startup' },
      budgetMin: 500,
      budgetMax: 1000,
      postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      skills: ['React Native', 'Stripe', 'UI/UX'],
      description: 'Create a shopping app with payment integration.',
      status: 'available',
      category: ['Mobile App', 'UI/UX Design'],
    },
  ];

  const [projects, setProjects] = useState(STATIC_PROJECTS);
  const [filteredProjects, setFilteredProjects] = useState(STATIC_PROJECTS);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('All');

  // 🔍 Search & filter logic
  useEffect(() => {
    let result = projects.filter((p) =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );

    if (filterType !== 'All') {
      result = result.filter((p) =>
        Array.isArray(p.category)
          ? p.category.includes(filterType)
          : p.category === filterType
      );
    }

    setFilteredProjects(result);
  }, [searchText, filterType, projects]);

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
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProjectCard project={item} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
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
});
