import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, DollarSign, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Project {
  id: string;
  title: string;
  client?: { name?: string };
  budgetMin?: number;
  budgetMax?: number;
  postedAt?: string;
  skills: string[];
  description?: string;
}

const STATIC_PROJECT: Project = {
  id: 'static-1',
  title: 'React Native Mobile App Development',
  client: { name: 'Tech Startup' },
  budgetMin: 300,
  budgetMax: 600,
  postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
  skills: ['React Native', 'JavaScript', 'UI/UX', 'API Integration'],
  description:
    'Looking for an experienced React Native developer to build a modern mobile application.',
};

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

export default function ProjectCard({ project = STATIC_PROJECT }: { project?: Project }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/project-details?id=${project.id}`)}
      activeOpacity={0.85}
    >
      {/* Title */}
      <Text style={styles.title}>{project.title}</Text>

      {/* Posted by */}
      <View style={styles.row}>
        <User size={14} color="#6B7280" />
        <Text style={styles.metaText}>
          Posted by {project.client?.name || 'Unknown'}
        </Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        {project.description || 'Description not specified'}
      </Text>

      {/* Budget + Posted Time */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <DollarSign size={16} color="#10B981" />
          <Text style={styles.budget}>
            ${project.budgetMin ?? 'Not specified'} – ${project.budgetMax ?? 'Not specified'}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Clock size={16} color="#F59E0B" />
          <Text style={styles.postedTime}>{timeAgo(project.postedAt)}</Text>
        </View>
      </View>

      {/* Skills */}
      <View style={styles.skills}>
        {project.skills.map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => router.push(`/Bid-now?id=${project.id}`)}
        >
          <Text style={styles.applyButtonText}>Bid Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
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
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  skillTag: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  skillText: { fontSize: 12, fontWeight: '500', color: '#374151' },
  footer: { flexDirection: 'row', gap: 12 },
  applyButton: { flex: 1, backgroundColor: '#2563EB', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  applyButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  saveButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  saveButtonText: { fontSize: 14, fontWeight: '500', color: '#374151' },
});
