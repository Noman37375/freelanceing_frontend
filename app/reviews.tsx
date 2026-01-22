import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  Pressable,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Star, MessageSquareQuote } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { reviewService, Review } from '@/services/reviewService';
import { COLORS } from '@/utils/constants';
import ScreenHeader from '@/components/ScreenHeader';

export default function ReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewService.getMyReviews();
      setReviews(data);
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
      setError(error?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks === 1) return '1 week ago';
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    if (diffMonths === 1) return '1 month ago';
    if (diffMonths < 12) return `${diffMonths} months ago`;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const renderStars = (count: number) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={14} 
          color={i < Math.floor(count) ? COLORS.primary : COLORS.gray200} 
          fill={i < Math.floor(count) ? COLORS.primary : "transparent"} 
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Client Reviews"
        subtitle={`${reviews.length} Feedbacks received`}
        showBackButton
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Couldn’t load reviews</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchReviews} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: review }) => (
            <Pressable
              style={({ pressed }) => [
                styles.reviewCard,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
              ]}
              onPress={() =>
                router.push({
                  pathname: '../reviewDetails',
                  params: {
                    id: review.id,
                    rating: String(review.rating ?? 0),
                    comment: review.comment ?? '',
                    createdAt: review.createdAt ?? '',
                    projectTitle: review.project?.title ?? '',
                    reviewerName: review.reviewer?.userName ?? '',
                  },
                })
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleInfo}>
                  <Text style={styles.projectTitle} numberOfLines={1}>
                    {review.project?.title || 'Unknown Project'}
                  </Text>
                  <View style={styles.ratingRow}>
                    {renderStars(review.rating)}
                    <Text style={styles.ratingValue}>{review.rating}</Text>
                  </View>
                </View>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>{review.reviewer?.userName?.[0]?.toUpperCase() || 'U'}</Text>
                </View>
              </View>

              <View style={styles.commentContainer}>
                <Text numberOfLines={3} style={styles.comment}>
                  "{review.comment || 'No comment provided'}"
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.userName}>{review.reviewer?.userName || 'Unknown User'}</Text>
                <View style={styles.dot} />
                <Text style={styles.duration}>{formatDuration(review.createdAt)}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquareQuote size={48} color={COLORS.gray300} />
              <Text style={styles.noReviews}>No reviews for completed projects yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  
  listContent: { padding: 20, paddingBottom: 40 },
  
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
  noReviews: { color: COLORS.gray400, textAlign: 'center', fontSize: 16, fontWeight: '500' },
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
  
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    shadowColor: COLORS.gray800,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleInfo: { flex: 1, marginRight: 10 },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingValue: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },

  commentContainer: {
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  comment: {
    color: COLORS.gray600,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: { color: COLORS.gray800, fontSize: 13, fontWeight: '700' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: COLORS.gray300, marginHorizontal: 8 },
  duration: { color: COLORS.gray400, fontSize: 12, fontWeight: '500' },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});