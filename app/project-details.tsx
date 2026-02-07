import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  MapPin,
  Clock,
  DollarSign,
  User,
  Briefcase,
  Calendar,
  Layers
} from "lucide-react-native";
import { projectService } from "@/services/projectService";
import { Project, getProjectDisplayStatus } from "@/models/Project";
import { useAuth } from "@/contexts/AuthContext";
import SectionCard from "@/components/SectionCard";

export default function ProjectDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const fetchedProject = await projectService.getProjectById(id);
        setProject(fetchedProject || null);
      } catch (error) {
        console.error("Failed to fetch project:", error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Briefcase size={64} color="#CBD5E1" />
          <Text style={styles.errorText}>Project not found</Text>
          <Text style={styles.errorSubtext}>
            This project may have been removed or is no longer available.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Browse Projects</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isFreelancer = user?.role === 'Freelancer';
  const showBidButton = isFreelancer && project.status === 'ACTIVE' && !project.freelancerId;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Job Details</Text>
          {/* <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={20} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Bookmark size={20} color="#64748B" />
            </TouchableOpacity>
          </View> */}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Title Section */}
          <View style={styles.mainSection}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{getProjectDisplayStatus(project)}</Text>
            </View>
            <Text style={styles.projectTitle}>{project.title}</Text>

            <View style={styles.metaRow}>
              {project.createdAt && (
                <View style={styles.metaItem}>
                  <Clock size={14} color="#64748B" />
                  <Text style={styles.metaText}>Posted recently</Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Layers size={14} color="#64748B" />
                <Text style={styles.metaText}>{project.bidsCount || 0} Proposals</Text>
              </View>
            </View>
          </View>

          {/* Budget Card */}
          <View style={styles.budgetCard}>
            <View style={styles.budgetContent}>
              <Text style={styles.budgetLabel}>Fixed Price</Text>
              <Text style={styles.budgetAmount}>${project.budget}</Text>
            </View>
            <View style={styles.budgetIconWrapper}>
              <DollarSign size={24} color="#fff" />
            </View>
          </View>

          {/* Details Grid */}
          <View style={styles.gridContainer}>
            {project.location && (
              <View style={styles.gridItem}>
                <MapPin size={20} color="#0F172A" />
                <Text style={styles.gridLabel}>Location</Text>
                <Text style={styles.gridValue}>{project.location}</Text>
              </View>
            )}
            <View style={styles.gridItem}>
              <Calendar size={20} color="#0F172A" />
              <Text style={styles.gridLabel}>Duration</Text>
              <Text style={styles.gridValue}>{project.duration || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionHeading}>Job Description</Text>
          <Text style={styles.descriptionText}>{project.description}</Text>

          {/* Skills */}
          {project.tags && project.tags.length > 0 && (
            <View style={styles.skillsSection}>
              <Text style={styles.sectionHeading}>Skills Required</Text>
              <View style={styles.skillsList}>
                {project.tags.map((tag, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Client Info */}
          {/* {project.client && (
            <View style={styles.clientSection}>
              <Text style={styles.sectionHeading}>About the Client</Text>
              <View style={styles.clientCard}>
                <View style={styles.clientAvatar}>
                  <User size={24} color="#64748B" />
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{project.client.userName}</Text>
                  <Text style={styles.clientMeta}>Verified Client</Text>
                </View>
              </View>
            </View>
          )} */}

          {/* Padding for bottom buttons */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Action Button */}
        {showBidButton && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.bidButton}
              onPress={() => router.push(`/Bid-now?id=${project.id}` as any)}
            >
              <Text style={styles.bidButtonText}>Submit Proposal</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1, textAlign: 'center' },
  headerActions: { flexDirection: 'row', gap: 12 },
  backButton: { padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  actionButton: { padding: 8 },

  scrollContent: { paddingHorizontal: 20 },

  mainSection: { marginTop: 10, marginBottom: 24 },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: { color: '#15803D', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  projectTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', lineHeight: 32, marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#64748B', fontSize: 14, fontWeight: '500' },

  budgetCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 8px 16px rgba(79, 70, 229, 0.3)',
      },
    }),
  },
  budgetContent: {},
  budgetLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  budgetAmount: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  budgetIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  gridContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  gridItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  gridLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  gridValue: { color: '#1E293B', fontSize: 15, fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 24 },

  sectionHeading: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  descriptionText: { fontSize: 16, color: '#475569', lineHeight: 26, marginBottom: 32 },

  skillsSection: { marginBottom: 32 },
  skillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  skillText: { color: '#475569', fontSize: 14, fontWeight: '600' },

  clientSection: { marginBottom: 32 },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clientInfo: {},
  clientName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  clientMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...Platform.select({
      ios: { paddingBottom: 32 },
    }),
  },
  bidButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(79, 70, 229, 0.3)',
      },
    }),
  },
  bidButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  errorText: { fontSize: 20, fontWeight: "700", color: "#1E293B", marginTop: 20, marginBottom: 8 },
  errorSubtext: { fontSize: 15, color: "#64748B", textAlign: "center", marginBottom: 32, lineHeight: 22 },
  primaryButton: { backgroundColor: "#0F172A", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
});
