import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, DollarSign, User, Zap, Bookmark } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Project, getProjectDisplayStatus } from '@/models/Project';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, TYPOGRAPHY, GRADIENTS } from '@/constants/theme';

const timeAgo = (timestamp?: string) => {
  if (!timestamp) return 'Not specified';
  const postedDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - postedDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  const statusDisplay = getProjectDisplayStatus(project);
  const isActive = statusDisplay === 'Active';
  const isInProgress = statusDisplay === 'In Progress';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/project-details?id=${project.id}`)}
      activeOpacity={0.95}
    >
      {/* Header with Status Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>{project.title}</Text>
        {project.status && (
          <View style={[
            styles.statusBadge,
            isActive && styles.statusActive,
            isInProgress && styles.statusInProgress
          ]}>
            <Text style={[
              styles.statusText,
              isActive && styles.statusTextActive,
              isInProgress && styles.statusTextInProgress
            ]}>
              {statusDisplay}
            </Text>
          </View>
        )}
      </View>

      {/* Posted by */}
      {project.client && (
        <View style={styles.row}>
          <View style={styles.iconBg}>
            <User size={12} color="#64748B" />
          </View>
          <Text style={styles.metaText}>
            Posted by {project.client.userName || 'Unknown'}
          </Text>
        </View>
      )}

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {project.description || 'Description not specified'}
      </Text>

      {/* Meta Information Badges */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <View style={[styles.infoBadge, { backgroundColor: '#ECFDF5' }]}>
            <DollarSign size={14} color={COLORS.success} />
            <Text style={[styles.infoText, { color: COLORS.success }]}>
              ${project.budget || 'Not specified'}
            </Text>
          </View>
        </View>

        {project.createdAt && (
          <View style={styles.infoItem}>
            <View style={[styles.infoBadge, { backgroundColor: '#FEF3C7' }]}>
              <Clock size={14} color={COLORS.warning} />
              <Text style={[styles.infoText, { color: COLORS.warning }]}>
                {timeAgo(project.createdAt)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Tags/Skills */}
      {project.tags && project.tags.length > 0 && (
        <View style={styles.skills}>
          {project.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{tag}</Text>
            </View>
          ))}
          {project.tags.length > 3 && (
            <Text style={styles.moreTags}>+{project.tags.length - 3} more</Text>
          )}
        </View>
      )}

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyButtonContainer}
          onPress={(e) => {
            e.stopPropagation();
            router.push(`/Bid-now?id=${project.id}`);
          }}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={GRADIENTS.primary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.applyButton}
          >
            <Zap size={16} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.applyButtonText}>Place a Bid</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={(e) => e.stopPropagation()}
          activeOpacity={0.7}
        >
          <Bookmark size={16} color="#64748B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.l,
    marginBottom: SPACING.m,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.s,
    gap: SPACING.m,
  },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#111827',
    lineHeight: TYPOGRAPHY.lineHeight.tight * TYPOGRAPHY.fontSize.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
    marginBottom: SPACING.s
  },
  iconBg: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.s,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#6B7280',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: '#4B5563',
    marginBottom: SPACING.m,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.fontSize.base,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
    marginBottom: SPACING.m
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.m,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.m,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
    marginBottom: SPACING.m,
    alignItems: 'center'
  },
  skillTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: SPACING.m,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skillText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#374151'
  },
  moreTags: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#6B7280',
    fontStyle: 'italic',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  statusBadge: {
    paddingHorizontal: SPACING.m,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.m,
    backgroundColor: '#F3F4F6',
  },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusInProgress: { backgroundColor: '#DBEAFE' },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#6B7280'
  },
  statusTextActive: { color: COLORS.success },
  statusTextInProgress: { color: COLORS.info },
  footer: {
    flexDirection: 'row',
    gap: SPACING.m,
    marginTop: SPACING.s,
  },
  applyButtonContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS.m,
    overflow: 'hidden',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.s,
    paddingVertical: 12,
  },
  applyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: SPACING.l,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
});
