/**
 * Client Messages - Conversation list; search all users (except self) with Client/Freelancer badge.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, MessageSquare, Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { chatService, type ConversationItem, type ChatUserItem } from "@/services/chatService";
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, TYPOGRAPHY, GRADIENTS } from "@/constants/theme";

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

interface ListItem {
  userId: string;
  name: string;
  profileImage?: string | null;
  lastMessage: string;
  updatedAt: string;
  unread: boolean;
}

const SEARCH_DEBOUNCE_MS = 400;
const SKELETON_COUNT = 6;

function SkeletonRow({ opacity }: { opacity: Animated.Value }) {
  return (
    <View style={skeletonStyles.item}>
      <Animated.View style={[skeletonStyles.avatar, { opacity }]} />
      <View style={skeletonStyles.textContainer}>
        <Animated.View style={[skeletonStyles.line, skeletonStyles.lineName, { opacity }]} />
        <Animated.View style={[skeletonStyles.line, skeletonStyles.lineMessage, { opacity }]} />
      </View>
    </View>
  );
}

function MessageListSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, useNativeDriver: true, duration: 600 }),
        Animated.timing(opacity, { toValue: 0.4, useNativeDriver: true, duration: 600 }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <View style={skeletonStyles.list}>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <SkeletonRow key={i} opacity={opacity} />
      ))}
    </View>
  );
}

const MessagesScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { onlineUserIds } = useSocket();
  const [conversations, setConversations] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUserItem[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await chatService.getHistory();
      const currentUserId = user.id;
      const items: ListItem[] = (data || []).map((item: ConversationItem) => {
        const otherUserId = item.sender_id === currentUserId ? item.receiver_id : item.sender_id;
        const name = item.otherUser?.user_name ?? otherUserId?.slice(0, 8) ?? "User";
        return {
          userId: otherUserId,
          name,
          profileImage: item.otherUser?.profile_image ?? null,
          lastMessage: item.latestMessage ?? "",
          updatedAt: formatTime(item.timestamp ?? ""),
          unread: item.unread ?? false,
        };
      });
      setConversations(items);
    } catch (e) {
      console.error("Load chat history failed", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await chatService.getUsers(searchQuery.trim());
        setSearchResults(data || []);
      } catch (e) {
        console.error("Search users failed", e);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handlePressConversation = (item: ListItem) => {
    router.push({
      pathname: "/ChatScreen" as any,
      params: {
        receiverId: item.userId,
        userName: item.name,
        client: JSON.stringify({
          id: item.userId,
          name: item.name,
          avatar: item.profileImage ?? "",
          profileImage: item.profileImage ?? "",
        }),
      },
    });
  };

  const handlePressUser = (u: ChatUserItem) => {
    const name = u.user_name ?? u.id?.slice(0, 8) ?? "User";
    router.push({
      pathname: "/ChatScreen" as any,
      params: {
        receiverId: u.id,
        userName: name,
        client: JSON.stringify({
          id: u.id,
          name,
          avatar: u.profile_image || "",
          profileImage: u.profile_image || "",
        }),
      },
    });
  };

  const renderConversationItem = ({ item }: { item: ListItem }) => {
    const online = onlineUserIds.has(item.userId);
    return (
      <TouchableOpacity
        style={[styles.item, item.unread && styles.unreadItem]}
        onPress={() => handlePressConversation(item)}
        activeOpacity={0.9}
      >
        <View style={styles.avatarWrapper}>
          {item.profileImage ? (
            <View style={styles.avatarImageWrap}>
              <Image source={{ uri: item.profileImage }} style={styles.avatarImage} />
              {online && <View style={styles.onlineDot} />}
            </View>
          ) : (
            <LinearGradient
              colors={GRADIENTS.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.placeholderAvatar}
            >
              <Text style={styles.avatarLetter}>{item.name.charAt(0).toUpperCase()}</Text>
              {online && <View style={styles.onlineDot} />}
            </LinearGradient>
          )}
          {item.unread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>1</Text>
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.timeContainer}>
              {!item.unread && <Check size={12} color="#10B981" />}
              <Text style={[styles.time, item.unread && styles.unreadTime]}>{item.updatedAt}</Text>
            </View>
          </View>
          <Text style={[styles.message, item.unread && styles.unreadMessage]} numberOfLines={1}>
            {item.lastMessage || "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchResultItem = ({ item }: { item: ChatUserItem }) => {
    const name = item.user_name ?? item.id?.slice(0, 8) ?? "User";
    const role = item.role === "Client" ? "Client" : "Freelancer";
    const online = onlineUserIds.has(item.id);
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => handlePressUser(item)}
        activeOpacity={0.9}
      >
        <View style={styles.avatarWrapper}>
          {item.profile_image ? (
            <View style={styles.avatarImageWrap}>
              <Image source={{ uri: item.profile_image }} style={styles.avatarImage} />
              {online && <View style={styles.onlineDot} />}
            </View>
          ) : (
            <LinearGradient
              colors={GRADIENTS.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.placeholderAvatar}
            >
              <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
              {online && <View style={styles.onlineDot} />}
            </LinearGradient>
          )}
        </View>
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <View style={[styles.roleBadge, role === "Client" ? styles.roleBadgeClient : styles.roleBadgeFreelancer]}>
              <Text style={styles.roleBadgeText}>{role}</Text>
            </View>
          </View>
          <Text style={styles.message} numberOfLines={1}>{item.email || "Start a conversation"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const showSearchResults = searchQuery.trim().length > 0;

  if (!user?.id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Sign in to view messages</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Inbox</Text>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            placeholder="Search conversations or find users..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            underlineColorAndroid="transparent"
          />
        </View>
      </View>

      {showSearchResults ? (
        searching ? (
          <MessageListSkeleton />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderSearchResultItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No users found. Try a different search.</Text>
              </View>
            }
          />
        )
      ) : loading ? (
        <MessageListSkeleton />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.userId}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true) || loadHistory()} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MessageSquare size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>Search above to find users and start a chat</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    backgroundColor: COLORS.white,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize["3xl"],
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    color: "#444751",
  },
  searchContainer: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: BORDER_RADIUS.m,
    paddingHorizontal: SPACING.m,
    height: 48,
    borderWidth: 0,
    borderColor: "transparent",
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.m,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: "#444751",
    borderWidth: 0,
    borderColor: "transparent",
    outlineStyle: "none",
  },
  listContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 100,
    paddingTop: SPACING.m,
  },
  item: {
    flexDirection: "row",
    paddingVertical: SPACING.m,
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.l,
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.s,
    ...SHADOWS.small,
  },
  unreadItem: {
    backgroundColor: "#E5E4EA",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  avatarWrapper: { position: "relative" },
  avatarImageWrap: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.l,
    position: "relative",
    overflow: "hidden",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.l,
  },
  placeholderAvatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.l,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarLetter: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    fontSize: TYPOGRAPHY.fontSize["2xl"],
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  unreadCount: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  textContainer: { flex: 1, marginLeft: SPACING.m },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: "#444751",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.s,
  },
  roleBadgeClient: { backgroundColor: "#DBEAFE" },
  roleBadgeFreelancer: { backgroundColor: "#D1FAE5" },
  roleBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: "#444751",
  },
  timeContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  time: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: "#94A3B8",
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  unreadTime: { color: COLORS.primary, fontWeight: TYPOGRAPHY.fontWeight.bold },
  message: {
    color: "#64748B",
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
  },
  unreadMessage: {
    color: "#444751",
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  separator: { height: 1, backgroundColor: "transparent" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 48 },
  emptyText: { marginTop: SPACING.m, fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textTertiary },
  emptySubtext: { marginTop: SPACING.s, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary },
});

const skeletonStyles = StyleSheet.create({
  list: {
    flex: 1,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: 100,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.s,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.l,
    ...SHADOWS.small,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.l,
    backgroundColor: "#E5E4EA",
  },
  textContainer: { flex: 1, marginLeft: SPACING.m },
  line: { backgroundColor: "#E5E4EA", borderRadius: 4 },
  lineName: { height: 16, width: "65%", marginBottom: 8 },
  lineMessage: { height: 12, width: "90%" },
});

export default MessagesScreen;
