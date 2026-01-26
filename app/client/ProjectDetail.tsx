import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import {
  ArrowLeft,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Globe
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// --- DATA & CONVERSION LOGIC ---
const EXCHANGE_RATES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  PKR: { symbol: 'Rs', rate: 278.50 },
};

const PROJECTS_DATA = [
  {
    id: '1',
    title: 'Mobile App UI/UX Design',
    description: 'Looking for an experienced UI/UX designer to create a modern and intuitive fitness tracking application. Need complete wireframes and high-fidelity mockups.',
    budget: 2500,
    status: 'In Progress',
    freelancer: { name: 'Sarah Johnson', rating: 4.9, completedProjects: 127 },
    deadline: 'Dec 20, 2025',
    milestones: [
      { id: 'm1', title: 'Research & Wireframes', amount: 500, status: 'completed', dueDate: 'Dec 5, 2025' },
      { id: 'm2', title: 'High-Fidelity Mockups', amount: 1500, status: 'in-progress', dueDate: 'Dec 12, 2025' },
      { id: 'm3', title: 'Final Handoff', amount: 500, status: 'pending', dueDate: 'Dec 20, 2025' },
    ],
  },
  {
    id: '2',
    title: 'E-commerce Website Development',
    description: 'Full-stack development of a React-based e-commerce platform with Stripe integration and admin dashboard.',
    budget: 5000,
    status: 'Active',
    freelancer: { name: 'Michael Chen', rating: 4.8, completedProjects: 85 },
    deadline: 'Dec 28, 2025',
    milestones: [
      { id: 'm4', title: 'Database Schema', amount: 1000, status: 'completed', dueDate: 'Dec 10, 2025' },
      { id: 'm5', title: 'API Implementation', amount: 4000, status: 'in-progress', dueDate: 'Dec 28, 2025' },
    ],
  },
  {
    id: '3',
    title: 'Logo Design & Branding',
    description: 'Minimalist branding package including logo variations, color palette, and brand guidelines for a tech startup.',
    budget: 800,
    status: 'Completed',
    freelancer: { name: 'Emma Davis', rating: 5.0, completedProjects: 210 },
    deadline: 'Dec 10, 2025',
    milestones: [
      { id: 'm6', title: 'Brand Identity', amount: 800, status: 'completed', dueDate: 'Dec 10, 2025' },
    ],
  },
  {
    id: '4',
    title: 'SEO Optimization & Content',
    description: 'Comprehensive SEO audit and content strategy to improve organic traffic and search engine rankings.',
    budget: 1200,
    status: 'In Progress',
    freelancer: { name: 'David Wilson', rating: 4.7, completedProjects: 64 },
    deadline: 'Dec 18, 2025',
    milestones: [
      { id: 'm7', title: 'SEO Audit', amount: 400, status: 'completed', dueDate: 'Dec 05, 2025' },
      { id: 'm8', title: 'Content Writing', amount: 800, status: 'in-progress', dueDate: 'Dec 18, 2025' },
    ],
  },
  {
    id: '5',
    title: 'Social Media Marketing',
    description: 'Managing Instagram and LinkedIn campaigns to drive engagement and lead generation for the Q1 period.',
    budget: 1800,
    status: 'Active',
    freelancer: { name: 'Lisa Anderson', rating: 4.9, completedProjects: 92 },
    deadline: 'Dec 25, 2025',
    milestones: [
      { id: 'm9', title: 'Campaign Setup', amount: 600, status: 'completed', dueDate: 'Dec 12, 2025' },
      { id: 'm10', title: 'Ad Management', amount: 1200, status: 'in-progress', dueDate: 'Dec 25, 2025' },
    ],
  },
];

