import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  ChevronRight,
  Zap
} from "lucide-react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

/* =======================
    STATIC PROJECT DATA
======================= */
const STATIC_PROJECTS = [
  {
    id: "1",
    title: "React Native Mobile App",
    budgetMin: 300,
    budgetMax: 600,
    deadline: "2 Weeks",
    client: { name: "Tech Startup", industry: "FinTech" },
    location: "Remote",
    description: "We are looking for an experienced React Native developer to build a modern and scalable mobile application. The ideal candidate has experience with high-performance animations and Redux Toolkit.",
    skills: ["React Native", "JavaScript", "API Integration", "UI/UX"],
    milestones: [
      { title: "UI Design", details: "Design application screens", duration: "3 days", priceUSD: "$100" },
      { title: "Development", details: "Develop app functionality", duration: "7 days", priceUSD: "$300" },
      { title: "Testing & Delivery", details: "Final testing and deployment", duration: "4 days", priceUSD: "$100" },
    ],
  },
];

export default function ProjectDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const foundProject = STATIC_PROJECTS.find((p) => p.id === id) || STATIC_PROJECTS[0];
    setProject(foundProject);
  }, [id]);

  if (!project) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.categoryBadge}>
            <Briefcase size={14} color="#4F46E5" />
            <Text style={styles.categoryText}>Mobile Development</Text>
          </View>
          <Text style={styles.title}>{project.title}</Text>
          
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <View style={styles.metaIcon}>
                <DollarSign size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.metaLabel}>Budget</Text>
                <Text style={styles.metaValue}>${project.budgetMin}-${project.budgetMax}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaIcon}>
                <Clock size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.metaLabel}>Timeline</Text>
                <Text style={styles.metaValue}>{project.deadline}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CLIENT INFO */}
        <View style={styles.section}>
          <View style={styles.clientCard}>
            <View style={styles.clientAvatar}>
              <Users size={20} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{project.client.name}</Text>
              <View style={styles.clientSubRow}>
                <MapPin size={12} color="#64748B" />
                <Text style={styles.clientLocation}>{project.location} • {project.client.industry}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </View>
        </View>

        {/* DESCRIPTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{project.description}</Text>
        </View>

        {/* SKILLS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills Required</Text>
          <View style={styles.skillContainer}>
            {project.skills.map((skill: string, i: number) => (
              <View key={i} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* MILESTONES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Execution Milestones</Text>
          {project.milestones.map((m: any, i: number) => (
            <View key={i} style={styles.milestoneItem}>
              <View style={styles.timeline}>
                <View style={styles.timelineDot} />
                {i !== project.milestones.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.milestoneContent}>
                <View style={styles.milestoneHeader}>
                  <Text style={styles.milestoneTitle}>{m.title}</Text>
                  <Text style={styles.milestonePrice}>{m.priceUSD}</Text>
                </View>
                <Text style={styles.milestoneDetail}>{m.details}</Text>
                <View style={styles.milestoneFooter}>
                  <Calendar size={12} color="#94A3B8" />
                  <Text style={styles.milestoneDuration}>{m.duration}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <View style={styles.footerAction}>
        <TouchableOpacity 
          activeOpacity={0.9}
          style={styles.applyButton}
          onPress={() => router.push(`/bids/${project.id}`)}
        >
          <Zap size={20} color="#FFF" fill="#FFF" />
          <Text style={styles.applyButtonText}>Submit Proposal</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B" },

  heroSection: { backgroundColor: '#FFF', padding: 20, paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 15, gap: 6 },
  categoryText: { color: '#4F46E5', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: "800", color: "#1E293B", marginBottom: 20, lineHeight: 32 },
  
  metaGrid: { flexDirection: 'row', gap: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  metaIcon: { width: 38, height: 38, backgroundColor: '#F8FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  metaLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },
  metaValue: { fontSize: 15, fontWeight: '700', color: '#1E293B' },

  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 12 },
  
  clientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  clientAvatar: { width: 45, height: 45, backgroundColor: '#EEF2FF', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  clientName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  clientSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  clientLocation: { fontSize: 13, color: '#64748B' },

  description: { fontSize: 15, color: "#475569", lineHeight: 24 },
  
  skillContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillTag: { backgroundColor: "#FFF", borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 },
  skillText: { color: "#475569", fontWeight: "600", fontSize: 13 },

  milestoneItem: { flexDirection: 'row', gap: 15 },
  timeline: { alignItems: 'center', width: 20 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4F46E5', marginTop: 6, borderWidth: 3, borderColor: '#EEF2FF' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#F1F5F9' },
  milestoneContent: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  milestoneTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  milestonePrice: { fontSize: 15, fontWeight: '800', color: '#10B981' },
  milestoneDetail: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  milestoneFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  milestoneDuration: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },

  footerAction: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.9)', padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  applyButton: { backgroundColor: "#4F46E5", height: 56, borderRadius: 18, flexDirection: 'row', alignItems: "center", justifyContent: "center", gap: 10, shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  applyButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
});