import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ChatScreen = () => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const userId = "user1";
  const client = { id: "client1", name: "Alice Johnson", avatar: "https://i.pravatar.cc/100?img=5" };

  const [messages, setMessages] = useState([
    { _id: "m1", senderId: "client1", message: "Hi! Are you available for a new project?", createdAt: new Date("2025-12-27T09:00:00") },
    { _id: "m2", senderId: "user1", message: "Hello Alice! Yes, I am available.", createdAt: new Date("2025-12-27T09:05:00") },
    { _id: "m3", senderId: "client1", message: "Great! I need a logo designed by tomorrow.", createdAt: new Date("2025-12-27T09:07:00") },
    { _id: "m4", senderId: "user1", message: "Sure, I can do that. Do you have any references?", createdAt: new Date("2025-12-27T09:10:00") },
  ]);

  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text) return;

    const newMsg = {
      _id: `m${messages.length + 1}`,
      senderId: userId,
      message: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setText("");
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === userId;
    return (
      <View style={[styles.msgRow, isMe ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
        {!isMe && (
          <Image source={{ uri: client.avatar }} style={styles.avatar} />
        )}
        <View style={[styles.msgBubble, isMe ? styles.myMsg : styles.theirMsg]}>
          <Text style={styles.msgText}>{item.message}</Text>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
        {isMe && <View style={{ width: 36 }} />} {/* spacer for alignment */}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#f0f4f7", "#d9e2ec"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{client.name}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message"
            style={styles.input}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Feather name="send" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachButton}>
            <Feather name="paperclip" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
    color: "#333",
  },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  msgBubble: {
    maxWidth: "75%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  myMsg: { backgroundColor: "#DCF8C6", borderTopRightRadius: 0 },
  theirMsg: { backgroundColor: "#fff", borderTopLeftRadius: 0 },
  msgText: { fontSize: 15, color: "#111" },
  time: { fontSize: 10, color: "#555", marginTop: 4, textAlign: "right" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f2f2f7",
    marginRight: 8,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: "#2563EB",
    padding: 10,
    borderRadius: 20,
    marginRight: 6,
  },
  attachButton: {
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 20,
  },
});

export default ChatScreen;
