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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Wallet,
  TrendingUp,
  Star,
  AlertTriangle,
  ChevronRight,
  Zap,
} from 'lucide-react-native';

import { storageGet } from "@/utils/storage";
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { projectService } from '@/services/projectService';
import { reviewService } from '@/services/reviewService';
import { walletService } from '@/services/walletService';

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

      {/* Dynamic Background Element */}
      <View style={styles.topGradient} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.userNameText}>
              {user?.userName || user?.email?.split('@')[0] || 'Freelancer'} 👋
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => router.push('../notifications')}
              activeOpacity={0.7}
            >
              <Bell size={20} color="#FFF" />
              <View style={styles.statusDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Glass Card */}
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>${balance}</Text>
          </View>
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => router.push('../wallet')}
          >
            <Wallet size={16} color="#6366F1" />
            <Text style={styles.withdrawText}>Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Analytics Grid */}
        <View style={styles.statsRow}>
          <StatsCard
            icon={<TrendingUp size={20} color="#10B981" />}
            title="Earnings"
            value={`$${totalEarnings}`}
            subtitle="+12% this month"
            color="#10B981"
            onPress={() => router.push('../earnings')}
          />
          <StatsCard
            icon={<Star size={20} color="#F59E0B" />}
            title="Rating"
            value={avgRating}
            subtitle="Top Rated Status"
            color="#F59E0B"
            onPress={() => router.push('../reviews')}
          />
        </View>

        {/* Quick Actions - Floating Style */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.push('../find-projects')}
          >
            <Zap size={20} color="#FFF" fill="#FFF" />
            <Text style={styles.primaryActionText}>Browse Projects</Text>
          </TouchableOpacity>
        </View>

        {/* Project List Section */}
        <View style={styles.projectSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <TouchableOpacity><Text style={styles.linkText}>View All</Text></TouchableOpacity>
          </View>

          {recentProjects.map(project => (
            <View key={project.id} style={styles.cardWrapper}>
              <ProjectCard project={project} />
            </View>
          ))}
        </View>

        {/* Support Footer */}
        <TouchableOpacity
          style={styles.supportCard}
          onPress={() => router.push('../FDisputes')}
        >
          <View style={styles.supportIconBox}>
            <AlertTriangle size={20} color="#EF4444" />
          </View>
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Resolution Center</Text>
            <Text style={styles.supportSub}>Open a dispute or get help</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: '#1E1B4B', // Deep Indigo
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greetingText: { color: '#C7D2FE', fontSize: 14, fontWeight: '500' },
  userNameText: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#1E1B4B',
  },

  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
      },
    }),
    marginBottom: 24,
  },
  balanceLabel: { color: '#64748B', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  balanceAmount: { color: '#1E293B', fontSize: 32, fontWeight: '800', marginTop: 4 },
  withdrawButton: {
    backgroundColor: '#EEF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  withdrawText: { color: '#4F46E5', fontWeight: '700', fontSize: 14 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },

  actionContainer: { flexDirection: 'row', gap: 12, marginBottom: 32, justifyContent: 'center' },
  primaryAction: {
    flex: 1,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 6px 12px rgba(79, 70, 229, 0.3)',
      },
    }),
  },
  primaryActionText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  projectSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  linkText: { color: '#4F46E5', fontWeight: '600', fontSize: 14 },
  cardWrapper: { marginBottom: 12 },

  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  supportIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportContent: { flex: 1 },
  supportTitle: { color: '#1E293B', fontSize: 15, fontWeight: '700' },
  supportSub: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
});