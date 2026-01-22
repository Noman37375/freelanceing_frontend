import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Settings,
  Edit,
  Star,
  CheckCircle2,
  Mail,
  Phone,
  DollarSign,
  X,
  Plus,
  Save,
  Briefcase,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Camera
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Default avatar logic
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

        // Update profile with new image
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
      {/* Background Decor */}
      <View style={styles.topBackground} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => Alert.alert('Settings', 'Settings screen coming soon!')}
          >
            <Settings size={22} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: defaultAvatar }} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Camera size={14} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.userName || "User"}</Text>
              <Text style={styles.userRole}>{user?.role || "Freelancer"}</Text>

              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => setEditModalVisible(true)}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
                <Edit size={14} color="#4F46E5" />
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.9<Text style={styles.statSub}>/5</Text></Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>${user?.hourlyRate || '0'}</Text>
                <Text style={styles.statLabel}>Hourly</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Projects</Text>
              </View>
            </View>
          </View>

          {/* Details Sections */}
          <View style={styles.detailsContainer}>
            {user?.bio ? (
              <SectionCard title="About Me">
                <Text style={styles.bioText}>{user.bio}</Text>
              </SectionCard>
            ) : (
              <SectionCard title="About Me">
                <Text style={styles.placeholderText}>No bio added yet. Click edit to add a bio.</Text>
              </SectionCard>
            )}

            <SectionCard title="Skills & Expertise">
              {user?.skills && user.skills.length > 0 ? (
                <View style={styles.skillsContainer}>
                  {user.skills.map((skill, index) => (
                    <SkillTag key={index} skill={skill} />
                  ))}
                </View>
              ) : (
                <Text style={styles.placeholderText}>No skills added yet.</Text>
              )}
            </SectionCard>

            <SectionCard title="Contact Info">
              <View style={styles.contactItem}>
                <View style={styles.contactIcon}>
                  <Mail size={18} color="#4F46E5" />
                </View>
                <View>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>{user?.email}</Text>
                </View>
              </View>

              {user?.phone && (
                <View style={[styles.contactItem, { marginTop: 16 }]}>
                  <View style={styles.contactIcon}>
                    <Phone size={18} color="#4F46E5" />
                  </View>
                  <View>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>{user.phone}</Text>
                  </View>
                </View>
              )}
            </SectionCard>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Version 1.0.0 • Oct 2023</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedUserName}
                  onChangeText={setEditedUserName}
                  placeholder="Your Name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editedBio}
                  onChangeText={setEditedBio}
                  multiline
                  numberOfLines={4}
                  placeholder="Tell us about your experience..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hourly Rate ($)</Text>
                <TextInput
                  style={styles.input}
                  value={editedHourlyRate}
                  onChangeText={setEditedHourlyRate}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Skills</Text>
                <View style={styles.addSkillRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    value={newSkill}
                    onChangeText={setNewSkill}
                    placeholder="Add a new skill"
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity onPress={handleAddSkill} style={styles.addSkillButton}>
                    <Plus size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalSkillsList}>
                  {editedSkills.map((skill, index) => (
                    <SkillTag
                      key={index}
                      skill={skill}
                      editable
                      onRemove={() => handleRemoveSkill(index)}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: '#EEF2FF', // Very light indigo
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#1E293B" },
  settingsButton: { padding: 4 },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#F8FAFC'
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: { alignItems: 'center', marginBottom: 24 },
  userName: { fontSize: 22, fontWeight: "800", color: "#1E293B", marginBottom: 4 },
  userRole: { fontSize: 14, color: "#64748B", fontWeight: "600", marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  editProfileText: { color: "#4F46E5", fontWeight: "700", fontSize: 13 },

  statsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  statSub: { fontSize: 12, color: "#94A3B8", fontWeight: "600" },
  statLabel: { fontSize: 12, color: "#64748B", marginTop: 4 },
  verticalDivider: { width: 1, height: '80%', backgroundColor: '#E2E8F0' },

  detailsContainer: { gap: 8 },
  bioText: { fontSize: 15, color: "#475569", lineHeight: 24 },
  placeholderText: { fontSize: 14, color: "#94A3B8", fontStyle: "italic" },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: { fontSize: 12, color: "#64748B", marginBottom: 2 },
  contactValue: { fontSize: 15, color: "#1E293B", fontWeight: "600" },

  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutButtonText: { color: '#EF4444', fontWeight: "700", fontSize: 16 },

  versionText: {
    textAlign: 'center',
    color: '#CBD5E1',
    fontSize: 12,
    marginBottom: 20,
  },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.9)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '90%'
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  modalTitle: { fontSize: 24, fontWeight: "800", color: "#1E293B" },
  closeButton: { padding: 4 },
  modalBody: { flexGrow: 1 },

  inputGroup: { marginBottom: 20 },
  inputLabel: { fontWeight: "700", marginBottom: 8, color: "#334155", fontSize: 14 },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
    color: "#1E293B"
  },
  textArea: { height: 120, textAlignVertical: "top" },
  addSkillRow: { flexDirection: "row", gap: 10, marginBottom: 15, alignItems: "center" },
  addSkillButton: {
    backgroundColor: "#4F46E5",
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalSkillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  saveButton: {
    backgroundColor: "#4F46E5",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
    marginTop: 10,
  },
  saveButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 }
});
