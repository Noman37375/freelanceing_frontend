/**
 * ChatRoom - Shared chat UI with socket: message list, input, send/delete/edit, typing.
 * Use in ChatScreen and client/chat.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSocket } from '@/contexts/SocketContext';
import { chatService, type ChatMessage } from '@/services/chatService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

export interface ActiveUser {
  id: string;
  userName?: string;
  profileImage?: string | null;
}

export interface CurrentUser {
  id: string;
  userName?: string;
  profileImage?: string | null;
}

function messageKey(msg: ChatMessage) {
  return msg?.id || '';
}

interface ChatRoomProps {
  activeUser: ActiveUser;
  currentUser: CurrentUser | null;
  onBack?: () => void;
  onUnreadUpdate?: (users: { userId: string; unreadCount: number }[]) => void;
  projectId?: string | null;
}

export function ChatRoom({ activeUser, currentUser, onBack, onUnreadUpdate, projectId }: ChatRoomProps) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Map<string, ChatMessage>>(new Map());
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [menuMessageId, setMenuMessageId] = useState<string | null>(null);
  const [receiverProfileImage, setReceiverProfileImage] = useState<string | null>(activeUser?.profileImage ?? null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadMessages = useCallback(async (silent = false) => {
    if (!activeUser?.id) return;
    if (!silent) setLoading(true);
    try {
      const list = await chatService.getMessages(activeUser.id, projectId);
      const map = new Map<string, ChatMessage>();
      list.forEach((m) => map.set(m.id, m));
      setMessages(map);
      const firstWithReceiver = list.find(
        (m: any) => m.receiverId === activeUser.id && m.receiver?.profile_image
      );
      const firstWithSender = list.find(
        (m: any) => m.senderId === activeUser.id && m.sender?.profile_image
      );
      const fromMessage =
        firstWithReceiver?.receiver?.profile_image ||
        firstWithSender?.sender?.profile_image;
      if (fromMessage) {
        setReceiverProfileImage((prev) => prev || fromMessage);
      }
    } catch (e) {
      if (!silent) console.error('Load messages failed', e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [activeUser?.id, projectId]);

  useEffect(() => {
    setReceiverProfileImage(activeUser?.profileImage ?? null);
  }, [activeUser?.id, activeUser?.profileImage]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    const handleNewMessage = (data: {
      id?: string;
      sender?: string;
      receiver?: string;
      message?: string;
      userName?: string;
      profilePic?: string | null;
      isReceiverInRoom?: boolean;
      createdAt?: string;
      updatedAt?: string;
    }) => {
      const key = data?.id;
      if (!key) return;
      const s = String(data.sender ?? '');
      const r = String(data.receiver ?? '');
      const cur = String(currentUser.id ?? '');
      const act = String(activeUser.id ?? '');
      const isForThisChat =
        (s === cur && r === act) || (r === cur && s === act);
      if (!isForThisChat) return;
      const msg: ChatMessage = {
        id: key,
        senderId: s,
        receiverId: r,
        message: data.message ?? '',
        read: false,
        createdAt: data.createdAt ?? new Date().toISOString(),
        updatedAt: data.updatedAt ?? new Date().toISOString(),
      };
      setMessages((prev) => {
        const next = new Map(prev);
        next.set(key, msg);
        return next;
      });
      if (onUnreadUpdate && data.sender !== currentUser.id) {
        onUnreadUpdate([{ userId: data.sender!, unreadCount: 1 }]);
      }
    };

    const handleDeleteMsg = (messageId: string) => {
      setMessages((prev) => {
        if (!prev.has(messageId)) return prev;
        const next = new Map(prev);
        next.delete(messageId);
        return next;
      });
    };

    const handleEditMsg = (payload: { messageId?: string; message?: string }) => {
      if (!payload?.messageId) return;
      setMessages((prev) => {
        if (!prev.has(payload.messageId!)) return prev;
        const next = new Map(prev);
        const existing = next.get(payload.messageId!);
        if (existing) next.set(payload.messageId!, { ...existing, message: payload.message ?? existing.message });
        return next;
      });
    };

    const handleStartTyping = (sender: string) => {
      setTypingUsers((prev) => (prev.includes(sender) ? prev : [...prev, sender]));
    };
    const handleStopTyping = (sender: string) => {
      setTypingUsers((prev) => prev.filter((id) => id !== sender));
    };

    const handleUserMsg = (sender: string) => {
      if (activeUser?.id === sender && onUnreadUpdate) {
        onUnreadUpdate([{ userId: sender, unreadCount: 0 }]);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('deleteMsg', handleDeleteMsg);
    socket.on('editMsg', handleEditMsg);
    socket.on('startTyping', handleStartTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('userMsg', handleUserMsg);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('deleteMsg', handleDeleteMsg);
      socket.off('editMsg', handleEditMsg);
      socket.off('startTyping', handleStartTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('userMsg', handleUserMsg);
    };
  }, [socket, currentUser?.id, activeUser?.id, onUnreadUpdate]);

  const handleSendMessage = async () => {
    const text = messageInput.trim();
    if (!text || !activeUser?.id || !currentUser?.id) return;
    setMessageInput('');
    try {
      const saved = await chatService.sendMessage(activeUser.id, text, projectId ?? undefined);
      if (saved?.id) {
        const msg: ChatMessage = {
          id: saved.id,
          senderId: saved.senderId ?? currentUser.id,
          receiverId: saved.receiverId ?? activeUser.id,
          message: saved.message ?? text,
          read: saved.read ?? false,
          createdAt: saved.createdAt ?? new Date().toISOString(),
          updatedAt: saved.updatedAt ?? new Date().toISOString(),
        };
        setMessages((prev) => {
          const next = new Map(prev);
          next.set(msg.id, msg);
          return next;
        });
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    } catch (e) {
      console.error('Send message failed', e);
      setMessageInput(text);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!activeUser?.id) return;
    const previous = new Map(messages);
    setMessages((prev) => {
      const next = new Map(prev);
      next.delete(messageId);
      return next;
    });
    setMenuMessageId(null);
    try {
      await chatService.deleteMessage(messageId);
    } catch (e) {
      console.error('Delete message failed', e);
      setMessages(previous);
    }
  };

  const handleUpdate = async (messageId: string, message: string) => {
    if (!activeUser?.id || !message.trim()) return;
    const trimmed = message.trim();
    const previous = new Map(messages);
    setMessages((prev) => {
      const next = new Map(prev);
      const existing = next.get(messageId);
      if (existing) next.set(messageId, { ...existing, message: trimmed });
      return next;
    });
    setEditingMessageId(null);
    setEditedText('');
    setMenuMessageId(null);
    try {
      await chatService.updateMessage(messageId, trimmed);
    } catch (e) {
      console.error('Update message failed', e);
      setMessages(previous);
    }
  };

  const handleTyping = () => {
    if (!socket || !activeUser?.id || !currentUser?.id) return;
    if (messageInput.trim().length > 0) {
      socket.emit('startTyping', { sender: currentUser.id, receiver: activeUser.id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { sender: currentUser.id, receiver: activeUser.id });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const list = Array.from(messages.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === currentUser?.id;
    const key = messageKey(item);
    const isEditing = editingMessageId === key;

    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
        {!isMe && (
          <View style={styles.avatarWrap}>
            {(receiverProfileImage || activeUser.profileImage) ? (
              <Image
                source={{ uri: receiverProfileImage || activeUser.profileImage || '' }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>{(activeUser.userName || '?').charAt(0)}</Text>
              </View>
            )}
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          {isEditing ? (
            <View style={styles.editRow}>
              <TextInput
                value={editedText}
                onChangeText={setEditedText}
                style={styles.editInput}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => handleUpdate(key, editedText)}
                style={styles.editBtn}
              >
                <Text style={styles.editBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.msgText}>{item.message}</Text>
              <View style={styles.msgMeta}>
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {isMe && (
                  <TouchableOpacity
                    onPress={() => setMenuMessageId(menuMessageId === key ? null : key)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="more-vertical" size={14} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
              {menuMessageId === key && isMe && (
                <View style={styles.menu}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingMessageId(key);
                      setEditedText(item.message);
                      setMenuMessageId(null);
                    }}
                    style={styles.menuItem}
                  >
                    <Text style={styles.menuItemText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(key)} style={styles.menuItem}>
                    <Text style={[styles.menuItemText, { color: COLORS.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
        {isMe && <View style={styles.avatarWrap} />}
      </View>
    );
  };

  if (!currentUser?.id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.placeholderText}>Sign in to chat</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {onBack && (
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            {(receiverProfileImage || activeUser.profileImage) ? (
              <Image
                source={{ uri: receiverProfileImage || activeUser.profileImage || '' }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Text style={styles.headerAvatarLetter}>
                  {(activeUser.userName || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.headerTitle} numberOfLines={1}>
              {activeUser.userName || 'Chat'}
            </Text>
          </View>
          <View style={styles.backBtn} />
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={list}
            keyExtractor={(item) => messageKey(item)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          {typingUsers.includes(activeUser.id) && (
            <View style={styles.typingBar}>
              <Text style={styles.typingText}>{activeUser.userName || 'User'} is typing...</Text>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              value={messageInput}
              onChangeText={(t) => {
                setMessageInput(t);
                handleTyping();
              }}
              placeholder="Type a message"
              style={styles.input}
              placeholderTextColor={COLORS.textTertiary}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity onPress={handleSendMessage} style={styles.sendBtn} disabled={!messageInput.trim()}>
              <Feather name="send" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarLetter: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    maxWidth: '60%',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textTertiary },
  listContent: { padding: SPACING.m, paddingBottom: SPACING.l },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 4 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },
  avatarWrap: { width: 36, marginHorizontal: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textSecondary },
  bubble: { maxWidth: '75%', paddingVertical: 8, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.l },
  bubbleMe: { backgroundColor: '#DCF8C6', borderTopRightRadius: 0 },
  bubbleThem: { backgroundColor: COLORS.white, borderTopLeftRadius: 0, borderWidth: 1, borderColor: COLORS.border },
  msgText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textPrimary },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 6 },
  time: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textTertiary },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.s, padding: 8, fontSize: TYPOGRAPHY.fontSize.base },
  editBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.s },
  editBtnText: { color: COLORS.white, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  menu: { marginTop: 4, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 4 },
  menuItem: { paddingVertical: 6 },
  menuItemText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  typingBar: { paddingHorizontal: SPACING.m, paddingVertical: 4, backgroundColor: COLORS.surfaceMuted },
  typingText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary, fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceMuted,
    marginRight: 8,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
