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
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Briefcase, 
  DollarSign, 
  Star, 
  CheckCircle2,
  Camera
} from "lucide-react-native";
import { useRouter } from 'expo-router';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileViewScreen() {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const user = {
    name: "John Doe",
    title: "UI/UX Designer",
    email: "john.doe@example.com",
    skills: ["React Native", "UI Design", "Figma", "TypeScript"],
    bio: "Creative and detail-oriented designer passionate about building smooth mobile experiences and scalable design systems.",
    pricing: "$25/hr",
    avatar: null,
  };

  const reviews = [
    {
      projectTitle: "Mobile App Redesign",
      communication: 5,
      quality: 4,
      punctuality: 5,
      milestones: [],
      feedback: "Great collaboration and timely delivery.",
    },
    {
      projectTitle: "Website Development",
      communication: 4,
      quality: 4,
      punctuality: 4,
      milestones: [],
      feedback: "Good work overall.",
    },
  ];

  const [formName, setFormName] = useState(user.name);
  const [formTitle, setFormTitle] = useState(user.title);
  const [formBio, setFormBio] = useState(user.bio);
  const [formPricing, setFormPricing] = useState(user.pricing);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const getProjectAverageRating = (projectTitle: string) => {
    const review = reviews.find((r) => r.projectTitle === projectTitle);
    if (!review) return null;
    const milestoneRatings = review.milestones?.map((m) => Number(m.rating || 0)) || [];
    const other = [Number(review.communication), Number(review.quality), Number(review.punctuality)];
    const all = [...milestoneRatings, ...other];
    return (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <Text style={[styles.editAction, { color: editMode ? "#10B981" : "#4F46E5" }]}>
                {editMode ? "Save" : "Edit"}
            </Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* AVATAR & BASIC INFO */}
        <View style={styles.profileHero}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{formName.charAt(0)}</Text>
            </View>
            {editMode && (
              <TouchableOpacity style={styles.cameraIcon}>
                <Camera size={16} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
          
          <TextInput 
            style={[styles.nameInput, editMode && styles.inputActive]} 
            value={formName} 
            onChangeText={setFormName} 
            editable={editMode} 
          />
          <View style={styles.titleRow}>
             <Briefcase size={14} color="#64748B" />
             <TextInput 
                style={[styles.titleInput, editMode && styles.inputActive]} 
                value={formTitle} 
                onChangeText={setFormTitle} 
                editable={editMode} 
             />
          </View>
        </View>

        {/* QUICK STATS */}
        {!editMode && (
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <DollarSign size={18} color="#4F46E5" />
                    <Text style={styles.statValue}>{formPricing}</Text>
                    <Text style={styles.statLabel}>Rate</Text>
                </View>
                <View style={[styles.statBox, styles.statBorder]}>
                    <Star size={18} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.statValue}>4.9</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statBox}>
                    <CheckCircle2 size={18} color="#10B981" />
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>Jobs</Text>
                </View>
            </View>
        )}

        {/* BIO SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <TextInput 
            style={[styles.bioText, editMode && styles.bioInputActive]} 
            value={formBio} 
            onChangeText={setFormBio} 
            multiline 
            editable={editMode} 
          />
        </View>

        {/* SKILLS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expertise</Text>
          <View style={styles.skillsWrapper}>
            {user.skills.map((skill) => (
              <View key={skill} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* PORTFOLIO / HISTORY */}
        <Text style={[styles.sectionTitle, { marginLeft: 20, marginTop: 10 }]}>Completed Projects</Text>
        {reviews.map((review, idx) => {
          const avg = getProjectAverageRating(review.projectTitle);
          const expanded = expandedIndex === idx;

          return (
            <View key={idx} style={styles.projectCard}>
              <TouchableOpacity style={styles.projectHeader} onPress={() => toggleExpand(idx)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.projectTitle}>{review.projectTitle}</Text>
                  <View style={styles.ratingInline}>
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.projectRating}>{avg} / 5.0</Text>
                  </View>
                </View>
                <View style={styles.expandCircle}>
                    {expanded ? <ChevronUp size={18} color="#4F46E5" /> : <ChevronDown size={18} color="#4F46E5" />}
                </View>
              </TouchableOpacity>

              {expanded && (
                <View style={styles.expandedContent}>
                  <Text style={styles.feedbackText}>"{review.feedback}"</Text>
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    backgroundColor: "#FFFFFF",
    paddingBottom: 10
  },
  backButton: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B" },
  editAction: { fontSize: 15, fontWeight: "700" },

  content: { paddingVertical: 20 },

  profileHero: { alignItems: "center", marginBottom: 25 },
  avatarContainer: { marginBottom: 15, position: 'relative' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 35, backgroundColor: "#EEF2FF", justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: '#FFF' },
  avatarInitial: { fontSize: 40, fontWeight: "800", color: "#4F46E5" },
  cameraIcon: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#4F46E5', padding: 8, borderRadius: 12, borderWidth: 3, borderColor: '#FFF' },

  nameInput: { fontSize: 24, fontWeight: "800", color: "#1E293B", textAlign: "center", minWidth: 200 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  titleInput: { fontSize: 15, fontWeight: "600", color: "#64748B", textAlign: "center" },
  inputActive: { color: '#4F46E5', textDecorationLine: 'underline' },

  statsRow: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 24, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#F1F5F9' },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' },

  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B", marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  bioText: { fontSize: 15, color: "#475569", lineHeight: 24 },
  bioInputActive: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#4F46E5', color: '#1E293B' },

  skillsWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillBadge: { backgroundColor: "#FFF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  skillText: { color: "#4F46E5", fontSize: 13, fontWeight: "700" },

  projectCard: { backgroundColor: "#FFF", marginHorizontal: 20, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  projectHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  projectTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  ratingInline: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  projectRating: { fontSize: 13, fontWeight: '700', color: "#F59E0B" },
  expandCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },

  expandedContent: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  feedbackText: { fontSize: 14, color: "#64748B", fontStyle: "italic", lineHeight: 20, marginBottom: 15 },
  milestoneList: { gap: 10 },
  milestoneItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 12 },
  milestoneName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#475569' },
  milestoneScore: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
});