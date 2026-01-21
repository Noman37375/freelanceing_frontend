import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AdminLayout() {
    const { user, isLoading } = useAuth();

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
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#111',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                contentStyle: {
                    backgroundColor: '#000',
                },
            }}
        >
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="manage-freelancers" options={{ title: 'Manage Freelancers' }} />
            <Stack.Screen name="manage-clients" options={{ title: 'Manage Clients' }} />
            <Stack.Screen name="manage-projects" options={{ title: 'Manage Projects' }} />
        </Stack>
    );
}
