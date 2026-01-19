import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle, Clock, Info, User, DollarSign, MapPin, Calendar } from "lucide-react-native";

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
  const [project, setProject] = useState<Project>({
    id: "1",
    title: "Mobile App Redesign",
    client: "Acme Corp",
    budget: "$1200",
    deadline: "Dec 2025",
    location: "Remote",
    description: "Redesign a mobile app with modern UI/UX and improve user engagement.",
    milestones: [],
  });


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER SECTION (Deep Indigo) */}
      <View style={styles.darkHeader}>
        <SafeAreaView>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButton}>
              <ArrowLeft color="#F8FAFC" size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{project.title}</Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <User size={14} color="#C7D2FE" />
              <Text style={styles.summaryText}>{project.client}</Text>
            </View>
            <View style={styles.summaryItem}>
              <DollarSign size={14} color="#C7D2FE" />
              <Text style={styles.summaryText}>{project.budget}</Text>
            </View>
            <View style={styles.summaryItem}>
              <MapPin size={14} color="#C7D2FE" />
              <Text style={styles.summaryText}>{project.location}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Calendar size={14} color="#C7D2FE" />
              <Text style={styles.summaryText}>{project.deadline}</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* CONTENT AREA */}
      <ScrollView 
        style={styles.contentBody} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <Text style={styles.sectionTitle}>Project Overview</Text>
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{project.description}</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  
  // Header
  darkHeader: { paddingHorizontal: 20, paddingBottom: 25 },
  navRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#F8FAFC", flex: 1 },
  
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 20, gap: 10 },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1E293B", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#334155" },
  summaryText: { color: "#F8FAFC", fontSize: 12, fontWeight: "600" },

  // Content Body
  contentBody: { flex: 1, backgroundColor: "#F8FAFC", borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 12, marginTop: 10 },
  descriptionCard: { backgroundColor: "#FFF", padding: 16, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: "#E2E8F0" },
  descriptionText: { fontSize: 14, color: "#475569", lineHeight: 22 },

  // Milestone Cards
  milestoneCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  milestoneHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  milestoneIconTitle: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  milestoneTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  milestonePrice: { fontSize: 16, fontWeight: "800", color: "#6366F1" },
  approvedText: { textDecorationLine: "line-through", color: "#94A3B8" },
  
  milestoneBody: { marginBottom: 15 },
  milestoneSubtext: { fontSize: 13, color: "#64748B", fontWeight: "600", marginBottom: 6 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  detailDescription: { fontSize: 13, color: "#94A3B8", flex: 1, lineHeight: 18 },

  requestButton: { backgroundColor: "#6366F1", paddingVertical: 12, borderRadius: 14, shadowColor: "#6366F1", shadowOpacity: 0.2, shadowRadius: 5 },
  requestText: { color: "#FFFFFF", fontWeight: "700", textAlign: "center", fontSize: 14 },
  
  statusTag: { paddingVertical: 10, borderRadius: 14 },
  statusText: { textAlign: "center", fontWeight: "700", fontSize: 13 },

  // Border accents
  approvedCardBorder: { borderLeftWidth: 5, borderLeftColor: "#10B981" },
  activeCardBorder: { borderLeftWidth: 5, borderLeftColor: "#6366F1" },
  pendingCardBorder: { borderLeftWidth: 5, borderLeftColor: "#CBD5E1" },
});