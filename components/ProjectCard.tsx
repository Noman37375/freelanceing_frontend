import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, DollarSign, User, Zap, Bookmark } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Project, getProjectDisplayStatus } from '@/models/Project';

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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/project-details?id=${project.id}`)}
      activeOpacity={0.9}
    >
      {/* Title */}
      <Text style={styles.title}>{project.title}</Text>

      {/* Posted by */}
      {project.client && (
        <View style={styles.row}>
          <User size={14} color="#6B7280" />
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
          <DollarSign size={16} color="#10B981" />
          <Text style={styles.budget}>
            ${project.budget || 'Not specified'}
          </Text>
        </View>

        {project.createdAt && (
          <View style={styles.infoItem}>
            <Clock size={16} color="#F59E0B" />
            <Text style={styles.postedTime}>{timeAgo(project.createdAt)}</Text>
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

      {/* Status Badge */}
      {project.status && (
        <View style={[styles.statusBadge, getProjectDisplayStatus(project) === 'Active' && styles.statusActive, getProjectDisplayStatus(project) === 'In Progress' && styles.statusInProgress]}>
          <Text style={[styles.statusText, getProjectDisplayStatus(project) === 'Active' && styles.statusTextActive, getProjectDisplayStatus(project) === 'In Progress' && styles.statusTextInProgress]}>
            {getProjectDisplayStatus(project)}
          </Text>
        </View>
      )}

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={(e) => {
            e.stopPropagation();
            router.push(`/Bid-now?id=${project.id}`);
          }}
        >
          <Text style={styles.applyButtonText}>Place a Bid</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  metaText: { fontSize: 13, color: '#6B7280' },
  description: { fontSize: 14, color: '#4B5563', marginBottom: 10, lineHeight: 20 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 16, marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  budget: { fontSize: 14, fontWeight: '600', color: '#10B981' },
  postedTime: { fontSize: 13, fontWeight: '500', color: '#F59E0B' },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14, alignItems: 'center' },
  skillTag: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  skillText: { fontSize: 12, fontWeight: '500', color: '#374151' },
  moreTags: { fontSize: 12, color: '#6B7280', fontStyle: 'italic' },
  statusBadge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12, 
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusInProgress: { backgroundColor: '#DBEAFE' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  statusTextActive: { color: '#10B981' },
  statusTextInProgress: { color: '#3B82F6' },
  footer: { flexDirection: 'row', gap: 12 },
  applyButton: { flex: 1, backgroundColor: '#2563EB', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  applyButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  saveButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  saveButtonText: { fontSize: 14, fontWeight: '500', color: '#374151' },
});
