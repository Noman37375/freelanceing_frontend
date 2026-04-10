/**
 * ChatRoom - WhatsApp-style chat UI: message list, input, send/delete/edit, typing.
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
  Animated,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSocket } from '@/contexts/SocketContext';
import { useCall } from '@/contexts/CallContext';
import { chatService, type ChatMessage } from '@/services/chatService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

const CHAT_SKELETON_COUNT = 6;

function ChatBubbleSkeleton({ isMe, opacity }: { isMe: boolean; opacity: Animated.Value }) {
  return (
    <View style={[chatSkeletonStyles.msgRow, isMe ? chatSkeletonStyles.msgRowMe : chatSkeletonStyles.msgRowThem]}>
      {!isMe && <Animated.View style={[chatSkeletonStyles.avatar, { opacity }]} />}
      <Animated.View
        style={[
          chatSkeletonStyles.bubble,
          isMe ? chatSkeletonStyles.bubbleMe : chatSkeletonStyles.bubbleThem,
          { opacity },
        ]}
      >
        <View style={[chatSkeletonStyles.line, chatSkeletonStyles.lineShort]} />
        <View style={[chatSkeletonStyles.line, chatSkeletonStyles.lineLong]} />
      </Animated.View>
      {isMe && <View style={chatSkeletonStyles.avatarSpacer} />}
    </View>
  );
}

function ChatSkeleton() {
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
    <View style={chatSkeletonStyles.list}>
      {Array.from({ length: CHAT_SKELETON_COUNT }).map((_, i) => (
        <ChatBubbleSkeleton key={i} isMe={i % 2 === 1} opacity={opacity} />
      ))}
    </View>
  );
}

export interface ActiveUser {
  id: string;
  userName?: string;
  profileImage?: string | null;
  phone?: string | null;
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
  const { socket, connected, onlineUserIds } = useSocket();
  const { startCall, isWebRTCAvailable } = useCall();
  const [messages, setMessages] = useState<Map<string, ChatMessage>>(new Map());
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [menuMessageId, setMenuMessageId] = useState<string | null>(null);
  const [receiverProfileImage, setReceiverProfileImage] = useState<string | null>(activeUser?.profileImage ?? null);
  const [partnerPhone, setPartnerPhone] = useState<string | null>(activeUser?.phone ?? null);
  const [refreshing, setRefreshing] = useState(false);
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
    setPartnerPhone(activeUser?.phone ?? null);
  }, [activeUser?.id, activeUser?.phone]);

  useEffect(() => {
    if (!activeUser?.id) return;
    if (activeUser.phone != null && activeUser.phone !== '') return;
    let cancelled = false;
    chatService.getUserProfile(activeUser.id).then((profile) => {
      if (cancelled || !profile?.phone) return;
      setPartnerPhone(profile.phone);
    });
    return () => { cancelled = true; };
  }, [activeUser?.id, activeUser?.phone]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const prevConnectedRef = useRef(true);
  // When socket (re)connects (disconnected -> connected), sync once for missed real-time events
  useEffect(() => {
    if (!activeUser?.id) return;
    const justReconnected = connected && !prevConnectedRef.current;
    prevConnectedRef.current = connected;
    if (justReconnected) loadMessages(true);
  }, [connected, activeUser?.id, loadMessages]);

  // Poll only when socket is disconnected; when connected, real-time handles new messages
  const POLL_WHEN_DISCONNECTED_MS = 15000;
  useEffect(() => {
    if (!activeUser?.id || connected) return;
    const interval = setInterval(() => loadMessages(true), POLL_WHEN_DISCONNECTED_MS);
    return () => clearInterval(interval);
  }, [activeUser?.id, connected, loadMessages]);

  // Emit messagesSeen when chat opens - tell sender we've seen their messages
  useEffect(() => {
    if (!socket || !currentUser?.id || !activeUser?.id) return;
    // Find unread messages from the active user (messages they sent to us)
    const unseenIds = Array.from(messages.values())
      .filter(m => m.senderId === activeUser.id && !m.seenAt && !m.read)
      .map(m => m.id);
    if (unseenIds.length > 0) {
      socket.emit('messagesSeen', {
        sender: activeUser.id,
        receiver: currentUser.id,
        messageIds: unseenIds,
      });
      // Update local state immediately
      setMessages(prev => {
        const next = new Map(prev);
        const now = new Date().toISOString();
        unseenIds.forEach(id => {
          const msg = next.get(id);
          if (msg) next.set(id, { ...msg, read: true, seenAt: now });
        });
        return next;
      });
    }
  }, [socket, currentUser?.id, activeUser?.id, messages.size]);

  const onRefresh = useCallback(async () => {
    if (!activeUser?.id) return;
    setRefreshing(true);
    await loadMessages(true);
    setRefreshing(false);
  }, [activeUser?.id, loadMessages]);

  const normalizePhoneForTel = (raw: string | null | undefined): string | null => {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const digitsAndPlus = trimmed.replace(/\s/g, '').replace(/[^\d+]/g, '');
    return digitsAndPlus.length > 0 ? digitsAndPlus : null;
  };

  const handleVoiceCall = useCallback(() => {
    if (!activeUser?.id) return;
    if (isWebRTCAvailable) {
      startCall(activeUser.id, 'audio', activeUser.userName);
    } else {
      const telNumber = normalizePhoneForTel(partnerPhone);
      if (telNumber) {
        Linking.openURL(`tel:${telNumber}`).catch(() => {
          Alert.alert('Cannot place call', 'Your device could not open the dialer.');
        });
      } else {
        Alert.alert(
          'Calls on web',
          'Real-time audio and video calls work in the web app. Open this app in a browser, or share your phone number for a regular call.'
        );
      }
    }
  }, [activeUser?.id, activeUser?.userName, isWebRTCAvailable, startCall, partnerPhone]);

  const handleVideoCall = useCallback(() => {
    if (!activeUser?.id) return;
    if (isWebRTCAvailable) {
      startCall(activeUser.id, 'video', activeUser.userName);
    } else {
      Alert.alert(
        'Calls on web',
        'Real-time video calls work in the web app. Open this app in a browser to use in-app video calling.'
      );
    }
  }, [activeUser?.id, activeUser?.userName, isWebRTCAvailable, startCall]);

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
      const s = String(data.sender ?? '').trim().toLowerCase();
      const r = String(data.receiver ?? '').trim().toLowerCase();
      const cur = String(currentUser?.id ?? '').trim().toLowerCase();
      const act = String(activeUser?.id ?? '').trim().toLowerCase();
      if (!cur || !act) return;
      const isForThisChat =
        (s === cur && r === act) || (r === cur && s === act);
      if (!isForThisChat) return;
      const msg: ChatMessage = {
        id: key,
        senderId: s,
        receiverId: r,
        message: data.message ?? '',
        read: false,
        seenAt: null,
        createdAt: data.createdAt ?? new Date().toISOString(),
        updatedAt: data.updatedAt ?? new Date().toISOString(),
      };
      setMessages((prev) => {
        const next = new Map(prev);
        next.set(key, msg);
        return next;
      });
      // Auto-scroll to show new message
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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

    // Sender receives notification that receiver has seen their messages
    const handleMessagesSeen = (data: { by?: string; messageIds?: string[]; seenAt?: string }) => {
      if (!data?.messageIds?.length) return;
      const by = String(data.by ?? '').toLowerCase();
      const act = String(activeUser.id ?? '').toLowerCase();
      if (by !== act) return;
      setMessages(prev => {
        const next = new Map(prev);
        let changed = false;
        data.messageIds!.forEach(id => {
          const msg = next.get(id);
          if (msg) {
            next.set(id, { ...msg, read: true, seenAt: data.seenAt || new Date().toISOString() });
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('deleteMsg', handleDeleteMsg);
    socket.on('editMsg', handleEditMsg);
    socket.on('startTyping', handleStartTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('userMsg', handleUserMsg);
    socket.on('messagesSeen', handleMessagesSeen);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('deleteMsg', handleDeleteMsg);
      socket.off('editMsg', handleEditMsg);
      socket.off('startTyping', handleStartTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('userMsg', handleUserMsg);
      socket.off('messagesSeen', handleMessagesSeen);
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
          seenAt: saved.seenAt ?? null,
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

  function getDateLabel(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
  }

  const listWithDates: Array<{ type: 'date'; label: string } | { type: 'msg'; item: ChatMessage }> = [];
  let lastDate = '';
  list.forEach((item) => {
    const dateLabel = getDateLabel(item.createdAt);
    if (dateLabel !== lastDate) {
      lastDate = dateLabel;
      listWithDates.push({ type: 'date', label: dateLabel });
    }
    listWithDates.push({ type: 'msg', item });
  });

  const renderItem = ({ item: row }: { item: { type: 'date'; label: string } | { type: 'msg'; item: ChatMessage } }) => {
    if (row.type === 'date') {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.datePill}>
            <Text style={styles.datePillText}>{row.label}</Text>
          </View>
        </View>
      );
    }
    const item = row.item;
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
                  <View style={styles.seenIndicator}>
                    {item.seenAt ? (
                      <Ionicons name="checkmark-done" size={16} color={COLORS.primaryLight} />
                    ) : (
                      <Ionicons name="checkmark-done" size={16} color="rgba(0,0,0,0.45)" />
                    )}
                  </View>
                )}
                {isMe && (
                  <TouchableOpacity
                    onPress={() => setMenuMessageId(menuMessageId === key ? null : key)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="more-vertical" size={14} color="rgba(0,0,0,0.45)" />
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
          <TouchableOpacity onPress={onBack} style={styles.headerIconBtn} activeOpacity={0.7}>
            <Feather name="chevron-left" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerProfileRow} activeOpacity={1}>
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
            <View style={styles.headerNameBlock}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {activeUser.userName || 'Chat'}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {onlineUserIds.has(activeUser.id) ? 'online' : 'last seen recently'}
              </Text>
            </View>
          </TouchableOpacity>
          {/* <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7} onPress={handleVideoCall}>
              <Feather name="video" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7} onPress={handleVoiceCall}>
              <Feather name="phone" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View> */}
        </View>
      )}

      {loading ? (
        <ChatSkeleton />
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={listWithDates}
            extraData={messages.size}
            keyExtractor={(entry, idx) => entry.type === 'date' ? `date-${entry.label}-${idx}` : messageKey(entry.item)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
          />
          {typingUsers.includes(activeUser.id) && (
            <View style={styles.typingBar}>
              <Text style={styles.typingText}>{activeUser.userName || 'User'} is typing...</Text>
            </View>
          )}
          <View style={styles.inputRow}>
            <View style={styles.inputWrap}>
              <TextInput
                value={messageInput}
                onChangeText={(t) => {
                  setMessageInput(t);
                  handleTyping();
                }}
                placeholder="Message"
                style={styles.input}
                placeholderTextColor="#667781"
                multiline
                maxLength={2000}
              />
            </View>
            <TouchableOpacity
              onPress={handleSendMessage}
              style={[styles.sendBtn, !messageInput.trim() && styles.sendBtnDisabled]}
              disabled={!messageInput.trim()}
            >
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
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.s,
    paddingTop: Platform.OS === 'ios' ? SPACING.m + 24 : SPACING.s + 8,
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerProfileRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.xs,
    minWidth: 0,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  headerAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarLetter: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  headerNameBlock: {
    flex: 1,
    marginLeft: SPACING.m,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textTertiary },
  listContent: { paddingHorizontal: SPACING.m, paddingVertical: SPACING.s, paddingBottom: SPACING.l },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: SPACING.m,
  },
  datePill: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  datePillText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(0,0,0,0.7)',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 2 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },
  avatarWrap: { width: 32, marginHorizontal: 4 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: 'rgba(0,0,0,0.6)',
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2 },
      android: { elevation: 1 },
    }),
  },
  bubbleMe: {
    backgroundColor: COLORS.surfaceMuted,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
  },
  bubbleThem: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    borderTopRightRadius: 18,
  },
  msgText: { fontSize: 15, color: COLORS.textPrimary, lineHeight: 20 },
  msgMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  time: { fontSize: 11, color: 'rgba(0,0,0,0.45)' },
  seenIndicator: { marginLeft: 2 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.s,
    padding: 8,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.s,
  },
  editBtnText: { color: COLORS.white, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  menu: { marginTop: 4, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)', paddingTop: 4 },
  menuItem: { paddingVertical: 6 },
  menuItemText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  typingBar: {
    paddingHorizontal: SPACING.m,
    paddingVertical: 6,
    backgroundColor: COLORS.backgroundLight,
  },
  typingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(0,0,0,0.5)',
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    backgroundColor: COLORS.surfaceMuted,
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    minHeight: 26,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.textTertiary,
    opacity: 0.9,
  },
});

const chatSkeletonStyles = StyleSheet.create({
  list: {
    flex: 1,
    padding: SPACING.m,
    paddingBottom: SPACING.l,
    backgroundColor: COLORS.backgroundLight,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginRight: 8,
  },
  avatarSpacer: { width: 32, marginLeft: 8 },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 18,
    borderTopLeftRadius: 18,
  },
  bubbleThem: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
    borderTopRightRadius: 18,
  },
  line: { backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 4, height: 10 },
  lineShort: { width: 120, marginBottom: 6 },
  lineLong: { width: 180 },
});
