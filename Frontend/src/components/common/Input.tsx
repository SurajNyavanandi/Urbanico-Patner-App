import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  isNightMode?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftElement,
  rightElement,
  isNightMode = false,
  style,
  ...rest
}) => {
  const colors = {
    text: isNightMode ? '#F8FAFC' : '#18181B',
    subtext: isNightMode ? '#94A3B8' : '#64748B',
    bg: isNightMode ? '#0F172A' : '#F8FAFC',
    border: isNightMode ? '#334155' : '#E2E8F0',
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.subtext }]}>{label}</Text>}
      <View style={[styles.inputWrapper, { backgroundColor: colors.bg, borderColor: error ? '#EF4444' : colors.border }]}>
        {leftElement}
        <TextInput
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor="#94A3B8"
          {...rest}
        />
        {rightElement}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    height: '100%',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 4,
  },
});
