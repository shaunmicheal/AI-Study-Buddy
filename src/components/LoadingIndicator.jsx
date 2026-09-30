import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Typography } from '../constants/theme';

const LoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.eight,
  },
  text: {
    marginTop: Spacing.three,
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
    textAlign: 'center',
  },
});

export default LoadingIndicator;