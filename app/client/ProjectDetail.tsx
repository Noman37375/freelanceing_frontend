import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import {
  ArrowLeft,
  User,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { projectService } from '@/services/projectService';
import { Project, getProjectDisplayStatus } from '@/models/Project';
import { COLORS } from '@/utils/constants';

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const fetchedProject = await projectService.getProjectById(id);
        setProject(fetchedProject);
      } catch (error: any) {
        console.error('Failed to fetch project:', error);
        Alert.alert('Error', error.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Project not found</Text>
          <TouchableOpacity style={styles.backButtonStyle} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* TITLE */}
        <View style={styles.titleCard}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.statusText}>{project.status}</Text>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <DollarSign size={18} color="#6B7280" strokeWidth={2} />
              <View>
                <Text style={styles.infoLabel}>Budget</Text>
                <Text style={styles.infoValue}>${project.budget}</Text>
              </View>
            </View>

            {project.duration && (
              <View style={styles.infoItem}>
                <Calendar size={18} color="#6B7280" strokeWidth={2} />
                <View>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{project.duration}</Text>
                </View>
              </View>
            )}

            {project.location && (
              <View style={styles.infoItem}>
                <Clock size={18} color="#6B7280" strokeWidth={2} />
                <View>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{project.location}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* STATUS INFO */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={[styles.statusBadge, { 
                backgroundColor: getProjectDisplayStatus(project) === 'Active' ? COLORS.primary : 
                                 getProjectDisplayStatus(project) === 'Completed' ? COLORS.success :
                                 getProjectDisplayStatus(project) === 'In Progress' ? COLORS.primaryDark : COLORS.gray500 
              }]}>
                <Text style={styles.statusText}>{getProjectDisplayStatus(project)}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bids</Text>
              <Text style={styles.infoValue}>{project.bidsCount || 0}</Text>
            </View>
          </View>
        </View>

        {/* FREELANCER */}
        {project.freelancer && (
          <View style={styles.freelancerCard}>
            <View style={styles.freelancerHeader}>
              <View style={styles.avatarContainer}>
                <User size={24} color="#282A32" strokeWidth={2} />
              </View>
              <View style={styles.freelancerInfo}>
                <Text style={styles.freelancerName}>{project.freelancer.userName || 'Freelancer'}</Text>
                {project.freelancer.email && (
                  <Text style={styles.freelancerStats}>{project.freelancer.email}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.messageButton} onPress={() => {
            }} disabled>
              <MessageSquare size={18} color={COLORS.primary} strokeWidth={2} />
              <Text style={styles.messageButtonText}>Messaging disabled</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DESCRIPTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{project.description}</Text>
        </View>

        {/* TAGS */}
        {project.tags && project.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills/Tags</Text>
            <View style={styles.tagsContainer}>
              {project.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* CATEGORY */}
        {project.category && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <Text style={styles.categoryText}>{project.category}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ================= STYLES (same as before) ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: COLORS.white, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 3 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gray800 },
  content: { flex: 1 },
  titleCard: { margin: 20, padding: 20, backgroundColor: COLORS.white, borderRadius: 16, elevation: 3 },
  projectTitle: { fontSize: 22, fontWeight: '700', color: COLORS.gray800 },
  statusBadge: { marginTop: 12, padding: 6, borderRadius: 8 },
  statusText: { color: '#FFF', fontWeight: '600' },
  infoCard: { marginHorizontal: 20, marginBottom: 20, padding: 20, backgroundColor: COLORS.white, borderRadius: 16 },
  infoRow: { flexDirection: 'row', gap: 24 },
  infoItem: { flexDirection: 'row', gap: 12 },
  infoLabel: { fontSize: 12, color: COLORS.gray500 },
  infoValue: { fontSize: 16, fontWeight: '700' },
  freelancerCard: { marginHorizontal: 20, marginBottom: 20, padding: 20, backgroundColor: COLORS.white, borderRadius: 16 },
  freelancerHeader: { flexDirection: 'row', marginBottom: 16 },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  freelancerInfo: { flex: 1 },
  freelancerName: { fontSize: 18, fontWeight: '700' },
  freelancerStats: { color: COLORS.gray500 },
  messageButton: { flexDirection: 'row', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary, opacity: 0.6 },
  messageButtonText: { color: COLORS.primary, fontWeight: '600' },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  description: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, color: COLORS.gray500 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: COLORS.gray100, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 12, color: COLORS.primaryDark, fontWeight: '500' },
  categoryText: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, color: COLORS.gray700, fontSize: 16, fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.gray100 },
  loadingText: { marginTop: 12, color: COLORS.gray500, fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, color: COLORS.gray700, marginBottom: 20 },
  backButtonStyle: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
