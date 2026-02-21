import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  User,
  Star,
  MapPin,
  Briefcase,
  Clock,
  Mail,
  Calendar,
  Globe,
  MessageCircle,
  AlertCircle,
} from 'lucide-react-native';
import { freelancerService, Freelancer } from '@/services/freelancerService';

export default function FreelancerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFreelancer = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await freelancerService.getFreelancerById(id);
      setFreelancer(data);
    } catch (error: any) {
      console.error('Failed to load freelancer:', error);
      Alert.alert('Error', error.message || 'Failed to load freelancer');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFreelancer();
  }, [fetchFreelancer]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
        return '#10B981';
      case 'Busy':
        return '#F59E0B';
      default:
        return '#94A3B8';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#444751" />
        <Text style={styles.loadingText}>Loading freelancer...</Text>
      </View>
    );
  }

  if (!freelancer) {
    return (
      <View style={styles.centered}>
        <AlertCircle size={40} color="#CBD5E1" />
        <Text style={{ color: '#64748B', marginTop: 12 }}>Freelancer not found</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.darkHeader}>
        <SafeAreaView>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#F8FAFC" size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Freelancer Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Profile Summary */}
          <View style={styles.profileSummary}>
            <View style={styles.avatarLarge}>
              <User size={40} color="#444751" strokeWidth={1.5} />
            </View>
            <Text style={styles.nameText}>{freelancer.name}</Text>
            <Text style={styles.titleText}>{freelancer.title}</Text>

            <View style={styles.ratingRow}>
              <Star size={16} color="#FCD34D" fill="#FCD34D" />
              <Text style={styles.ratingText}>{freelancer.rating.toFixed(1)}</Text>
              <Text style={styles.reviewsText}>({freelancer.reviews} reviews)</Text>
            </View>

            <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityColor(freelancer.availability) + '20' }]}>
              <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor(freelancer.availability) }]} />
              <Text style={[styles.availabilityText, { color: getAvailabilityColor(freelancer.availability) }]}>
                {freelancer.availability}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentBody}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Briefcase size={20} color="#444751" />
            <Text style={styles.statValue}>{freelancer.completedProjects}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={20} color="#444751" />
            <Text style={styles.statValue}>{freelancer.hourlyRate}</Text>
            <Text style={styles.statLabel}>Per Hour</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={20} color="#444751" />
            <Text style={styles.statValue}>{formatDate(freelancer.memberSince)}</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        {/* Bio */}
        {freelancer.bio && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.card}>
              <Text style={styles.bioText}>{freelancer.bio}</Text>
            </View>
          </>
        )}

        {/* Skills */}
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.card}>
          <View style={styles.skillsContainer}>
            {freelancer.skills.length > 0 ? (
              freelancer.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No skills listed</Text>
            )}
          </View>
        </View>

        {/* Contact Info */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Mail size={18} color="#64748B" />
            <Text style={styles.infoText}>{freelancer.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={18} color="#64748B" />
            <Text style={styles.infoText}>{freelancer.location}</Text>
          </View>
          {freelancer.languages && freelancer.languages.length > 0 && (
            <View style={styles.infoRow}>
              <Globe size={18} color="#64748B" />
              <Text style={styles.infoText}>{freelancer.languages.join(', ')}</Text>
            </View>
          )}
        </View>

        {/* Experience */}
        {freelancer.experience && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            <View style={styles.card}>
              <Text style={styles.bioText}>{freelancer.experience}</Text>
            </View>
          </>
        )}

        {/* Education */}
        {freelancer.education && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.card}>
              <Text style={styles.bioText}>{freelancer.education}</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => {
            router.push({
              pathname: '/ChatScreen',
              params: {
                receiverId: freelancer.id,
                userName: freelancer.name,
              },
            });
          }}
        >
          <MessageCircle size={20} color="#FFF" />
          <Text style={styles.chatButtonText}>Start Conversation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#282A32' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  loadingText: { color: '#94A3B8', fontSize: 14, marginTop: 8 },
  goBackBtn: {
    marginTop: 16,
    backgroundColor: '#282A32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  goBackText: { color: '#FFF', fontWeight: '700' },

  darkHeader: { paddingHorizontal: 20, paddingBottom: 24, backgroundColor: '#282A32' },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#32343D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444751',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },

  profileSummary: { alignItems: 'center', marginTop: 20 },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F4F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#444751',
  },
  nameText: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', marginBottom: 4 },
  titleText: { fontSize: 14, color: '#A5B4FC', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  ratingText: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  reviewsText: { fontSize: 13, color: '#94A3B8' },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  availabilityDot: { width: 8, height: 8, borderRadius: 4 },
  availabilityText: { fontSize: 13, fontWeight: '700' },

  contentBody: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#282A32', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bioText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  emptyText: { fontSize: 14, color: '#94A3B8' },

  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skillText: { fontSize: 13, color: '#444751', fontWeight: '600' },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoText: { fontSize: 14, color: '#475569', flex: 1 },

  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  chatButton: {
    backgroundColor: '#282A32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  chatButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
