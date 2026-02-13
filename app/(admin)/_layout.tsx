import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View, useWindowDimensions } from 'react-native';
import AdminBottomBar from '@/components/admin/AdminBottomBar';

const MOBILE_BREAKPOINT = 768;

export default function AdminLayout() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isMobile = width <= MOBILE_BREAKPOINT;

    const handleLogout = async () => {
        await logout();
        router.replace('/login' as any);
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="large" color="#A855F7" />
            </View>
        );
    }

    if (!user || user.role !== 'Admin') {
        return <Redirect href="/login" />;
    }

    return (
        <View style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#ffffff',
                    },
                    headerTintColor: '#222325',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerShadowVisible: false,
                    contentStyle: {
                        backgroundColor: '#f7f7f7',
                    },
                }}
            >
                <Stack.Screen name="dashboard" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="manage-freelancers" options={{ headerShown: false }} />
                <Stack.Screen name="manage-clients" options={{ headerShown: false }} />
                <Stack.Screen name="manage-projects" options={{ headerShown: false }} />
                <Stack.Screen name="manage-services" options={{ headerShown: false }} />
                <Stack.Screen name="manage-notifications" options={{ headerShown: false }} />
                <Stack.Screen name="manage-disputes" options={{ headerShown: false }} />
            </Stack>
            {isMobile && <AdminBottomBar onLogout={handleLogout} />}
        </View>
    );
}
