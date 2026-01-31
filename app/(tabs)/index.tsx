// HomeScreen.tsx (ULTRA-POLISHED VERSION)

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Zap,
  Layout,
  PenTool,
  Code,
  Smartphone,
  Video,
  Database,
  Search,
  MapPin,
  Heart,
  Bell,
  TrendingUp,
  Star,
  Box,
} from 'lucide-react-native';

import { storageGet } from "@/utils/storage";
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { projectService } from '@/services/projectService';
import { reviewService } from '@/services/reviewService';
import { walletService } from '@/services/walletService';
import { adminService } from '@/services/adminService';

import ProjectCard from '@/components/ProjectCard';
import StatsCard from '@/components/StatsCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const { balance } = useWallet();
  const router = useRouter();

  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const [categories, setCategories] = useState<any[]>([]);

  // Icon mapping helper
  const getCategoryIcon = (iconName: string, color: string) => {
    const size = 22;
    const props = { size, color: "#FFF" };

    switch (iconName) {
      case 'PenTool': return <PenTool {...props} />;
      case 'Code': return <Code {...props} />;
      case 'Smartphone': return <Smartphone {...props} />;
      case 'Video': return <Video {...props} />;
      case 'Database': return <Database {...props} />;
      case 'Layout': return <Layout {...props} />;
      case 'Search': return <Search {...props} />;
      case 'MapPin': return <MapPin {...props} />;
      case 'Zap': return <Zap {...props} />;
      default: return <Box {...props} />;
    }
  };

  const [freelancerGigs] = useState([
    {
      id: '1',
      name: 'Sarah Jenkins',
      title: 'Expert UI/UX Designer',
      rating: '4.9',
      reviews: '124',
      price: '45',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      isPro: true
    },
    {
      id: '2',
      name: 'Alex Rivera',
      title: 'Full Stack Developer',
      rating: '5.0',
      reviews: '89',
      price: '60',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      isPro: false
    },
    {
      id: '3',
      name: 'Maria Garcia',
      title: 'Content Strategist',
      rating: '4.8',
      reviews: '210',
      price: '35',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      isPro: true
    },
  ]);

  useEffect(() => {
    const checkRole = async () => {
      const storedUser = await storageGet("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role?.toLowerCase() !== "freelancer") {
          router.replace("../(client-tabs)");
        }
      }
    };
    checkRole();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch services
      const servicesData = await adminService.getServiceCategories();
      setCategories(servicesData || []);

      // Fetch recent projects
      const projectsData = await projectService.getProjects({ status: 'ACTIVE' });
      setRecentProjects(projectsData.slice(0, 2));

      // Fetch reviews for average rating
      const reviewsData = await reviewService.getMyReviews();
      setReviews(reviewsData.map(r => ({ id: r.id, rating: r.rating })));

      // Fetch wallet for earnings
      const walletData = await walletService.getWallet();
      setEarnings([{ id: '1', amount: walletData.balance }]);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
    }
  };

  const totalEarnings = earnings.reduce((acc, e) => acc + Number(e.amount), 0);
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1) : '0';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header/Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroOverlay}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greetingText}>Good afternoon,</Text>
                <Text style={styles.userNameText}>
                  {user?.userName || user?.email?.split('@')[0] || 'Freelancer'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.notificationBtn}
                onPress={() => router.push('../notifications')}
              >
                <Bell size={22} color="#FFF" />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Find the perfect{"\n"}freelance services</Text>

              <View style={styles.searchWrapper}>
                <View style={styles.searchBarPremium}>
                  <Search size={20} color="#64748B" />
                  <TextInput
                    style={styles.searchInputPremium}
                    placeholder="Search for any service..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                  <Layout size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>



        {/* Services Row */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeaderPremium}>
            <Text style={styles.sectionTitlePremium}>Browse Categories</Text>
            <TouchableOpacity><Text style={styles.exploreText}>See All</Text></TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollPremium}
          >
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={styles.serviceCard}
                onPress={() => router.push({
                  pathname: `/service-category/${cat.id}`,
                  params: {
                    name: cat.name,
                    image: cat.image ?? '',
                    icon: cat.icon ?? 'Box',
                    color: cat.color ?? '#6366F1',
                  },
                } as any)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: cat.image }} style={styles.serviceImage} />
                <View style={[styles.serviceOverlay, { backgroundColor: (cat.color || '#6366F1') + 'CC' }]}>
                  {getCategoryIcon(cat.icon, cat.color)}
                  <Text style={styles.serviceName}>{cat.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Freelancer Gigs Section */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeaderPremium}>
            <Text style={styles.sectionTitlePremium}>Popular Gigs</Text>
            <TouchableOpacity><Text style={styles.exploreText}>See All</Text></TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gigScrollPremium}
          >
            {freelancerGigs.map(gig => (
              <TouchableOpacity key={gig.id} style={styles.premiumGigCard}>
                <View style={styles.premiumGigImageWrapper}>
                  <Image source={{ uri: gig.image }} style={styles.premiumGigImage} />
                  {gig.isPro && (
                    <View style={styles.premiumProBadge}>
                      <Zap size={10} color="#FFF" fill="#FFF" />
                      <Text style={styles.premiumProText}>PRO</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.premiumFavBtn}>
                    <Heart size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.premiumGigInfo}>
                  <View style={styles.gigMeta}>
                    <Text style={styles.gigAuthor}>{gig.name}</Text>
                    <View style={styles.premiumRating}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingValue}>{gig.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.premiumGigTitle} numberOfLines={2}>{gig.title}</Text>

                  <View style={styles.premiumGigFooter}>
                    <Text style={styles.priceLabel}>Starting at</Text>
                    <Text style={styles.premiumPrice}>${gig.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 40 },

  heroSection: {
    height: 320,
    width: '100%',
    backgroundColor: '#1E1B4B',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    paddingTop: 10,
  },
  heroOverlay: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  greetingText: { color: '#C7D2FE', fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1 },
  userNameText: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 4 },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#1E1B4B',
  },
  heroContent: {
    marginBottom: 10,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBarPremium: {
    flex: 1,
    height: 56,
    backgroundColor: '#FFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  searchInputPremium: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  filterBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
      android: { elevation: 8 },
    }),
  },

  sectionWrapper: { marginTop: 32 },
  sectionHeaderPremium: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitlePremium: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  exploreText: { color: '#4F46E5', fontSize: 14, fontWeight: '700' },

  categoryScrollPremium: { paddingLeft: 24, paddingRight: 10 },
  serviceCard: {
    width: 160,
    height: 120,
    borderRadius: 24,
    marginRight: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  serviceImage: { width: '100%', height: '100%' },
  serviceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'flex-end',
    gap: 8,
  },
  serviceName: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  gigScrollPremium: { paddingLeft: 24, paddingRight: 10 },
  premiumGigCard: {
    width: 280,
    backgroundColor: '#FFF',
    borderRadius: 28,
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 },
      android: { elevation: 4 },
    }),
  },
  premiumGigImageWrapper: { height: 180, position: 'relative' },
  premiumGigImage: { width: '100%', height: '100%' },
  premiumProBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  premiumProText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  premiumFavBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumGigInfo: { padding: 20 },
  gigMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  gigAuthor: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  premiumRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingValue: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  premiumGigTitle: { fontSize: 17, fontWeight: '700', color: '#1E1B4B', lineHeight: 24, height: 48 },
  premiumGigFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  priceLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  premiumPrice: { fontSize: 20, fontWeight: '800', color: '#4F46E5' },
});
