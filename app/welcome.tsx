import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import UndrawIllustration from '@/assets/images/undraw_personalization_0q05.svg';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING, SHADOWS } from '@/constants/theme';

export default function Welcome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const illustrationSize = Math.min(width * 0.85, 320);

  const handleContinue = () => {
    router.replace('/login' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.illustrationWrap}>
          <UndrawIllustration
            width={illustrationSize}
            height={illustrationSize * (607.63 / 683.76)}
          />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.headline}>
            Find the best freelance projects
          </Text>
          <Text style={styles.description}>
            Your ultimate destination to discover exciting career opportunities
            tailored just for you. We understand that finding the right project
            matters—connect with clients and grow your career.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cta}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  illustrationWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  textBlock: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  headline: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
    textAlign: 'center',
    marginBottom: SPACING.m,
    paddingHorizontal: SPACING.s,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.s,
  },
  cta: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.l,
    minWidth: 280,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.white,
  },
});
