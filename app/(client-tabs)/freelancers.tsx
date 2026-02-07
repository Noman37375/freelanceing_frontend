import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { Search, Filter, User, Star, MapPin, Briefcase, ChevronLeft, UserCheck } from 'lucide-react-native';
import { freelancerService, Freelancer } from '@/services/freelancerService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Freelancers() {
  const router = useRouter();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchFreelancers();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFreelancers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeFilter]);

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
      case 'Available': return '#10B981';
      case 'Busy': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topGradient} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Find Talent</Text>
          <Text style={styles.headerSubtitle}>Discover top freelancers</Text>
        </View>
        <TouchableOpacity style={styles.iconCircle}>
          <Filter size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentHeader}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by skills, name..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filtersRow}>
          {['All', 'Top Rated', 'Available', 'New'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.activeChip]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.chipText, activeFilter === filter && styles.activeChipText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#282A32" />
        </View>
      ) : (
        <FlatList
          data={freelancers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: freelancer }) => (
            <TouchableOpacity key={freelancer.id} style={styles.freelancerCard} activeOpacity={0.9}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarBox}>
                  <User size={28} color="#282A32" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nameText}>{freelancer.name}</Text>
                  <Text style={styles.titleText}>{freelancer.title}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: getAvailabilityColor(freelancer.availability) }]} />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.inlineStat}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.boldText}>{freelancer.rating}</Text>
                  <Text style={styles.mutedText}>({freelancer.reviews})</Text>
                </View>
                <Text style={styles.divider}>•</Text>
                <Text style={styles.priceText}>{freelancer.hourlyRate}</Text>
                <Text style={styles.mutedText}>/hr</Text>
              </View>

              <View style={styles.badgesRow}>
                {freelancer.skills.slice(0, 3).map((skill, index) => (
                  <View key={index} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
                {freelancer.skills.length > 3 && (
                  <Text style={styles.moreText}>+{freelancer.skills.length - 3} more</Text>
                )}
              </View>

              <View style={styles.footerRow}>
                <View style={styles.inlineStat}>
                  <MapPin size={12} color="#94A3B8" />
                  <Text style={styles.footerText}>{freelancer.location}</Text>
                </View>
                <View style={[styles.inlineStat, { marginLeft: 16 }]}>
                  <Briefcase size={12} color="#94A3B8" />
                  <Text style={styles.footerText}>{freelancer.completedProjects} projects</Text>
                </View>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.profileBtn}>
                  <Text style={styles.profileBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{error ? 'Connection Error' : 'No matches found'}</Text>
              <Text style={styles.emptySubtitle}>
                {error || 'Try adjusting your search or filters to find what you are looking for.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: '#1E1B4B',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#C7D2FE',
    fontWeight: '500',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#282A32',
    fontWeight: '500',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activeChip: {
    backgroundColor: '#282A32',
    borderColor: '#282A32',
  },
  chipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  freelancerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E5E4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 2,
  },
  titleText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inlineStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  boldText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#282A32',
  },
  mutedText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  divider: {
    marginHorizontal: 8,
    color: '#E2E8F0',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#282A32',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  skillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  moreText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    alignSelf: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  profileBtn: {
    backgroundColor: '#E5E4EA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  profileBtnText: {
    color: '#282A32',
    fontWeight: '700',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#282A32',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
