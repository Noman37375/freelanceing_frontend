import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, DollarSign, User } from 'lucide-react-native';

interface ProjectCardProps {
  title: string;
  budget: string;
  status: 'Active' | 'Completed' | 'In Progress' | 'Pending' | 'Cancelled';
  freelancer?: string;
  deadline: string;
  onPress?: () => void;
}

export default function ProjectCard({
  title,
  budget,
  status,
  freelancer,
  deadline,
  onPress,
}: ProjectCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'Active':
      case 'In Progress':
        return '#3B82F6';
      case 'Completed':
        return '#10B981';
      case 'Pending':
        return '#F59E0B';
      case 'Cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <DollarSign size={16} color="#6B7280" strokeWidth={2} />
          <Text style={styles.infoText}>{budget}</Text>
        </View>

        <View style={styles.infoItem}>
          <Clock size={16} color="#6B7280" strokeWidth={2} />
          <Text style={styles.infoText}>{deadline}</Text>
        </View>
      </View>

      {freelancer && (
        <View style={styles.freelancerRow}>
          <User size={16} color="#6B7280" strokeWidth={2} />
          <Text style={styles.freelancerText}>{freelancer}</Text>
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
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  freelancerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  freelancerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
