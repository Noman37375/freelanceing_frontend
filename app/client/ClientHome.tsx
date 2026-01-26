import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Briefcase, DollarSign, MessageSquare, AlertCircle, Plus, Search, LogOut, Bell, ArrowUpRight } from 'lucide-react-native';
import StatsCard from './components/StatsCard';
import ProjectCard from './components/ProjectCard';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const STATS_DATA = [
  { title: 'Projects', value: '12', icon: Briefcase, iconColor: '#6366F1' },
  { title: 'Total Spent', value: '$24.5K', icon: DollarSign, iconColor: '#8B5CF6' },
  { title: 'Messages', value: '8', icon: MessageSquare, iconColor: '#06B6D4' },
  { title: 'Disputes', value: '2', icon: AlertCircle, iconColor: '#F43F5E' },
];

export default function ClientHome() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER SECTION */}
      <View style={styles.topVisualContainer}>
        <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.headerGradient}>
          <View style={styles.header}>
            <View>
              <Text style={styles.labelSmall}>EXECUTIVE DASHBOARD</Text>
              <Text style={styles.userName}>John Doe</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationBtn} 
              onPress={() => router.push('/client/C_Notifications')}
            >
              <Bell size={22} color="#FFFFFF" />
              <View style={styles.dot} />
            </TouchableOpacity>
          </View>

          {/* RESTORED & UPGRADED: POST PROJECT HERO */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={styles.heroActionCard}
            onPress={() => router.push('/client/PostProject')}

          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroGradient}
            >
              <View>
                <Text style={styles.heroTitle}>Need something done?</Text>
                <Text style={styles.heroSubtitle}>Post a project and find experts</Text>
              </View>
              <View style={styles.heroIconContainer}>
                <Plus size={24} color="#6366F1" strokeWidth={3} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* OVERVIEW STATS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {STATS_DATA.map((stat, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.statWrapper}
              onPress={() => {
                if (stat.title === 'Disputes') router.push('/client/Disputes');
                if (stat.title === 'Projects') router.push('/client/Projects');
                if (stat.title === 'Total Spent') router.push('/client/Wallet');
                if (stat.title === 'Messages') router.push('/client/messages');
              }}
            >
              <StatsCard {...stat} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SECONDARY QUICK ACTIONS */}
      <View style={styles.section}>
        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => router.push('/client/Freelancers')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
              <Search size={20} color="#10B981" />
            </View>
            <Text style={styles.actionLabel}>Find Talent</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={logout}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFF1F2' }]}>
              <LogOut size={20} color="#F43F5E" />
            </View>
            <Text style={styles.actionLabel}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RECENT ACTIVITY */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity onPress={() => router.push('/client/Projects')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {/* Project Cards would go here as per your original logic */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topVisualContainer: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  labelSmall: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5 },
  userName: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginTop: 2 },
  notificationBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  dot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#1E293B' },

  heroActionCard: {
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  heroGradient: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, fontWeight: '500' },
  heroIconContainer: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },

  section: { paddingHorizontal: 24, marginTop: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAllText: { fontSize: 14, color: '#6366F1', fontWeight: '700' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statWrapper: { width: '48%', marginBottom: 12 },

  secondaryActionsRow: { flexDirection: 'row', gap: 16 },
  actionItem: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: 12, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  actionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionLabel: { fontSize: 14, fontWeight: '700', color: '#334155' },
});