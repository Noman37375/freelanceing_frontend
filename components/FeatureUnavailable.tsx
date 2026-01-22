import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { COLORS } from '@/utils/constants';

type Props = {
  title?: string;
  description?: string;
  /**
   * If true, shows a "Go Back" button.
   */
  showBackButton?: boolean;
};

export default function FeatureUnavailable({
  title = 'Feature unavailable',
  description = 'This feature is not available yet.',
  showBackButton = true,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <AlertCircle size={28} color={COLORS.primary} strokeWidth={2} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {showBackButton && (
          <TouchableOpacity style={styles.button} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray800,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray500,
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

