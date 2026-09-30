const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const LETTERS = ["A", "B", "C", "D"];

const CHAT_SYSTEM_PROMPT =
  "You are an AI study buddy helping students learn. Give clear, educational and helpful answers. Keep them informative but concise, and use the earlier messages in the conversation for context.";

const describeApiError = (status, details) => {
  switch (status) {
    case 400:
      return details && details.toLowerCase().includes("api key")
        ? "Your Gemini API key is not valid. Check EXPO_PUBLIC_GEMINI_API_KEY in your .env file."
        : `The request was rejected (400). ${details}`;
    case 403:
      return "Your API key is not allowed to use this model. Check the key in Google AI Studio.";
    case 404:
      return `The model "${GEMINI_MODEL}" was not found. Update GEMINI_MODEL in geminiService.js.`;
    case 429:
      return "Too many requests right now. Please wait a moment and try again.";
    default:
      return status >= 500
        ? "The AI service is busy right now. Please try again in a moment."
        : `Request failed (${status}). ${details}`;
  }
};

const toContents = (prompt) => [{ role: "user", parts: [{ text: prompt }] }];

const makeGeminiRequest = async (
  contents,
  { json = false, systemInstruction } = {},
) => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is missing. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file and restart with: npx expo start -c",
    );
  }

  let response;
  try {
    response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents,
        ...(systemInstruction
          ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
          : {}),
        generationConfig: {
          maxOutputTokens: 8192,
          ...(json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    });
  } catch (networkError) {
    console.warn("Network error:", networkError);
    throw new Error(
      "Network error. Please check your internet connection and try again.",
    );
  }

  if (!response.ok) {
    let details = "";
    try {
      const body = await response.json();
      details = body?.error?.message || "";
    } catch (e) {
      // ignore body parse problems
    }
    console.error("Gemini API error:", response.status, details);
    throw new Error(describeApiError(response.status, details));
  }

  const data = await response.json();
  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error(
      data?.promptFeedback?.blockReason
        ? "That request was blocked by the AI safety filter. Try rephrasing it."
        : "The AI returned an empty response. Please try again.",
    );
  }

  return text;
};

export const chatGemini = async (messages) => {
  const recent = (messages || []).slice(-20);

  const firstUser = recent.findIndex((m) => m.role === "user");
  const usable = firstUser >= 0 ? recent.slice(firstUser) : [];

  if (usable.length === 0) {
    throw new Error("Please enter a question");
  }

  const contents = usable.map((m) => ({
    role: m.role === "ai" ? "model" : "user",
    parts: [{ text: m.text }],
  }));

  return await makeGeminiRequest(contents, {
    systemInstruction: CHAT_SYSTEM_PROMPT,
  });
};

export const askGemini = async (question) => {
  if (!question || question.trim() === "") {
    throw new Error("Please enter a question");
  }

  return await chatGemini([{ role: "user", text: question }]);
};
const normalizeAnswer = (answer, options) => {
  const value = String(answer ?? "").trim();
  const first = value.charAt(0).toUpperCase();

  if (
    LETTERS.includes(first) &&
    (value.length === 1 || /^[A-Da-d][).:\s]/.test(value))
  ) {
    return first;
  }

  const index = options.findIndex(
    (option) => option.toLowerCase() === value.toLowerCase(),
  );
  return index >= 0 ? LETTERS[index] : null;
};

const normalizeQuestion = (item) => {
  if (
    !item ||
    typeof item.question !== "string" ||
    !Array.isArray(item.options)
  ) {
    return null;
  }

  const options = item.options.slice(0, 4).map((option) =>
    String(option)
      .replace(/^\s*[A-Da-d][).:]\s+/, "")
      .trim(),
  );

  if (options.length !== 4) return null;

  const correctAnswer = normalizeAnswer(item.correctAnswer, options);
  if (!correctAnswer) return null;

  return {
    question: item.question.trim(),
    options,
    correctAnswer,
    explanation: String(item.explanation || "").trim(),
  };
};

const parseQuizResponse = (raw) => {
  const cleaned = raw.replace(/```json|```/gi, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      "The AI did not return a quiz in the expected format. Please try again.",
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch (e) {
    throw new Error(
      "The AI returned a quiz that could not be read. Please try again.",
    );
  }

  const questions = (Array.isArray(parsed) ? parsed : [])
    .map(normalizeQuestion)
    .filter(Boolean);

  if (questions.length === 0) {
    throw new Error("The AI returned an incomplete quiz. Please try again.");
  }

  return questions;
};
export const generateQuiz = async (topic, studyNotes = "") => {
  if (!topic || topic.trim() === "") {
    throw new Error("Please enter a topic for the quiz");
  }

  const intro = studyNotes
    ? `A student has been studying the material below. Generate a quiz that tests their understanding of it.

Study material:
${studyNotes}

`
    : `Generate a quiz about "${topic}". `;

  const prompt = `${intro}Create exactly 5 multiple choice questions with 4 answer choices each. For each question, provide:
1. The question text
2. Four answer options
3. The correct answer as a single letter (A, B, C, or D)
4. A brief explanation of why the answer is correct

Return ONLY a JSON array of objects with this structure, with no extra text:
[
  {
    "question": "Question text here",
    "options": ["Option one", "Option two", "Option three", "Option four"],
    "correctAnswer": "A",
    "explanation": "Explanation here"
  }
]

Do not put letters like "A." inside the options. Make sure the questions are educational and appropriate for students learning about ${topic}.`;

  const raw = await makeGeminiRequest(toContents(prompt), { json: true });
  return parseQuizResponse(raw);
};
export const testConnection = async () => {
  try {
    await makeGeminiRequest(toContents("Say hello in one word."));
    return { success: true, message: "Connection successful" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
