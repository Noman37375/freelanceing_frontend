import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  backgroundColor?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = '#282A32',
  backgroundColor = '#FFFFFF',
}: StatsCardProps) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        <Icon size={24} color={iconColor} strokeWidth={2} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    margin: 8,
  },
  iconContainer: {
    marginBottom: 12,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
