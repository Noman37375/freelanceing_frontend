import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  User,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  CheckCircle,
  Circle,
  Briefcase,
  Tag,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { projectService } from '@/services/projectService';
import { Project, Milestone, getProjectDisplayStatus } from '@/models/Project';
import { formatCurrency } from '@/utils/helpers';
import { COLORS } from '@/utils/constants';
import { milestoneService } from '@/services/projectService';

function normalizeRouteId(raw: string | string[] | undefined): string | undefined {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

export default function ProjectDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = normalizeRouteId(params.id);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);

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

  useEffect(() => {
    const fetchMilestones = async () => {
      if (!id) return;
      try {
        setMilestonesLoading(true);
        const fetchedMilestones = await milestoneService.getMilestonesByProjectId(id);
        setMilestones(fetchedMilestones || []);
      } catch (err) {
        console.error('Failed to fetch milestones:', err);
      } finally {
        setMilestonesLoading(false);
      }
    };

    fetchMilestones();
  }, [id]);

  const getMilestoneStatusConfig = (status: string) => {
    switch (status) {
      case 'funded':      return { label: 'Funded',      color: '#0891B2', bg: '#ECFEFF', border: '#67E8F9' };
      case 'in_progress': return { label: 'In Progress', color: '#4F46E5', bg: '#EEF2FF', border: '#818CF8' };
      case 'in_review':
      case 'submitted':   return { label: 'In Review',   color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' };
      case 'approved':
      case 'released':    return { label: 'Accepted',     color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' };
      case 'disputed':    return { label: 'Disputed',    color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' };
      case 'pending':     return { label: 'Open',        color: '#475569', bg: '#F8FAFC', border: '#CBD5E1' };
      default:            return { label: 'Open',        color: '#94A3B8', bg: '#F8FAFC', border: '#CBD5E1' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in progress':
        return { bg: '#E8F5E9', text: '#2E7D32', border: '#4CAF50' };
      case 'completed':
        return { bg: '#E3F2FD', text: '#1565C0', border: '#2196F3' };
      case 'pending':
        return { bg: '#FFF3E0', text: '#E65100', border: '#FF9800' };
      default:
        return { bg: '#F5F5F5', text: '#616161', border: '#9E9E9E' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading project details...</Text>
          <Text style={styles.loadingSubtext}>Please wait</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#1F2937" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Project not found</Text>
          <Text style={styles.errorSubtext}>The project you're looking for doesn't exist</Text>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = getStatusColor(getProjectDisplayStatus(project));

  return (
    <SafeAreaView style={styles.container}>
      {/* ENHANCED HEADER WITH BETTER AFFORDANCE */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#1F2937" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Project Details</Text>
          <Text style={styles.headerSubtitle}>#{project.id?.slice(0, 8)}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO CARD - CLEAR VISUAL HIERARCHY */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroLeft}>
              <View style={[styles.statusPill, { 
                backgroundColor: statusColors.bg,
                borderColor: statusColors.border,
              }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColors.border }]} />
                <Text style={[styles.statusPillText, { color: statusColors.text }]}>
                  {getProjectDisplayStatus(project)}
                </Text>
              </View>
            </View>
            <View style={styles.bidsContainer}>
              <Text style={styles.bidsLabel}>Bids</Text>
              <Text style={styles.bidsValue}>{project.bidsCount || 0}</Text>
            </View>
          </View>
          
          <Text style={styles.projectTitle}>{project.title}</Text>
          
          {project.category && (
            <View style={styles.categoryRow}>
              <Briefcase size={16} color={COLORS.gray500} strokeWidth={2} />
              <Text style={styles.categoryText}>{project.category}</Text>
            </View>
          )}
        </View>

        {/* KEY METRICS - SCANNABLE INFO GRID */}
        <View style={styles.metricsGrid}>
          {/* Budget Card */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <DollarSign size={24} color="#2E7D32" strokeWidth={2.5} />
            </View>
            <Text style={styles.metricLabel}>Budget</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(project.budget, project.currency || 'USD')}
            </Text>
          </View>

          {/* Duration Card */}
          {project.duration && (
            <View style={styles.metricCard}>
              <View style={[styles.metricIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Clock size={24} color="#1565C0" strokeWidth={2.5} />
              </View>
              <Text style={styles.metricLabel}>Duration</Text>
              <Text style={styles.metricValue}>{project.duration}</Text>
            </View>
          )}

          {/* Location Card */}
          {project.location && (
            <View style={styles.metricCard}>
              <View style={[styles.metricIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <MapPin size={24} color="#E65100" strokeWidth={2.5} />
              </View>
              <Text style={styles.metricLabel}>Location</Text>
              <Text style={styles.metricValue} numberOfLines={1}>
                {project.location}
              </Text>
            </View>
          )}
        </View>

        {/* ENHANCED TIMELINE WITH BETTER SIGNIFIERS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Calendar size={22} color={COLORS.primary} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Project Milestones</Text>
            </View>
            {milestones.length > 0 && (
              <Text style={styles.milestoneCount}>{milestones.length}</Text>
            )}
          </View>

          <View style={styles.workspaceHint}>
            <Text style={styles.workspaceHintTitle}>Milestones</Text>
            <Text style={styles.workspaceHintText}>
              Tap a milestone to accept or reject submitted work. Payment to the platform is handled separately.
            </Text>
          </View>

          {milestonesLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingStateText}>Loading milestones...</Text>
            </View>
          ) : milestones.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color={COLORS.gray300} strokeWidth={1.5} />
              <Text style={styles.emptyStateTitle}>No milestones yet</Text>
              <Text style={styles.emptyStateText}>
                Milestones will appear here once added
              </Text>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              {milestones.map((milestone, index) => {
                const isLast = index === milestones.length - 1;
                const isDone = milestone.status === 'released' || milestone.status === 'approved';
                const statusCfg = getMilestoneStatusConfig(milestone.status);

                return (
                  <View key={milestone.id || index} style={styles.timelineItem}>
                    {/* Timeline Visual */}
                    <View style={styles.timelineLeftColumn}>
                      <View style={[styles.timelineDot, isDone && styles.timelineDotCompleted]}>
                        {isDone ? (
                          <CheckCircle size={20} color="#FFFFFF" fill={COLORS.primary} strokeWidth={2.5} />
                        ) : (
                          <Circle size={20} color={COLORS.primary} strokeWidth={2.5} />
                        )}
                      </View>
                      {!isLast && <View style={styles.timelineConnector} />}
                    </View>

                    {/* Milestone Card — tap opens active-details (submit work / approvals) */}
                    <TouchableOpacity
                      style={[styles.milestoneCard, isDone && styles.milestoneCardCompleted]}
                      activeOpacity={0.92}
                      onPress={() =>
                        router.push({ pathname: '/active-details' as any, params: { id: project.id } } as any)
                      }
                    >
                      <View style={styles.milestoneHeader}>
                        <View style={styles.milestoneHeaderLeft}>
                          <Text style={styles.milestoneNumber}>
                            {String(index + 1).padStart(2, '0')}
                          </Text>
                          <Text style={styles.milestoneTitle} numberOfLines={2}>
                            {milestone.title}
                          </Text>
                        </View>
                        <View style={[styles.mStatusBadge, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
                          <Text style={[styles.mStatusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                        </View>
                      </View>

                      {milestone.description ? (
                        <Text style={styles.milestoneDescription} numberOfLines={2}>
                          {milestone.description}
                        </Text>
                      ) : null}

                      <View style={styles.milestoneMetaRow}>
                        {milestone.amount && milestone.amount > 0 ? (
                          <View style={styles.amountBadge}>
                            <DollarSign size={13} color={COLORS.primary} strokeWidth={2.5} />
                            <Text style={styles.amountText}>${Number(milestone.amount).toFixed(2)}</Text>
                          </View>
                        ) : null}
                        {milestone.dueDate ? (
                          <View style={styles.milestoneDateRow}>
                            <Calendar size={13} color="#9CA3AF" strokeWidth={2} />
                            <Text style={styles.milestoneDateText}>Due {milestone.dueDate}</Text>
                          </View>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* FREELANCER CARD - CLEAR CALL TO ACTION */}
        {project.freelancer && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <User size={22} color={COLORS.primary} strokeWidth={2.5} />
                <Text style={styles.sectionTitle}>Assigned Freelancer</Text>
              </View>
            </View>
            
            <View style={styles.freelancerCard}>
              <View style={styles.freelancerHeader}>
                <View style={styles.avatarContainer}>
                  <User size={28} color={COLORS.primary} strokeWidth={2.5} />
                </View>
                <View style={styles.freelancerInfo}>
                  <Text style={styles.freelancerName}>
                    {project.freelancer.userName || 'Freelancer'}
                  </Text>
                  {project.freelancer.email && (
                    <Text style={styles.freelancerEmail}>{project.freelancer.email}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* DESCRIPTION - IMPROVED READABILITY */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Project Description</Text>
            </View>
          </View>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{project.description}</Text>
          </View>
        </View>

        {/* TAGS - BETTER VISUAL GROUPING */}
        {project.tags && project.tags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Tag size={22} color={COLORS.primary} strokeWidth={2.5} />
                <Text style={styles.sectionTitle}>Required Skills</Text>
              </View>
              <Text style={styles.tagCount}>{project.tags.length}</Text>
            </View>
            <View style={styles.tagsContainer}>
              {project.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // HEADER STYLES - IMPROVED AFFORDANCE
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 2,
  },
  
  // CONTENT STYLES
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // HERO CARD - CLEAR VISUAL HIERARCHY
  heroCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLeft: {
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bidsContainer: {
    alignItems: 'flex-end',
  },
  bidsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  bidsValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  
  // METRICS GRID - SCANNABLE LAYOUT
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 6,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  
  // SECTION STYLES
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  milestoneCount: {
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tagCount: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // TIMELINE STYLES - ENHANCED SIGNIFIERS
  timelineContainer: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeftColumn: {
    alignItems: 'center',
    width: 32,
    marginRight: 16,
    paddingTop: 4,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  timelineDotCompleted: {
    borderColor: COLORS.primary,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  
  // MILESTONE CARD - BETTER FEEDBACK
  milestoneCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  milestoneCardCompleted: {
    backgroundColor: '#F9FAFB',
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  milestoneHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  milestoneNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  milestoneTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 22,
  },
  amountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 10,
  },
  milestoneDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  milestoneDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  milestoneMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  mStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  mStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  workspaceHint: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  workspaceHintTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3730A3',
    marginBottom: 6,
  },
  workspaceHintText: {
    fontSize: 13,
    color: '#4F46E5',
    lineHeight: 18,
  },
  noAmountHint: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 8,
  },
  
  // FREELANCER CARD - CLEAR ACTION
  freelancerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  freelancerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  freelancerInfo: {
    flex: 1,
  },
  freelancerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  freelancerEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  
  // DESCRIPTION CARD
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  
  // TAGS
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  
  // LOADING STATES - BETTER FEEDBACK
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  loadingSubtext: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  loadingStateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  
  // EMPTY STATE - CLEAR SIGNIFIERS
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  
  // ERROR STATE
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  errorSubtext: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});