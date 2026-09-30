import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Typography } from '../constants/theme';

const CustomButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  loading = false,
  style = {} 
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? Colors.placeholder : Colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? Colors.placeholder : Colors.white,
          borderWidth: 1,
          borderColor: Colors.primary,
        };
      case 'accent':
        return {
          backgroundColor: disabled ? Colors.placeholder : Colors.accent,
        };
      default:
        return {
          backgroundColor: disabled ? Colors.placeholder : Colors.primary,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          color: Colors.primary,
        };
      default:
        return {
          color: Colors.white,
        };
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <Text style={[styles.text, getTextStyle(), styles.loading]}>
          Loading...
        </Text>
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  text: {
    fontSize: Typography.fontSize.medium,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  loading: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default CustomButton;