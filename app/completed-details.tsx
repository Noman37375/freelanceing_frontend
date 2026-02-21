import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router"; // 🔹 Added for back navigation
import { ArrowLeft, CheckCircle2, Clock4, FileText, User, DollarSign, Calendar, MapPin, Award } from "lucide-react-native";

type Milestone = {
  title: string;
  duration?: string;
  details?: string;
  pricePKR?: string;
  priceUSD?: string;
  status: "completed" | "pending";
};

type Project = {
  id: string;
  title: string;
  client: string;
  budget: string;
  deadline: string;
  status: string;
  location?: string;
  description?: string;
  milestones: Milestone[];
  completedDate?: string;
};

export default function CompletedDetails() {
  const router = useRouter(); // 🔹 Initialize router

  // 🔹 Static project data (Logic Maintained)
  const [project] = useState<Project>({
    id: "1",
    title: "Website Redesign Project",
    client: "Acme Corp",
    budget: "$1500",
    deadline: "Dec 15, 2025",
    status: "completed",
    location: "Remote",
    description: "Redesign the corporate website with modern UI/UX and responsive layout.",
    completedDate: "Dec 20, 2025",
    milestones: [],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* INDIGO HEADER */}
      <View style={styles.darkHeader}>
        <SafeAreaView>
          <View style={styles.navRow}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()} // 🔹 Logic Fixed: Works now
            >
              <ArrowLeft color="#F8FAFC" size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Project Archive</Text>
          </View>

          <View style={styles.summaryGrid}>
            {project.client?.userName && (
              <View style={styles.tag}>
                <User size={12} color="#C7D2FE" />
                <Text style={styles.tagText}>{project.client.userName}</Text>
              </View>
            )}
            <View style={styles.tag}>
              <DollarSign size={12} color="#C7D2FE" />
              <Text style={styles.tagText}>${project.budget?.toFixed(2) || '0.00'}</Text>
            </View>
            {project.location && (
              <View style={styles.tag}>
                <MapPin size={12} color="#C7D2FE" />
                <Text style={styles.tagText}>{project.location}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* CONTENT BODY */}
      <ScrollView 
        style={styles.contentBody} 
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Overview */}
        <View style={styles.mainCard}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.description}>{project.description || 'No description provided'}</Text>
          
          <View style={styles.divider} />
          
          {project.duration && (
            <View style={styles.deadlineRow}>
              <Calendar size={16} color="#444751" />
              <Text style={styles.deadlineText}>Duration: {project.duration}</Text>
            </View>
          )}
        </View>

        {/* Completion Success Card */}
        <View style={styles.successCard}>
          <Award size={24} color="#FFF" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.successTitle}>Project Completed</Text>
            <Text style={styles.successDate}>Completed: {formatDate(project.updatedAt)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#282A32" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC", gap: 12 },
  loadingText: { color: "#94A3B8", fontSize: 14, marginTop: 8 },
  goBackBtn: { marginTop: 16, backgroundColor: "#282A32", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  goBackText: { color: "#FFF", fontWeight: "700" },
  
  // Header
  darkHeader: { paddingHorizontal: 20, paddingBottom: 20 },
  navRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#282A32", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#444751" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#F8FAFC" },
  
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 15, gap: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(99, 102, 241, 0.2)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tagText: { color: "#C7D2FE", fontSize: 12, fontWeight: "600" },

  // Content
  contentBody: { flex: 1, backgroundColor: "#F8FAFC", borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  mainCard: { backgroundColor: "#FFF", padding: 20, borderRadius: 24, marginBottom: 20, marginTop: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  projectTitle: { fontSize: 22, fontWeight: "800", color: "#282A32", marginBottom: 8 },
  description: { fontSize: 14, color: "#64748B", lineHeight: 22 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 15 },
  deadlineRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  deadlineText: { fontSize: 13, fontWeight: "700", color: "#444751" },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 15, paddingLeft: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#282A32" },

  milestoneItem: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0", borderLeftWidth: 5, borderLeftColor: "#10B981" },
  milestoneTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  milestoneLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  milestoneTitle: { fontSize: 15, fontWeight: "700", color: "#282A32" },
  statusBadge: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "800", color: "#10B981" },
  milestoneDetail: { fontSize: 13, color: "#94A3B8", marginTop: 8, lineHeight: 18 },
  milestoneFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F8FAFC" },
  footerInfo: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  footerPrice: { fontSize: 13, color: "#282A32", fontWeight: "800" },

  successCard: { backgroundColor: "#444751", flexDirection: "row", alignItems: "center", padding: 20, borderRadius: 20, marginTop: 10 },
  successTitle: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  successDate: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" }
});