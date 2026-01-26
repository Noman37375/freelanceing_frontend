import { Slot, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { useEffect } from 'react';

// A separate component for the Loading Screen to keep RootNavigation clean
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.indicatorWrapper}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    </View>
  );
}

function RootNavigation() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/login', '/signup', '/forgot-password', '/verify-email', '/change-password'];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    if (!isLoading && !user && !isPublicRoute) {
      router.replace('/login');
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading && !isPublicRoute && !user) {
    return <LoadingScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <WalletProvider>
        {/* We use 'dark' or 'auto' based on your app theme preference */}
        <StatusBar style="dark" />
        <RootNavigation />
      </WalletProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Modern light-gray background (Tailwind gray-50)
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorWrapper: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    // Modern soft shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});