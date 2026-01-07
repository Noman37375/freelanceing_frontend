import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function SectionCard({ title, children, style }: SectionCardProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  content: {
    // Content wrapper
  },
});

