import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/CustomButton";
import { Colors } from "../constants/colors";
import {
  MaxContentWidth,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { clearAllStorage, getHistory, getQuizzes } from "../utils/storage";

const dayLabel = (iso) => {
  const date = new Date(iso);
  const startOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86400000,
  );

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const groupByDay = (items) => {
  const groups = [];
  items.forEach((item) => {
    const label = dayLabel(item.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  });
  return groups;
};

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const HistoryScreen = () => {
  const router = useRouter();

  const [history, setHistory] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState("conversations");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const [conversations, savedQuizzes] = await Promise.all([
            getHistory(),
            getQuizzes(),
          ]);
          setHistory([...conversations]);
          setQuizzes([...savedQuizzes]);
        } catch (error) {
          console.error("Error loading history:", error);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, []),
  );

  const clearHistory = async () => {
    try {
      await clearAllStorage();
      setHistory([]);
      setQuizzes([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  const confirmClear = () => {
    if (Platform.OS === "web") {
      clearHistory();
      return;
    }
    Alert.alert(
      "Clear all history?",
      "This deletes all saved conversations and quizzes.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear all", style: "destructive", onPress: clearHistory },
      ],
    );
  };

  const hasAnything = history.length > 0 || quizzes.length > 0;
  const isConversations = activeTab === "conversations";
  const currentItems = isConversations ? history : quizzes;

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{isConversations ? "" : ""}</Text>
      <Text style={styles.emptyTitle}>
        {isConversations ? "No conversations yet" : "No quizzes yet"}
      </Text>
      <Text style={styles.emptyText}>
        {isConversations
          ? "Questions you ask the AI will be saved here so you can read the answers again."
          : "Quizzes you generate will be saved here so you can retake them."}
      </Text>
      <CustomButton
        title={isConversations ? "Ask a question" : "Generate a quiz"}
        onPress={() => router.push(isConversations ? "/ask-ai" : "/quiz")}
        style={styles.emptyButton}
      />
    </View>
  );

  const renderConversation = (item) => (
    <Pressable
      key={item.id}
      onPress={() =>
        router.push({ pathname: "/ask-ai", params: { historyId: item.id } })
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>❓</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.question}
        </Text>
        <Text style={styles.cardPreview} numberOfLines={2}>
          {item.response}
        </Text>
        <Text style={styles.cardMeta}>{formatTime(item.timestamp)}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  const renderQuiz = (quiz) => (
    <Pressable
      key={quiz.id}
      onPress={() =>
        router.push({ pathname: "/quiz", params: { quizId: quiz.id } })
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconCircle, styles.quizIconCircle]}>
        <Text style={styles.iconText}>📝</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {quiz.topic}
        </Text>
        <Text style={styles.cardMeta}>
          {quiz.questions.length} questions · {formatTime(quiz.timestamp)}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Text style={styles.summary}>
              {history.length}{" "}
              {history.length === 1 ? "conversation" : "conversations"} ·{" "}
              {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
            </Text>
            {hasAnything && (
              <Pressable onPress={confirmClear} hitSlop={8}>
                <Text style={styles.clearText}>Clear all</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.tabsContainer}>
            <Pressable
              style={[styles.tab, isConversations && styles.activeTab]}
              onPress={() => setActiveTab("conversations")}
            >
              <Text
                style={[
                  styles.tabText,
                  isConversations && styles.activeTabText,
                ]}
              >
                Conversations ({history.length})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, !isConversations && styles.activeTab]}
              onPress={() => setActiveTab("quizzes")}
            >
              <Text
                style={[
                  styles.tabText,
                  !isConversations && styles.activeTabText,
                ]}
              >
                Quizzes ({quizzes.length})
              </Text>
            </Pressable>
          </View>

          {currentItems.length === 0
            ? renderEmptyState()
            : groupByDay(currentItems).map((group) => (
                <View key={group.label} style={styles.group}>
                  <Text style={styles.groupLabel}>{group.label}</Text>
                  {group.items.map(
                    isConversations ? renderConversation : renderQuiz,
                  )}
                </View>
              ))}
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
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.eight,
  },
  inner: {
    width: "100%",
    maxWidth: MaxContentWidth,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  summary: {
    fontSize: Typography.fontSize.small,
    color: Colors.secondary,
    opacity: 0.7,
  },
  clearText: {
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.error,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: Spacing.four,
    padding: Spacing.one,
    marginBottom: Spacing.five,
    ...Shadows.small,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: "center",
    borderRadius: Spacing.three,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.small,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  activeTabText: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  group: {
    marginBottom: Spacing.four,
  },
  groupLabel: {
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    ...Shadows.small,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6B7D3A26",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.three,
  },
  quizIconCircle: {
    backgroundColor: "#D4A72C33",
  },
  iconText: {
    fontSize: Typography.fontSize.medium,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.fontSize.medium,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary,
    marginBottom: Spacing.one,
  },
  cardPreview: {
    fontSize: Typography.fontSize.small,
    color: Colors.secondary,
    opacity: 0.65,
    lineHeight: 20,
    marginBottom: Spacing.one,
  },
  cardMeta: {
    fontSize: Typography.fontSize.small,
    color: Colors.placeholder,
  },
  chevron: {
    fontSize: Typography.fontSize.xlarge,
    color: Colors.primary,
    marginLeft: Spacing.two,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.eight,
    paddingHorizontal: Spacing.four,
  },
  emptyIcon: {
    fontSize: Typography.fontSize.xxlarge,
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.large,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.secondary,
    marginBottom: Spacing.two,
    textAlign: "center",
  },
  emptyText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: Typography.fontSize.large + 4,
    marginBottom: Spacing.five,
  },
  emptyButton: {
    width: "100%",
    maxWidth: 220,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
  },
});

export default HistoryScreen;
