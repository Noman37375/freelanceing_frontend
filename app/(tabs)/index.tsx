// HomeScreen.tsx (STATIC DATA VERSION)

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Wallet,
  TrendingUp,
  Star,
  AlertTriangle,
} from 'lucide-react-native';

import { storageGet } from "@/utils/storage";
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';

import ProjectCard from '@/components/ProjectCard';
import StatsCard from '@/components/StatsCard';

/* =======================
   STATIC DATA
======================= */

const STATIC_PROJECTS = [
  {
    id: '1',
    title: 'React Native App',
    description: 'Build a mobile app using React Native',
    budget: 500,
    skills: ['react native', 'javascript'],
    status: 'available',
  },
  {
    id: '2',
    title: 'Node.js API',
    description: 'Create REST APIs with Node.js',
    budget: 300,
    skills: ['node.js', 'express'],
    status: 'available',
  },
];

const STATIC_EARNINGS = [
  { id: '1', amount: 200 },
  { id: '2', amount: 450 },
  { id: '3', amount: 150 },
];

const STATIC_REVIEWS = [
  { id: '1', rating: 4.5 },
  { id: '2', rating: 5 },
  { id: '3', rating: 4 },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { balance } = useWallet();
  const router = useRouter();

  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  /* =======================
     ROLE CHECK
  ======================= */
  useEffect(() => {
    const checkRole = async () => {
      const storedUser = await storageGet("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role?.toLowerCase() !== "freelancer") {
          router.replace("/client");
        }
      }
    };
    checkRole();
  }, []);

  /* =======================
     LOAD STATIC DATA
  ======================= */
  useEffect(() => {
    setRecentProjects(STATIC_PROJECTS);
    setEarnings(STATIC_EARNINGS);
    setReviews(STATIC_REVIEWS);
  }, []);

  /* =======================
     CALCULATIONS
  ======================= */
  const totalEarnings = earnings.reduce(
    (acc, e) => acc + Number(e.amount),
    0
  );

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + Number(r.rating), 0) /
          reviews.length
        ).toFixed(1)
      : '0';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>
              {user?.userName || user?.email?.split('@')[0] || 'Freelancer'}
            </Text>
            {user?.role && (
              <Text style={styles.userRole}>{user.role}</Text>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.walletButton}
              onPress={() => router.push('/wallet')}
            >
              <Wallet size={20} color="#3B82F6" />
              <Text style={styles.walletText}>${balance}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatsCard
            icon={<TrendingUp size={24} color="#10B981" />}
            title="Earnings"
            value={`$${totalEarnings}`}
            subtitle="Total Earnings"
            color="#10B981"
            onPress={() => router.push('/earnings')}
          />

          <StatsCard
            icon={<Star size={24} color="#F59E0B" />}
            title="Rating"
            value={avgRating}
            subtitle="Average"
            color="#F59E0B"
            onPress={() => router.push('/reviews')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/find-projects')}
            >
              <Text style={styles.actionButtonText}>Find Projects</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => router.push('/profile-view')}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  styles.actionButtonSecondaryText,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dispute Button (NEW, SAFE ADDITION) */}
          <TouchableOpacity
            style={styles.disputeButton}
            onPress={() => router.push('/FDisputes')}
          >
            <AlertTriangle size={18} color="#DC2626" />
            <Text style={styles.disputeButtonText}>
              Dispute
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Projects</Text>

          {recentProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },

  headerLeft: {
    flex: 1,
  },

  greeting: { 
    fontSize: 14, 
    color: '#9CA3AF',
    fontWeight: '500',
  },
  userName: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#111827',
    marginTop: 2,
  },
  userRole: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },

  walletText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },

  notificationButton: { padding: 8 },

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },

  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },

  actionButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  actionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  actionButtonSecondaryText: {
    color: '#374151',
  },

  /* ===== Dispute Button Styles (NEW) ===== */
  disputeButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },

  disputeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});
