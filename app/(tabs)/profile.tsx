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
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import SkillTag from "@/components/SkillTag";
import SectionCard from "@/components/SectionCard";

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
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.userName || "User")}&background=6366F1&color=fff&size=200`;

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
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* STATIC HEADER (No Back Arrow) */}
      <View style={styles.header}>
        <View style={{ width: 40 }} /> 
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Settings size={22} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE AREA */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: defaultAvatar }} style={styles.avatar} />
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setEditModalVisible(true)}
            >
              <Edit size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user?.userName || "User"}</Text>
          
          <View style={styles.verifiedBadge}>
            <CheckCircle2 size={14} color="#6366F1" />
            <Text style={styles.verifiedText}>Verified Professional</Text>
          </View>

          {/* Quick Stats Bar */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Star size={18} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <CheckCircle2 size={18} color="#10B981" />
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <DollarSign size={18} color="#6366F1" />
              <Text style={styles.statValue}>${user?.hourlyRate || '0'}</Text>
              <Text style={styles.statLabel}>Hourly</Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.sectionWrapper}>
          {user?.bio && (
            <SectionCard title="Professional Bio">
              <Text style={styles.bioText}>{user.bio}</Text>
            </SectionCard>
          )}

          {user?.skills && user.skills.length > 0 && (
            <SectionCard title="Core Expertise">
              <View style={styles.skillsContainer}>
                {user.skills.map((skill, index) => (
                  <SkillTag key={index} skill={skill} />
                ))}
              </View>
            </SectionCard>
          )}

          <SectionCard title="Contact Information">
            <View style={styles.contactRow}>
              <Mail size={18} color="#64748B" />
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Email Address</Text>
                <Text style={styles.contactValue}>{user?.email}</Text>
              </View>
            </View>
            
            {user?.phone && (
              <View style={styles.contactRow}>
                <Phone size={18} color="#64748B" />
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Phone Number</Text>
                  <Text style={styles.contactValue}>{user.phone}</Text>
                </View>
              </View>
            )}
          </SectionCard>

          {/* Logout Button (Positioned at bottom of scroll) */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out of Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={editedUserName}
                onChangeText={setEditedUserName}
                placeholder="Your Name"
              />

              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedBio}
                onChangeText={setEditedBio}
                multiline
                numberOfLines={4}
                placeholder="Tell us about yourself..."
              />

              <Text style={styles.inputLabel}>Hourly Rate ($)</Text>
              <TextInput
                style={styles.input}
                value={editedHourlyRate}
                onChangeText={setEditedHourlyRate}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Skills</Text>
              <View style={styles.addSkillRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={newSkill}
                  onChangeText={setNewSkill}
                  placeholder="Add skill"
                />
                <TouchableOpacity onPress={handleAddSkill} style={styles.addSkillButton}>
                  <Plus size={20} color="#6366F1" />
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

              <TouchableOpacity 
                style={[styles.saveButton, isSaving && { opacity: 0.7 }]} 
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Save size={18} color="#fff" style={{marginRight: 8}} />
                    <Text style={styles.saveButtonText}>Apply Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    height: 60,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  iconButton: { padding: 8 },

  // Added large paddingBottom to ensure logout button clears the tab bar
  scrollContent: { 
    flexGrow: 1, 
    paddingBottom: 130 
  },

  heroSection: {
    alignItems: "center",
    paddingVertical: 35,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  avatarContainer: { position: "relative", marginBottom: 15 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: "#EEF2FF" },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6366F1",
    borderRadius: 15,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: { fontSize: 26, fontWeight: "900", color: "#1E293B" },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20
  },
  verifiedText: { fontSize: 12, color: "#6366F1", fontWeight: "700" },
  
  quickStats: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 18,
    borderRadius: 22,
    width: '90%',
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  statLabel: { fontSize: 10, color: "#64748B", fontWeight: "700", textTransform: "uppercase", marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: "#CBD5E1" },

  sectionWrapper: { paddingHorizontal: 20, marginTop: 25 },
  bioText: { fontSize: 15, color: "#475569", lineHeight: 22 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  
  contactRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  contactContent: { marginLeft: 15 },
  contactLabel: { fontSize: 12, color: "#94A3B8", fontWeight: "600" },
  contactValue: { fontSize: 15, fontWeight: "700", color: "#1E293B" },

  logoutButton: {
    backgroundColor: "#FFF1F2",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutButtonText: { color: "#E11D48", fontSize: 16, fontWeight: "800" },

  // Modal Styling
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.85)", justifyContent: "flex-end" },
  modalContent: { 
    backgroundColor: "#fff", 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 24, 
    maxHeight: '85%' 
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#1E293B" },
  closeButton: { padding: 4 },
  modalBody: { marginBottom: 20 },
  inputLabel: { fontWeight: "700", marginBottom: 8, color: "#475569", fontSize: 14 },
  input: { 
    backgroundColor: "#F8FAFC", 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 18, 
    borderWidth: 1, 
    borderColor: "#E2E8F0",
    fontSize: 16,
    color: "#1E293B"
  },
  textArea: { height: 100, textAlignVertical: "top" },
  addSkillRow: { flexDirection: "row", gap: 10, marginBottom: 15, alignItems: "center" },
  addSkillButton: { 
    backgroundColor: "#EEF2FF", 
    width: 50, 
    height: 50, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D2FE"
  },
  modalSkillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 25 },
  saveButton: { 
    backgroundColor: "#6366F1", 
    padding: 18, 
    borderRadius: 18, 
    alignItems: "center", 
    flexDirection: 'row', 
    justifyContent: 'center',
    shadowColor: "#6366F1",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  saveButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 }
});