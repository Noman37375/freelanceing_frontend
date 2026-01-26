import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Search, Plus, ArrowLeft, Globe, CheckCircle2, Clock, Activity } from 'lucide-react-native';
import ProjectCard from './components/ProjectCard';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// --- DATA ---
const PROJECTS_DATA = [
  { id: '1', title: 'Mobile App UI/UX Design', budget: 2500, status: 'In Progress' as const, freelancer: 'Sarah Johnson', deadline: 'Dec 20, 2025' },
  { id: '2', title: 'E-commerce Website Development', budget: 5000, status: 'Active' as const, freelancer: 'Michael Chen', deadline: 'Dec 28, 2025' },
  { id: '3', title: 'Logo Design & Branding', budget: 800, status: 'Completed' as const, freelancer: 'Emma Davis', deadline: 'Dec 10, 2025' },
  { id: '4', title: 'SEO Optimization & Content Writing', budget: 1200, status: 'In Progress' as const, freelancer: 'David Wilson', deadline: 'Dec 18, 2025' },
  { id: '5', title: 'Social Media Marketing Campaign', budget: 1800, status: 'Active' as const, freelancer: 'Lisa Anderson', deadline: 'Dec 25, 2025' },
];

const EXCHANGE_RATES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  PKR: { symbol: 'Rs', rate: 278.50 },
};

type CurrencyKey = keyof typeof EXCHANGE_RATES;
type StatusFilter = 'All' | 'Active' | 'Completed' | 'In Progress';

export default function Projects() {
  const router = useRouter();
  
  // --- STATE ---
  const [currency, setCurrency] = useState<CurrencyKey>('USD');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- LOGIC ---
  const toggleCurrency = () => {
    const keys: CurrencyKey[] = ['USD', 'EUR', 'PKR'];
    const nextIndex = (keys.indexOf(currency) + 1) % keys.length;
    setCurrency(keys[nextIndex]);
  };

  const formatBudget = (usdAmount: number) => {
    const config = EXCHANGE_RATES[currency];
    const converted = (usdAmount * config.rate).toLocaleString(undefined, { maximumFractionDigits: 0 });
    return `${config.symbol} ${converted}`;
  };

  const filteredProjects = useMemo(() => {
    return PROJECTS_DATA.filter(project => {
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           project.freelancer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchQuery]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" strokeWidth={2.5} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Projects</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.currencyButton} onPress={toggleCurrency}>
            <Globe size={16} color="#6366F1" />
            <Text style={styles.currencyText}>{currency}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.addGradient}>
              <Plus size={20} color="#FFFFFF" strokeWidth={3} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // Ensures clicks work even if keyboard is open
      >
        {/* STATS CHIPS */}
        <View style={styles.statsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScrollContent}>
            <TouchableOpacity 
              onPress={() => setStatusFilter('All')}
              style={[styles.statChip, statusFilter === 'All' && styles.statChipActive]}
            >
              <Text style={styles.statChipValue}>{PROJECTS_DATA.length}</Text>
              <Text style={styles.statChipLabel}>Total</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setStatusFilter('Active')}
              style={[styles.statChip, statusFilter === 'Active' && styles.statChipActive]}
            >
              <Clock size={14} color="#6366F1" />
              <Text style={styles.statChipLabel}>Active</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setStatusFilter('In Progress')}
              style={[styles.statChip, statusFilter === 'In Progress' && styles.statChipActive]}
            >
              <Activity size={14} color="#F59E0B" />
              <Text style={styles.statChipLabel}>In Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setStatusFilter('Completed')}
              style={[styles.statChip, statusFilter === 'Completed' && styles.statChipActive]}
            >
              <CheckCircle2 size={14} color="#10B981" />
              <Text style={styles.statChipLabel}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search project..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* PROJECTS LIST */}
        <View style={styles.listContent}>
          <Text style={styles.listSubtitle}>{statusFilter.toUpperCase()} PROJECTS</Text>

          {filteredProjects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items found.</Text>
            </View>
          ) : (
            filteredProjects.map((project) => (
              <View key={project.id} style={styles.cardWrapper}>
                <ProjectCard
                  {...project}
                  budget={formatBudget(project.budget)}
                  onPress={() => {
                    // This is the navigation trigger
                    router.push({ 
                      pathname: '/client/ProjectDetail', 
                      params: { id: project.id } 
                    });
                  }}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  currencyButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12 },
  currencyText: { fontSize: 12, fontWeight: '800', color: '#6366F1' },
  addButton: { width: 44, height: 44, borderRadius: 14, overflow: 'hidden' },
  addGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsSection: { marginTop: 20 },
  statsScrollContent: { paddingHorizontal: 24, gap: 10 },
  statChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  statChipActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  statChipValue: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  statChipLabel: { fontSize: 13, color: '#64748B', fontWeight: '700' },
  searchSection: { paddingHorizontal: 24, paddingVertical: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '500', color: '#1E293B' },
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  listSubtitle: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 15 },
  cardWrapper: { marginBottom: 14 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontWeight: '600' }
});