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
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/authService";
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
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.userName || "User")}&background=4F46E5&color=fff&size=200`;

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
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        setIsSaving(true);
        const { uri } = result.assets[0];
        const type = result.assets[0].mimeType || 'image/jpeg';
        const name = uri.split('/').pop() || 'avatar.jpg';
        await authService.uploadProfileImage({ uri, type, name });
        await refreshUser();
        Alert.alert("Success", "Profile photo updated!");
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", error?.message || "Failed to upload image. Please try again.");
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
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topGradient} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Premium Profile Header - Cleaned */}
          <View style={styles.heroHeader}>
            {/* Centralized Identity Section */}
            <View style={styles.profileIdentity}>
              <View style={styles.premiumAvatarContainer}>
                <View style={styles.avatarBorder}>
                  <Image source={{ uri: defaultAvatar }} style={styles.premiumAvatar} key={user?.profileImage || 'avatar'} />
                </View>
                <TouchableOpacity style={styles.premiumCameraBtn} onPress={handlePickImage} disabled={isSaving}>
                  <Camera size={14} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.identityTextContainer}>
                <View style={styles.nameProRow}>
                  <Text style={styles.premiumNameText}>{user?.userName || "User"}</Text>
                  <View style={styles.proPill}>
                    <Zap size={10} color="#FFF" fill="#FFF" />
                    <Text style={styles.proPillText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.roleTagline}>{user?.role || "Premium Freelancer"}</Text>
              </View>
            </View>

            {/* Trust Stats Bar */}
            <View style={styles.trustStatsBar}>
              <View style={styles.trustStat}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.trustVal}>4.9</Text>
                <Text style={styles.trustLab}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.trustStat}>
                <Award size={14} color="#10B981" />
                <Text style={styles.trustVal}>98%</Text>
                <Text style={styles.trustLab}>Success</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.trustStat}>
                <Clock size={14} color="#6366F1" />
                <Text style={styles.trustVal}>1h</Text>
                <Text style={styles.trustLab}>Response</Text>
              </View>
            </View>
          </View>
          {/* My Workspace Section */}
          <Text style={styles.sectionTitle}>My Workspace</Text>
          <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#F8FAFC' }]}>
                  <Briefcase size={18} color="#1E293B" />
                </View>
                <Text style={styles.menuItemText}>My briefs</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#F8FAFC' }]}>
                  <Diamond size={18} color="#1E293B" />
                </View>
                <Text style={styles.menuItemText}>Get inspired</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#F8FAFC' }]}>
                  <Heart size={18} color="#1E293B" />
                </View>
                <Text style={styles.menuItemText}>Saved lists</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#F8FAFC' }]}>
                  <Inbox size={18} color="#1E293B" />
                </View>
                <Text style={styles.menuItemText}>My interests</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#F8FAFC' }]}>
                  <Send size={18} color="#1E293B" />
                </View>
                <Text style={styles.menuItemText}>Invite friends</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          {/* Settings Section */}
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => setEditModalVisible(true)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBox}>
                  <User size={18} color="#4F46E5" />
                </View>
                <Text style={styles.menuItemText}>Account</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => setNotifModalVisible(true)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBox}>
                  <Bell size={18} color="#4F46E5" />
                  {unreadCount > 0 && <View style={styles.menuBadge} />}
                </View>
                <Text style={styles.menuItemText}>Notifications</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setWalletModalVisible(true)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBox}>
                  <WalletIcon size={18} color="#4F46E5" />
                </View>
                <Text style={styles.menuItemText}>Wallet</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          {/* Resources Section */}
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.sectionContainer}>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setDisputeModalVisible(true)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBox}>
                  <ShieldCheck size={18} color="#4F46E5" />
                </View>
                <Text style={styles.menuItemText}>Resolution Center</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <View style={styles.logoutIconBox}>
                <LogOut size={18} color="#EF4444" />
              </View>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputBox}>
                <Text style={styles.boxLab}>Username</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedUserName}
                  onChangeText={setEditedUserName}
                  placeholder="Enter username"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.boxLab}>Professional Bio</Text>
                <TextInput
                  style={[styles.textInput, styles.areaInput]}
                  value={editedBio}
                  onChangeText={setEditedBio}
                  multiline
                  placeholder="Tell clients about yourself..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.boxLab}>Hourly Rate ($)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedHourlyRate}
                  onChangeText={setEditedHourlyRate}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.boxLab}>Core Skills</Text>
                <View style={styles.skillEntry}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                    value={newSkill}
                    onChangeText={setNewSkill}
                    placeholder="e.g. React Native"
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity onPress={handleAddSkill} style={styles.plusBtn}>
                    <Plus size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.sheetSkills}>
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
                style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Wallet Drawer */}
      <Modal
        visible={walletModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWalletModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>My Wallet</Text>
              <TouchableOpacity onPress={() => setWalletModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.drawerWalletCard}>
              <Text style={styles.drawerBalanceLabel}>Available Balance</Text>
              <Text style={styles.drawerBalanceValue}>${balance.toLocaleString()}</Text>
            </View>

            <View style={styles.drawerActionRow}>
              <TouchableOpacity
                style={styles.drawerPrimaryBtn}
                onPress={() => {
                  setWalletModalVisible(false);
                  router.push('../wallet' as any);
                }}
              >
                <HistoryIcon size={18} color="#4F46E5" />
                <Text style={styles.drawerPrimaryBtnText}>View History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerSecondaryBtn}
                onPress={() => {
                  setWalletModalVisible(false);
                  router.push('../wallet' as any); // Assuming add funds is on wallet screen
                }}
              >
                <Plus size={18} color="#FFF" />
                <Text style={styles.drawerSecondaryBtnText}>Add Funds</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </View>
        </View>
      </Modal>

      {/* Notifications Drawer */}
      <Modal
        visible={notifModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {isNotifLoading && notifications.length === 0 ? (
              <ActivityIndicator style={{ marginVertical: 30 }} color="#4F46E5" />
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.drawerNotifItem}>
                    <View style={[styles.notifDot, !item.isRead && styles.notifDotActive]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.drawerNotifItemTitle}>{item.title}</Text>
                      <Text style={styles.drawerNotifItemMsg} numberOfLines={1}>{item.message}</Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.drawerNotifPlaceholder}>
                    <Bell size={48} color="#CBD5E1" />
                    <Text style={styles.drawerNotifTitle}>No New Notifications</Text>
                    <Text style={styles.drawerNotifSub}>We'll let you know when something important happens.</Text>
                  </View>
                }
                style={{ maxHeight: 300 }}
              />
            )}

            <TouchableOpacity
              style={styles.drawerFullBtn}
              onPress={() => {
                setNotifModalVisible(false);
                router.push('../notifications' as any);
              }}
            >
              <Text style={styles.drawerFullBtnText}>View All Notifications</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </View>
        </View>
      </Modal>

      {/* Resolution Center Drawer */}
      <Modal
        visible={disputeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDisputeModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Resolution Center</Text>
              <TouchableOpacity onPress={() => setDisputeModalVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.drawerSupportCard}>
              <AlertTriangle size={24} color="#EF4444" />
              <View style={styles.drawerSupportContent}>
                <Text style={styles.drawerSupportTitle}>Need Help?</Text>
                <Text style={styles.drawerSupportSub}>Open a dispute or view your cases</Text>
              </View>
            </View>

            <View style={styles.drawerActionRow}>
              <TouchableOpacity
                style={styles.drawerPrimaryBtn}
                onPress={() => {
                  setDisputeModalVisible(false);
                  router.push('../FDisputes' as any);
                }}
              >
                <HistoryIcon size={18} color="#4F46E5" />
                <Text style={styles.drawerPrimaryBtnText}>My Disputes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerSecondaryBtn}
                onPress={() => {
                  setDisputeModalVisible(false);
                  router.push('../CreateDispute' as any);
                }}
              >
                <Plus size={18} color="#FFF" />
                <Text style={styles.drawerSecondaryBtnText}>New Dispute</Text>
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
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 350,
    backgroundColor: '#1E1B4B',
  },
  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
    alignItems: 'center',
  },
  topActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 10,
  },
  translucentBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#1E1B4B',
  },
  profileIdentity: {
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarBorder: {
    padding: 4,
    borderRadius: 54,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  premiumAvatar: { width: 100, height: 100, borderRadius: 50 },
  premiumCameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1E1B4B',
  },
  onlineBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#1E1B4B',
  },
  identityTextContainer: {
    alignItems: 'center',
  },
  nameProRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumNameText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  proPill: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  proPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  roleTagline: {
    fontSize: 14,
    color: '#C7D2FE',
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  trustStatsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  trustStat: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  trustVal: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  trustLab: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContent: { paddingBottom: 40 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 12,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoutContainer: {
    marginTop: 32,
    marginHorizontal: 15,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },

  logoutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  vText: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 20, marginBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: "flex-start", alignItems: "center", backgroundColor: '#F8FAFC' },

  overlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.7)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
  sheetHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B" },
  inputBox: { marginBottom: 20 },
  boxLab: { fontWeight: "700", marginBottom: 8, color: "#475569", fontSize: 14 },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 15,
    color: "#1E293B"
  },
  areaInput: { height: 100, textAlignVertical: "top" },
  skillEntry: { flexDirection: "row", gap: 10, marginBottom: 12 },
  plusBtn: {
    backgroundColor: "#4F46E5",
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center"
  },
  sheetSkills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  saveBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 6px 15px rgba(79, 70, 229, 0.3)',
      }
    }),
  },
  saveBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16 },

  drawerWalletCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  drawerBalanceLabel: {
    color: '#C7D2FE',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  drawerBalanceValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  drawerActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  drawerPrimaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  drawerPrimaryBtnText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 15,
  },
  drawerSecondaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  drawerSecondaryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  drawerSupportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  drawerSupportContent: {
    marginLeft: 16,
    flex: 1,
  },
  drawerSupportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  drawerSupportSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  drawerNotifPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  drawerNotifTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  drawerNotifSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginTop: 8,
  },
  drawerFullBtn: {
    backgroundColor: '#EEF2FF',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  drawerFullBtnText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 15,
  },
  drawerNotifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    marginRight: 12
  },
  notifDotActive: {
    backgroundColor: '#4F46E5'
  },
  drawerNotifItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B'
  },
  drawerNotifItemMsg: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  menuBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFF'
  },
});
