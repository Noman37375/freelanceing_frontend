import { Slot, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenNative from 'expo-splash-screen';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { useEffect, useRef, useState } from 'react';

// Keep native splash visible until we're ready, then show welcome.jpeg as initial loading
SplashScreenNative.preventAutoHideAsync();

const SPLASH_MIN_MS = 2000;
const { width: SPLASH_W, height: SPLASH_H } = Dimensions.get('window');

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
    const publicRoutes = ['/welcome', '/login', '/signup', '/complete-profile', '/forgot-password', '/verify-email', '/change-password'];
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
    if (!isLoading && !user && !isPublicRoute) {
      // From index/root: show welcome first; from any other route (e.g. after logout): go to login
      const isIndex = pathname === '/' || pathname === '';
      router.replace(isIndex ? '/welcome' : '/login');
    }
  }, [isLoading, user, pathname, router]);

  const publicRoutes = ['/welcome', '/login', '/signup', '/complete-profile', '/forgot-password', '/verify-email', '/change-password'];
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

  // Initial loading: full-screen welcome.jpeg before welcome page
  if (showSplash) {
    return (
      <View style={styles.splashWrap}>
        <StatusBar style="light" />
        <Image
          source={require('../assets/images/welcome.jpeg')}
          style={[styles.splashImage, { width: SPLASH_W, height: SPLASH_H }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  splashWrap: { flex: 1 },
  splashImage: StyleSheet.absoluteFillObject,
});

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <SocketProvider>
        <WalletProvider>
          <RootNavigation />
          <StatusBar style="auto" />
        </WalletProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
