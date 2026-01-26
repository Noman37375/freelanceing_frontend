import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { ArrowLeft, Search, Edit3, Circle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const MESSAGES = [
  { id: '1', name: 'Sarah Johnson', lastMessage: 'I’ve shared the first draft 👀', time: '2m ago', unread: 2, online: true },
  { id: '2', name: 'Michael Chen', lastMessage: 'Payment received, thanks!', time: '1h ago', unread: 0, online: false },
  { id: '3', name: 'Emma Davis', lastMessage: 'Final files uploaded ✅', time: 'Yesterday', unread: 1, online: true },
  { id: '4', name: 'David Wilson', lastMessage: 'Can we hop on a quick call?', time: '2 days ago', unread: 0, online: false },
];

export default function MessagesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#1E293B" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Edit3 size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* IN-HEADER SEARCH */}
        <View style={styles.searchWrapper}>
          <Search size={18} color="#94A3B8" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search conversations..." 
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        
        {/* ACTIVE NOW MINI-TRAY */}
        <View style={styles.activeTray}>
          <Text style={styles.sectionLabel}>ONLINE NOW</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeScroll}>
            {MESSAGES.filter(m => m.online).map(user => (
              <View key={user.id} style={styles.activeUser}>
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarTextLarge}>{user.name.charAt(0)}</Text>
                  <View style={styles.onlineStatusRing} />
                </View>
                <Text style={styles.activeUserName} numberOfLines={1}>{user.name.split(' ')[0]}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* CHAT LIST */}
        <View style={styles.chatList}>
          <Text style={styles.sectionLabel}>RECENT CHATS</Text>
          {MESSAGES.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              activeOpacity={0.6}
              style={styles.chatRow}
              onPress={() =>
                router.push({
                  pathname: '/client/chat',
                  params: { id: chat.id, name: chat.name },
                })
              }
            >
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={chat.unread > 0 ? ['#6366F1', '#A855F7'] : ['#E2E8F0', '#E2E8F0']}
                  style={styles.avatarGlow}
                >
                  <View style={styles.avatarInner}>
                    <Text style={[styles.avatarText, { color: chat.unread > 0 ? '#1E293B' : '#64748B' }]}>
                      {chat.name.charAt(0)}
                    </Text>
                  </View>
                </LinearGradient>
                {chat.online && <View style={styles.onlineIndicator} />}
              </View>

              <View style={styles.chatInfo}>
                <View style={styles.chatTitleRow}>
                  <Text style={[styles.name, chat.unread > 0 && styles.textBold]}>{chat.name}</Text>
                  <Text style={[styles.time, chat.unread > 0 && styles.timeActive]}>{chat.time}</Text>
                </View>
                
                <View style={styles.messageRow}>
                  <Text 
                    style={[styles.message, chat.unread > 0 && styles.textBold]} 
                    numberOfLines={1}
                  >
                    {chat.lastMessage}
                  </Text>
                  {chat.unread > 0 && (
                    <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unread}</Text>
                    </LinearGradient>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  
  // Header Improvements
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' },

  scrollBody: { paddingBottom: 40 },
  sectionLabel: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 1.5, marginHorizontal: 24, marginTop: 24, marginBottom: 16 },

  // Active Tray
  activeTray: { borderBottomWidth: 1, borderColor: '#F1F5F9', paddingBottom: 20 },
  activeScroll: { paddingHorizontal: 24, gap: 20 },
  activeUser: { alignItems: 'center', width: 65 },
  avatarLarge: { width: 60, height: 60, borderRadius: 24, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#6366F1' },
  avatarTextLarge: { fontSize: 22, fontWeight: '800', color: '#6366F1' },
  onlineStatusRing: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#10B981', borderWidth: 3, borderColor: '#FFFFFF' },
  activeUserName: { marginTop: 8, fontSize: 12, fontWeight: '700', color: '#475569' },

  // Chat List
  chatList: { paddingHorizontal: 24 },
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderColor: '#F8FAFC' },
  avatarContainer: { position: 'relative' },
  avatarGlow: { width: 56, height: 56, borderRadius: 20, padding: 2, justifyContent: 'center', alignItems: 'center' },
  avatarInner: { width: '100%', height: '100%', borderRadius: 18, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  onlineIndicator: { position: 'absolute', top: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },

  chatInfo: { flex: 1, marginLeft: 16 },
  chatTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#334155' },
  time: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  timeActive: { color: '#6366F1', fontWeight: '800' },
  
  messageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  message: { fontSize: 14, color: '#64748B', flex: 1, marginRight: 10 },
  textBold: { color: '#1E293B', fontWeight: '800' },

  unreadBadge: { minWidth: 20, height: 20, borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' }
});