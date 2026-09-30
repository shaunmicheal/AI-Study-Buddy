import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing, Typography, Shadows, MaxContentWidth } from '../constants/theme';
import { getHistory } from '../utils/storage';

const ACTIONS = [
  {
    key: 'ask',
    icon: '❓',
    title: 'Ask AI',
    description: 'Get clear answers to any study question',
    route: '/ask-ai',
    tint: '#6B7D3A26',
  },
  {
    key: 'quiz',
    icon: '📝',
    title: 'Generate Quiz',
    description: 'Practice with 5 questions on any topic',
    route: '/quiz',
    tint: '#D4A72C33',
  },
  {
    key: 'history',
    icon: '📚',
    title: 'History',
    description: 'Revisit your past answers and quizzes',
    route: '/history',
    tint: '#2D2D2D14',
  },
];

const HomeScreen = () => {
  const router = useRouter();
  const [recent, setRecent] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadRecent = async () => {
        const items = await getHistory();
        setRecent(items.slice(0, 3));
      };
      loadRecent();
    }, [])
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' · ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <View style={styles.hero}>
            <Text style={styles.title}>AI Study Buddy</Text>
            <Text style={styles.subtitle}>
              Get instant help with your studies. Ask questions, practice with quizzes and pick up where you left off.
              Boost your learning with AI Powered assistance. 
            </Text>
          </View>

          <View style={styles.actions}>
            {ACTIONS.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => router.push(action.route)}
                style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
              >
                <View style={[styles.iconCircle, { backgroundColor: action.tint }]}>
                  <Text style={styles.iconText}>{action.icon}</Text>
                </View>
                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent questions</Text>
              {recent.length > 0 && (
                <Pressable onPress={() => router.push('/history')}>
                  <Text style={styles.seeAll}>See all</Text>
                </Pressable>
              )}
            </View>

            {recent.length === 0 ? (
              <View style={styles.emptyRecent}>
                <Text style={styles.emptyRecentText}>
                  Your questions will show up here so you can open them again anytime.
                </Text>
              </View>
            ) : (
              recent.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: '/ask-ai',
                      params: { historyId: item.id },
                    })
                  }
                  style={({ pressed }) => [styles.recentCard, pressed && styles.pressed]}
                >
                  <Text style={styles.recentQuestion} numberOfLines={1}>
                    {item.question}
                  </Text>
                  <Text style={styles.recentMeta}>{formatDate(item.timestamp)}</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.eight,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  hero: {
    marginTop: Spacing.eight,
    marginBottom: Spacing.six,
  },
  title: {
    fontSize: Typography.fontSize.xxlarge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
    opacity: 0.75,
    lineHeight: Typography.fontSize.large + 6,
  },
  actions: {
    gap: Spacing.three,
    marginBottom: Spacing.eight,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Spacing.five,
    padding: Spacing.four,
    ...Shadows.medium,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  iconText: {
    fontSize: Typography.fontSize.xlarge,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.fontSize.large,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary,
    marginBottom: Spacing.half,
  },
  actionDescription: {
    fontSize: Typography.fontSize.small,
    color: Colors.secondary,
    opacity: 0.65,
    lineHeight: 20,
  },
  chevron: {
    fontSize: Typography.fontSize.xlarge,
    color: Colors.primary,
    marginLeft: Spacing.two,
  },
  recentSection: {
    width: '100%',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.large,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary,
  },
  seeAll: {
    fontSize: Typography.fontSize.medium,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary,
  },
  recentCard: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.four,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    ...Shadows.small,
  },
  recentQuestion: {
    fontSize: Typography.fontSize.medium,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.secondary,
    marginBottom: Spacing.half,
  },
  recentMeta: {
    fontSize: Typography.fontSize.small,
    color: Colors.placeholder,
  },
  emptyRecent: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    ...Shadows.small,
  },
  emptyRecentText: {
    fontSize: Typography.fontSize.small,
    color: Colors.secondary,
    opacity: 0.65,
    lineHeight: 20,
  },
});

export default HomeScreen;