import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';
const TOKEN_STORAGE_KEY = '@pakfreelance/push_token';

// Show notifications even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const { user, token: authToken } = useAuth();

  useEffect(() => {
    // Push notifications only work on native (not web)
    if (!user || Platform.OS === 'web') return;
    registerAndSaveToken();
  }, [user?.id]);

  async function registerAndSaveToken() {
    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Push] Permission not granted');
      return;
    }

    // Get the device FCM token
    let pushToken: string;
    try {
      const result = await Notifications.getDevicePushTokenAsync();
      pushToken = result.data;
    } catch (e) {
      console.warn('[Push] Could not get device push token:', e);
      return;
    }

    // Only save to backend if token changed
    const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken === pushToken) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/notifications/push-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ pushToken }),
      });

      if (res.ok) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, pushToken);
        console.log('[Push] Token saved to backend');
      }
    } catch (e) {
      console.warn('[Push] Failed to save push token:', e);
    }
  }
}
