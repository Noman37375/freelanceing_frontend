import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, MessageSquare, Clock, Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, TYPOGRAPHY, GRADIENTS } from "@/constants/theme";

interface Conversation {
  _id: string;
  client: { id: string; name: string; avatar: string };
  lastMessage: string;
  updatedAt: string;
  unread?: boolean;
  online?: boolean;
}

const MessagesScreen = () => {
  const router = useRouter();
  const userId = "userId1";

  const [conversations] = useState<Conversation[]>([
    {
      _id: "c1",
      client: { id: "client1", name: "Alice Johnson", avatar: "https://i.pravatar.cc/150?img=1" },
      lastMessage: "Hey, can we discuss the project timeline?",
      updatedAt: "10:15 AM",
      unread: true,
      online: true,
    },
    {
      _id: "c2",
      client: { id: "client2", name: "Bob Smith", avatar: "" },
      lastMessage: "I approved your latest milestone. Thanks for the quick turnaround!",
      updatedAt: "Yesterday",
      unread: false,
      online: false,
    },
    {
      _id: "c3",
      client: { id: "client3", name: "Charlie Davis", avatar: "https://i.pravatar.cc/150?img=3" },
      lastMessage: "Please review the attached document.",
      updatedAt: "Dec 25",
      unread: false,
      online: true,
    },
  ]);

  const handlePress = (conv: Conversation) => {
    router.push({
      pathname: "/ChatScreen" as any,
      params: {
        conversationId: conv._id,
        userId,
        receiverId: conv.client.id,
        client: JSON.stringify(conv.client),
      },
    });
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const { client, lastMessage, updatedAt, unread, online } = item;

    return (
      <TouchableOpacity
        style={[styles.item, unread && styles.unreadItem]}
        onPress={() => handlePress(item)}
        activeOpacity={0.9}
      >
        {/* Avatar Section */}
        <View style={styles.avatarWrapper}>
          {client.avatar ? (
            <View style={styles.avatarContainer}>
              <Image source={{ uri: client.avatar }} style={styles.avatar} />
              {online && <View style={styles.onlineDot} />}
            </View>
          ) : (
            <LinearGradient
              colors={GRADIENTS.primary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.placeholderAvatar}
            >
              <Text style={styles.placeholderText}>{client.name.charAt(0)}</Text>
              {online && <View style={styles.onlineDot} />}
            </LinearGradient>
          )}
          {unread && <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>1</Text>
          </View>}
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{client.name}</Text>
            <View style={styles.timeContainer}>
              {!unread && <Check size={12} color="#10B981" />}
              <Text style={[styles.time, unread && styles.unreadTime]}>{updatedAt}</Text>
            </View>
          </View>

          <Text style={[styles.message, unread && styles.unreadMessage]} numberOfLines={1}>
            {lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Area */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Inbox</Text>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <TouchableOpacity style={styles.newChatButton}>
          <LinearGradient
            colors={GRADIENTS.primary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.newChatGradient}
          >
            <MessageSquare size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            placeholder="Search conversations..."
            style={styles.searchInput}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
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
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    color: "#1E293B",
  },
  newChatButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.m,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  newChatGradient: {
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
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
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.m,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: "#1E293B",
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
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.l,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  placeholderAvatar: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.l,
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
  },
  placeholderText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    fontSize: TYPOGRAPHY.fontSize['2xl'],
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  unreadCount: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  textContainer: {
    flex: 1,
    marginLeft: SPACING.m,
  },
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
    color: "#1E293B",
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: "#94A3B8",
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  unreadTime: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  message: {
    color: "#64748B",
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
  },
  unreadMessage: {
    color: "#1E293B",
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  separator: {
    height: 1,
    backgroundColor: "transparent",
  }
});

export default MessagesScreen;
