import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, TYPOGRAPHY, GRADIENTS } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  right?: React.ReactNode;
  style?: ViewStyle;
};

export default function ScreenHeader({
  title,
  subtitle,
  showBackButton = false,
  right,
  style,
}: Props) {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, style]}>
      <View style={styles.row}>
        <View style={styles.leftSlot}>
          {showBackButton ? (
            <TouchableOpacity
              style={styles.backButtonContainer}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#F8FAFC', '#F1F5F9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backButton}
              >
                <ArrowLeft size={20} color="#282A32" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonSpacer} />
          )}
        </View>

        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightSlot}>{right ?? <View style={styles.rightSpacer} />}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.s,
    paddingBottom: SPACING.m,
    ...SHADOWS.small,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSlot: {
    width: 44,
    alignItems: 'flex-start',
  },
  rightSlot: {
    width: 44,
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.m,
    overflow: 'hidden',
  },
  backButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonSpacer: {
    width: 40,
    height: 40,
  },
  rightSpacer: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    color: '#282A32',
  },
  subtitle: {
    marginTop: 2,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

