import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

interface SkillTagProps {
  skill: string;
  onRemove?: () => void;
  editable?: boolean;
}

export default function SkillTag({ skill, onRemove, editable = false }: SkillTagProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{skill}</Text>
      {editable && onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <X size={14} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  text: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  removeButton: {
    padding: 2,
  },
});