export default function ProjectDetail() {
  const router = useRouter();
  const { id, currency = 'USD' } = useLocalSearchParams<{ id: string, currency: keyof typeof EXCHANGE_RATES }>();
  
  const project = PROJECTS_DATA.find((p) => p.id === id);

  const formatMoney = (val: number) => {
    const config = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || EXCHANGE_RATES.USD;
    return `${config.symbol}${Math.round(val * config.rate).toLocaleString()}`;
  };

  if (!project) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#94A3B8" />
        <Text style={styles.errorText}>Project not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={{color: '#6366F1', fontWeight: '700'}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        <View style={styles.currencyBadge}>
            <Globe size={12} color="#6366F1" />
            <Text style={styles.currencyText}>{currency}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
        {/* HERO SECTION */}
        <View style={styles.heroCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: project.status === 'Completed' ? '#DCFCE7' : '#EEF2FF' }]}>
              <Text style={[styles.statusText, { color: project.status === 'Completed' ? '#10B981' : '#6366F1' }]}>
                {project.status}
              </Text>
            </View>
            <Text style={styles.deadlineText}>Due {project.deadline}</Text>
          </View>
          
          <Text style={styles.projectTitle}>{project.title}</Text>
          
          <View style={styles.priceContainer}>
             <Text style={styles.priceLabel}>Total Budget</Text>
             <Text style={styles.priceValue}>{formatMoney(project.budget)}</Text>
          </View> 
        </View>

        {/* FREELANCER CARD */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>FREELANCER</Text>
          <View style={styles.freelancerRow}>
            <View style={styles.avatar}>
              <User size={24} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.freelancerName}>{project.freelancer.name}</Text>
              <Text style={styles.freelancerStats}>⭐ {project.freelancer.rating} • {project.freelancer.completedProjects} Projects</Text>
            </View>
            <TouchableOpacity style={styles.msgBtn}>
              <MessageSquare size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* DESCRIPTION */}
        <View style={styles.card}>
            <Text style={styles.cardLabel}>DESCRIPTION</Text>
            <Text style={styles.descriptionText}>{project.description}</Text>
        </View>

        {/* MILESTONES */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>MILESTONES ({project.milestones.length})</Text>
          {project.milestones.map((m, idx) => (
            <View key={m.id} style={styles.mStoneRow}>
                <View style={styles.mStoneIconCol}>
                    {m.status === 'completed' ? <CheckCircle2 size={20} color="#10B981" /> : <Clock size={20} color="#94A3B8" />}
                    {idx < project.milestones.length - 1 && <View style={styles.mLine} />}
                </View>
                <View style={styles.mStoneContent}>
                    <View style={styles.mStoneHeader}>
                        <Text style={styles.mStoneTitle}>{m.title}</Text>
                        <Text style={styles.mStonePrice}>{formatMoney(m.amount)}</Text>
                    </View>
                    <Text style={styles.mStoneDate}>Deadline: {m.dueDate}</Text>
                </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9'
  },
  backButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  currencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  currencyText: { fontSize: 12, fontWeight: '800', color: '#6366F1' },
  
  content: { flex: 1, padding: 20 },
  heroCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '700' },
  deadlineText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  projectTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginBottom: 20 },
  priceContainer: { borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 16 },
  priceLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  priceValue: { fontSize: 28, fontWeight: '900', color: '#1E293B' },

  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  cardLabel: { fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 1, marginBottom: 15 },
  freelancerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  freelancerName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  freelancerStats: { fontSize: 13, color: '#64748B' },
  msgBtn: { width: 40, height: 40, borderRadius: 10, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  
  descriptionText: { fontSize: 15, color: '#475569', lineHeight: 22 },
  
  mStoneRow: { flexDirection: 'row', gap: 12 },
  mStoneIconCol: { alignItems: 'center', width: 24 },
  mLine: { width: 2, flex: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
  mStoneContent: { flex: 1, paddingBottom: 20 },
  mStoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mStoneTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  mStonePrice: { fontSize: 14, fontWeight: '800', color: '#6366F1' },
  mStoneDate: { fontSize: 12, color: '#94A3B8', marginTop: 4 },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  errorText: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  backLink: { marginTop: 10 }
});