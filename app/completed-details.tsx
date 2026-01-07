import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ArrowLeft, CheckCircle2, Clock4, FileText } from "lucide-react-native";

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
  // 🔹 Static project data
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
    milestones: [
      {
        title: "Design Mockups",
        duration: "3 days",
        details: "Create Figma mockups for all pages",
        priceUSD: "$500",
        pricePKR: "PKR 100,000",
        status: "completed",
      },
      {
        title: "Frontend Implementation",
        duration: "5 days",
        details: "Develop responsive React components",
        priceUSD: "$600",
        pricePKR: "PKR 120,000",
        status: "completed",
      },
      {
        title: "Backend Integration",
        duration: "4 days",
        details: "Connect frontend with API endpoints",
        priceUSD: "$400",
        pricePKR: "PKR 80,000",
        status: "completed",
      },
    ],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconWrap} onPress={() => console.log("Go Back")}>
          <ArrowLeft color="#111827" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Project</Text>
      </View>

      {/* Project Info */}
      <View style={styles.card}>
        <Text style={styles.projectTitle}>{project.title}</Text>
        <Text style={styles.client}>👤 Client: {project.client}</Text>
        <Text style={styles.info}>💰 Budget: {project.budget}</Text>
        <Text style={styles.info}>🕒 Deadline: {project.deadline}</Text>
        {project.location && <Text style={styles.info}>📍 Location: {project.location}</Text>}
        {project.description && <Text style={styles.desc}>{project.description}</Text>}
      </View>

      {/* Milestones */}
      <View style={styles.milestoneCard}>
        <View style={styles.milestoneHeader}>
          <FileText size={18} color="#2563EB" />
          <Text style={styles.sectionTitle}>Milestones</Text>
        </View>

        {project.milestones.map((m, i) => (
          <View key={i} style={styles.milestoneItem}>
            <View style={styles.milestoneTop}>
              <View style={styles.milestoneLeft}>
                {m.status === "completed" ? (
                  <CheckCircle2 size={18} color="#16A34A" />
                ) : (
                  <Clock4 size={18} color="#F59E0B" />
                )}
                <Text style={styles.milestoneTitle}>{m.title}</Text>
              </View>
              <Text
                style={[
                  styles.approvalStatus,
                  m.status === "completed" ? styles.approved : styles.pending,
                ]}
              >
                {m.status === "completed" ? "COMPLETED" : "PENDING"}
              </Text>
            </View>

            {m.details && <Text style={styles.milestoneDetail}>{m.details}</Text>}

            <View style={styles.milestoneFooter}>
              {m.duration && <Text style={styles.milestoneDuration}>⏳ {m.duration}</Text>}
              {(m.priceUSD || m.pricePKR) && (
                <Text style={styles.milestonePrice}>
                  💵 {m.priceUSD} {m.pricePKR ? `(${m.pricePKR})` : ""}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Completion Message */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>🎉 Congratulations! Project Completed</Text>
        {project.completedDate && (
          <Text style={styles.summarySubText}>Completed on {project.completedDate}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconWrap: { backgroundColor: "#EFF6FF", padding: 8, borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginLeft: 10 },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  projectTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  client: { fontSize: 14, color: "#6B7280", marginTop: 6 },
  info: { fontSize: 14, color: "#374151", marginTop: 4 },
  desc: { color: "#4B5563", fontSize: 14, marginTop: 10, lineHeight: 20 },

  milestoneCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  milestoneHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  milestoneItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 10,
  },
  milestoneTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  milestoneLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  milestoneTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  milestoneDetail: { fontSize: 13, color: "#4B5563", marginTop: 6 },
  milestoneFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  milestoneDuration: { color: "#6B7280", fontSize: 13 },
  milestonePrice: { color: "#2563EB", fontSize: 13, fontWeight: "600" },
  approvalStatus: { fontSize: 12, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  approved: { backgroundColor: "#DCFCE7", color: "#16A34A" },
  pending: { backgroundColor: "#FEF9C3", color: "#CA8A04" },

  summaryCard: {
    backgroundColor: "#E0F2FE",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  summaryText: { color: "#0369A1", fontWeight: "700", fontSize: 15 },
  summarySubText: { color: "#0369A1", marginTop: 4 },
});
