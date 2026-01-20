import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MessageSquareQuote } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { reviewService, Review } from '@/services/reviewService';

export default function ReviewsScreen() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getMyReviews();
      setReviews(data);
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
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
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Client Reviews</Text>
          <Text style={styles.headerSubtitle}>{reviews.length} Feedbacks received</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageSquareQuote size={48} color="#CBD5E1" />
            <Text style={styles.noReviews}>No reviews for completed projects yet.</Text>
          </View>
        ) : (
          reviews.map((review) => (
            <Pressable
              key={review.id}
              style={({ pressed }) => [
                styles.reviewCard,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
              ]}
              onPress={() => router.push({ pathname: '../reviewDetails', params: { id: review.id } })}
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
                  <Text style={styles.avatarText}>
                    {review.reviewer?.userName?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
              </View>

              <View style={styles.commentContainer}>
                <Text numberOfLines={3} style={styles.comment}>
                  "{review.comment || 'No comment provided'}"
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.userName}>
                  {review.reviewer?.userName || 'Unknown User'}
                </Text>
                <View style={styles.dot} />
                <Text style={styles.duration}>{formatDuration(review.createdAt)}</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    gap: 15,
  },
  backButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 8,
  },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  headerSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  
  scroll: { padding: 20 },
  
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
  noReviews: { color: '#94A3B8', textAlign: 'center', fontSize: 16, fontWeight: '500' },
  
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1E293B',
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
    color: '#1E293B',
    marginBottom: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingValue: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
  
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#4F46E5', fontWeight: '800', fontSize: 16 },

  commentContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  comment: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: { color: '#1E293B', fontSize: 13, fontWeight: '700' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
  duration: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});