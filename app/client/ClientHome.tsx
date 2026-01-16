import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Briefcase, DollarSign, MessageSquare, AlertCircle, Plus, Search, LogOut } from 'lucide-react-native';
import StatsCard from './components/StatsCard';
import ProjectCard from './components/ProjectCard';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const STATS_DATA = [
  { title: 'Projects', value: '12', icon: Briefcase, iconColor: '#3B82F6' },
  { title: 'Total Spent', value: '$24.5K', icon: DollarSign, iconColor: '#10B981' },
  { title: 'Messages', value: '8', icon: MessageSquare, iconColor: '#F59E0B' },
  { title: 'Disputes', value: '2', icon: AlertCircle, iconColor: '#EF4444' },
];

const RECENT_PROJECTS = [
  {
    id: '1',
    title: 'Mobile App UI/UX Design',
    budget: '$2,500',
    status: 'In Progress' as const,
    freelancer: 'Sarah Johnson',
    deadline: 'Dec 20, 2025',
  },
  {
    id: '2',
    title: 'E-commerce Website Development',
    budget: '$5,000',
    status: 'Active' as const,
    freelancer: 'Michael Chen',
    deadline: 'Dec 28, 2025',
  },
  {
    id: '3',
    title: 'Logo Design & Branding',
    budget: '$800',
    status: 'Completed' as const,
    freelancer: 'Emma Davis',
    deadline: 'Dec 10, 2025',
  },
];

export default function ClientHome() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(); // clears storage + user
    router.replace('/login'); // go to login screen
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.userName}>John Doe</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* OVERVIEW STATS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsContainer}>
          {STATS_DATA.map((stat, index) => {
            const isDisputes = stat.title === 'Disputes';
            const isProjects = stat.title === 'Projects';
            const isWallet = stat.title === 'Total Spent';
            const isMessages = stat.title === 'Messages';

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => {
                  if (isDisputes) router.push('/client/Disputes');
                  if (isProjects) router.push('/client/Projects');
                  if (isWallet) router.push('/client/Wallet');
                  if (isMessages) router.push('/client/messages');
                }}
              >
                <StatsCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  iconColor={stat.iconColor}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#3B82F6' }]}>
              <Plus size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.actionTitle}>Post Project</Text>
            <Text style={styles.actionSubtitle}>Find the right talent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/client/Freelancers')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#10B981' }]}>
              <Search size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text style={styles.actionTitle}>Find Freelancers</Text>
            <Text style={styles.actionSubtitle}>Browse top talent</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RECENT PROJECTS */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity onPress={() => router.push('/client/Projects')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {RECENT_PROJECTS.map((project) => (
          <ProjectCard
            key={project.id}
            title={project.title}
            budget={project.budget}
            status={project.status}
            freelancer={project.freelancer}
            deadline={project.deadline}
            onPress={() =>
              router.push({
                pathname: '/client/ProjectDetail',
                params: { id: project.id },
              })
            }
          />
        ))}

      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 3,
  },
  greeting: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginTop: 4 },
  logoutButton: { padding: 8, borderRadius: 8, backgroundColor: '#FEE2E2' },

  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  viewAllText: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },

  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
  },
  actionIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4, textAlign: 'center' },
  actionSubtitle: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
});
