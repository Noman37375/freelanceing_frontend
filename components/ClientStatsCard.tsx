import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface ClientStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  backgroundColor?: string;
}

export default function ClientStatsCard({
  title,
  value,
  icon: Icon,
  iconColor = '#3B82F6',
  backgroundColor = '#FFFFFF',
}: ClientStatsCardProps) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Icon size={24} color={iconColor} strokeWidth={2.5} />
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
    padding: SPACING.l,
    borderRadius: BORDER_RADIUS.l,
    ...SHADOWS.medium,
    alignItems: 'center',
    margin: SPACING.s,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.l,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    color: '#1E293B',
    marginBottom: 4,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
