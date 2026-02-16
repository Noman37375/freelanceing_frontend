import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { LogOut, Wallet, AlertCircle, ChevronRight, Settings, Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClientProfile() {
  const router = useRouter();
  const { user, logout, updateProfile, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const avatarUri = user?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.userName || 'Client')}&background=444751&color=fff&size=200`;

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setIsSaving(true);
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await updateProfile({ profileImage: base64Img } as any);
        await refreshUser();
        Alert.alert('Success', 'Profile photo updated!');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F8" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section - aligned with Freelancer profile */}
          <View style={styles.heroSection}>
            <View style={styles.profileHero}>
              <View style={styles.avatarSection}>
                <View style={styles.avatarRing}>
                  <Image source={{ uri: avatarUri }} style={styles.heroAvatar} />
                </View>
                <TouchableOpacity
                  style={styles.editAvatarBtn}
                  onPress={handlePickImage}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Camera size={16} color="#FFFFFF" strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.heroName}>{user?.userName || 'Client'}</Text>
                <Text style={styles.heroRole}>Client</Text>
                {/* <Text style={styles.heroEmail} numberOfLines={1}>{user?.email}</Text> */}
              </View>
            </View>
          </View>

          {/* Menu Section - same card layout as Freelancer */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/client/Wallet' as any)}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <Wallet size={20} color="#444751" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.menuText}>Wallet & Payments</Text>
                </View>
                <ChevronRight size={20} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/client/Disputes' as any)}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <AlertCircle size={20} color="#444751" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.menuText}>Disputes / Resolution Center</Text>
                </View>
                <ChevronRight size={20} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Support section - fills bottom alignment */}
          {/* <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>SUPPORT</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/change-password' as any)}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <Settings size={20} color="#444751" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.menuText}>Change Password</Text>
                </View>
                <ChevronRight size={20} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View> */}

          {/* Spacer so logout sits above tab bar with consistent gap */}
          {/* <View style={styles.bottomSpacer} /> */}

          {/* Logout Button - same style as Freelancer */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutIconBox}>
              <LogOut size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F8',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  bottomSpacer: {
    minHeight: 16,
    flexGrow: 1,
  },

  // ========== HERO SECTION (matches Freelancer) ==========
  heroSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  profileHero: {
    alignItems: 'center',
    marginBottom: 0,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarRing: {
    position: 'relative',
    padding: 3,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#E5E4EA',
    backgroundColor: '#FFFFFF',
  },
  heroAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#444751',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroInfo: {
    alignItems: 'center',
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#282A32',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C2C2C8',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  heroEmail: {
    fontSize: 13,
    fontWeight: '500',
    color: '#C2C2C8',
  },

  // ========== MENU SECTION (matches Freelancer) ==========
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2C2C8',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E4EA',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#282A32',
    letterSpacing: -0.2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E4EA',
    marginHorizontal: 16,
  },

  // ========== LOGOUT BUTTON (matches Freelancer) ==========
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#444751',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  logoutIconBox: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
