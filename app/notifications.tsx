import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  ArrowLeft,
  Bell,
  Check,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Circle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface Notification {
  id: string;
  type: "payment" | "project" | "security";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const NOTIFICATIONS_DATA: Notification[] = [
  {
    id: "1",
    type: "payment",
    title: "Payment Received",
    message: "Alice Johnson paid $500.00 for 'Landing Page Design'.",
    time: "2m ago",
    isRead: false,
  },
  {
    id: "2",
    type: "project",
    title: "Milestone Approved",
    message: "Your milestone 'Initial Prototype' was approved by Mark Lee.",
    time: "1h ago",
    isRead: false,
  },
  {
    id: "3",
    type: "security",
    title: "New Login Detected",
    message: "A new login was detected from a Chrome browser on Windows.",
    time: "5h ago",
    isRead: true,
  },
  {
    id: "4",
    type: "project",
    title: "New Message",
    message: "Charlie Davis sent you a message regarding the logo assets.",
    time: "Yesterday",
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <View style={[styles.iconBox, { backgroundColor: "#ECFDF5" }]}><CreditCard size={20} color="#10B981" /></View>;
      case "project":
        return <View style={[styles.iconBox, { backgroundColor: "#EEF2FF" }]}><Briefcase size={20} color="#6366F1" /></View>;
      case "security":
        return <View style={[styles.iconBox, { backgroundColor: "#FEF2F2" }]}><ShieldCheck size={20} color="#EF4444" /></View>;
      default:
        return <Bell size={20} color="#64748B" />;
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      activeOpacity={0.7}
    >
      {getIcon(item.type)}
      <View style={styles.textDetails}>
        <View style={styles.titleRow}>
          <Text style={[styles.notifTitle, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
          {!item.isRead && <Circle size={8} color="#6366F1" fill="#6366F1" />}
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Check size={22} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>All caught up!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#1E293B" },
  
  listContainer: { paddingVertical: 10 },
  notificationCard: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
    alignItems: "flex-start",
  },
  unreadCard: {
    backgroundColor: "#F5F7FF", // Very light Indigo tint
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textDetails: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
  unreadTitle: {
    color: "#1E293B",
  },
  notifMessage: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
  },
});