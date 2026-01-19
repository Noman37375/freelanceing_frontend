import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // wait until auth state loads

  if (!user) return <Redirect href="/login" />; // not logged in → login page

  // Redirect based on user role
  if (user.role === 'Client') {
    return <Redirect href="/(client-tabs)" />; // Client → client tabs
  }

  return <Redirect href="/(tabs)" />; // Freelancer → tabs
}
