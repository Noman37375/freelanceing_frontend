import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle2, FileText, User, DollarSign, Calendar, MapPin, Award, CircleDollarSign } from "lucide-react-native";

// --- Currency Configuration ---
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, color: '#6366F1' },
  EUR: { symbol: '€', rate: 0.92, color: '#10B981' },
  PKR: { symbol: '₨', rate: 280, color: '#F59E0B' },
};

type CurrencyKey = keyof typeof CURRENCIES;

type Milestone = {
  title: string;
  duration?: string;
  details?: string;
  basePrice: number; // Changed to number for calculation
  status: "completed" | "pending";
};

type Project = {
  id: string;
  title: string;
  client: string;
  baseBudget: number; // Changed to number
  deadline: string;
  status: string;
  location?: string;
  description?: string;
  milestones: Milestone[];
  completedDate?: string;
};

export default function CompletedDetails() {
  const router = useRouter();
  const [curKey, setCurKey] = useState<CurrencyKey>('USD');

  // Static project data with numeric values
  const [project] = useState<Project>({
    id: "1",
    title: "Website Redesign Project",
    client: "Acme Corp",
    baseBudget: 1500,
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
        basePrice: 500,
        status: "completed",
      },
      {
        title: "Frontend Implementation",
        duration: "5 days",
        details: "Develop responsive React components",
        basePrice: 600,
        status: "completed",
      },
      {
        title: "Backend Integration",
        duration: "4 days",
        details: "Connect frontend with API endpoints",
        basePrice: 400,
        status: "completed",
      },
    ],
  });

  // --- Currency Conversion Logic ---
  const switchCurrency = () => {
    const keys = Object.keys(CURRENCIES) as CurrencyKey[];
    setCurKey(keys[(keys.indexOf(curKey) + 1) % keys.length]);
  };

  const activeRate = CURRENCIES[curKey].rate;
  const activeSymbol = CURRENCIES[curKey].symbol;

  const formatPrice = (val: number) => 
    `${activeSymbol}${(val * activeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* INDIGO HEADER */}
      <View style={styles.darkHeader}>
        <SafeAreaView edges={['top']}>
          <View style={styles.navRow}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <ArrowLeft color="#F8FAFC" size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Project Archive</Text>

            {/* Currency Switcher Pill */}
            <TouchableOpacity style={styles.currencyToggle} onPress={switchCurrency}>
              <CircleDollarSign size={16} color="#FFF" />
              <Text style={styles.currencyLabel}>{curKey}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.tag}>
              <User size={12} color="#C7D2FE" />
              <Text style={styles.tagText}>{project.client}</Text>
            </View>
            <View style={styles.tag}>
              <DollarSign size={12} color="#C7D2FE" />
              <Text style={styles.tagText}>{formatPrice(project.baseBudget)}</Text>
            </View>
            <View style={styles.tag}>
              <MapPin size={12} color="#C7D2FE" />
              <Text style={styles.tagText}>{project.location}</Text>
            </View>
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
          <Text style={styles.description}>{project.description}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.deadlineRow}>
            <Calendar size={16} color="#6366F1" />
            <Text style={styles.deadlineText}>Final Deadline: {project.deadline}</Text>
          </View>
        </View>

        {/* Milestones Section */}
        <View style={styles.sectionHeader}>
          <FileText size={18} color="#6366F1" />
          <Text style={styles.sectionTitle}>Completed Milestones</Text>
        </View>

        {project.milestones.map((m, i) => (
          <View key={i} style={styles.milestoneItem}>
            <View style={styles.milestoneTop}>
              <View style={styles.milestoneLeft}>
                <CheckCircle2 size={20} color="#10B981" />
                <Text style={styles.milestoneTitle}>{m.title}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>PAID</Text>
              </View>
            </View>

            <Text style={styles.milestoneDetail}>{m.details}</Text>

            <View style={styles.milestoneFooter}>
              <Text style={styles.footerInfo}>⏳ {m.duration}</Text>
              <Text style={styles.footerPrice}>{formatPrice(m.basePrice)}</Text>
            </View>
          </View>
        ))}

        {/* Completion Success Card */}
        <View style={styles.successCard}>
          <Award size={24} color="#FFF" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.successTitle}>Project Fully Completed</Text>
            <Text style={styles.successDate}>Archive Date: {project.completedDate}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  
  darkHeader: { paddingHorizontal: 20, paddingBottom: 20 },
  navRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#F8FAFC", flex: 1 },
  
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

  summaryGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 15, gap: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(99, 102, 241, 0.2)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tagText: { color: "#C7D2FE", fontSize: 12, fontWeight: "600" },

  contentBody: { flex: 1, backgroundColor: "#F8FAFC", borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  mainCard: { backgroundColor: "#FFF", padding: 20, borderRadius: 24, marginBottom: 20, marginTop: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  projectTitle: { fontSize: 22, fontWeight: "800", color: "#1E293B", marginBottom: 8 },
  description: { fontSize: 14, color: "#64748B", lineHeight: 22 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 15 },
  deadlineRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  deadlineText: { fontSize: 13, fontWeight: "700", color: "#6366F1" },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 15, paddingLeft: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },

  milestoneItem: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0", borderLeftWidth: 5, borderLeftColor: "#10B981" },
  milestoneTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  milestoneLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  milestoneTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  statusBadge: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "800", color: "#10B981" },
  milestoneDetail: { fontSize: 13, color: "#94A3B8", marginTop: 8, lineHeight: 18 },
  milestoneFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F8FAFC" },
  footerInfo: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  footerPrice: { fontSize: 13, color: "#1E293B", fontWeight: "800" },

  successCard: { backgroundColor: "#6366F1", flexDirection: "row", alignItems: "center", padding: 20, borderRadius: 20, marginTop: 10 },
  successTitle: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  successDate: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" }
});