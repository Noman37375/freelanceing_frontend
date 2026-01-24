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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Settings,
  Edit,
  Mail,
  Phone,
  X,
  Plus,
  Briefcase,
  Camera,
  ChevronLeft,
  LogOut,
  Star,
  Award,
  Clock,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "@/contexts/AuthContext";
import SkillTag from "@/components/SkillTag";
import SectionCard from "@/components/SectionCard";

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading, updateProfile, refreshUser } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
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
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topGradient} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.iconCircle} onPress={() => Alert.alert('Settings', 'Coming soon')}>
            <Settings size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: defaultAvatar }} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage} disabled={isSaving}>
                <Camera size={14} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{user?.userName || "User"}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.proBadge}>
                <Award size={12} color="#4F46E5" />
                <Text style={styles.proText}>PRO</Text>
              </View>
              <Text style={styles.userRole}>• {user?.role || "Freelancer"}</Text>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setEditModalVisible(true)}
            >
              <Edit size={14} color="#4F46E5" />
              <Text style={styles.editBtnText}>Edit Portfolio</Text>
            </TouchableOpacity>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>4.9/5</Text>
                <Text style={styles.statLab}>Rating</Text>
              </View>
              <View style={styles.divV} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>${user?.hourlyRate || '0'}</Text>
                <Text style={styles.statLab}>Rate/hr</Text>
              </View>
              <View style={styles.divV} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>24</Text>
                <Text style={styles.statLab}>Done</Text>
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={styles.sectionsContainer}>
            <SectionCard title="Expertise & Skills">
              <View style={styles.skillsList}>
                {(user?.skills && user.skills.length > 0) ? (
                  user.skills.map((s, i) => (
                    <SkillTag key={i} skill={s} />
                  ))
                ) : (
                  <Text style={styles.emptyVal}>No skills listed yet.</Text>
                )}
              </View>
            </SectionCard>

            <SectionCard title="Professional Bio">
              <Text style={user?.bio ? styles.bioDesc : styles.emptyVal}>
                {user?.bio || "Describe your professional background and top achievements here."}
              </Text>
            </SectionCard>

            <SectionCard title="Basic Information">
              <View style={styles.infoRow}>
                <View style={styles.infoIconBg}>
                  <Mail size={18} color="#4F46E5" />
                </View>
                <View>
                  <Text style={styles.infoLab}>Email Address</Text>
                  <Text style={styles.infoVal}>{user?.email}</Text>
                </View>
              </View>
              <View style={[styles.infoRow, { marginTop: 16 }]}>
                <View style={styles.infoIconBg}>
                  <Phone size={18} color="#4F46E5" />
                </View>
                <View>
                  <Text style={styles.infoLab}>Phone Number</Text>
                  <Text style={styles.infoVal}>{user?.phone || "Not provided"}</Text>
                </View>
              </View>
            </SectionCard>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Log Out Account</Text>
            </TouchableOpacity>

            <Text style={styles.vText}>Version 1.2.4 • Made with Pride</Text>
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
    height: 180,
    backgroundColor: '#1E1B4B',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: "center",
    alignItems: "center"
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  avatarWrapper: { position: 'relative', marginBottom: 20 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#F1F5F9' },
  cameraBtn: {
    position: 'absolute',
    bottom: 4,
    right: 0,
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userName: { fontSize: 24, fontWeight: "800", color: "#1E293B", marginBottom: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  proText: { color: '#4F46E5', fontSize: 10, fontWeight: '900' },
  userRole: { fontSize: 13, color: "#64748B", fontWeight: "600", textTransform: 'uppercase', letterSpacing: 1 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editBtnText: { color: "#4F46E5", fontWeight: "700", fontSize: 14 },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 24,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    justifyContent: 'space-around'
  },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  statLab: { fontSize: 12, color: "#94A3B8", marginTop: 4, fontWeight: '600' },
  divV: { width: 1, height: '60%', backgroundColor: '#E2E8F0', alignSelf: 'center' },
  sectionsContainer: { gap: 16 },
  bioDesc: { fontSize: 15, color: "#475569", lineHeight: 24 },
  emptyVal: { fontSize: 14, color: "#94A3B8", fontStyle: "italic" },
  skillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  infoIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  infoLab: { fontSize: 12, color: "#94A3B8", marginBottom: 2, fontWeight: '600' },
  infoVal: { fontSize: 15, color: "#1E293B", fontWeight: "700" },
  logoutBtn: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  logoutText: { color: '#EF4444', fontWeight: "700", fontSize: 15 },
  vText: { textAlign: 'center', color: '#CBD5E1', fontSize: 12, marginTop: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

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
  saveBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16 }
});
