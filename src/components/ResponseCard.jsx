import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Typography, Shadows } from '../constants/theme';

const ResponseCard = ({ title, content, timestamp }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.card, Shadows.medium]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {timestamp && (
          <Text style={styles.timestamp}>
            {formatDate(timestamp)}
          </Text>
        )}
      </View>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    marginVertical: Spacing.two,
    marginHorizontal: Spacing.four,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Colors.placeholder,
  },
  title: {
    fontSize: Typography.fontSize.large,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary,
  },
  timestamp: {
    fontSize: Typography.fontSize.small,
    color: Colors.placeholder,
    fontWeight: Typography.fontWeight.normal,
  },
  content: {
    fontSize: Typography.fontSize.medium,
    lineHeight: Typography.fontSize.large + 4,
    color: Colors.secondary,
    textAlign: 'left',
  },
});

export default ResponseCard;