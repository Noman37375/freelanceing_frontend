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
  User, 
  DollarSign, 
  Calendar, 
  Trash2,
  XCircle,
  FileText,
  CircleDollarSign,
  Layers,
  AlertCircle,
  CheckCircle2
} from "lucide-react-native";

// --- Currency Configuration ---
const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  PKR: { symbol: '₨', rate: 280 },
};

type CurrencyKey = keyof typeof CURRENCIES;

interface Milestone {
  title: string;
  duration: string;
  details: string;
  basePrice: number;
}

interface Project {
  id: string;
  title: string;
  baseBudget: number;
  deadline: string;
  client: string;
  description: string;
  location: string;
  coverLetter: string;
  proposalStatus: "pending" | "viewed" | "shortlisted" | "rejected" | "accepted" | "withdrawn";
  milestones: Milestone[];
}

const MOCK_PROJECT: Project = {
  id: "3",
  title: "Landing Page Proposal",
  client: "Soylent Corp",
  baseBudget: 500,
  deadline: "Dec 2025",
  location: "Remote",
  proposalStatus: "shortlisted", // Change this to test different UI states
  coverLetter: "Hi there! I have extensive experience building high-conversion landing pages. I can ensure a mobile-first design that loads in under 2 seconds.",
  description: "We need a high-converting landing page for our new organic supplement line.",
  milestones: [
    { title: "Initial Wireframes", duration: "3 days", details: "Basic layout structure.", basePrice: 150 },
    { title: "Final UI Design", duration: "1 week", details: "High fidelity designs.", basePrice: 350 }
  ],
};

export default function ProposalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [curKey, setCurKey] = useState<CurrencyKey>('USD');

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      setProject(MOCK_PROJECT);
    } finally {
      setLoading(false);
    }
  };

  const switchCurrency = () => {
    const keys = Object.keys(CURRENCIES) as CurrencyKey[];
    setCurKey(keys[(keys.indexOf(curKey) + 1) % keys.length]);
  };

  const activeRate = CURRENCIES[curKey].rate;
  const activeSymbol = CURRENCIES[curKey].symbol;

  const formatPrice = (val: number) => 
    `${activeSymbol}${(val * activeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  // --- Status UI Logic ---
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "accepted":
        return { label: "PROPOSAL ACCEPTED", color: "#10B981", bg: "#ECFDF5", icon: <CheckCircle2 size={16} color="#10B981" /> };
      case "rejected":
        return { label: "PROPOSAL DECLINED", color: "#EF4444", bg: "#FEF2F2", icon: <XCircle size={16} color="#EF4444" /> };
      case "withdrawn":
        return { label: "WITHDRAWN", color: "#64748B", bg: "#F1F5F9", icon: <AlertCircle size={16} color="#64748B" /> };
      case "shortlisted":
        return { label: "SHORTLISTED", color: "#6366F1", bg: "#EEF2FF", icon: <Layers size={16} color="#6366F1" /> };
      default:
        return { label: "STILL PROPOSED", color: "#F59E0B", bg: "#FFFBEB", icon: <Clock size={16} color="#F59E0B" /> };
    }
  };

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#6366F1" /></View>;
  if (!project) return <View style={[styles.container, styles.center]}><XCircle color="#DC2626" size={40} /><Text style={{color: '#FFF', marginTop: 10}}>Not Found</Text></View>;

  const statusInfo = getStatusConfig(project.proposalStatus);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.darkHeader}>
        <SafeAreaView edges={['top']}>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#F8FAFC" size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>Proposal Details</Text>
            <TouchableOpacity style={styles.currencyToggle} onPress={switchCurrency}>
              <CircleDollarSign size={16} color="#FFF" />
              <Text style={styles.currencyLabel}>{curKey}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}><User size={12} color="#C7D2FE" /><Text style={styles.summaryText}>{project.client}</Text></View>
            <View style={styles.summaryItem}><DollarSign size={12} color="#C7D2FE" /><Text style={styles.summaryText}>Bid: {formatPrice(project.baseBudget)}</Text></View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.contentBody} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        
        {/* --- MAIN PROPOSAL STATUS BADGE --- */}
        <View style={[styles.statusBanner, { backgroundColor: statusInfo.bg, borderColor: statusInfo.color + '40' }]}>
          {statusInfo.icon}
          <Text style={[styles.statusBannerText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>

        {/* COVER LETTER */}
        <View style={styles.sectionHeader}>
            <FileText size={18} color="#6366F1" />
            <Text style={styles.sectionTitle}>Your Cover Letter</Text>
        </View>
        <View style={styles.letterCard}>
          <Text style={styles.letterText}>{project.coverLetter}</Text>
        </View>

        {/* DESCRIPTION & WITHDRAW */}
        <Text style={styles.sectionTitle}>Project Overview</Text>
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{project.description}</Text>
          {(project.proposalStatus === "pending" || project.proposalStatus === "shortlisted") && (
            <TouchableOpacity style={styles.withdrawButton} onPress={() => Alert.alert("Withdraw", "Confirm withdrawal?", [{text: 'Cancel'}, {text: 'Withdraw', style: 'destructive'}])}>
               <Trash2 size={16} color="#DC2626" />
               <Text style={styles.withdrawText}>Withdraw Proposal</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* MILESTONES */}
        <View style={styles.sectionHeader}>
            <Layers size={18} color="#6366F1" />
            <Text style={styles.sectionTitle}>Proposed Milestones</Text>
        </View>

        {project.milestones?.map((m, index) => (
          <View key={index} style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneTitle}>{m.title}</Text>
              <Text style={styles.milestonePrice}>{formatPrice(m.basePrice)}</Text>
            </View>
            <Text style={styles.milestoneSubtext}>Duration: {m.duration}</Text>
            <Text style={styles.detailDescription}>{m.details}</Text>
            <View style={styles.proposedBadge}>
              <Text style={styles.proposedText}>MILESTONE {index + 1}</Text>
            </View>
          </View>
        ))}
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
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#F8FAFC", flex: 1 },
  currencyToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  currencyLabel: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 15, gap: 8 },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1E293B", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  summaryText: { color: "#C7D2FE", fontSize: 11, fontWeight: "600" },

  contentBody: { flex: 1, backgroundColor: "#F8FAFC", borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  
  // New Status Banner
  statusBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, marginBottom: 20, marginTop: 5, borderWidth: 1 },
  statusBannerText: { fontWeight: "900", fontSize: 13, letterSpacing: 1 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B", marginVertical: 12 },
  letterCard: { backgroundColor: "#FFF", padding: 18, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: "#E2E8F0", borderLeftWidth: 4, borderLeftColor: '#6366F1' },
  letterText: { fontSize: 14, color: "#475569", lineHeight: 22 },
  descriptionCard: { backgroundColor: "#FFF", padding: 16, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  descriptionText: { fontSize: 14, color: "#64748B", lineHeight: 22 },
  withdrawButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  withdrawText: { color: "#DC2626", fontWeight: "700", fontSize: 12 },
  milestoneCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  milestoneHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  milestoneTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  milestonePrice: { fontSize: 15, fontWeight: "800", color: "#6366F1" },
  milestoneSubtext: { fontSize: 12, color: "#6366F1", fontWeight: "700", marginBottom: 4 },
  detailDescription: { fontSize: 13, color: "#94A3B8", lineHeight: 18, marginBottom: 10 },
  proposedBadge: { backgroundColor: "#F8FAFC", paddingVertical: 4, borderRadius: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  proposedText: { textAlign: "center", fontWeight: "800", fontSize: 10, color: '#CBD5E1' },
});