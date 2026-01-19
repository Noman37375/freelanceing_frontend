import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Calendar, CheckCircle2, Quote } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ReviewDetails() {
  const router = useRouter();

  const project = {
    title: 'React Native App Development',
    milestones: [],
  };

  const review = {
    projectTitle: project.title,
    communication: 5,
    quality: 4,
    punctuality: 5,
    milestones: [],
    comment: 'Excellent work! Delivered on time with high quality.',
    duration: '2 weeks ago',
  };

  const extraRatings = [review.communication, review.quality, review.punctuality];
  const allRatings = [...extraRatings];
  const averageRating = allRatings.length > 0
    ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
    : '0';

  const renderStars = (count: number, size = 14) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={size} 
          color={i < Math.floor(count) ? "#4F46E5" : "#E2E8F0"} 
          fill={i < Math.floor(count) ? "#4F46E5" : "transparent"} 
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Project Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* OVERALL SCORECARD */}
        <View style={styles.heroCard}>
          <Text style={styles.heroProjectTitle}>{review.projectTitle}</Text>
          <View style={styles.ratingCircle}>
            <Text style={styles.ratingLargeText}>{averageRating}</Text>
            <Text style={styles.ratingSmallText}>/ 5.0</Text>
          </View>
          <View style={styles.heroStarRow}>{renderStars(Number(averageRating), 18)}</View>
          <View style={styles.durationBadge}>
            <Calendar size={12} color="#94A3B8" />
            <Text style={styles.durationText}>Completed {review.duration}</Text>
          </View>
        </View>

        {/* FEEDBACK COMMENT */}
        <View style={styles.commentCard}>
          <Quote size={20} color="#C7D2FE" fill="#C7D2FE" style={{ marginBottom: 8 }} />
          <Text style={styles.commentText}>{review.comment}</Text>
        </View>

        {/* METRICS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricBox}>
            {[
              { label: 'Communication', val: review.communication },
              { label: 'Quality of Work', val: review.quality },
              { label: 'Punctuality', val: review.punctuality }
            ].map((item, i) => (
              <View key={i} style={[styles.metricRow, i !== 2 && styles.borderBottom]}>
                <Text style={styles.metricLabel}>{item.label}</Text>
                {renderStars(item.val)}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', flex: 1, textAlign: 'center' },

  content: { padding: 20 },

  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
    shadowColor: '#1E293B',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  heroProjectTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  ratingCircle: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  ratingLargeText: { fontSize: 48, fontWeight: '800', color: '#1E293B' },
  ratingSmallText: { fontSize: 18, fontWeight: '600', color: '#94A3B8', marginBottom: 8, marginLeft: 4 },
  heroStarRow: { marginBottom: 16 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  durationText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },

  commentCard: { backgroundColor: '#EEF2FF', borderRadius: 20, padding: 20, marginBottom: 25 },
  commentText: { fontSize: 16, color: '#312E81', lineHeight: 24, fontWeight: '500', fontStyle: 'italic' },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  
  metricBox: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  metricLabel: { fontSize: 15, fontWeight: '600', color: '#475569' },

  milestoneCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  milestoneTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  milestoneTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  milestoneBody: { paddingLeft: 26 },
  milestoneDuration: { fontSize: 12, color: '#4F46E5', fontWeight: '700', marginBottom: 4 },
  milestoneDetails: { fontSize: 14, color: '#64748B', lineHeight: 20 },
});