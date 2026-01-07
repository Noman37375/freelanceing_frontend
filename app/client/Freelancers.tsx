import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Filter, User, Star, MapPin, Briefcase } from 'lucide-react-native';

interface Freelancer {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  hourlyRate: string;
  location: string;
  skills: string[];
  completedProjects: number;
  availability: 'Available' | 'Busy' | 'Not Available';
}

const FREELANCERS_DATA: Freelancer[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'UI/UX Designer',
    rating: 4.9,
    reviews: 127,
    hourlyRate: '$85/hr',
    location: 'San Francisco, CA',
    skills: ['UI Design', 'Figma', 'Prototyping'],
    completedProjects: 127,
    availability: 'Available',
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Full Stack Developer',
    rating: 4.8,
    reviews: 94,
    hourlyRate: '$95/hr',
    location: 'New York, NY',
    skills: ['React', 'Node.js', 'MongoDB'],
    completedProjects: 94,
    availability: 'Available',
  },
  {
    id: '3',
    name: 'Emma Davis',
    title: 'Graphic Designer',
    rating: 5.0,
    reviews: 156,
    hourlyRate: '$70/hr',
    location: 'Los Angeles, CA',
    skills: ['Illustration', 'Branding', 'Adobe CC'],
    completedProjects: 156,
    availability: 'Busy',
  },
  {
    id: '4',
    name: 'David Wilson',
    title: 'SEO Specialist',
    rating: 4.7,
    reviews: 82,
    hourlyRate: '$60/hr',
    location: 'Chicago, IL',
    skills: ['SEO', 'Content Strategy', 'Analytics'],
    completedProjects: 82,
    availability: 'Available',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    title: 'Social Media Manager',
    rating: 4.9,
    reviews: 103,
    hourlyRate: '$55/hr',
    location: 'Miami, FL',
    skills: ['Instagram', 'Facebook Ads', 'Content'],
    completedProjects: 103,
    availability: 'Available',
  },
];

export default function Freelancers() {
  const getAvailabilityColor = (availability: Freelancer['availability']) => {
    switch (availability) {
      case 'Available':
        return '#10B981';
      case 'Busy':
        return '#F59E0B';
      case 'Not Available':
        return '#EF4444';
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

      <ScrollView style={styles.freelancersList} showsVerticalScrollIndicator={false}>
        <View style={styles.freelancersContent}>
          {FREELANCERS_DATA.map((freelancer) => (
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
                {freelancer.skills.map((skill, index) => (
                  <View key={index} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.viewProfileButton}>
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
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
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  chipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeChipText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  freelancersList: {
    flex: 1,
  },
  freelancersContent: {
    padding: 20,
    paddingTop: 0,
  },
  freelancerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  freelancerInfo: {
    flex: 1,
  },
  freelancerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  freelancerTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  availabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
  },
  hourlyRate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  skillBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  skillText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  viewProfileButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewProfileText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
