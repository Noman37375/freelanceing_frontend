import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, User, Zap, Bookmark } from 'lucide-react-native';
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

// Define props to receive currency data from FindProjectsScreen
interface ProjectCardProps {
  project?: Project;
  currencyRate?: number;
  currencySymbol?: string;
  curKey?: string;
}

const STATIC_PROJECT: Project = {
  id: 'static-1',
  title: 'React Native Mobile App Development',
  client: { name: 'Tech Startup' },
  budgetMin: 300,
  budgetMax: 600,
  postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  skills: ['React Native', 'JavaScript', 'UI/UX', 'API Integration'],
  description: 'Looking for an experienced React Native developer to build a modern mobile application.',
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
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${diffWeeks}w ago`;
};

export default function ProjectCard({ 
  project = STATIC_PROJECT, 
  currencyRate = 1, 
  currencySymbol = '$',
  curKey = 'USD'
}: ProjectCardProps) {
  const router = useRouter();

  // Helper to format the converted numbers
  const formatValue = (val: number) => 
    (val * currencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/project-details?id=${project.id}`)}
      activeOpacity={0.9}
    >
      {/* Header with Icon and Title */}
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Zap size={18} color="#4F46E5" fill="#4F46E5" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
          <div style={styles.clientRow}>
            <User size={12} color="#94A3B8" />
            <Text style={styles.clientName}>{project.client?.name || 'Unknown'}</Text>
          </div>
        </View>
      </View>

      {/* Body: Description */}
      <Text style={styles.description} numberOfLines={2}>
        {project.description || 'Description not specified'}
      </Text>

      {/* Meta Information Badges */}
      <View style={styles.infoRow}>
        <View style={[styles.badge, styles.budgetBadge]}>
          {/* We replace the static DollarSign icon with the dynamic symbol text for clarity */}
          <Text style={styles.symbolText}>{currencySymbol}</Text>
          <Text style={styles.budgetText}>
            {formatValue(project.budgetMin ?? 0)} – {formatValue(project.budgetMax ?? 0)}
          </Text>
        </View>

        <View style={[styles.badge, styles.timeBadge]}>
          <Clock size={14} color="#64748B" />
          <Text style={styles.timeText}>{timeAgo(project.postedAt)}</Text>
        </View>
      </View>

      {/* Skills Tags */}
      <View style={styles.skillsWrapper}>
        {project.skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {project.skills.length > 3 && (
          <Text style={styles.moreText}>+{project.skills.length - 3}</Text>
        )}
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => router.push(`/Bid-now?id=${project.id}`)}
        >
          <Text style={styles.applyButtonText}>Place a Bid</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton}>
          <Bookmark size={20} color="#64748B" />
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
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clientName: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  budgetBadge: {
    backgroundColor: '#ECFDF5',
  },
  symbolText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  timeBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
    alignItems: 'center',
  },
  skillTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  moreText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    marginLeft: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#4F46E5', 
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});