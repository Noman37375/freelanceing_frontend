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
import { Search, MessageSquare, Clock } from "lucide-react-native";

interface Conversation {
  _id: string;
  client: { id: string; name: string; avatar: string };
  lastMessage: string;
  updatedAt: string;
  unread?: boolean; // Added for UI "pop"
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
    },
    {
      _id: "c2",
      client: { id: "client2", name: "Bob Smith", avatar: "" },
      lastMessage: "I approved your latest milestone. Thanks for the quick turnaround!",
      updatedAt: "Yesterday",
      unread: false,
    },
    {
      _id: "c3",
      client: { id: "client3", name: "Charlie Davis", avatar: "https://i.pravatar.cc/150?img=3" },
      lastMessage: "Please review the attached document.",
      updatedAt: "Dec 25",
      unread: false,
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
    const { client, lastMessage, updatedAt, unread } = item;
    
    return (
      <TouchableOpacity 
        style={[styles.item, unread && styles.unreadItem]} 
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        {/* Avatar Section */}
        <View style={styles.avatarWrapper}>
          {client.avatar ? (
            <Image source={{ uri: client.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.placeholderText}>{client.name.charAt(0)}</Text>
            </View>
          )}
          {unread && <View style={styles.activeDot} />}
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{client.name}</Text>
            <Text style={[styles.time, unread && styles.unreadTime]}>{updatedAt}</Text>
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
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <MessageSquare size={20} color="#6366F1" />
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
    backgroundColor: "#FFFFFF" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1E293B",
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#1E293B",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Clears Tab Bar
    paddingTop: 10,
  },
  item: {
    flexDirection: "row",
    paddingVertical: 15,
    alignItems: "center",
  },
  unreadItem: {
    // Optional: add a very subtle background for unread
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: { 
    width: 55, 
    height: 55, 
    borderRadius: 18, // Slightly squared-circle for modern look
  },
  placeholderAvatar: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#6366F1", // Brand color for placeholders
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { 
    color: "#fff", 
    fontWeight: "800", 
    fontSize: 20 
  },
  activeDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#6366F1",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  textContainer: { 
    flex: 1, 
    marginLeft: 15 
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: { 
    fontWeight: "800", 
    fontSize: 16, 
    color: "#1E293B" 
  },
  time: { 
    fontSize: 12, 
    color: "#94A3B8",
    fontWeight: "500" 
  },
  unreadTime: {
    color: "#6366F1",
    fontWeight: "700",
  },
  message: { 
    color: "#64748B", 
    fontSize: 14,
    fontWeight: "400"
  },
  unreadMessage: {
    color: "#1E293B",
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
    width: "80%",
    alignSelf: "flex-end",
  }
});

export default MessagesScreen;