import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Search, Filter, User, Star, MapPin, Briefcase } from 'lucide-react-native';
import { freelancerService, Freelancer } from '@/services/freelancerService';

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFreelancers();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFreelancers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const data = await freelancerService.getFreelancers({
        search: searchQuery || undefined,
      });
      setFreelancers(data);
    } catch (error: any) {
      console.error('Failed to fetch freelancers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
        return '#10B981';
      case 'Busy':
        return '#F59E0B';
      case 'Not Available':
        return '#EF4444';
      default:
        return '#10B981';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Freelancers</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by skills, name..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#3B82F6" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersRow}>
        <TouchableOpacity style={[styles.filterChip, styles.activeChip]}>
          <Text style={styles.activeChipText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.chipText}>Top Rated</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.chipText}>Available</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.chipText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.freelancersList} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.freelancersContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : freelancers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No freelancers found</Text>
            </View>
          ) : (
            freelancers.map((freelancer) => (
              <TouchableOpacity key={freelancer.id} style={styles.freelancerCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarContainer}>
                    <User size={28} color="#3B82F6" strokeWidth={2} />
                  </View>
                  <View style={styles.freelancerInfo}>
                    <Text style={styles.freelancerName}>{freelancer.name}</Text>
                    <Text style={styles.freelancerTitle}>{freelancer.title}</Text>
                  </View>
                  <View
                    style={[
                      styles.availabilityDot,
                      { backgroundColor: getAvailabilityColor(freelancer.availability) },
                    ]}
                  />
                </View>

                <View style={styles.ratingRow}>
                  <View style={styles.ratingItem}>
                    <Star size={16} color="#F59E0B" strokeWidth={2} fill="#F59E0B" />
                    <Text style={styles.ratingText}>
                      {freelancer.rating} ({freelancer.reviews})
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.hourlyRate}>{freelancer.hourlyRate}</Text>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.metaText}>{freelancer.location}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Briefcase size={14} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.metaText}>{freelancer.completedProjects} projects</Text>
                  </View>
                </View>

                <View style={styles.skillsRow}>
                  {freelancer.skills.slice(0, 3).map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.viewProfileButton}>
                  <Text style={styles.viewProfileText}>View Profile</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  searchContainer: { flexDirection: 'row', padding: 20, gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  searchInput: { flex: 1, fontSize: 16, color: '#1F2937' },
  filterButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  activeChip: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  chipText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  activeChipText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  freelancersList: { flex: 1 },
  freelancersContent: { padding: 20, paddingTop: 0 },
  freelancerCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  freelancerInfo: { flex: 1 },
  freelancerName: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  freelancerTitle: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  availabilityDot: { width: 12, height: 12, borderRadius: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  ratingItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  divider: { width: 1, height: 16, backgroundColor: '#E5E7EB' },
  hourlyRate: { fontSize: 16, fontWeight: '700', color: '#3B82F6' },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: '#6B7280' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  skillBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  skillText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
  viewProfileButton: { backgroundColor: '#3B82F6', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  viewProfileText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loadingContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#6B7280' },
});
