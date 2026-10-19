import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useHaptics } from '../../hooks/useHaptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'blue' | 'success' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle
}) => {
  const { playTap } = useHaptics();

  const handlePress = () => {
    if (disabled || loading) return;
    playTap();
    onPress();
  };

  const getBgColor = () => {
    switch (variant) {
      case 'primary': return '#FCB026';
      case 'secondary': return '#F1F5F9';
      case 'blue': return '#0284C7';
      case 'success': return '#10B981';
      case 'danger': return '#EF4444';
      default: return '#FCB026';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return '#18181B';
      case 'secondary': return '#18181B';
      case 'blue': return '#FFFFFF';
      case 'success': return '#FFFFFF';
      case 'danger': return '#FFFFFF';
      default: return '#18181B';
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: getBgColor() },
        (disabled || loading) && styles.disabled,
        style
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <TouchableOpacity style={styles.contentRow} onPress={handlePress}>
          {icon}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '900',
  },
});
