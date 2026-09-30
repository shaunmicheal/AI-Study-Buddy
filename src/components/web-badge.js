import { useColorScheme, StyleSheet, Text } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="code" themeColor="textSecondary" style={styles.versionText}>
        v1.0.0
      </ThemedText>
      <Text style={styles.badgeText}>Web</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  versionText: {
    textAlign: 'center',
  },
  badgeText: {
    fontSize: 12,
    color: '#6B7D3A',
    fontWeight: 'bold',
    padding: 4,
    backgroundColor: '#F5F1E8',
    borderRadius: 4,
  },
});