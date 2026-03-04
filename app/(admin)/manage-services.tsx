import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ManageServicesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Services</Text>
      <Text style={styles.subtitle}>Service management coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});
