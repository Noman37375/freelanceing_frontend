import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // wait until auth state loads

  if (!user) return <Redirect href={"/welcome" as any} />; // not logged in → welcome then login

  // Redirect based on user role
  if (user.role === 'Admin') {
    return <Redirect href={"/(admin)/dashboard" as any} />; // Admin → admin dashboard
  } else if (user.role === 'Client') {
    return <Redirect href={"/(client-tabs)" as any} />; // Client → client tabs
  }

  return <Redirect href={"/(tabs)" as any} />; // Freelancer → tabs
}
