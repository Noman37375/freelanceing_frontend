import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING, SHADOWS } from '@/constants/theme';

// ─── Edit these to change splash UI (uses theme) ───────────────────────────────
export const SPLASH_CONFIG = {
  backgroundColor: COLORS.background,
  logoText: 'PF',
  logoSubtext: 'PAK FREELANCE',
  tagline: 'CONNECTING TALENT',
  appName: 'Pakistan Freelance App',
  logoBgColor: COLORS.surface,
  logoAccent: COLORS.primary,
  textColor: COLORS.white,
  taglineColor: COLORS.textSecondary,
};
// ─────────────────────────────────────────────────────────────────────────────

export default function SplashScreen() {
  const {
    backgroundColor,
    logoText,
    logoSubtext,
    tagline,
    appName,
    logoBgColor,
    logoAccent,
    textColor,
    taglineColor,
  } = SPLASH_CONFIG;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.centerBlock}>
        {/* Logo area – edit styles below to change shape/size */}
        <View style={[styles.logoBox, { backgroundColor: logoBgColor }]}>
          <Text style={[styles.logoLetter, { color: logoAccent }]}>{logoText}</Text>
        </View>
        <Text style={[styles.logoSubtext, { color: textColor }]}>{logoSubtext}</Text>
        <Text style={[styles.tagline, { color: taglineColor }]}>{tagline}</Text>
      </View>
      <Text style={[styles.appName, { color: textColor }]}>{appName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.m,
    ...SHADOWS.large,
  },
  logoLetter: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  logoSubtext: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    textTransform: 'uppercase',
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
