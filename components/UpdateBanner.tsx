import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Linking,
} from 'react-native';
import { RefreshCw, X } from 'lucide-react-native';

interface Props {
  onDismiss: () => void;
}

export function UpdateBanner({ onDismiss }: Props) {
  const handleAction = () => {
    if (Platform.OS === 'web') {
      // On web (PWA): reload the page to get latest bundle
      window.location.reload();
    } else {
      // On native: dismiss and let user restart manually
      // (Expo OTA would auto-apply on next cold start)
      onDismiss();
    }
  };

  const actionLabel = Platform.OS === 'web' ? 'Reload Now' : 'Got it';

  return (
    <View style={styles.banner}>
      <RefreshCw size={16} color="#10B981" style={styles.icon} />
      <Text style={styles.message} numberOfLines={2}>
        {Platform.OS === 'web'
          ? 'A new version is available.'
          : 'New update available! Restart the app to get the latest features.'}
      </Text>
      <TouchableOpacity style={styles.actionBtn} onPress={handleAction} activeOpacity={0.8}>
        <Text style={styles.actionText}>{actionLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeBtn} onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <X size={14} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 90, // above tab bar
    left: 16,
    right: 16,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: '#10B981',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
  icon: { flexShrink: 0 },
  message: {
    flex: 1,
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '500',
    lineHeight: 18,
  },
  actionBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    flexShrink: 0,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  closeBtn: {
    flexShrink: 0,
    padding: 2,
  },
});
