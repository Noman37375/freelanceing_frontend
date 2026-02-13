import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  ScrollView,
  Platform,
  StatusBar,
  Pressable,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Briefcase,
  Camera,
  ChevronLeft,
  LogOut,
  Star,
  Award,
  Clock,
  Send,
  User,
  ShieldCheck,
  HelpCircle,
  MessageCircle,
  UserPlus,
  ChevronRight,
  Wallet as WalletIcon,
  Bell,
  Settings,
  X,
  Plus,
  Edit,
  AlertTriangle,
  Diamond,
  Heart,
  Inbox,
  History as HistoryIcon,
  Zap,
  TrendingUp,
  Target,
  CheckCircle2,
  Sparkles,
  BarChart3,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "@/contexts/AuthContext";
import SkillTag from "@/components/SkillTag";
import SectionCard from "@/components/SectionCard";
import { useWallet } from "@/contexts/WalletContext";
import { notificationService } from "@/services/notificationService";

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading, updateProfile, refreshUser } = useAuth();
  const { balance } = useWallet();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [editedUserName, setEditedUserName] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedHourlyRate, setEditedHourlyRate] = useState("");
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Initialize form when modal opens
  useEffect(() => {
    if (editModalVisible && user) {
      setEditedUserName(user.userName || "");
      setEditedBio(user.bio || "");
      setEditedPhone(user.phone || "");
      setEditedHourlyRate(user.hourlyRate?.toString() || "");
      setEditedSkills(user.skills || []);
    }
  }, [editModalVisible, user]);

  const defaultAvatar = user?.profileImage ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.userName || "User")}&background=444751&color=fff&size=200`;

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as any);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editedSkills.includes(newSkill.trim())) {
      setEditedSkills([...editedSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    setEditedSkills(editedSkills.filter((_, i) => i !== index));
  };

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
        Alert.alert("Success", "Profile photo updated!");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedUserName || editedUserName.trim().length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters long.");
      return;
    }

    setIsSaving(true);
    try {
      const profileData: any = {
        userName: editedUserName.trim(),
        bio: editedBio.trim() || undefined,
        phone: editedPhone.trim() || undefined,
        hourlyRate: editedHourlyRate ? parseFloat(editedHourlyRate) : undefined,
        skills: editedSkills.length > 0 ? editedSkills : undefined,
      };

      await updateProfile(profileData);
      await refreshUser();
      setEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#444751" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F8" />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* REDESIGNED HERO HEADER */}
          <View style={styles.heroSection}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.settingsBtn} onPress={() => setEditModalVisible(true)}>
                <Settings size={22} color="#282A32" strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.notifBtn} onPress={() => setNotifModalVisible(true)}>
                <Bell size={22} color="#282A32" strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <View style={styles.notifDot}>
                    <Text style={styles.notifDotText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Profile Avatar & Info */}
            <View style={styles.profileHero}>
              <View style={styles.avatarSection}>
                <View style={styles.avatarRing}>
                  <Image source={{ uri: defaultAvatar }} style={styles.heroAvatar} />
                  {/* <View style={styles.verifiedBadge}>
                    <CheckCircle2 size={18} color="#FFFFFF" fill="#444751" strokeWidth={3} />
                  </View> */}
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
                <View style={styles.nameRow}>
                  <Text style={styles.heroName}>{user?.userName || "User"}</Text>
                  {/* <View style={styles.levelBadge}>
                    <Sparkles size={12} color="#444751" fill="#444751" strokeWidth={2} />
                    <Text style={styles.levelText}>Level 3</Text>
                  </View> */}
                </View>
                <Text style={styles.heroRole}>{user?.role || "Freelancer"}</Text>
                {user?.bio && <Text style={styles.heroBio}>{user.bio}</Text>}
              </View>
            </View>

            {/* Stats Cards Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Star size={20} color="#444751" fill="#444751" strokeWidth={2} />
                </View>
                <Text style={styles.statValue}>4.9</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <TrendingUp size={20} color="#444751" strokeWidth={2.5} />
                </View>
                <Text style={styles.statValue}>127</Text>
                <Text style={styles.statLabel}>Projects</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Target size={20} color="#444751" strokeWidth={2.5} />
                </View>
                <Text style={styles.statValue}>98%</Text>
                <Text style={styles.statLabel}>Success</Text>
              </View>
            </View>

            {/* Earnings Card */}
            <View style={styles.earningsCard}>
              <View style={styles.earningsLeft}>
                <View style={styles.walletIconBox}>
                  <WalletIcon size={24} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <View>
                  <Text style={styles.earningsLabel}>Total Earnings</Text>
                  <Text style={styles.earningsValue}>${balance.toLocaleString()}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.viewWalletBtn}
                onPress={() => setWalletModalVisible(true)}
              >
                <Text style={styles.viewWalletText}>View</Text>
                <ChevronRight size={18} color="#444751" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.actionIconBox}>
                <Briefcase size={20} color="#444751" strokeWidth={2.5} />
              </View>
              <Text style={styles.actionText}>Briefs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.actionIconBox}>
                <Heart size={20} color="#444751" strokeWidth={2.5} />
              </View>
              <Text style={styles.actionText}>Saved</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.actionIconBox}>
                <BarChart3 size={20} color="#444751" strokeWidth={2.5} />
              </View>
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.actionIconBox}>
                <Send size={20} color="#444751" strokeWidth={2.5} />
              </View>
              <Text style={styles.actionText}>Invite</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Sections */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={() => setEditModalVisible(true)}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <User size={20} color="#444751" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.menuText}>Edit Profile</Text>
                </View>
                <ChevronRight size={20} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={() => setWalletModalVisible(true)}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <WalletIcon size={20} color="#444751" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.menuText}>Wallet & Payments</Text>
                </View>
                <ChevronRight size={20} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={() => setNotifModalVisible(true)}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <Bell size={20} color="#444751" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.menuText}>Notifications</Text>
                  {unreadCount > 0 && (
                    <View style={styles.menuBadge}>
                      <Text style={styles.menuBadgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
                <ChevronRight size={20} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>SUPPORT</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={() => setDisputeModalVisible(true)}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <ShieldCheck size={20} color="#444751" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.menuText}>Resolution Center</Text>
                </View>
                <ChevronRight size={20} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <MessageCircle size={20} color="#444751" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.menuText}>Help Center</Text>
                </View>
                <ChevronRight size={20} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutIconBox}>
              <LogOut size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      {/* EDIT PROFILE MODAL - REDESIGNED */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.backdropPress} onPress={() => setEditModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Edit Profile</Text>
                <Text style={styles.sheetSubtitle}>Update your information</Text>
              </View>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.inputField}
                  value={editedUserName}
                  onChangeText={setEditedUserName}
                  placeholder="Enter username"
                  placeholderTextColor="#C2C2C8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Professional Bio</Text>
                <TextInput
                  style={[styles.inputField, styles.textArea]}
                  value={editedBio}
                  onChangeText={setEditedBio}
                  multiline
                  numberOfLines={4}
                  placeholder="Tell clients about yourself..."
                  placeholderTextColor="#C2C2C8"
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hourly Rate (USD)</Text>
                <TextInput
                  style={styles.inputField}
                  value={editedHourlyRate}
                  onChangeText={setEditedHourlyRate}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#C2C2C8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Skills</Text>
                <View style={styles.skillInputRow}>
                  <TextInput
                    style={[styles.inputField, { flex: 1, marginBottom: 0 }]}
                    value={newSkill}
                    onChangeText={setNewSkill}
                    placeholder="e.g. React Native"
                    placeholderTextColor="#C2C2C8"
                  />
                  <TouchableOpacity onPress={handleAddSkill} style={styles.addSkillBtn}>
                    <Plus size={22} color="#FFFFFF" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                <View style={styles.skillsWrap}>
                  {editedSkills.map((s, i) => (
                    <SkillTag
                      key={i}
                      skill={s}
                      editable
                      onRemove={() => handleRemoveSkill(i)}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <CheckCircle2 size={20} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* WALLET MODAL - REDESIGNED */}
      <Modal
        visible={walletModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWalletModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.backdropPress} onPress={() => setWalletModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Wallet</Text>
              <TouchableOpacity onPress={() => setWalletModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.walletHero}>
              <View style={styles.walletIconCircle}>
                <WalletIcon size={32} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.walletLabel}>Available Balance</Text>
              <Text style={styles.walletAmount}>${balance.toLocaleString()}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => {
                  setWalletModalVisible(false);
                  router.push('../wallet' as any);
                }}
              >
                <HistoryIcon size={20} color="#444751" strokeWidth={2.5} />
                <Text style={styles.primaryActionText}>History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => {
                  setWalletModalVisible(false);
                  router.push('../wallet' as any);
                }}
              >
                <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.secondaryActionText}>Add Funds</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </View>
        </View>
      </Modal>

      {/* NOTIFICATIONS MODAL - REDESIGNED */}
      <Modal
        visible={notifModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.backdropPress} onPress={() => setNotifModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {isNotifLoading && notifications.length === 0 ? (
              <ActivityIndicator style={{ marginVertical: 30 }} color="#444751" />
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.notifItem}>
                    <View style={[styles.notifIndicator, !item.isRead && styles.notifIndicatorActive]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      <Text style={styles.notifMessage} numberOfLines={1}>{item.message}</Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Bell size={56} color="#E5E4EA" strokeWidth={1.5} />
                    <Text style={styles.emptyTitle}>No Notifications</Text>
                    <Text style={styles.emptySubtitle}>We'll notify you when something arrives</Text>
                  </View>
                }
                style={{ maxHeight: 300 }}
              />
            )}

            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => {
                setNotifModalVisible(false);
                router.push('../notifications' as any);
              }}
            >
              <Text style={styles.viewAllText}>View All Notifications</Text>
              <ChevronRight size={18} color="#444751" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </View>
        </View>
      </Modal>

      {/* DISPUTE MODAL - REDESIGNED */}
      <Modal
        visible={disputeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDisputeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.backdropPress} onPress={() => setDisputeModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Resolution Center</Text>
              <TouchableOpacity onPress={() => setDisputeModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#C2C2C8" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.alertCard}>
              <View style={styles.alertIconBox}>
                <ShieldCheck size={28} color="#444751" strokeWidth={2.5} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Need Help?</Text>
                <Text style={styles.alertSubtitle}>Open a dispute or view your cases</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => {
                  setDisputeModalVisible(false);
                  router.push('../FDisputes' as any);
                }}
              >
                <HistoryIcon size={20} color="#444751" strokeWidth={2.5} />
                <Text style={styles.primaryActionText}>My Cases</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => {
                  setDisputeModalVisible(false);
                  router.push('../CreateDispute' as any);
                }}
              >
                <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.secondaryActionText}>New Case</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F4F4F8',
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // ========== HERO SECTION ==========
  heroSection: {
    backgroundColor: "#FFFFFF",
    paddingTop: 14,
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 20,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#444751',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notifDotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  profileHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarRing: {
    position: 'relative',
    padding: 4,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: '#E5E4EA',
    backgroundColor: '#FFFFFF',
  },
  heroAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 2,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#444751',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  heroInfo: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#282A32',
    letterSpacing: -0.5,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E5E4EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444751',
    letterSpacing: 0.3,
  },
  heroRole: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C2C2C8',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  heroBio: {
    fontSize: 15,
    fontWeight: '500',
    color: '#C2C2C8',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 30,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F4F4F8',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C2C2C8',
    letterSpacing: 0.2,
  },

  earningsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#444751',
    borderRadius: 18,
    padding: 18,
  },
  earningsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  walletIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C2C2C8',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  earningsValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  viewWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  viewWalletText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444751',
    letterSpacing: 0.2,
  },

  // ========== QUICK ACTIONS ==========
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E4EA',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#282A32',
    letterSpacing: 0.2,
  },

  // ========== MENU SECTIONS ==========
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C2C2C8',
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E4EA',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#282A32',
    letterSpacing: -0.2,
  },
  menuBadge: {
    backgroundColor: '#444751',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E4EA',
    marginHorizontal: 16,
  },

  // ========== LOGOUT BUTTON ==========
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#444751',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 6,
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

  // ========== MODALS ==========
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(40, 42, 50, 0.85)',
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 24,
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#E5E4EA',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 4,
    letterSpacing: -0.6,
  },
  sheetSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C2C2C8',
    letterSpacing: 0.1,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScroll: {
    flex: 1,
  },

  // ========== INPUTS ==========
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444751',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputField: {
    backgroundColor: '#F4F4F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#282A32',
    borderWidth: 2,
    borderColor: '#E5E4EA',
  },
  textArea: {
    height: 110,
    paddingTop: 14,
  },
  skillInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  addSkillBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#444751',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // ========== BUTTONS ==========
  saveButton: {
    backgroundColor: '#444751',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ========== WALLET MODAL ==========
  walletHero: {
    backgroundColor: '#444751',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  walletIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  walletLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C2C2C8',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  walletAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F4F4F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#E5E4EA',
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444751',
    letterSpacing: 0.2,
  },
  secondaryActionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#444751',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // ========== NOTIFICATIONS ==========
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E4EA',
  },
  notifIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    marginRight: 14,
  },
  notifIndicatorActive: {
    backgroundColor: '#444751',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#282A32',
    marginBottom: 3,
  },
  notifMessage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#C2C2C8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#282A32',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C2C2C8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  viewAllBtn: {
    backgroundColor: '#F4F4F8',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#E5E4EA',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444751',
    letterSpacing: 0.2,
  },

  // ========== ALERT CARD ==========
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F8',
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E4EA',
  },
  alertIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#282A32',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#C2C2C8',
  },
});