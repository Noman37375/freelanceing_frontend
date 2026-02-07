import { Slot, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenNative from 'expo-splash-screen';
import { View } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { useEffect, useRef, useState } from 'react';
import SplashScreen from '@/components/SplashScreen';

// Keep native splash visible until we're ready, then hide so custom splash shows
SplashScreenNative.preventAutoHideAsync();

const SPLASH_MIN_MS = 2000;

function RootNavigation() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const publicRoutes = ['/welcome', '/login', '/signup', '/forgot-password', '/verify-email', '/change-password'];
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
    if (!isLoading && !user && !isPublicRoute) {
      router.replace('/welcome');
    }
  }, [isLoading, user, pathname, router]);

  const publicRoutes = ['/welcome', '/login', '/signup', '/forgot-password', '/verify-email', '/change-password'];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
  const showSplash = !minTimeElapsed || (isLoading && !isPublicRoute && !user);
  const prevShowSplash = useRef(true);

  // When splash ends and user is not logged in, always show welcome first (so restored /login doesn't skip it)
  useEffect(() => {
    if (prevShowSplash.current && !showSplash && !user) {
      router.replace('/welcome');
    }
    prevShowSplash.current = showSplash;
  }, [showSplash, user, router]);

  useEffect(() => {
    if (showSplash) {
      SplashScreenNative.hideAsync().catch(() => {});
    }
  }, [showSplash]);

  if (showSplash) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        <SplashScreen />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <WalletProvider>
        <RootNavigation />
        <StatusBar style="auto" />
      </WalletProvider>
    </AuthProvider>
  );
}
