import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileViewScreen() {
  const [editMode, setEditMode] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // 🔹 Static user data
  const user = {
    name: "John Doe",
    title: "UI/UX Designer",
    email: "john.doe@example.com",
    skills: ["React Native", "UI Design", "Figma"],
    bio: "Creative and detail-oriented designer passionate about building smooth mobile experiences.",
    pricing: "$25/hr",
    avatar: null, // you can add a URI here
  };

  const completedProjects = [
    { id: "1", title: "Mobile App Redesign" },
    { id: "2", title: "Website Development" },
  ];

  const reviews = [
    {
      projectTitle: "Mobile App Redesign",
      communication: 5,
      quality: 4,
      punctuality: 5,
      milestones: [
        { title: "UI Design", rating: 5, comment: "Excellent design work" },
        { title: "Prototype", rating: 4, comment: "Smooth transitions" },
      ],
      feedback: "Great collaboration and timely delivery.",
    },
    {
      projectTitle: "Website Development",
      communication: 4,
      quality: 4,
      punctuality: 4,
      milestones: [
        { title: "Backend Setup", rating: 4, comment: "Solid implementation" },
      ],
      feedback: "Good work overall.",
    },
  ];

  const [formName, setFormName] = useState(user.name);
  const [formTitle, setFormTitle] = useState(user.title);
  const [formEmail, setFormEmail] = useState(user.email);
  const [formSkills, setFormSkills] = useState(user.skills.join(", "));
  const [formBio, setFormBio] = useState(user.bio);
  const [formPricing, setFormPricing] = useState(user.pricing);
  const [avatarUri, setAvatarUri] = useState<string | null>(user.avatar);

  const toggleExpand = (index: number) => {
    LayoutAnimation.easeInEaseOut();
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const getProjectAverageRating = (projectTitle: string) => {
    const review = reviews.find((r) => r.projectTitle === projectTitle);
    if (!review) return null;
    const milestoneRatings = review.milestones?.map((m) => Number(m.rating || 0)) || [];
    const other = [Number(review.communication), Number(review.quality), Number(review.punctuality)];
    const all = [...milestoneRatings, ...other].filter((v) => typeof v === "number" && !Number.isNaN(v));
    if (all.length === 0) return null;
    return Number((all.reduce((a, b) => a + b, 0) / all.length).toFixed(1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{user.name.charAt(0)}</Text>
              </View>
            )}
          </View>

          <TextInput style={styles.nameInput} value={formName} onChangeText={setFormName} editable={editMode} />
          <TextInput style={[styles.input, { marginTop: 8 }]} value={formTitle} onChangeText={setFormTitle} editable={editMode} />
          <TextInput style={styles.input} value={formEmail} onChangeText={setFormEmail} editable={editMode} keyboardType="email-address" />

          <View style={{ width: "100%", marginTop: 12 }}>
            <Text style={styles.sectionLabel}>Skills</Text>
            {editMode ? (
              <TextInput style={styles.input} value={formSkills} onChangeText={setFormSkills} />
            ) : (
              <View style={styles.skillsContainer}>
                {user.skills.map((skill) => (
                  <View key={skill} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.bioContainer}>
            <Text style={styles.sectionLabel}>Bio</Text>
            {editMode ? (
              <TextInput style={styles.bioInput} value={formBio} onChangeText={setFormBio} multiline />
            ) : (
              <View style={styles.bioCard}>
                <Text style={styles.bioText}>{formBio}</Text>
              </View>
            )}
          </View>

          <View style={{ width: "100%", marginTop: 12 }}>
            <Text style={styles.sectionLabel}>Pricing</Text>
            {editMode ? (
              <TextInput style={styles.input} value={formPricing} onChangeText={setFormPricing} />
            ) : (
              <View style={styles.pricingBox}>
                <Text style={styles.pricingText}>{formPricing}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={editMode ? styles.saveButton : styles.editButton} onPress={() => setEditMode(!editMode)}>
            <Text style={styles.buttonText}>{editMode ? "Save Changes" : "Edit Profile"}</Text>
          </TouchableOpacity>
        </View>

        {/* Completed Projects */}
        <Text style={styles.sectionTitle}>Completed Projects</Text>
        {completedProjects.map((proj, idx) => {
          const avg = getProjectAverageRating(proj.title);
          const review = reviews.find((r) => r.projectTitle === proj.title);
          const preview = review?.feedback || null;
          const expanded = expandedIndex === idx;

          return (
            <View key={proj.id} style={styles.projectCard}>
              <TouchableOpacity style={styles.projectHeader} onPress={() => toggleExpand(idx)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.projectTitle}>{proj.title}</Text>
                  {avg !== null && <Text style={styles.projectRating}>⭐ {avg} / 5</Text>}
                  {preview ? <Text style={styles.projectReview} numberOfLines={2}>“{preview}”</Text> : <Text style={styles.projectNoReview}>No review available</Text>}
                </View>
                {expanded ? <ChevronUp size={22} color="#111827" /> : <ChevronDown size={22} color="#111827" />}
              </TouchableOpacity>

              {expanded && (
                <View style={styles.milestonesContainer}>
                  {review?.milestones.map((m, i) => (
                    <View key={i} style={styles.milestoneBox}>
                      <Text style={styles.milestoneTitle}>{m.title}</Text>
                      <Text style={styles.milestoneRating}>⭐ {m.rating} / 5</Text>
                      {m.comment && <Text style={styles.milestoneComment}>{m.comment}</Text>}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===== styles ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },

  avatarWrapper: { marginBottom: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, resizeMode: "cover" },
  avatarPlaceholder: { backgroundColor: "#e0f2fe", justifyContent: "center", alignItems: "center" },
  avatarInitial: { fontSize: 32, fontWeight: "700", color: "#0369A1" },

  nameInput: { fontSize: 20, fontWeight: "700", color: "#111827", textAlign: "center", width: "100%" },
  input: { backgroundColor: "#f9fafb", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", padding: 10, width: "100%" },

  skillsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  skillBadge: { backgroundColor: "#E0F2FE", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginRight: 6, marginBottom: 6 },
  skillText: { color: "#0369A1", fontSize: 14, fontWeight: "600" },

  bioContainer: { width: "100%", marginTop: 12 },
  bioCard: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e5e7eb" },
  bioText: { fontSize: 14.5, color: "#374151", lineHeight: 20 },
  bioInput: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#d1d5db", padding: 10, height: 110, textAlignVertical: "top", color: "#111827" },

  pricingBox: { backgroundColor: "#ECFDF5", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#D1FAE5" },
  pricingText: { fontSize: 16, fontWeight: "700", color: "#065F46" },

  editButton: { backgroundColor: "#3b82f6", marginTop: 12, borderRadius: 10, paddingVertical: 12, alignItems: "center", width: "100%" },
  saveButton: { backgroundColor: "#10b981", marginTop: 12, borderRadius: 10, paddingVertical: 12, alignItems: "center", width: "100%" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginTop: 6, marginBottom: 8 },
  emptyText: { textAlign: "center", color: "#777", marginTop: 6 },

  projectCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, elevation: 2 },
  projectHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  projectTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  projectRating: { fontSize: 14, color: "#f59e0b", marginTop: 4 },
  projectReview: { fontSize: 13, color: "#4b5563", fontStyle: "italic", marginTop: 6 },
  projectNoReview: { fontSize: 13, color: "#9CA3AF", marginTop: 6, fontStyle: "italic" },

  milestonesContainer: { marginTop: 10 },
  milestoneBox: { backgroundColor: "#f4f6fc", borderRadius: 10, padding: 8, marginBottom: 6, borderLeftWidth: 3, borderLeftColor: "#f59e0b" },
  milestoneTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },
  milestoneComment: { fontSize: 12, color: "#475569", marginTop: 4 },
  milestoneRating: { fontSize: 13, color: "#f59e0b", marginTop: 4 },
});
