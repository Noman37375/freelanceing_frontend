import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

interface SkillTagProps {
  skill: string;
  onRemove?: () => void;
  editable?: boolean;
}

const getSkillColor = (skill: string) => {
  const hash = skill.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = [
    { bg: '#E5E4EA', border: '#C2C2C8', text: '#282A32' }, // Neutral
    { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' }, // Green
    { bg: '#FEF3C7', border: '#FDE68A', text: '#D97706' }, // Amber
    { bg: '#FCE7F3', border: '#FBCFE8', text: '#DB2777' }, // Pink
    { bg: '#DBEAFE', border: '#BFDBFE', text: '#2563EB' }, // Blue
    { bg: '#F3E8FF', border: '#E9D5FF', text: '#9333EA' }, // Purple
  ];
  return colors[hash % colors.length];
};

export default function SkillTag({ skill, onRemove, editable = false }: SkillTagProps) {
  const colors = getSkillColor(skill);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{skill}</Text>
      {editable && onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          style={[styles.removeButton, { backgroundColor: colors.border }]}
          activeOpacity={0.7}
        >
          <X size={12} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    gap: SPACING.s,
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  removeButton: {
    padding: 2,
    borderRadius: BORDER_RADIUS.s,
  },
});

