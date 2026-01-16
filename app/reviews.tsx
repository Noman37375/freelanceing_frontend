import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MessageSquareQuote } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ReviewsScreen() {
  const router = useRouter();

  // Static reviews data
  const [reviews] = useState([
    {
      id: 'r1',
      projectTitle: 'React Native App Development',
      rating: 4.5,
      comment: 'Great work! Delivered on time with excellent quality.',
      userName: 'Alice Johnson',
      duration: '2 weeks ago',
    },
    {
      id: 'r2',
      projectTitle: 'Website Redesign',
      rating: 5,
      comment: 'Amazing design skills, very professional and communicative.',
      userName: 'Michael Smith',
      duration: '1 month ago',
    },
    {
      id: 'r3',
      projectTitle: 'API Integration',
      rating: 4,
      comment: 'Good job integrating APIs seamlessly into the project.',
      userName: 'Sarah Lee',
      duration: '3 weeks ago',
    },
    {
      id: 'r4',
      projectTitle: 'E-commerce Platform',
      rating: 5,
      comment: 'Exceeded expectations! Highly recommend.',
      userName: 'David Brown',
      duration: '1 week ago',
    },
  ]);

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
        {reviews.length === 0 ? (
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
              onPress={() => router.push({ pathname: '/reviewDetails', params: { id: review.id } })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleInfo}>
                  <Text style={styles.projectTitle} numberOfLines={1}>{review.projectTitle}</Text>
                  <View style={styles.ratingRow}>
                    {renderStars(Number(review.rating))}
                    <Text style={styles.ratingValue}>{review.rating}</Text>
                  </View>
                </View>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>{review.userName[0]}</Text>
                </View>
              </View>

              <View style={styles.commentContainer}>
                <Text numberOfLines={3} style={styles.comment}>"{review.comment}"</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.userName}>{review.userName}</Text>
                <View style={styles.dot} />
                <Text style={styles.duration}>{review.duration}</Text>
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
});