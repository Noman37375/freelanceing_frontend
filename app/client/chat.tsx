import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Mic,
  MoreVertical,
  Circle,
  Image as ImageIcon,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  type?: 'text' | 'image';
};

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: 'Hi! I’ve started working on the mobile app UI.', sender: 'them', time: '10:20 AM' },
  { id: '2', text: 'Great! Let me know if you need any brand assets.', sender: 'me', time: '10:22 AM' },
  { id: '3', text: 'I’ll send the first draft of the Login screen today.', sender: 'them', time: '10:25 AM' },
];

export default function ChatScreen() {
  const router = useRouter();
  const { name, id } = useLocalSearchParams<{ name: string; id: string }>();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.messageRow, isMe ? styles.myRow : styles.theirRow]}>
        {!isMe && (
          <View style={styles.chatAvatar}>
            <Text style={styles.avatarText}>{name?.charAt(0)}</Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isMe ? styles.myTime : styles.theirTime]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER: EXECUTIVE STYLE */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#1E293B" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name || 'Freelancer'}</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Active on Project</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <MoreVertical size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* INPUT: MODULAR STYLE */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={10}>
        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachBtn}>
              <Paperclip size={20} color="#64748B" />
            </TouchableOpacity>
            
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message..."
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
              multiline
            />

            {input.trim() ? (
              <TouchableOpacity onPress={sendMessage}>
                <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.sendBtn}>
                  <Send size={18} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.inputActions}>
                <TouchableOpacity style={styles.actionIcon}><ImageIcon size={20} color="#64748B" /></TouchableOpacity>
                <TouchableOpacity style={styles.micBtn}><Mic size={20} color="#FFF" /></TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  statusText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  moreBtn: { padding: 8 },

  listContent: { padding: 20, paddingBottom: 40 },
  messageRow: { marginBottom: 20, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  myRow: { justifyContent: 'flex-end' },
  theirRow: { justifyContent: 'flex-start' },
  
  chatAvatar: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 14 },

  bubble: { maxWidth: '80%', padding: 16, borderRadius: 24 },
  myBubble: { backgroundColor: '#1E293B', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F1F5F9' },

  messageText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  myText: { color: '#FFF' },
  theirText: { color: '#334155' },

  timeText: { fontSize: 10, marginTop: 6, fontWeight: '700' },
  myTime: { color: '#94A3B8', alignSelf: 'flex-end' },
  theirTime: { color: '#CBD5E1' },

  inputArea: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, backgroundColor: 'transparent' },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  },
  attachBtn: { padding: 10 },
  textInput: { flex: 1, paddingHorizontal: 12, fontSize: 15, color: '#1E293B', maxHeight: 100 },
  inputActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { padding: 10 },
  micBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});