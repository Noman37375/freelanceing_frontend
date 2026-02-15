import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { Search, Filter, User, Star, MapPin, Briefcase, ChevronLeft, UserCheck, X, Award, TrendingUp } from 'lucide-react-native';
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
      case 'Available': return '#444751';
      case 'Busy': return '#C2C2C8';
      default: return '#E5E4EA';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* CLEAN HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={22} color="#282A32" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Find Talent</Text>
            <Text style={styles.headerSubtitle}>{freelancers.length} freelancers</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#282A32" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* SEARCH & FILTERS */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#C2C2C8" strokeWidth={2.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by skills, name..."
              placeholderTextColor="#C2C2C8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
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

        {/* FREELANCERS LIST */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#444751" />
          </View>
        ) : (
          <FlatList
            data={freelancers}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item: freelancer }) => (
              <TouchableOpacity 
                key={freelancer.id} 
                style={styles.freelancerCard} 
                activeOpacity={0.7}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarBox}>
                    <User size={26} color="#444751" strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nameText}>{freelancer.name}</Text>
                    <Text style={styles.titleText}>{freelancer.title}</Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: getAvailabilityColor(freelancer.availability) }]} />
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Star size={14} color="#444751" fill="#444751" strokeWidth={2} />
                    <Text style={styles.statValue}>{freelancer.rating}</Text>
                    <Text style={styles.statLabel}>({freelancer.reviews})</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.priceValue}>{freelancer.hourlyRate}</Text>
                    <Text style={styles.priceLabel}>/hr</Text>
                  </View>
                </View>

                {/* Skills */}
                <View style={styles.skillsRow}>
                  {freelancer.skills.slice(0, 3).map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                  {freelancer.skills.length > 3 && (
                    <Text style={styles.moreText}>+{freelancer.skills.length - 3}</Text>
                  )}
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.footerLeft}>
                    <View style={styles.footerItem}>
                      <MapPin size={13} color="#C2C2C8" strokeWidth={2} />
                      <Text style={styles.footerText}>{freelancer.location}</Text>
                    </View>
                    <View style={styles.footerDot} />
                    <View style={styles.footerItem}>
                      <Briefcase size={13} color="#C2C2C8" strokeWidth={2} />
                      <Text style={styles.footerText}>{freelancer.completedProjects} done</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBox}>
                  <UserCheck size={40} color="#C2C2C8" strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>
                  {error ? 'Connection Error' : 'No Freelancers Found'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {error || 'Try adjusting your search or filters to find the perfect match'}
                </Text>
                {error && (
                  <TouchableOpacity style={styles.emptyActionBtn} onPress={fetchFreelancers}>
                    <Text style={styles.emptyActionText}>Try Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F8',
  },

  // ========== HEADER ==========
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E4EA',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#282A32',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#C2C2C8',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ========== SEARCH SECTION ==========
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E4EA',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#282A32',
    fontWeight: '600',
  },

  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F4F4F8',
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  activeChip: {
    backgroundColor: '#444751',
    borderColor: '#444751',
  },
  chipText: {
    fontSize: 13,
    color: '#C2C2C8',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  activeChipText: {
    color: '#FFFFFF',
  },

  // ========== LIST ==========
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },

  // ========== FREELANCER CARD ==========
  freelancerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F4F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  titleText: {
    fontSize: 13,
    color: '#C2C2C8',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // ========== STATS ROW ==========
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E4EA',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#282A32',
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 13,
    color: '#C2C2C8',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E5E4EA',
    marginHorizontal: 12,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#282A32',
    letterSpacing: -0.3,
  },
  priceLabel: {
    fontSize: 13,
    color: '#C2C2C8',
    fontWeight: '600',
  },

  // ========== SKILLS ==========
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  skillBadge: {
    backgroundColor: '#F4F4F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  skillText: {
    fontSize: 12,
    color: '#444751',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  moreText: {
    fontSize: 12,
    color: '#C2C2C8',
    fontWeight: '600',
    alignSelf: 'center',
  },

  // ========== FOOTER ==========
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E4EA',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#E5E4EA',
    marginHorizontal: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#C2C2C8',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  viewBtn: {
    backgroundColor: '#444751',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
  },

  // ========== EMPTY STATE ==========
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#C2C2C8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  emptyActionBtn: {
    backgroundColor: '#444751',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});