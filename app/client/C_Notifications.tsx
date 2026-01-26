import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { ArrowLeft, Bell, BellRing, MessageSquare, ShieldCheck, CreditCard, Trash2, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface Notification {
  id: string;
  type: 'message' | 'dispute' | 'payment' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const NOTIFICATIONS_DATA: Notification[] = [
  {
    id: '1',
    type: 'dispute',
    title: 'Dispute Update',
    message: 'Your dispute for "Landing Page Design" has been reviewed by a mediator.',
    time: '2 mins ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    message: 'A payment of $500 has been secured in Escrow for your new project.',
    time: '1 hour ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    message: 'Alice Brown sent you a message regarding the milestone.',
    time: '5 hours ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Security Alert',
    message: 'Your account was logged in from a new device in London, UK.',
    time: 'Yesterday',
    isRead: true,
  },
];

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return <MessageSquare size={20} color="#6366F1" />;
      case 'dispute': return <ShieldCheck size={20} color="#F59E0B" />;
      case 'payment': return <CreditCard size={20} color="#10B981" />;
      default: return <Bell size={20} color="#94A3B8" />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markReadBtn} onPress={markAllRead}>
          <CheckCircle size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* STATS CARD */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.infoCard}>
          <View style={styles.infoLeft}>
            <BellRing size={32} color="#6366F1" />
            <View>
              <Text style={styles.infoTitle}>Stay Updated</Text>
              <Text style={styles.infoSub}>
                You have {notifications.filter(n => !n.isRead).length} unread alerts
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.listWrapper}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          
          {notifications.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, !item.isRead && styles.unreadCard]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: item.isRead ? '#F1F5F9' : '#EEF2FF' }]}>
                  {getIcon(item.type)}
                </View>
                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.notifMessage} numberOfLines={2}>
                    {item.message}
                  </Text>
                </View>
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
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
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  markReadBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },

  content: { flex: 1 },
  infoCard: { margin: 24, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  infoTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  infoSub: { color: '#94A3B8', fontSize: 12, fontWeight: '500', marginTop: 2 },

  listWrapper: { paddingHorizontal: 24, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#94A3B8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#F1F5F9',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center'
  },
  unreadCard: {
    borderColor: '#E0E7FF',
    backgroundColor: '#FBFCFF'
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  textContainer: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  notifTime: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  notifMessage: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    position: 'absolute',
    right: 16,
    bottom: 16
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' }
});