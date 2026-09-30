// Simplified storage utils for testing - will use in-memory storage
// Replace with AsyncStorage when available

const inMemoryStorage = {
  history: [],
  quizzes: [],
};

// Save item to storage
export const saveToStorage = async (key, data) => {
  try {
    inMemoryStorage[key] = data;
    return true;
  } catch (error) {
    console.error("Error saving to storage:", error);
    return false;
  }
};

// Get item from storage
export const getFromStorage = async (key) => {
  try {
    return inMemoryStorage[key] || null;
  } catch (error) {
    console.error("Error loading from storage:", error);
    return null;
  }
};

// Save a single question/answer to history (older single-question format)
export const saveToHistory = async (question, response) => {
  try {
    const history = (await getFromStorage("history")) || [];
    const newEntry = {
      id: Date.now().toString(),
      question,
      response,
      timestamp: new Date().toISOString(),
    };

    history.unshift(newEntry); // Add to beginning
    if (history.length > 50) history.pop(); // Keep only last 50 entries

    return await saveToStorage("history", history);
  } catch (error) {
    console.error("Error saving to history:", error);
    return false;
  }
};

// Save (or update) a whole chat conversation as ONE history entry.
// `question` is the first thing you asked and `response` is the latest AI reply,
// so the History, Home and Quiz screens keep working without changes.
export const saveConversation = async (id, messages) => {
  try {
    const history = (await getFromStorage("history")) || [];

    const firstUser = messages.find((m) => m.role === "user");
    const lastAi = [...messages].reverse().find((m) => m.role === "ai");

    const entry = {
      id,
      question: firstUser ? firstUser.text : "",
      response: lastAi ? lastAi.text : "",
      messages,
      timestamp: new Date().toISOString(),
    };

    // Remove the old version of this conversation, then put the updated one on top
    const existingIndex = history.findIndex((item) => item.id === id);
    if (existingIndex >= 0) history.splice(existingIndex, 1);

    history.unshift(entry);
    if (history.length > 50) history.pop(); // Keep only last 50 entries

    return await saveToStorage("history", history);
  } catch (error) {
    console.error("Error saving conversation:", error);
    return false;
  }
};

// Get conversation history
export const getHistory = async () => {
  try {
    return (await getFromStorage("history")) || [];
  } catch (error) {
    console.error("Error loading history:", error);
    return [];
  }
};

// Save generated quiz
export const saveQuiz = async (topic, questions) => {
  try {
    const quizzes = (await getFromStorage("quizzes")) || [];
    const newQuiz = {
      id: Date.now().toString(),
      topic,
      questions,
      timestamp: new Date().toISOString(),
    };

    quizzes.unshift(newQuiz); // Add to beginning
    if (quizzes.length > 20) quizzes.pop(); // Keep only last 20 quizzes

    return await saveToStorage("quizzes", quizzes);
  } catch (error) {
    console.error("Error saving quiz:", error);
    return false;
  }
};

// Get saved quizzes
export const getQuizzes = async () => {
  try {
    return (await getFromStorage("quizzes")) || [];
  } catch (error) {
    console.error("Error loading quizzes:", error);
    return [];
  }
};

// Clear all storage
export const clearAllStorage = async () => {
  try {
    inMemoryStorage.history = [];
    inMemoryStorage.quizzes = [];
    return true;
  } catch (error) {
    console.error("Error clearing storage:", error);
    return false;
  }
};
