import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { chatGemini } from "../services/geminiService";
import { getHistory, saveConversation } from "../utils/storage";

const SUGGESTIONS = [
  "Explain photosynthesis in simple terms",
  "What is a closure in JavaScript?",
  "Help me understand fractions",
];

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const AskAIScreen = () => {
  const { historyId } = useLocalSearchParams();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const conversationId = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const id = Array.isArray(historyId) ? historyId[0] : historyId;
    if (!id) return;

    const loadSaved = async () => {
      const saved = await getHistory();
      const item = saved.find((entry) => entry.id === id);
      if (!item) return;

      conversationId.current = item.id;
      setMessages(
        item.messages && item.messages.length > 0
          ? item.messages
          : [
              {
                id: `${item.id}-q`,
                role: "user",
                text: item.question,
                timestamp: item.timestamp,
              },
              {
                id: `${item.id}-a`,
                role: "ai",
                text: item.response,
                timestamp: item.timestamp,
              },
            ],
      );
      setError(null);
    };

    loadSaved();
  }, [historyId]);

  const requestReply = async (history) => {
    setLoading(true);
    setError(null);

    try {
      const reply = await chatGemini(history);
      const aiMessage = {
        id: `${Date.now()}-a`,
        role: "ai",
        text: reply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...history, aiMessage];
      setMessages(finalMessages);

      if (!conversationId.current) {
        conversationId.current = Date.now().toString();
      }
      await saveConversation(conversationId.current, finalMessages);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = {
      id: `${Date.now()}-u`,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    requestReply(nextMessages);
  };

  const handleRetry = () => {
    if (loading) return;
    requestReply(messages);
  };

  const handleNewChat = () => {
    conversationId.current = null;
    setMessages([]);
    setInput("");
    setError(null);
  };

  const lastMessage = messages[messages.length - 1];
  const canRetry = !!error && lastMessage && lastMessage.role === "user";
  const canSend = input.trim().length > 0 && !loading;

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <Stack.Screen
        options={{
          headerRight:
            messages.length > 0
              ? () => (
                  <Pressable onPress={handleNewChat} hitSlop={8}>
                    <Text style={styles.newChat}>New chat</Text>
                  </Pressable>
                )
              : undefined,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          <View style={styles.inner}>
            {messages.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Ask me anything</Text>

                {SUGGESTIONS.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    onPress={() => setInput(suggestion)}
                    style={({ pressed }) => [
                      styles.suggestion,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.rowUser : styles.rowAi,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.bubbleUser : styles.bubbleAi,
                    ]}
                  >
                    <Text
                      selectable
                      style={[
                        styles.bubbleText,
                        isUser ? styles.textUser : styles.textAi,
                      ]}
                    >
                      {message.text}
                    </Text>
                    <Text
                      style={[
                        styles.time,
                        isUser ? styles.timeUser : styles.timeAi,
                      ]}
                    >
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>
                </View>
              );
            })}

            {loading && (
              <View style={[styles.messageRow, styles.rowAi]}>
                <View
                  style={[
                    styles.bubble,
                    styles.bubbleAi,
                    styles.thinkingBubble,
                  ]}
                >
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.thinkingText}>Thinking...</Text>
                </View>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                {canRetry && (
                  <CustomButton
                    title="Try again"
                    onPress={handleRetry}
                    variant="secondary"
                    style={styles.retryButton}
                  />
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.inputBar}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={
                messages.length === 0
                  ? "Type your question..."
                  : "Ask a follow-up..."
              }
              placeholderTextColor={Colors.placeholder}
              value={input}
              onChangeText={setInput}
              multiline
              textAlignVertical="center"
            />
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              style={({ pressed }) => [
                styles.sendButton,
                !canSend && styles.sendDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.sendText}>↑</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  newChat: {
    fontSize: Typography.fontSize.medium,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  messagesContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  inner: {
    flexGrow: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xlarge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.six,
  },
  suggestion: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: Spacing.four,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    ...Shadows.small,
  },
  suggestionText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
  },
  pressed: {
    opacity: 0.7,
  },
  messageRow: {
    width: "100%",
    marginBottom: Spacing.three,
  },
  rowUser: {
    alignItems: "flex-end",
  },
  rowAi: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "85%",
    borderRadius: Spacing.four,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: Spacing.one,
  },
  bubbleAi: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: Spacing.one,
    ...Shadows.small,
  },
  bubbleText: {
    fontSize: Typography.fontSize.medium,
    lineHeight: Typography.fontSize.large + 4,
  },
  textUser: {
    color: Colors.white,
  },
  textAi: {
    color: Colors.secondary,
  },
  time: {
    fontSize: 11,
    marginTop: Spacing.one,
    alignSelf: "flex-end",
  },
  timeUser: {
    color: Colors.white,
    opacity: 0.7,
  },
  timeAi: {
    color: Colors.placeholder,
  },
  thinkingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  thinkingText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
    opacity: 0.7,
  },
  errorContainer: {
    width: "100%",
    backgroundColor: "#FFE5E5",
    borderRadius: Spacing.four,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    alignItems: "center",
    gap: Spacing.three,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.medium,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: Spacing.two,
  },
  inputBar: {
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: "#0000000F",
  },
  inputRow: {
    width: "100%",
    maxWidth: MaxContentWidth,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: Colors.white,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.placeholder,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: {
    backgroundColor: Colors.placeholder,
    opacity: 0.6,
  },
  sendText: {
    fontSize: Typography.fontSize.xlarge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    lineHeight: 28,
  },
});

export default AskAIScreen;
