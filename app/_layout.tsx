import { StripeProvider } from '@stripe/stripe-react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreenNative from 'expo-splash-screen';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { CallProvider } from '@/contexts/CallContext';
import Toast from 'react-native-toast-message';
import { CallModal } from '@/components/CallModal';
import { UpdateBanner } from '@/components/UpdateBanner';
import { useUpdateCheck } from '@/hooks/useUpdateCheck';
import { usePushNotifications } from '@/hooks/usePushNotifications';
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
  const prevUserRef = useRef<typeof user>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  // After logout (user was logged in, now null) → always go to sign-in, not welcome
  useEffect(() => {
    if (user) {
      prevUserRef.current = user;
    } else if (prevUserRef.current) {
      prevUserRef.current = undefined;
      router.replace('/login');
    }
  }, [user, router]);

  useEffect(() => {
    const publicRoutes = ['/welcome', '/login', '/signup', '/complete-profile', '/forgot-password', '/verify-email', '/change-password'];
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
    if (!isLoading && !user && !isPublicRoute) {
      // From index/root: show welcome first; from any other route: go to login (logout case handled above)
      const isIndex = pathname === '/' || pathname === '';
      router.replace(isIndex ? '/welcome' : '/login');
    }
  }, [isLoading, user, pathname, router]);

  const publicRoutes = ['/welcome', '/login', '/signup', '/complete-profile', '/forgot-password', '/verify-email', '/change-password'];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
  const showSplash = !minTimeElapsed || (isLoading && !isPublicRoute && !user);
  const prevShowSplash = useRef(true);

  // When splash ends and user is not logged in, show welcome first
  // Guard: don't redirect if user is already on a public/auth route (e.g. mid-login)
  useEffect(() => {
    const onAuthRoute = ['/login', '/signup', '/welcome', '/verify-email', '/forgot-password', '/change-password', '/complete-profile']
      .some(r => pathname?.startsWith(r));
    if (prevShowSplash.current && !showSplash && !user && !onAuthRoute) {
      router.replace('/welcome');
    }
    prevShowSplash.current = showSplash;
  }, [showSplash, user, pathname, router]);

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

function UpdateChecker() {
  const { updateAvailable, dismissUpdate } = useUpdateCheck();
  if (!updateAvailable) return null;
  return <UpdateBanner onDismiss={dismissUpdate} />;
}

function PushNotificationSetup() {
  usePushNotifications();
  return null;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''} urlScheme="myapp">
      <AuthProvider>
        <SocketProvider>
          <CallProvider>
            <WalletProvider>
              <NotificationProvider>
                <RootNavigation />
                <CallModal />
                <UpdateChecker />
                <PushNotificationSetup />
                <Toast />
                <StatusBar style="auto" />
              </NotificationProvider>
            </WalletProvider>
          </CallProvider>
        </SocketProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
