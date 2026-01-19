import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Info, 
  User, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Trash2,
  XCircle 
} from "lucide-react-native";

// --- FAKE DATA FALLBACK ---
const MOCK_PROJECT: Project = {
  id: "3",
  title: "Landing Page Proposal",
  client: "Soylent Corp",
  budget: "$500",
  deadline: "Dec 2025",
  location: "Remote",
  proposalStatus: "shortlisted",
  description: "This is a fallback description shown because the database ID was not found. We need a high-converting landing page for our new organic supplement line.",
  milestones: [],
};

interface Milestone {
  title: string;
  duration: string;
  details: string;
  pricePKR: string;
  priceUSD: string;
  approvalStatus: "pending" | "approved" | "inReview" | "requested" | "rejected";
}

interface Project {
  id: string;
  title: string;
  budget: string;
  deadline: string;
  client: string;
  description: string;
  location: string;
  proposalStatus: "pending" | "viewed" | "shortlisted" | "rejected" | "accepted" | "withdrawn";
  milestones: Milestone[];
}

export default function ProposalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      // Try to get real data from the server
      const response = await axios.get(`${API_BASE_URL}/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.log("Database ID not found, using Mock Data for UI testing.");
      // If the server fails or ID doesn't exist, use the Fake Data
      setProject(MOCK_PROJECT);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawProposal = async () => {
    Alert.alert(
      "Withdraw Proposal",
      "Are you sure you want to withdraw? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: async () => {
            try {
              setIsWithdrawing(true);
              await axios.patch(`${API_BASE_URL}/projects/${id}`, {
                proposalStatus: "withdrawn",
              });
              setProject((prev) => (prev ? { ...prev, proposalStatus: "withdrawn" } : null));
              Alert.alert("Success", "Proposal withdrawn.");
            } catch (e) {
              Alert.alert("Error", "Failed to withdraw.");
            } finally {
              setIsWithdrawing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // Final safety check: if both API and Mock fail, show an error UI instead of a white screen
  if (!project) {
    return (
      <View style={[styles.container, styles.center]}>
        <XCircle color="#DC2626" size={40} />
        <Text style={{color: '#FFF', marginTop: 10}}>Project not found</Text>
      </View>
    );
  }

  const isWithdrawn = project.proposalStatus === "withdrawn";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER SECTION */}
      <View style={styles.darkHeader}>
        <SafeAreaView>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#F8FAFC" size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{project.title}</Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}><User size={14} color="#C7D2FE" /><Text style={styles.summaryText}>{project.client}</Text></View>
            <View style={styles.summaryItem}><DollarSign size={14} color="#C7D2FE" /><Text style={styles.summaryText}>{project.budget}</Text></View>
            <View style={styles.summaryItem}><MapPin size={14} color="#C7D2FE" /><Text style={styles.summaryText}>{project.location}</Text></View>
            <View style={styles.summaryItem}><Calendar size={14} color="#C7D2FE" /><Text style={styles.summaryText}>{project.deadline}</Text></View>
          </View>
        </SafeAreaView>
      </View>

      {/* CONTENT AREA */}
      <ScrollView
        style={styles.contentBody}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Status Alert Banner */}
        {isWithdrawn && (
          <View style={styles.withdrawnBanner}>
            <XCircle color="#DC2626" size={18} />
            <Text style={styles.withdrawnBannerText}>This proposal has been withdrawn.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Project Overview</Text>
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{project.description}</Text>
          
          {!isWithdrawn && project.proposalStatus !== "accepted" && (
            <TouchableOpacity 
                style={styles.withdrawButton} 
                onPress={handleWithdrawProposal}
                disabled={isWithdrawing}
            >
              {isWithdrawing ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Trash2 size={16} color="#DC2626" />
                  <Text style={styles.withdrawText}>Withdraw Proposal</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  center: { justifyContent: "center", alignItems: "center" },
  darkHeader: { paddingHorizontal: 20, paddingBottom: 25 },
  navRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#F8FAFC", flex: 1 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 20, gap: 10 },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1E293B", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#334155" },
  summaryText: { color: "#F8FAFC", fontSize: 12, fontWeight: "600" },
  contentBody: { flex: 1, backgroundColor: "#F8FAFC", borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 12, marginTop: 10 },
  descriptionCard: { backgroundColor: "#FFF", padding: 16, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: "#E2E8F0" },
  descriptionText: { fontSize: 14, color: "#475569", lineHeight: 22 },
  withdrawButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  withdrawText: { color: "#DC2626", fontWeight: "700", fontSize: 13 },
  withdrawnBanner: { backgroundColor: "#FEF2F2", padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15, borderWidth: 1, borderColor: '#FEE2E2' },
  withdrawnBannerText: { color: "#DC2626", fontWeight: "700", fontSize: 13 },
  milestoneCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  milestoneHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  milestoneIconTitle: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  milestoneTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  milestonePrice: { fontSize: 16, fontWeight: "800", color: "#6366F1" },
  approvedText: { textDecorationLine: "line-through", color: "#94A3B8" },
  milestoneBody: { marginBottom: 15 },
  milestoneSubtext: { fontSize: 13, color: "#64748B", fontWeight: "600", marginBottom: 6 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  detailDescription: { fontSize: 13, color: "#94A3B8", flex: 1, lineHeight: 18 },
  statusTag: { paddingVertical: 8, borderRadius: 10 },
  statusText: { textAlign: "center", fontWeight: "800", fontSize: 11, letterSpacing: 0.5 },
  approvedCardBorder: { borderLeftWidth: 5, borderLeftColor: "#10B981" },
  activeCardBorder: { borderLeftWidth: 5, borderLeftColor: "#6366F1" },
  rejectedCardBorder: { borderLeftWidth: 5, borderLeftColor: "#DC2626" },
});