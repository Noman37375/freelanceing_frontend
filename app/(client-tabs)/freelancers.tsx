import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Search, Filter, User, Star, MapPin, Briefcase } from 'lucide-react-native';
import { freelancerService, Freelancer } from '@/services/freelancerService';
import { COLORS } from '@/utils/constants';
import ScreenHeader from '@/components/ScreenHeader';

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      const data = await freelancerService.getFreelancers({
        search: searchQuery || undefined,
      });
      setFreelancers(data);
    } catch (error: any) {
      console.error('Failed to fetch freelancers:', error);
      setError(error?.message || 'Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
        return COLORS.success;
      case 'Busy':
        return COLORS.accent;
      case 'Not Available':
        return COLORS.error;
      default:
        return COLORS.success;
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Find Freelancers" />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.gray500} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by skills, name..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={COLORS.primary} strokeWidth={2} />
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={freelancers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: freelancer }) => (
            <TouchableOpacity key={freelancer.id} style={styles.freelancerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarContainer}>
                  <User size={28} color={COLORS.primary} strokeWidth={2} />
                </View>
                <View style={styles.freelancerInfo}>
                  <Text style={styles.freelancerName}>{freelancer.name}</Text>
                  <Text style={styles.freelancerTitle}>{freelancer.title}</Text>
                </View>
                <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor(freelancer.availability) }]} />
              </View>

              <View style={styles.ratingRow}>
                <View style={styles.ratingItem}>
                  <Star size={16} color={COLORS.accent} strokeWidth={2} fill={COLORS.accent} />
                  <Text style={styles.ratingText}>
                    {freelancer.rating} ({freelancer.reviews})
                  </Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.hourlyRate}>{freelancer.hourlyRate}</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={14} color={COLORS.gray500} strokeWidth={2} />
                  <Text style={styles.metaText}>{freelancer.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Briefcase size={14} color={COLORS.gray500} strokeWidth={2} />
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
          )}
          ListEmptyComponent={
            error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Couldn’t load freelancers</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchFreelancers} activeOpacity={0.85}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No freelancers found</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray100 },
  searchContainer: { flexDirection: 'row', padding: 20, gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.gray800 },
  filterButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 16, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200 },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, color: COLORS.gray500, fontWeight: '500' },
  activeChipText: { fontSize: 14, color: COLORS.white, fontWeight: '600' },
  listContent: { padding: 20, paddingTop: 0, paddingBottom: 100 },
  freelancerCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.infoLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  freelancerInfo: { flex: 1 },
  freelancerName: { fontSize: 18, fontWeight: '700', color: COLORS.gray800, marginBottom: 4 },
  freelancerTitle: { fontSize: 14, color: COLORS.gray500, fontWeight: '500' },
  availabilityDot: { width: 12, height: 12, borderRadius: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  ratingItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, color: COLORS.gray800, fontWeight: '600' },
  divider: { width: 1, height: 16, backgroundColor: COLORS.gray200 },
  hourlyRate: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: COLORS.gray500 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  skillBadge: { backgroundColor: COLORS.infoLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  skillText: { fontSize: 12, color: COLORS.primaryDark, fontWeight: '600' },
  viewProfileButton: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  viewProfileText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  loadingContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: COLORS.gray500 },
  errorContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  errorTitle: { fontSize: 16, fontWeight: '800', color: COLORS.gray800, marginBottom: 6, textAlign: 'center' },
  errorMessage: { fontSize: 14, color: COLORS.gray600, lineHeight: 20, textAlign: 'center' },
  retryButton: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
});
