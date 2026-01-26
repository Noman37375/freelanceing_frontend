import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Animated } from 'react-native';
import { ArrowLeft, Bell, BellRing, Briefcase, ShieldCheck, CreditCard, CheckCircle, SlidersHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface Notification {
  id: string;
  type: 'payment' | 'project' | 'security';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const NOTIFICATIONS_DATA: Notification[] = [
  { id: '1', type: 'payment', title: 'Payment Secured', message: 'Escrow confirmed $500.00 for "Landing Page Design".', time: '2m ago', isRead: false },
  { id: '2', type: 'project', title: 'Milestone Approved', message: 'The "Initial Prototype" has been signed off by the client.', time: '1h ago', isRead: false },
  { id: '3', type: 'security', title: 'Security Alert', message: 'New login detected from a Chrome browser on Windows.', time: '5h ago', isRead: true },
  { id: '4', type: 'project', title: 'New Message', message: 'Charlie Davis sent you a message regarding assets.', time: 'Yesterday', isRead: true },
];

export default function C_Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [activeFilter, setActiveFilter] = useState('All');

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment': return { icon: <CreditCard size={20} color="#10B981" />, bg: '#ECFDF5' };
      case 'project': return { icon: <Briefcase size={20} color="#6366F1" />, bg: '#EEF2FF' };
      case 'security': return { icon: <ShieldCheck size={20} color="#EF4444" />, bg: '#FEF2F2' };
      default: return { icon: <Bell size={20} color="#94A3B8" />, bg: '#F8FAFC' };
    }
  };

  const filteredData = activeFilter === 'All' 
    ? notifications 
    : notifications.filter(n => n.type === activeFilter.toLowerCase());

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Center</Text>
        <TouchableOpacity style={styles.markReadBtn} onPress={markAllRead}>
          <CheckCircle size={22} color="#6366F1" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* INNOVATION: DYNAMIC SUMMARY CARD */}
        <LinearGradient colors={['#1E293B', '#334155']} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.infoCard}>
          <View style={styles.infoContent}>
            <View style={styles.statsCircle}>
              <BellRing size={24} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Priority Alerts</Text>
              <Text style={styles.infoSub}>
                {notifications.filter(n => !n.isRead).length} new updates require your attention
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* INNOVATION: FILTER CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
          {['All', 'Payment', 'Project', 'Security'].map((filter) => (
            <TouchableOpacity 
              key={filter} 
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.listWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Updates</Text>
            <SlidersHorizontal size={16} color="#94A3B8" />
          </View>
          
          {filteredData.map((item) => {
            const theme = getIcon(item.type);
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.card, !item.isRead && styles.unreadCard]}
                activeOpacity={0.9}
              >
                <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
                  {theme.icon}
                </View>
                
                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notifTitle, !item.isRead && styles.boldTitle]}>{item.title}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
                </View>

                {!item.isRead && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', letterSpacing: -0.5 },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  markReadBtn: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },

  content: { flex: 1 },
  infoCard: { margin: 20, borderRadius: 28, padding: 24, elevation: 8, shadowColor: '#1E293B', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  infoContent: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  statsCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  infoTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  infoSub: { color: '#CBD5E1', fontSize: 13, marginTop: 4, lineHeight: 18 },

  filterScroll: { marginBottom: 10 },
  filterContainer: { paddingHorizontal: 20, gap: 10, paddingBottom: 10 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9' },
  filterChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  filterText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  filterTextActive: { color: '#FFF' },

  listWrapper: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 22, 
    padding: 18, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  unreadCard: {
    borderColor: '#EEF2FF',
    backgroundColor: '#F8FAFF',
  },
  iconContainer: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '600', color: '#475569' },
  boldTitle: { fontWeight: '800', color: '#1E293B' },
  notifTime: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  notifMessage: { fontSize: 13, color: '#64748B', lineHeight: 19 },
  
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#FFF'
  }
});