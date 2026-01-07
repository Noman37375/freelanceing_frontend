import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router"; // ✅ use Expo Router

interface Conversation {
  _id: string;
  client: { id: string; name: string; avatar: string };
  lastMessage: string;
  updatedAt: string;
}

const MessagesScreen = () => {
  const router = useRouter();
  const userId = "userId1";

  // 🔹 Static conversations
  const [conversations] = useState<Conversation[]>([
    {
      _id: "c1",
      client: { id: "client1", name: "Alice Johnson", avatar: "https://i.pravatar.cc/150?img=1" },
      lastMessage: "Hey, can we discuss the project timeline?",
      updatedAt: "2025-12-27T10:15:00Z",
    },
    {
      _id: "c2",
      client: { id: "client2", name: "Bob Smith", avatar: "" }, // no avatar
      lastMessage: "I approved your latest milestone.",
      updatedAt: "2025-12-26T08:30:00Z",
    },
    {
      _id: "c3",
      client: { id: "client3", name: "Charlie Davis", avatar: "https://i.pravatar.cc/150?img=3" },
      lastMessage: "Please review the attached document.",
      updatedAt: "2025-12-25T14:45:00Z",
    },
  ]);

  const handlePress = (conv: Conversation) => {
    console.log("Navigate to chat with:", conv.client.name);
    // Example: routing simulation
    router.push({
      pathname: "/ChatScreen",
      params: {
        conversationId: conv._id,
        userId,
        receiverId: conv.client.id,
        client: JSON.stringify(conv.client),
      },
    });
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const other = item.client || { name: "Unknown", avatar: "" };
    return (
      <TouchableOpacity style={styles.item} onPress={() => handlePress(item)}>
        {other.avatar ? (
          <Image source={{ uri: other.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.placeholderText}>{other.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{other.name}</Text>
          <Text style={styles.message} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7", padding: 12 },
  item: {
    flexDirection: "row",
    padding: 14,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  placeholderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  textContainer: { flex: 1 },
  name: { fontWeight: "600", fontSize: 16 },
  message: { color: "#555", marginTop: 2, fontSize: 14 },
});

export default MessagesScreen;
