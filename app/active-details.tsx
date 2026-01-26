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
import { ArrowLeft, CheckCircle, Clock, Info, User, DollarSign, MapPin, Calendar, CircleDollarSign } from "lucide-react-native";
import { useRouter } from "expo-router"; // Import router

// --- Currency Configuration ---
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, color: '#6366F1' },
  EUR: { symbol: '€', rate: 0.92, color: '#10B981' },
  PKR: { symbol: '₨', rate: 280, color: '#F59E0B' },
};

type CurrencyKey = keyof typeof CURRENCIES;

interface Milestone {
  title: string;
  duration: string;
  details: string;
  basePrice: number; // Changed to number for calculation
  approvalStatus: "pending" | "approved" | "inReview" | "requested";
}

interface Project {
  id: string;
  title: string;
  baseBudget: number; // Changed to number
  deadline: string;
  client: string;
  description: string;
  location: string;
  milestones: Milestone[];
}

export default function AvailableDetailsScreen() {
  const router = useRouter(); // Initialize router for back navigation
  const [curKey, setCurKey] = useState<CurrencyKey>('USD');

  const [project, setProject] = useState<Project>({
    id: "1",
    title: "Mobile App Redesign",
    client: "Acme Corp",
    baseBudget: 1200,
    deadline: "Dec 2025",
    location: "Remote",
    description: "Redesign a mobile app with modern UI/UX and improve user engagement.",
    milestones: [
      {
        title: "UI Design",
        duration: "2 weeks",
        details: "Create wireframes and final design assets.",
        basePrice: 300,
        approvalStatus: "approved",
      },
      {
        title: "Prototype",
        duration: "1 week",
        details: "Build interactive prototype for client testing.",
        basePrice: 200,
        approvalStatus: "pending",
      },
      {
        title: "Final Implementation",
        duration: "3 weeks",
        details: "Implement the design in React Native.",
        basePrice: 500,
        approvalStatus: "requested",
      },
    ],
  });

  // --- Currency Logic ---
  const switchCurrency = () => {
    const keys = Object.keys(CURRENCIES) as CurrencyKey[];
    setCurKey(keys[(keys.indexOf(curKey) + 1) % keys.length]);
  };

  const activeRate = CURRENCIES[curKey].rate;
  const activeSymbol = CURRENCIES[curKey].symbol;

  const formatPrice = (val: number) => 
    `${activeSymbol}${(val * activeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER SECTION */}
      <View style={styles.darkHeader}>
        <SafeAreaView edges={['top']}>
          <View style={styles.navRow}>
            {/* FIXED: Back button now works */}
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <ArrowLeft color="#F8FAFC" size={22} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle} numberOfLines={1}>{project.title}</Text>
            
            {/* Added Currency Switcher in Header */}
            <TouchableOpacity style={styles.currencyToggle} onPress={switchCurrency}>
              <CircleDollarSign size={16} color="#FFF" />
              <Text style={styles.currencyLabel}>{curKey}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <User size={14} color="#C7D2FE" />
              <Text style={styles.summaryText}>{project.client}</Text>
            </View>
            <View style={styles.summaryItem}>
              <DollarSign size={14} color="#C7D2FE" />
              <Text style={styles.summaryText}>{formatPrice(project.baseBudget)}</Text>
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

        <Text style={styles.sectionTitle}>Milestones</Text>

        {project.milestones.map((m, index) => (
          <View
            key={index}
            style={[
              styles.milestoneCard,
              m.approvalStatus === "approved" ? styles.approvedCardBorder : 
              m.approvalStatus === "pending" ? styles.pendingCardBorder : styles.activeCardBorder
            ]}
          >
            <View style={styles.milestoneHeader}>
              <View style={styles.milestoneIconTitle}>
                {m.approvalStatus === "approved" ? (
                  <CheckCircle color="#10B981" size={20} />
                ) : (
                  <Clock color={m.approvalStatus === "pending" ? "#94A3B8" : "#6366F1"} size={20} />
                )}
                <Text style={[
                  styles.milestoneTitle,
                  m.approvalStatus === "approved" && styles.approvedText
                ]}>
                  {m.title}
                </Text>
              </View>
              {/* Dynamic Milestone Price */}
              <Text style={styles.milestonePrice}>{formatPrice(m.basePrice)}</Text>
            </View>

            <View style={styles.milestoneBody}>
              <Text style={styles.milestoneSubtext}>Duration: {m.duration}</Text>
              <View style={styles.detailRow}>
                <Info color="#94A3B8" size={14} />
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
              <View style={[
                styles.statusTag, 
                { backgroundColor: m.approvalStatus === 'approved' ? '#ECFDF5' : '#EEF2FF' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: m.approvalStatus === "approved" ? "#10B981" : "#6366F1" }
                ]}>
                  {m.approvalStatus === "approved" ? "Approved" : 
                   m.approvalStatus === "inReview" ? "In Review" : "Approval Requested"}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  darkHeader: { paddingHorizontal: 20, paddingBottom: 25 },
  navRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#F8FAFC", flex: 1 },
  
  currencyToggle: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: '#1E293B', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  currencyLabel: { color: '#FFF', fontWeight: '800', fontSize: 12 },

  summaryGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 20, gap: 10 },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1E293B", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#334155" },
  summaryText: { color: "#F8FAFC", fontSize: 12, fontWeight: "600" },

  contentBody: { flex: 1, backgroundColor: "#F8FAFC", borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 12, marginTop: 10 },
  descriptionCard: { backgroundColor: "#FFF", padding: 16, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: "#E2E8F0" },
  descriptionText: { fontSize: 14, color: "#475569", lineHeight: 22 },

  milestoneCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0", elevation: 2 },
  milestoneHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  milestoneIconTitle: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  milestoneTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  milestonePrice: { fontSize: 16, fontWeight: "800", color: "#6366F1" },
  approvedText: { textDecorationLine: "line-through", color: "#94A3B8" },
  
  milestoneBody: { marginBottom: 15 },
  milestoneSubtext: { fontSize: 13, color: "#64748B", fontWeight: "600", marginBottom: 6 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  detailDescription: { fontSize: 13, color: "#94A3B8", flex: 1, lineHeight: 18 },

  requestButton: { backgroundColor: "#6366F1", paddingVertical: 12, borderRadius: 14 },
  requestText: { color: "#FFFFFF", fontWeight: "700", textAlign: "center", fontSize: 14 },
  
  statusTag: { paddingVertical: 10, borderRadius: 14 },
  statusText: { textAlign: "center", fontWeight: "700", fontSize: 13 },

  approvedCardBorder: { borderLeftWidth: 5, borderLeftColor: "#10B981" },
  activeCardBorder: { borderLeftWidth: 5, borderLeftColor: "#6366F1" },
  pendingCardBorder: { borderLeftWidth: 5, borderLeftColor: "#CBD5E1" },
});