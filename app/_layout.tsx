import { Slot, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { useEffect } from 'react';

function RootNavigation() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // current path

  useEffect(() => {
    // Allow access to auth pages without login
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/verify-email', '/change-password'];
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
    
    if (!isLoading && !user && !isPublicRoute) {
      router.replace('/login'); // redirect only if not already on login/signup
    }
  }, [isLoading, user, pathname, router]);

  // Show loading only if we're checking auth and not on a public route
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/verify-email', '/change-password'];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
  
  if (isLoading && !isPublicRoute && !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <Slot />; // user logged in or on public route
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
