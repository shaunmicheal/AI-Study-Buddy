const inMemoryStorage = {
  history: [],
  quizzes: [],
};
export const saveToStorage = async (key, data) => {
  try {
    inMemoryStorage[key] = data;
    return true;
  } catch (error) {
    console.error("Error saving to storage:", error);
    return false;
  }
};
export const getFromStorage = async (key) => {
  try {
    return inMemoryStorage[key] || null;
  } catch (error) {
    console.error("Error loading from storage:", error);
    return null;
  }
};
export const saveToHistory = async (question, response) => {
  try {
    const history = (await getFromStorage("history")) || [];
    const newEntry = {
      id: Date.now().toString(),
      question,
      response,
      timestamp: new Date().toISOString(),
    };

    history.unshift(newEntry);
    if (history.length > 50) history.pop();

    return await saveToStorage("history", history);
  } catch (error) {
    console.error("Error saving to history:", error);
    return false;
  }
};
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

    const existingIndex = history.findIndex((item) => item.id === id);
    if (existingIndex >= 0) history.splice(existingIndex, 1);

    history.unshift(entry);
    if (history.length > 50) history.pop();
    return await saveToStorage("history", history);
  } catch (error) {
    console.error("Error saving conversation:", error);
    return false;
  }
};

export const getHistory = async () => {
  try {
    return (await getFromStorage("history")) || [];
  } catch (error) {
    console.error("Error loading history:", error);
    return [];
  }
};

export const saveQuiz = async (topic, questions) => {
  try {
    const quizzes = (await getFromStorage("quizzes")) || [];
    const newQuiz = {
      id: Date.now().toString(),
      topic,
      questions,
      timestamp: new Date().toISOString(),
    };

    quizzes.unshift(newQuiz);
    if (quizzes.length > 20) quizzes.pop();

    return await saveToStorage("quizzes", quizzes);
  } catch (error) {
    console.error("Error saving quiz:", error);
    return false;
  }
};

export const getQuizzes = async () => {
  try {
    return (await getFromStorage("quizzes")) || [];
  } catch (error) {
    console.error("Error loading quizzes:", error);
    return [];
  }
};

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
