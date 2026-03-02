import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileCompletion } from '@/utils/profileCompletion';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '@/constants/theme';

export default function ProfileCompletionBar() {
  const { user } = useAuth();
  const router = useRouter();

  const { percentage, isComplete } = getProfileCompletion(user ?? null);

  if (!user || user.role !== 'Freelancer' || isComplete) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label} numberOfLines={1}>
          Profile {percentage}% complete
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/complete-profile' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Complete profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.surfaceMuted,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    minHeight: 48,
    gap: SPACING.m,
  },
  label: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.s,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.white,
  },
});
