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
  Briefcase,
  Mail,
  CheckCircle2,
  MessageSquare,
  UserCircle,
  Calendar,
  MapPin,
  Phone,
  DollarSign,
  Clock,
  X,
  Save,
  Plus,
  Globe,
  GraduationCap,
  Award,
  Folder,
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

  // Default avatar
  const defaultAvatar = user?.profileImage || 
    "https://ui-avatars.com/api/?name=" + 
    encodeURIComponent(user?.userName || "User") + 
    "&background=3B82F6&color=fff&size=200";

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

      // Remove undefined values
      Object.keys(profileData).forEach(key => 
        profileData[key] === undefined && delete profileData[key]
      );

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
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header with Settings */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Profile Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: defaultAvatar }} style={styles.avatar} />
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setEditModalVisible(true)}
            >
              <Edit size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user?.userName || "User"}</Text>
          
          <View style={styles.metaInfo}>
            {user?.isVerified && (
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Star size={18} color="#F59E0B" />
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <CheckCircle2 size={18} color="#10B981" />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <DollarSign size={18} color="#3B82F6" />
              <Text style={styles.statValue}>${user?.hourlyRate || '0'}</Text>
              <Text style={styles.statLabel}>Hourly</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        {user?.bio && (
          <SectionCard title="About">
            <Text style={styles.bioText}>{user.bio}</Text>
          </SectionCard>
        )}

        {/* Skills Section */}
        {user?.skills && user.skills.length > 0 && (
          <SectionCard title="Skills">
            <View style={styles.skillsContainer}>
              {user.skills.map((skill, index) => (
                <SkillTag key={index} skill={skill} />
              ))}
            </View>
          </SectionCard>
        )}

        {/* Contact Information */}
        <SectionCard title="Contact Information">
          <View style={styles.contactRow}>
            <Mail size={20} color="#6B7280" />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{user?.email}</Text>
            </View>
          </View>
          
          {user?.phone && (
            <View style={styles.contactRow}>
              <Phone size={20} color="#6B7280" />
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{user.phone}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.contactRow}>
            <Briefcase size={20} color="#6B7280" />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Role</Text>
              <Text style={styles.contactValue}>{user?.role || 'Freelancer'}</Text>
            </View>
          </View>
        </SectionCard>

        {/* Languages */}
        {user?.languages && user.languages.length > 0 && (
          <SectionCard title="Languages">
            {user.languages.map((lang, index) => (
              <View key={index} style={styles.listItem}>
                <Globe size={18} color="#3B82F6" />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{lang.name}</Text>
                  <Text style={styles.listItemSubtitle}>{lang.proficiency}</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Education */}
        {user?.education && user.education.length > 0 && (
          <SectionCard title="Education">
            {user.education.map((edu, index) => (
              <View key={index} style={styles.listItem}>
                <GraduationCap size={18} color="#8B5CF6" />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{edu.degree}</Text>
                  <Text style={styles.listItemSubtitle}>{edu.school}</Text>
                  <Text style={styles.listItemMeta}>{edu.years}</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Certifications */}
        {user?.certifications && user.certifications.length > 0 && (
          <SectionCard title="Certifications">
            {user.certifications.map((cert, index) => (
              <View key={index} style={styles.listItem}>
                <Award size={18} color="#F59E0B" />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{cert.name}</Text>
                  <Text style={styles.listItemSubtitle}>{cert.issuer}</Text>
                  <Text style={styles.listItemMeta}>{cert.date}</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Portfolio */}
        {user?.portfolio && user.portfolio.length > 0 && (
          <SectionCard title="Portfolio">
            {user.portfolio.map((item, index) => (
              <View key={index} style={styles.portfolioItem}>
                <Folder size={18} color="#3B82F6" />
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{item.title}</Text>
                  <Text style={styles.listItemDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity 
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Basic Info Section */}
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  placeholderTextColor="#9CA3AF"
                  value={editedUserName}
                  onChangeText={setEditedUserName}
                  autoCapitalize="none"
                  editable={!isSaving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={user?.email || ""}
                  editable={false}
                />
                <Text style={styles.inputHint}>Email cannot be changed</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <View style={styles.inputWithIcon}>
                  <Phone size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.inputWithIconText}
                    placeholder="+1 234 567 8900"
                    placeholderTextColor="#9CA3AF"
                    value={editedPhone}
                    onChangeText={setEditedPhone}
                    keyboardType="phone-pad"
                    editable={!isSaving}
                  />
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* About Section */}
              <Text style={styles.sectionTitle}>About</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us about yourself, your experience, and what makes you unique..."
                  placeholderTextColor="#9CA3AF"
                  value={editedBio}
                  onChangeText={setEditedBio}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  editable={!isSaving}
                />
                <Text style={styles.inputHint}>
                  {editedBio.length}/1000 characters
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Skills Section */}
              <Text style={styles.sectionTitle}>Skills</Text>
              
              <View style={styles.skillsInputContainer}>
                <View style={styles.addSkillRow}>
                  <TextInput
                    style={styles.skillInput}
                    placeholder="Add a skill"
                    placeholderTextColor="#9CA3AF"
                    value={newSkill}
                    onChangeText={setNewSkill}
                    onSubmitEditing={handleAddSkill}
                    editable={!isSaving}
                  />
                  <TouchableOpacity
                    onPress={handleAddSkill}
                    style={styles.addSkillButton}
                    disabled={!newSkill.trim() || isSaving}
                  >
                    <Plus size={20} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.skillsList}>
                  {editedSkills.map((skill, index) => (
                    <SkillTag
                      key={index}
                      skill={skill}
                      editable={true}
                      onRemove={() => handleRemoveSkill(index)}
                    />
                  ))}
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Pricing Section */}
              <Text style={styles.sectionTitle}>Pricing</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hourly Rate (USD)</Text>
                <View style={styles.inputWithIcon}>
                  <DollarSign size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.inputWithIconText}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    value={editedHourlyRate}
                    onChangeText={setEditedHourlyRate}
                    keyboardType="decimal-pad"
                    editable={!isSaving}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Save size={18} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  
  // Header
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  settingsButton: { 
    padding: 8 
  },
  
  // Hero Section
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  avatarContainer: { 
    position: "relative", 
    marginBottom: 16 
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#3B82F6",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: "#111827", 
    marginBottom: 4,
    textAlign: "center",
  },
  userTitle: { 
    fontSize: 16, 
    color: "#6B7280", 
    marginBottom: 12,
    textAlign: "center",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: "#6B7280",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  verifiedText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },

  // Quick Stats
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    gap: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },

  // Bio
  bioText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
  },

  // Skills
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Contact Info
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  contactContent: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  // List Items
  listItem: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  listItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  listItemMeta: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  listItemDesc: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 20,
  },

  // Portfolio
  portfolioItem: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  // Logout
  logoutButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    maxHeight: 500,
  },
  
  // Form Sections
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },
  
  // Inputs
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  inputDisabled: {
    backgroundColor: "#F9FAFB",
    color: "#9CA3AF",
  },
  inputHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  inputWithIconText: {
    flex: 1,
    padding: 14,
    paddingLeft: 10,
    fontSize: 16,
    color: "#111827",
  },

  // Skills Input
  skillsInputContainer: {
    marginBottom: 20,
  },
  addSkillRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  skillInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
  },
  addSkillButton: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#BFDBFE",
  },
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // Modal Actions
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
