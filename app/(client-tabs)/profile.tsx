import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { User, LogOut, Settings, Wallet, FileText, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS } from '@/utils/constants';

export default function ClientProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User size={40} color={COLORS.primary} strokeWidth={2} />
        </View>
        <Text style={styles.userName}>{user?.userName || 'Client'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/client/Wallet' as any)}
        >
          <View style={[styles.menuIcon, { backgroundColor: COLORS.gray100 }]}>
            <Wallet size={20} color={COLORS.primary} strokeWidth={2} />
          </View>
          <Text style={styles.menuText}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/client/Disputes' as any)}
        >
          <View style={[styles.menuIcon, { backgroundColor: COLORS.errorLight }]}>
            <AlertCircle size={20} color={COLORS.error} strokeWidth={2} />
          </View>
          <Text style={styles.menuText}>Disputes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/change-password' as any)}
        >
          <View style={[styles.menuIcon, { backgroundColor: COLORS.gray100 }]}>
            <Settings size={20} color={COLORS.gray500} strokeWidth={2} />
          </View>
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={COLORS.error} strokeWidth={2} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray100 },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: { fontSize: 24, fontWeight: '700', color: COLORS.gray800, marginBottom: 4 },
  userEmail: { fontSize: 14, color: COLORS.gray500 },
  menuSection: { paddingHorizontal: 20, marginBottom: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: { fontSize: 16, fontWeight: '600', color: COLORS.gray800, flex: 1 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.errorLight,
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: COLORS.error },
});
