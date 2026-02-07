import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, CheckCircle2, XCircle, AlertCircle, ShieldAlert, Eye } from 'lucide-react-native';
import type { DisputeStatus } from '@/models/Dispute';

interface DisputeStatusBadgeProps {
  status: DisputeStatus;
  size?: 'small' | 'medium' | 'large';
}

export default function DisputeStatusBadge({ status, size = 'medium' }: DisputeStatusBadgeProps) {
  const getStatusConfig = (status: DisputeStatus) => {
    switch (status) {
      case 'open':
        return {
          color: '#F59E0B',
          bg: '#FFFBEB',
          icon: Clock,
          label: 'Open',
        };
      case 'under_review':
        return {
          color: '#282A32',
          bg: '#EFF6FF',
          icon: Eye,
          label: 'Under Review',
        };
      case 'awaiting_response':
        return {
          color: '#444751',
          bg: '#F5F3FF',
          icon: AlertCircle,
          label: 'Awaiting Response',
        };
      case 'mediation':
        return {
          color: '#EC4899',
          bg: '#FDF2F8',
          icon: ShieldAlert,
          label: 'In Mediation',
        };
      case 'resolved':
        return {
          color: '#10B981',
          bg: '#ECFDF5',
          icon: CheckCircle2,
          label: 'Resolved',
        };
      case 'closed':
        return {
          color: '#64748B',
          bg: '#F1F5F9',
          icon: CheckCircle2,
          label: 'Closed',
        };
      case 'escalated':
        return {
          color: '#EF4444',
          bg: '#FEF2F2',
          icon: ShieldAlert,
          label: 'Escalated',
        };
      default:
        return {
          color: '#64748B',
          bg: '#F1F5F9',
          icon: Clock,
          label: 'Unknown',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
      icon: 12,
    },
    medium: {
      container: styles.containerMedium,
      text: styles.textMedium,
      icon: 16,
    },
    large: {
      container: styles.containerLarge,
      text: styles.textLarge,
      icon: 20,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, currentSize.container, { backgroundColor: config.bg }]}>
      <Icon size={currentSize.icon} color={config.color} />
      <Text style={[styles.text, currentSize.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 6,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  containerMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
});
