import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Bell,
  Check,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Circle,
  AlertTriangle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { notificationService, Notification } from "@/services/notificationService";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";

// Returns the route to push based on notification type + user role
function getNavigationTarget(notification: Notification, role?: string): { pathname: string; params?: Record<string, string> } | null {
  const { type, relatedId } = notification;

  if (!relatedId) return null;

  const isDispute = type.startsWith('dispute_');
  if (isDispute) {
    // resolution-center works for both Client and Freelancer
    // Admin should go to the admin dispute detail
    if (role === 'Admin') {
      return { pathname: '/(admin)/dispute-detail/[id]', params: { id: relatedId } };
    }
    return { pathname: '/resolution-center', params: { disputeId: relatedId } };
  }

  if (type.startsWith('project_') || type.startsWith('proposal_') || type.startsWith('bid_')) {
    return { pathname: '/project-details', params: { id: relatedId } };
  }

  if (type.startsWith('payment_') || type.startsWith('milestone_')) {
    return { pathname: '/wallet', params: {} };
  }

  return null;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { clearUnreadCount } = useNotifications();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Clear badge as soon as screen opens
    clearUnreadCount();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      clearUnreadCount();
    } catch (error: any) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIcon = (type: string) => {
    if (type.startsWith('dispute_')) {
      return <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}><AlertTriangle size={20} color="#1D4ED8" /></View>;
    }
    if (type.toLowerCase().includes('payment') || type.toLowerCase().includes('milestone')) {
      return <View style={[styles.iconBox, { backgroundColor: "#ECFDF5" }]}><CreditCard size={20} color="#10B981" /></View>;
    }
    if (type.toLowerCase().includes('project') || type.toLowerCase().includes('proposal')) {
      return <View style={[styles.iconBox, { backgroundColor: "#E5E4EA" }]}><Briefcase size={20} color="#444751" /></View>;
    }
    if (type.toLowerCase().includes('security') || type.toLowerCase().includes('login')) {
      return <View style={[styles.iconBox, { backgroundColor: "#FEF2F2" }]}><ShieldCheck size={20} color="#EF4444" /></View>;
    }
    return <View style={[styles.iconBox, { backgroundColor: "#F1F5F9" }]}><Bell size={20} color="#64748B" /></View>;
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read (fire-and-forget — don't block navigation on this)
    if (!notification.isRead) {
      notificationService.markAsRead(notification.id).catch(() => {});
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    }

    // Navigate immediately — never block on the network call above
    const target = getNavigationTarget(notification, user?.role);
    if (target) {
      router.push(target as any);
    }
  };

  const markOneRead = async (id: string) => {
    notificationService.markAsRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isNavigable = !!getNavigationTarget(item, user?.role);
    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        {getIcon(item.type)}
        <View style={styles.textDetails}>
          <View style={styles.titleRow}>
            <Text style={[styles.notifTitle, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
              {item.title}
            </Text>
            {/* Unread dot OR per-notification complete button */}
            {!item.isRead ? (
              <TouchableOpacity
                style={styles.markDoneBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={(e) => {
                  e.stopPropagation();
                  markOneRead(item.id);
                }}
              >
                <Check size={13} color="#444751" strokeWidth={2.5} />
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
          <View style={styles.notifFooter}>
            <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
            {isNavigable && (
              <Text style={styles.notifTapHint}>Tap to view →</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#282A32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Check size={22} color="#444751" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#444751" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchNotifications}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Bell size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>All caught up!</Text>
            </View>
          }
        />
      )}
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
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#282A32" },

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
    color: "#282A32",
  },
  notifMessage: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 6,
  },
  notifFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  notifTime: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  notifTapHint: {
    fontSize: 11,
    color: "#444751",
    fontWeight: "700",
  },
  markDoneBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});