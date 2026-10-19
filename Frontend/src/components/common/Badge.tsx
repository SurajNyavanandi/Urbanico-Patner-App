import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'amber' | 'green' | 'blue' | 'purple' | 'gray';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'amber' }) => {
  const getColors = () => {
    switch (variant) {
      case 'amber': return { bg: '#FFF8EB', text: '#B45309', border: '#FCB026' };
      case 'green': return { bg: '#ECFDF5', text: '#047857', border: '#10B981' };
      case 'blue': return { bg: '#F0F9FF', text: '#0369A1', border: '#0284C7' };
      case 'purple': return { bg: '#F3E8FF', text: '#6B21A8', border: '#A855F7' };
      case 'gray': return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '900',
  },
});
