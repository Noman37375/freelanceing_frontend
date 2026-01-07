import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

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
    client: { name: "Tech Startup" },
    location: "Remote",
    description: "We are looking for an experienced React Native developer to build a modern and scalable mobile application.",
    skills: ["React Native", "JavaScript", "API Integration", "UI/UX"],
    milestones: [
      { title: "UI Design", details: "Design application screens", duration: "3 days", pricePKR: "PKR 30,000", priceUSD: "$100" },
      { title: "Development", details: "Develop app functionality", duration: "7 days", pricePKR: "PKR 90,000", priceUSD: "$300" },
      { title: "Testing & Delivery", details: "Final testing and deployment", duration: "4 days", pricePKR: "PKR 30,000", priceUSD: "$100" },
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.budget}>💰 ${project.budgetMin} – ${project.budgetMax}</Text>
        <Text style={styles.deadline}>🕒 {project.deadline}</Text>
        <Text style={styles.client}>👤 {project.client.name}</Text>
        <Text style={styles.location}>📍 {project.location}</Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{project.description}</Text>

        <Text style={styles.sectionTitle}>Skills Required</Text>
        <View style={styles.skillContainer}>
          {project.skills.map((skill: string, i: number) => (
            <Text key={i} style={styles.skillTag}>{skill}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Project Milestones</Text>
        {project.milestones.map((m: any, i: number) => (
          <View key={i} style={styles.milestoneCard}>
            <Text style={styles.milestoneTitle}>{i + 1}. {m.title}</Text>
            <Text style={styles.milestoneDetail}>{m.details}</Text>
            <Text style={styles.milestoneDuration}>⏳ {m.duration}</Text>
            <Text style={styles.milestonePrice}>{m.pricePKR} • {m.priceUSD}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => router.push(`/bids/${project.id}`)} // ✅ dynamic route
        >
          <Text style={styles.applyButtonText}>🚀 Bid Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  card: { backgroundColor: "#FFFFFF", margin: 20, borderRadius: 12, padding: 20, elevation: 3 },
  title: { fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 8 },
  budget: { fontSize: 16, color: "#3B82F6", marginBottom: 4 },
  deadline: { fontSize: 16, color: "#6B7280", marginBottom: 4 },
  client: { fontSize: 16, color: "#6B7280", marginBottom: 4 },
  location: { fontSize: 16, color: "#6B7280", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 6 },
  description: { fontSize: 16, color: "#374151", lineHeight: 22 },
  skillContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  skillTag: { backgroundColor: "#EFF6FF", color: "#2563EB", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 16, marginRight: 6, marginBottom: 6, fontSize: 14 },
  milestoneCard: { backgroundColor: "#F3F4F6", borderRadius: 8, padding: 12, marginBottom: 10 },
  milestoneTitle: { fontSize: 16, fontWeight: "600" },
  milestoneDetail: { fontSize: 14, marginTop: 2 },
  milestoneDuration: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  milestonePrice: { fontSize: 14, color: "#10B981", marginTop: 4 },
  applyButton: { backgroundColor: "#3B82F6", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 20 },
  applyButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
});
