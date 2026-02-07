import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Project } from '@/models/Project';

const timeAgo = (timestamp?: string) => {
  if (!timestamp) return 'Not specified';
  const postedDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - postedDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return `${diffWeeks}w ago`;
};

interface ProjectListCardProps {
  project: Project;
  onPress: () => void;
  /** When true, no horizontal margin (e.g. freelancer projects route) */
  noHorizontalMargin?: boolean;
}

export default function ProjectListCard({ project, onPress, noHorizontalMargin }: ProjectListCardProps) {
  const location = project.location || 'Remote';
  const budget = project.budget != null ? `$${project.budget}` : 'Fixed-price';
  const duration = project.duration || project.projectDuration || 'Not specified';
  const proposals = project.bidsCount ?? project.proposals ?? 0;

  return (
    <TouchableOpacity style={[styles.card, noHorizontalMargin && styles.cardNoMargin]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.locationRow}>
        <MapPin size={14} color="#64748B" />
        <Text style={styles.locationText}>{location}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{project.title || 'Untitled'}</Text>
      <Text style={styles.posted}>{timeAgo(project.createdAt)}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Fixed-price</Text>
          <Text style={styles.metricValue}>{budget}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Duration</Text>
          <Text style={styles.metricValue}>{duration}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Proposals</Text>
          <Text style={styles.metricValue}>{proposals} Proposal{proposals !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {project.description || 'No description'}
      </Text>

      {project.tags && project.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {project.tags.slice(0, 4).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardNoMargin: {
    marginHorizontal: 0,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  posted: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
});
