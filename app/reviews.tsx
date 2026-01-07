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
import { ArrowLeft, Star } from 'lucide-react-native';
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
    <View style={{ flexDirection: 'row' }}>
      {[...Array(Math.round(count))].map((_, i) => (
        <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {reviews.length === 0 && (
          <Text style={styles.noReviews}>No reviews for completed projects yet.</Text>
        )}

        {reviews.map((review) => (
          <Pressable
            key={review.id}
            style={({ pressed }) => [
              styles.reviewCard,
              pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
            ]}
            onPress={() => router.push({ pathname: '/reviewDetails', params: { id: review.id } })}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.ratingPill}>
                {renderStars(Number(review.rating))}
                <Text style={styles.ratingText}>{review.rating} / 5</Text>
              </View>
              <Text style={styles.projectTitle}>{review.projectTitle}</Text>
            </View>

            <Text numberOfLines={2} style={styles.comment}>{review.comment}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.userName}>By {review.userName}</Text>
              <Text style={styles.duration}>{review.duration}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  scroll: { padding: 20 },
  noReviews: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#F59E0B',
    fontSize: 13,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 12,
  },
  comment: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  userName: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  duration: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
});
