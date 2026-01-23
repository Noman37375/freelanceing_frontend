import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Star, Calendar, Quote, User } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '@/utils/constants';
import ScreenHeader from '@/components/ScreenHeader';

export default function ReviewDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    rating?: string;
    comment?: string;
    createdAt?: string;
    projectTitle?: string;
    reviewerName?: string;
  }>();

  const rating = useMemo(() => {
    const n = Number(params.rating);
    if (Number.isFinite(n)) return Math.max(0, Math.min(5, n));
    return 0;
  }, [params.rating]);

  const createdLabel = useMemo(() => {
    if (!params.createdAt) return null;
    const d = new Date(params.createdAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString();
  }, [params.createdAt]);

  const projectTitle = params.projectTitle?.trim() || 'Project Review';
  const reviewerName = params.reviewerName?.trim() || 'Client';
  const comment = params.comment?.trim() || 'No comment provided.';

  const renderStars = (count: number, size = 14) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={size} 
          color={i < Math.floor(count) ? COLORS.primary : COLORS.gray200} 
          fill={i < Math.floor(count) ? COLORS.primary : 'transparent'} 
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Project Review" showBackButton />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Guard: if navigated without params */}
        {!params.id ? (
          <View style={styles.missingCard}>
            <Text style={styles.missingTitle}>Review not available</Text>
            <Text style={styles.missingText}>Please open this screen from the Reviews list.</Text>
            <TouchableOpacity style={styles.missingButton} onPress={() => router.back()} activeOpacity={0.85}>
              <Text style={styles.missingButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
        {/* OVERALL SCORECARD */}
        <View style={styles.heroCard}>
          <Text style={styles.heroProjectTitle} numberOfLines={1}>
            {projectTitle}
          </Text>
          <View style={styles.ratingCircle}>
            <Text style={styles.ratingLargeText}>{rating.toFixed(1)}</Text>
            <Text style={styles.ratingSmallText}>/ 5.0</Text>
          </View>
          <View style={styles.heroStarRow}>{renderStars(rating, 18)}</View>
          <View style={styles.durationBadge}>
            <Calendar size={12} color="#94A3B8" />
            <Text style={styles.durationText}>
              {createdLabel ? `Submitted ${createdLabel}` : 'Submitted'}
            </Text>
          </View>
        </View>

        {/* REVIEWER */}
        <View style={styles.reviewerCard}>
          <View style={styles.reviewerAvatar}>
            <User size={18} color={COLORS.primary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewerLabel}>Reviewer</Text>
            <Text style={styles.reviewerName} numberOfLines={1}>
              {reviewerName}
            </Text>
          </View>
        </View>

        {/* FEEDBACK COMMENT */}
        <View style={styles.commentCard}>
          <Quote size={20} color="#C7D2FE" fill="#C7D2FE" style={{ marginBottom: 8 }} />
          <Text style={styles.commentText}>{comment}</Text>
        </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },

  missingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  missingTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  missingText: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  missingButton: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  missingButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

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

  reviewerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  reviewerName: { fontSize: 15, color: '#1E293B', fontWeight: '800', marginTop: 2 },

  commentCard: { backgroundColor: '#EEF2FF', borderRadius: 20, padding: 20, marginBottom: 25 },
  commentText: { fontSize: 16, color: '#312E81', lineHeight: 24, fontWeight: '500', fontStyle: 'italic' },

  milestoneCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  milestoneTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  milestoneTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  milestoneBody: { paddingLeft: 26 },
  milestoneDuration: { fontSize: 12, color: COLORS.primary, fontWeight: '700', marginBottom: 4 },
  milestoneDetails: { fontSize: 14, color: '#64748B', lineHeight: 20 },
});