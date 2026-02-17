/**
 * ChatScreen - Single conversation view. Used by both freelancer and client when opening a chat from messages list.
 * Params: receiverId, userName (or client name), profileImage (optional). Fetches user profile from backend when image missing.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { ChatRoom, type ActiveUser } from '@/components/ChatRoom';
import { chatService } from '@/services/chatService';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    receiverId?: string;
    userName?: string;
    client?: string;
    conversationId?: string;
    userId?: string;
  }>();
  const { user } = useAuth();

  const receiverId = params.receiverId ?? params.userId ?? '';
  let displayName = params.userName ?? '';
  let initialProfileImage: string | null = null;
  if (params.client) {
    try {
      const client = JSON.parse(params.client as string);
      displayName = client.name ?? client.user_name ?? displayName;
      initialProfileImage = client.profileImage ?? client.avatar ?? null;
    } catch (_) {}
  }

  const [profileImage, setProfileImage] = useState<string | null>(initialProfileImage);
  const [userName, setUserName] = useState(displayName || 'Chat');

  useEffect(() => {
    if (!receiverId) return;
    if (initialProfileImage) {
      setProfileImage(initialProfileImage);
      return;
    }
    let cancelled = false;
    chatService.getUserProfile(receiverId).then((profile) => {
      if (cancelled || !profile) return;
      if (profile.profile_image) setProfileImage(profile.profile_image);
      if (profile.user_name && !displayName) setUserName(profile.user_name);
    });
    return () => { cancelled = true; };
  }, [receiverId, initialProfileImage, displayName]);

  const activeUser: ActiveUser = {
    id: receiverId,
    userName: userName || displayName || 'Chat',
    profileImage: profileImage ?? initialProfileImage,
  };

  const currentUser = user
    ? { id: user.id, userName: user.userName, profileImage: user.profileImage }
    : null;

  if (!receiverId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.placeholderText}>Select a conversation</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ChatRoom
        activeUser={activeUser}
        currentUser={currentUser}
        onBack={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 16, color: '#64748B' },
});
