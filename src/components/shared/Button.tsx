import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: theme.colors.gray };
      case 'outline':
        return { 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary 
        };
      case 'danger':
        return { backgroundColor: theme.colors.error };
      default:
        return { backgroundColor: theme.colors.primary };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return { color: theme.colors.primary };
      default:
        return { color: '#FFFFFF' };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
