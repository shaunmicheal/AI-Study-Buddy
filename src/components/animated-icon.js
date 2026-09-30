import { View, Text, StyleSheet } from 'react-native';

export function AnimatedSplashOverlay() {
  return null; // We'll skip the splash screen for simplicity
}

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.background}>
        <Text style={styles.iconText}>📚</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    zIndex: 100,
  },
  background: {
    borderRadius: 40,
    backgroundColor: '#6B7D3A',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  iconText: {
    fontSize: 40,
    color: '#FFFFFF',
  },
});