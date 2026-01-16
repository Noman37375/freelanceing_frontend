import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const MESSAGES = [
  {
    id: '1',
    name: 'Sarah Johnson',
    lastMessage: 'I’ve shared the first draft 👀',
    time: '2m ago',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    lastMessage: 'Payment received, thanks!',
    time: '1h ago',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Emma Davis',
    lastMessage: 'Final files uploaded ✅',
    time: 'Yesterday',
    unread: 1,
    online: true,
  },
];

export default function MessagesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* MESSAGES LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {MESSAGES.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatCard}
            onPress={() =>
              router.push({
                pathname: '/client/chat',
                params: { id: chat.id, name: chat.name },
              })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {chat.name.charAt(0)}
              </Text>
              {chat.online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.name}>{chat.name}</Text>
                <Text style={styles.time}>{chat.time}</Text>
              </View>
              <Text
                style={[
                  styles.message,
                  chat.unread > 0 && { fontWeight: '600' },
                ]}
                numberOfLines={1}
              >
                {chat.lastMessage}
              </Text>
            </View>

            {chat.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{chat.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },

  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 2,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  chatContent: { flex: 1 },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  time: { fontSize: 12, color: '#6B7280' },
  message: { fontSize: 14, color: '#4B5563' },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
