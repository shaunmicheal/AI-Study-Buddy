import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/CustomButton";
import LoadingIndicator from "../components/LoadingIndicator";
import { Colors } from "../constants/colors";
import {
  MaxContentWidth,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { generateQuiz } from "../services/geminiService";
import { getHistory, getQuizzes, saveQuiz } from "../utils/storage";

// Turn past questions + answers into study notes for the quiz prompt
const buildNotes = (items) =>
  items
    .map(
      (item, index) =>
        `Question ${index + 1}: ${item.question}\nAnswer: ${item.response.slice(0, 1200)}`,
    )
    .join("\n\n");

const shorten = (text, max = 40) =>
  text.length > max ? text.slice(0, max).trim() + "…" : text;

const QuizScreen = () => {
  const { quizId } = useLocalSearchParams();

  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [recent, setRecent] = useState([]);

  // Load the last 5 questions each time this screen is shown
  useFocusEffect(
    useCallback(() => {
      const loadRecent = async () => {
        const items = await getHistory();
        setRecent(items.slice(0, 5));
      };
      loadRecent();
    }, []),
  );

  // When opened from the History screen, show the saved quiz
  useEffect(() => {
    const id = Array.isArray(quizId) ? quizId[0] : quizId;
    if (!id) return;

    const loadSaved = async () => {
      const saved = await getQuizzes();
      const found = saved.find((item) => item.id === id);
      if (found) {
        setTopic(found.topic);
        setQuiz(found);
        setShowAnswers(false);
        setError(null);
      }
    };

    loadSaved();
  }, [quizId]);

  // Shared by all three ways of starting a quiz
  const runQuiz = async (quizTopic, studyNotes = "") => {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setShowAnswers(false);

    try {
      const questions = await generateQuiz(quizTopic, studyNotes);
      const newQuiz = {
        topic: quizTopic,
        questions,
        timestamp: new Date().toISOString(),
      };

      setQuiz(newQuiz);
      setShowAnswers(false);

      // Save quiz to storage
      await saveQuiz(quizTopic, questions);
    } catch (err) {
      setError(
        err.message ||
          "An error occurred while generating the quiz. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = () => {
    if (!topic.trim()) {
      setError("Please enter a topic for the quiz");
      return;
    }
    runQuiz(topic.trim());
  };

  // Quiz based on one past question and its answer
  const handleQuizFromItem = (item) => {
    const label = `Review: ${shorten(item.question)}`;
    setTopic(label);
    runQuiz(label, buildNotes([item]));
  };

  // Quiz based on all the recent questions together
  const handleQuizFromRecent = () => {
    const label = "Review: my recent questions";
    setTopic(label);
    runQuiz(label, buildNotes(recent));
  };

  const handleClear = () => {
    setTopic("");
    setQuiz(null);
    setError(null);
    setShowAnswers(false);
  };

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  const formatOption = (option, index) => {
    const letters = ["A", "B", "C", "D"];
    return `${letters[index]}. ${option}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Quiz Generator</Text>
            <Text style={styles.subtitle}>
              Enter a topic to generate practice questions
            </Text>
          </View>

          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              placeholder="e.g., JavaScript basics, History, Science"
              placeholderTextColor={Colors.placeholder}
              value={topic}
              onChangeText={setTopic}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Generate Quiz"
                onPress={handleGenerateQuiz}
                disabled={loading || !topic.trim()}
                loading={loading}
              />
              <CustomButton
                title="Clear"
                onPress={handleClear}
                variant="secondary"
                style={styles.clearButton}
              />
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {loading && <LoadingIndicator message="Generating quiz..." />}

          {!quiz && !loading && recent.length > 0 && (
            <View style={styles.studySection}>
              <Text style={styles.studyTitle}>
                Quiz me on what I've learned
              </Text>
              <Text style={styles.studySubtitle}>
                Build a quiz from your recent Ask AI questions and answers.
              </Text>

              <CustomButton
                title="Mix of my recent questions"
                onPress={handleQuizFromRecent}
                variant="accent"
                style={styles.mixButton}
              />

              <Text style={styles.orText}>or pick one</Text>

              {recent.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentRow}
                  onPress={() => handleQuizFromItem(item)}
                >
                  <Text style={styles.recentQuestion} numberOfLines={2}>
                    {item.question}
                  </Text>
                  <Text style={styles.recentAction}>Quiz me ›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {quiz && (
            <View style={styles.quizContainer}>
              <View style={styles.quizHeader}>
                <Text style={styles.quizTitle}>Quiz: {quiz.topic}</Text>
                <Text style={styles.quizInfo}>
                  {quiz.questions.length} questions
                </Text>
              </View>

              {quiz.questions.map((question, index) => (
                <View key={index} style={styles.questionCard}>
                  <Text style={styles.questionText}>
                    {index + 1}. {question.question}
                  </Text>

                  <View style={styles.optionsContainer}>
                    {question.options.map((option, optionIndex) => (
                      <TouchableOpacity
                        key={optionIndex}
                        style={[
                          styles.optionButton,
                          showAnswers &&
                            question.correctAnswer ===
                              ["A", "B", "C", "D"][optionIndex] &&
                            styles.correctOption,
                          showAnswers &&
                            question.correctAnswer !==
                              ["A", "B", "C", "D"][optionIndex] &&
                            styles.incorrectOption,
                        ]}
                        disabled={true}
                      >
                        <Text style={styles.optionText}>
                          {formatOption(option, optionIndex)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {showAnswers && (
                    <View style={styles.explanationContainer}>
                      <Text style={styles.explanationLabel}>Answer:</Text>
                      <Text style={styles.explanationText}>
                        {question.correctAnswer}. {question.explanation}
                      </Text>
                    </View>
                  )}
                </View>
              ))}

              <CustomButton
                title={showAnswers ? "Hide Answers" : "Show Answers"}
                onPress={toggleAnswers}
                variant="accent"
                style={styles.toggleButton}
              />
            </View>
          )}

          {!quiz && !loading && !error && recent.length === 0 && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Quiz Tips:</Text>
              <Text style={styles.tipsText}>• Be specific about the topic</Text>
              <Text style={styles.tipsText}>
                • Try "Math basics" or "World War II"
              </Text>
              <Text style={styles.tipsText}>
                • Ask the AI some questions first, then come back to be quizzed
                on them
              </Text>
            </View>
          )}
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    maxWidth: MaxContentWidth,
  },
  header: {
    alignItems: "center",
    marginTop: Spacing.six,
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  title: {
    fontSize: Typography.fontSize.xxlarge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
    textAlign: "center",
    opacity: 0.8,
  },
  inputSection: {
    width: "100%",
    marginBottom: Spacing.four,
  },
  input: {
    width: "100%",
    minHeight: 80,
    backgroundColor: Colors.white,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
    ...Shadows.small,
    borderWidth: 1,
    borderColor: Colors.placeholder,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  clearButton: {
    flex: 1,
  },
  errorContainer: {
    width: "100%",
    backgroundColor: "#FFE5E5",
    borderRadius: Spacing.four,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    ...Shadows.small,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.medium,
    textAlign: "center",
  },
  studySection: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    marginTop: Spacing.two,
    ...Shadows.small,
  },
  studyTitle: {
    fontSize: Typography.fontSize.large,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.one,
  },
  studySubtitle: {
    fontSize: Typography.fontSize.small,
    color: Colors.secondary,
    opacity: 0.7,
    marginBottom: Spacing.three,
    lineHeight: 20,
  },
  mixButton: {
    width: "100%",
  },
  orText: {
    fontSize: Typography.fontSize.small,
    color: Colors.placeholder,
    textAlign: "center",
    marginVertical: Spacing.three,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    backgroundColor: Colors.background,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  recentQuestion: {
    flex: 1,
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
  },
  recentAction: {
    fontSize: Typography.fontSize.small,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  quizContainer: {
    width: "100%",
    marginTop: Spacing.four,
  },
  quizHeader: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    ...Shadows.medium,
  },
  quizTitle: {
    fontSize: Typography.fontSize.large,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.one,
  },
  quizInfo: {
    fontSize: Typography.fontSize.small,
    color: Colors.placeholder,
  },
  questionCard: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    ...Shadows.medium,
  },
  questionText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.three,
    lineHeight: Typography.fontSize.large + 4,
  },
  optionsContainer: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  optionButton: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.placeholder,
  },
  correctOption: {
    backgroundColor: "#E8F5E8",
    borderColor: Colors.success,
  },
  incorrectOption: {
    backgroundColor: "#FFE5E5",
    borderColor: Colors.error,
  },
  optionText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
    lineHeight: Typography.fontSize.large + 4,
  },
  explanationContainer: {
    backgroundColor: "#F0F8FF",
    borderRadius: Spacing.four,
    padding: Spacing.three,
    marginTop: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  explanationLabel: {
    fontSize: Typography.fontSize.medium,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.one,
  },
  explanationText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
    lineHeight: Typography.fontSize.large + 4,
  },
  toggleButton: {
    width: "100%",
    marginTop: Spacing.four,
  },
  tipsContainer: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    marginTop: Spacing.four,
    ...Shadows.small,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.large,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.two,
  },
  tipsText: {
    fontSize: Typography.fontSize.medium,
    color: Colors.secondary,
    marginBottom: Spacing.one,
    lineHeight: Typography.fontSize.large + 4,
  },
});

export default QuizScreen;
