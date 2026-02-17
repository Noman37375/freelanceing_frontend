/**
 * Client Chat - Full UI: conversation list + active chat room.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { chatService, type ConversationItem, type ChatListItem } from '@/services/chatService';
import { ChatRoom, type ActiveUser } from '@/components/ChatRoom';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, TYPOGRAPHY, GRADIENTS } from '@/constants/theme';

function toChatListItem(item: ConversationItem, currentUserId: string): ChatListItem {
  const otherUserId = item.sender_id === currentUserId ? item.receiver_id : item.sender_id;
  return {
    userId: otherUserId,
    otherUser: item.otherUser ?? undefined,
    latestMessage: item.latestMessage ?? '',
    timestamp: item.timestamp ?? '',
    unread: item.unread ?? false,
    unreadCount: item.unread ? 1 : 0,
  };
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function ClientChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { socket, onlineUserIds } = useSocket();
  const [list, setList] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await chatService.getHistory();
      const currentUserId = user.id;
      const items: ChatListItem[] = (data || []).map((item: ConversationItem) =>
        toChatListItem(item, currentUserId)
      );
      setList(items);
    } catch (e) {
      console.error('Load chat history failed', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onUnreadUpdate = useCallback((updates: { userId: string; unreadCount: number }[]) => {
    if (updates.length === 0) return;
    setList((prev) =>
      prev.map((u) => {
        const up = updates.find((x) => x.userId === u.userId);
        if (!up) return u;
        return { ...u, unreadCount: up.unreadCount, unread: up.unreadCount > 0 };
      })
    );
  }, []);

  const currentUser = user
    ? {
        id: user.id,
        userName: user.userName,
        profileImage: user.profileImage,
      }
    : null;

  if (!user?.id) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.placeholderText}>Sign in to use chat</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (activeUser) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ChatRoom
          activeUser={activeUser}
          currentUser={currentUser}
          onBack={() => setActiveUser(null)}
          onUnreadUpdate={onUnreadUpdate}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchBar}>
        <Search size={18} color={COLORS.textTertiary} />
        <Text style={styles.searchPlaceholder}>Search conversations...</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => {
            const name = item.otherUser?.user_name ?? item.userId?.slice(0, 8) ?? 'User';
            const isOnline = onlineUserIds.has(item.userId);
            return (
              <TouchableOpacity
                style={[styles.row, item.unread && styles.rowUnread]}
                onPress={() =>
                  setActiveUser({
                    id: item.userId,
                    userName: item.otherUser?.user_name ?? name,
                    profileImage: (item.otherUser as any)?.profile_image ?? null,
                  })
                }
                activeOpacity={0.8}
              >
                <View style={styles.avatarWrap}>
                  <LinearGradient
                    colors={GRADIENTS.primary as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarPlaceholder}
                  >
                    <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                  {isOnline && <View style={styles.onlineDot} />}
                </View>
                <View style={styles.rowText}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={[styles.time, item.unread && styles.timeUnread]}>
                      {formatTime(item.timestamp)}
                    </Text>
                  </View>
                  <Text style={[styles.preview, item.unread && styles.previewUnread]} numberOfLines={1}>
                    {item.latestMessage || 'No messages yet'}
                  </Text>
                </View>
                {item.unread && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unreadCount || 1}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true) || loadHistory()} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MessageCircle size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No conversations yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textTertiary },
  backLink: { marginTop: SPACING.m },
  backLinkText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBack: { padding: SPACING.s },
  headerBackText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.primary },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerRight: { width: 60 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    marginHorizontal: SPACING.m,
    marginVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.m,
  },
  searchPlaceholder: { marginLeft: SPACING.s, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary },
  listContent: { padding: SPACING.m, paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.l,
    marginBottom: SPACING.s,
    ...SHADOWS.small,
  },
  rowUnread: { backgroundColor: '#E5E4EA' },
  avatarWrap: { position: 'relative' },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { color: COLORS.white, fontWeight: TYPOGRAPHY.fontWeight.bold, fontSize: TYPOGRAPHY.fontSize.xl },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  rowText: { flex: 1, marginLeft: SPACING.m },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  name: {
    flex: 1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  time: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textTertiary },
  timeUnread: { color: COLORS.primary, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  preview: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary },
  previewUnread: { color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.fontWeight.medium },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.s,
  },
  badgeText: { color: COLORS.white, fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: TYPOGRAPHY.fontWeight.bold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 },
  emptyText: { marginTop: SPACING.m, fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textTertiary },
});
