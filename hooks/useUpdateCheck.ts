import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pakfreelance/last_build_id';
const CHECK_INTERVAL_MS = 30 * 60 * 1000; // check every 30 minutes

// Set EXPO_PUBLIC_FRONTEND_URL in your Vercel environment variables
// e.g. https://your-frontend-app.vercel.app
const FRONTEND_URL = process.env.EXPO_PUBLIC_FRONTEND_URL || '';

export function useUpdateCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!FRONTEND_URL) return; // silently skip if URL not configured

    checkForUpdate();
    const interval = setInterval(checkForUpdate, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function checkForUpdate() {
    try {
      const res = await fetch(
        `${FRONTEND_URL}/version.json?t=${Date.now()}`, // cache-bust
        { cache: 'no-store' }
      );
      if (!res.ok) return;

      const { buildId } = await res.json();
      if (!buildId) return;

      if (Platform.OS === 'web') {
        // On web: compare against the buildId embedded at build time
        const embeddedBuildId = process.env.EXPO_PUBLIC_BUILD_ID;
        if (embeddedBuildId && buildId !== embeddedBuildId) {
          setUpdateAvailable(true);
        }
      } else {
        // On native: compare against the last buildId we saw in AsyncStorage
        const lastBuildId = await AsyncStorage.getItem(STORAGE_KEY);

        if (lastBuildId === null) {
          // First launch — just store current buildId, no banner
          await AsyncStorage.setItem(STORAGE_KEY, buildId);
        } else if (lastBuildId !== buildId) {
          // BuildId changed since last launch → update available
          setUpdateAvailable(true);
        }
      }
    } catch {
      // Network error — silently ignore, don't disrupt the app
    }
  }

  async function dismissUpdate() {
    try {
      // Store the latest buildId so we don't show the banner again
      // until the NEXT deployment
      const res = await fetch(`${FRONTEND_URL}/version.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const { buildId } = await res.json();
        if (buildId) await AsyncStorage.setItem(STORAGE_KEY, buildId);
      }
    } catch {}
    setUpdateAvailable(false);
  }

  return { updateAvailable, dismissUpdate };
}
