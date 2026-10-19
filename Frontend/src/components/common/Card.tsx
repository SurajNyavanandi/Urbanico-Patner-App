import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  isNightMode?: boolean;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, isNightMode = false, style }) => {
  const colors = {
    bg: isNightMode ? '#1E293B' : '#FFFFFF',
    border: isNightMode ? '#334155' : '#E2E8F0',
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
});
