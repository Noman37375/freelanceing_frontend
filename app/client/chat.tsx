import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Mic,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hi! I’ve started working on the UI.',
    sender: 'them',
    time: '10:20 AM',
  },
  {
    id: '2',
    text: 'Great! Let me know if you need anything.',
    sender: 'me',
    time: '10:22 AM',
  },
  {
    id: '3',
    text: 'I’ll send the first draft today.',
    sender: 'them',
    time: '10:25 AM',
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        text: input,
        sender: 'me',
        time: 'Now',
      },
    ]);
    setInput('');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    const initial = name?.charAt(0).toUpperCase() || 'U';

    return (
      <View
        style={[
          styles.messageRow,
          isMe && { justifyContent: 'flex-end' },
        ]}
      >
        {/* PROFILE CIRCLE (ONLY FOR THEM) */}
        {!isMe && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessage : styles.theirMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              !isMe && { color: '#1F2937' },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.time,
              !isMe && { color: '#6B7280' },
            ]}
          >
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name || 'Chat'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* MESSAGES */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* INPUT BAR */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Paperclip size={20} color="#6B7280" />
        </TouchableOpacity>

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        {input.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.micButton}>
            <Mic size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },

  messagesContainer: {
    padding: 16,
    paddingBottom: 90,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },

  messageBubble: {
    maxWidth: '72%',
    padding: 14,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: '#3B82F6',
    borderTopRightRadius: 6,
  },
  theirMessage: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 6,
  },

  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  time: {
    fontSize: 10,
    marginTop: 4,
    color: '#DBEAFE',
    alignSelf: 'flex-end',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },

  iconButton: {
    padding: 8,
  },

  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1F2937',
    marginHorizontal: 8,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
