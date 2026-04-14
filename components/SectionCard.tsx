import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function SectionCard({ title, children, style }: SectionCardProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleRow}>
        <View style={styles.titleAccent} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.l,
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.s,
  },
  titleAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: COLORS.secondaryDark,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    color: '#282A32',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: SPACING.m,
  },
  content: {
    // Content wrapper
  },
});
