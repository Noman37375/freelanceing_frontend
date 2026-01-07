import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ArrowLeft, CheckCircle, Clock, Info } from "lucide-react-native";

interface Milestone {
  title: string;
  duration: string;
  details: string;
  pricePKR: string;
  priceUSD: string;
  approvalStatus: "pending" | "approved" | "inReview" | "requested";
}

interface Project {
  id: string;
  title: string;
  budget: string;
  deadline: string;
  client: string;
  description: string;
  location: string;
  milestones: Milestone[];
}

export default function AvailableDetailsScreen() {
  // 🔹 Hardcoded static project data
  const [project, setProject] = useState<Project>({
    id: "1",
    title: "Mobile App Redesign",
    client: "Acme Corp",
    budget: "$1200",
    deadline: "Dec 2025",
    location: "Remote",
    description: "Redesign a mobile app with modern UI/UX and improve user engagement.",
    milestones: [
      {
        title: "UI Design",
        duration: "2 weeks",
        details: "Create wireframes and final design assets.",
        pricePKR: "60000",
        priceUSD: "$300",
        approvalStatus: "approved",
      },
      {
        title: "Prototype",
        duration: "1 week",
        details: "Build interactive prototype for client testing.",
        pricePKR: "40000",
        priceUSD: "$200",
        approvalStatus: "pending",
      },
      {
        title: "Final Implementation",
        duration: "3 weeks",
        details: "Implement the design in React Native.",
        pricePKR: "100000",
        priceUSD: "$500",
        approvalStatus: "requested",
      },
    ],
  });

  const handleRequestApproval = (index: number) => {
    const updatedMilestones = [...project.milestones];
    const selected = updatedMilestones[index];

    if (
      selected.approvalStatus === "approved" ||
      selected.approvalStatus === "requested" ||
      selected.approvalStatus === "inReview"
    )
      return;

    updatedMilestones[index].approvalStatus = "requested";
    setProject({ ...project, milestones: updatedMilestones });

    Alert.alert(
      "Approval Requested",
      `Milestone "${selected.title}" is now marked for review.`
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ArrowLeft color="#111827" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{project.title}</Text>
      </View>

      {/* Project Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>👤 Client: {project.client}</Text>
        <Text style={styles.summaryText}>💰 Budget: {project.budget}</Text>
        <Text style={styles.summaryText}>📍 Location: {project.location}</Text>
        <Text style={styles.summaryText}>⏰ Deadline: {project.deadline}</Text>
      </View>

      {/* Description */}
      <Text style={styles.sectionTitle}>Project Description</Text>
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionText}>{project.description}</Text>
      </View>

      {/* Milestones */}
      <Text style={styles.sectionTitle}>Project Milestones</Text>

      {project.milestones.map((m, index) => (
        <View
          key={index}
          style={[
            styles.milestoneCard,
            m.approvalStatus === "approved"
              ? styles.approvedCard
              : m.approvalStatus === "requested"
              ? styles.requestedCard
              : m.approvalStatus === "inReview"
              ? styles.inReviewCard
              : styles.pendingCard,
          ]}
        >
          <View style={styles.milestoneInfo}>
            {m.approvalStatus === "approved" ? (
              <CheckCircle color="#16A34A" size={20} />
            ) : m.approvalStatus === "requested" || m.approvalStatus === "inReview" ? (
              <Clock color="#F59E0B" size={20} />
            ) : (
              <Clock color="#6B7280" size={20} />
            )}
            <Text
              style={[
                styles.milestoneTitle,
                m.approvalStatus === "approved" && styles.approvedText,
              ]}
            >
              {m.title}
            </Text>
          </View>

          <View style={styles.milestoneDetails}>
            <Text style={styles.detailText}>📆 Duration: {m.duration}</Text>
            <Text style={styles.detailText}>💵 {m.priceUSD} ({m.pricePKR})</Text>
            <View style={styles.detailRow}>
              <Info color="#6B7280" size={14} />
              <Text style={styles.detailDescription}>{m.details}</Text>
            </View>
          </View>

          {m.approvalStatus === "pending" ? (
            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => handleRequestApproval(index)}
            >
              <Text style={styles.requestText}>Request Approval</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.statusTag}>
              <Text
                style={[
                  styles.statusText,
                  m.approvalStatus === "approved"
                    ? { color: "#16A34A" }
                    : m.approvalStatus === "inReview"
                    ? { color: "#3B82F6" }
                    : { color: "#F59E0B" },
                ]}
              >
                {m.approvalStatus === "approved"
                  ? "Approved"
                  : m.approvalStatus === "inReview"
                  ? "In Review"
                  : "Requested"}
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backButton: { backgroundColor: "#E5E7EB", padding: 8, borderRadius: 8, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827", flexShrink: 1 },
  summary: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 12, elevation: 2, marginBottom: 20 },
  summaryText: { fontSize: 14, color: "#374151", marginBottom: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#111827" },
  descriptionCard: { backgroundColor: "#FFFFFF", padding: 14, borderRadius: 10, marginBottom: 20, elevation: 1 },
  descriptionText: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
  milestoneCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  milestoneInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  milestoneTitle: { fontSize: 15, color: "#111827", flex: 1 },
  approvedText: { textDecorationLine: "line-through", color: "#16A34A" },
  milestoneDetails: { marginTop: 8 },
  detailText: { fontSize: 13, color: "#6B7280", marginBottom: 2 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  detailDescription: { fontSize: 13, color: "#4B5563", flex: 1 },
  requestButton: { backgroundColor: "#3B82F6", paddingVertical: 8, borderRadius: 8, marginTop: 10 },
  requestText: { color: "#FFFFFF", fontWeight: "500", textAlign: "center" },
  statusTag: { marginTop: 10, backgroundColor: "#F3F4F6", paddingVertical: 6, borderRadius: 8 },
  statusText: { textAlign: "center", fontWeight: "500", fontSize: 13 },
  approvedCard: { borderLeftWidth: 4, borderLeftColor: "#16A34A" },
  requestedCard: { borderLeftWidth: 4, borderLeftColor: "#F59E0B" },
  inReviewCard: { borderLeftWidth: 4, borderLeftColor: "#3B82F6" },
  pendingCard: { borderLeftWidth: 4, borderLeftColor: "#E5E7EB" },
});
