import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CircleDollarSign } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ProjectCard from '@/components/ProjectCard';

// --- Currency Configuration ---
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, color: '#6366F1' },
  EUR: { symbol: '€', rate: 0.92, color: '#10B981' },
  PKR: { symbol: '₨', rate: 280, color: '#F59E0B' },
};

type CurrencyKey = keyof typeof CURRENCIES;

export default function FindProjectsScreen() {
  const router = useRouter();

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

  const [curKey, setCurKey] = useState<CurrencyKey>('USD');
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('All');

  // --- Currency Toggle ---
  const switchCurrency = () => {
    const keys = Object.keys(CURRENCIES) as CurrencyKey[];
    setCurKey(keys[(keys.indexOf(curKey) + 1) % keys.length]);
  };

  const activeRate = CURRENCIES[curKey].rate;
  const activeSymbol = CURRENCIES[curKey].symbol;

  // 🔍 Filter logic
  const filteredProjects = useMemo(() => {
    let result = STATIC_PROJECTS.filter((p) =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );

    if (filterType !== 'All') {
      result = result.filter((p) =>
        Array.isArray(p.category)
          ? p.category.includes(filterType)
          : p.category === filterType
      );
    }
    return result;
  }, [searchText, filterType]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 🔙 Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Projects</Text>
        </View>

        <TouchableOpacity style={styles.currencyPill} onPress={switchCurrency}>
          <CircleDollarSign size={16} color={CURRENCIES[curKey].color} />
          <Text style={styles.currencyText}>{curKey}</Text>
        </TouchableOpacity>
      </View>

      {/* 🔎 Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search projects..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* 🎯 Filter Buttons */}
      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', 'Web Development', 'UI/UX Design', 'Mobile App', 'Backend']}
          contentContainerStyle={styles.filterContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === item && styles.filterButtonActive,
              ]}
              onPress={() => setFilterType(item)}
            >
              <Text style={[
                styles.filterButtonText,
                filterType === item && styles.filterButtonTextActive,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 🧩 Project List */}
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard 
            project={item} 
            currencyRate={activeRate} 
            currencySymbol={activeSymbol} 
          />
        )}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 16 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  currencyPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  currencyText: { fontSize: 12, fontWeight: '800', color: '#111827' },
  searchContainer: { marginHorizontal: 16, marginBottom: 12 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 15,
  },
  filterContainer: { paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  filterButton: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 20, 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    backgroundColor: '#FFFFFF' 
  },
  filterButtonActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterButtonText: { color: '#4B5563', fontWeight: '600', fontSize: 13 },
  filterButtonTextActive: { color: '#FFFFFF' },
});