import { GoogleGenAI } from '@google/genai';
import { config } from '../config/index.js';

// In-memory cache to save Gemini API quota & speed up repeated requests
const aiResponseCache = new Map();

// Initialize Google Gen AI client if API key is provided
let aiClient = null;
if (config.gemini.apiKey && config.gemini.apiKey !== 'your-gemini-api-key') {
  try {
    aiClient = new GoogleGenAI({ apiKey: config.gemini.apiKey });
    console.log(`🤖 Gemini AI client initialized using model: ${config.gemini.model}`);
  } catch (err) {
    console.warn('⚠️ Could not initialize Gemini client, will use safe offline fallbacks:', err.message);
  }
} else {
  console.log('ℹ️ Running in safe offline mode (GEMINI_API_KEY placeholder). Curated fallbacks active.');
}

/**
 * 1. Explain a student's wrong answer with safe fallbacks and caching
 */
export async function explainWrongAnswer({ questionText, studentAnswer, correctAnswer, topicName }) {
  const cacheKey = `explain:${topicName}:${questionText}:${studentAnswer}`;
  if (aiResponseCache.has(cacheKey)) {
    return { ...aiResponseCache.get(cacheKey), cached: true };
  }

  // Pre-written reliable curriculum fallback
  const fallbackExplanation = `In "${topicName}", when evaluating "${questionText}", option "${studentAnswer}" is incorrect because it overlooks the foundational algebraic identity. The correct step leads to option "${correctAnswer}". Always verify terms before expanding or factoring.`;

  if (!aiClient) {
    return {
      explanation: fallbackExplanation,
      source: 'offline_fallback',
      modelUsed: config.gemini.model,
      disclaimer: '⚠️ Standard curriculum explanation (Offline fallback active). Please verify with your textbook.',
    };
  }

  try {
    const prompt = `You are an encouraging, expert Class 9 Mathematics tutor in India.
A student made a mistake on this question:
Question: "${questionText}"
Topic: "${topicName}"
Student selected: "${studentAnswer}"
Correct answer is: "${correctAnswer}"

In 3 concise bullet points:
1. Explain gently why the student's answer "${studentAnswer}" is incorrect (common misconception).
2. Show the exact step-by-step algebraic reason why "${correctAnswer}" is correct.
3. Give one memorable tip to avoid this mistake in exams.
Keep it simple, encouraging, and easy for a 14-year-old student.`;

    const response = await aiClient.models.generateContent({
      model: config.gemini.model,
      contents: prompt,
    });

    const explanationText = response.text || fallbackExplanation;

    const result = {
      explanation: explanationText,
      source: 'gemini_api',
      modelUsed: config.gemini.model,
      disclaimer: '⚠️ AI-generated, please verify with your textbook.',
    };

    aiResponseCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('[Gemini API Call Failed - Returning Safe Fallback]:', err.message);
    return {
      explanation: fallbackExplanation,
      source: 'error_fallback',
      modelUsed: config.gemini.model,
      errorDetails: 'AI service temporarily unavailable; standard lesson provided.',
      disclaimer: '⚠️ Standard curriculum explanation. Please verify with your textbook.',
    };
  }
}

/**
 * 2. Generate a conceptual hint without giving away the final answer
 */
export async function getHint({ questionText, topicName }) {
  const cacheKey = `hint:${topicName}:${questionText}`;
  if (aiResponseCache.has(cacheKey)) {
    return { ...aiResponseCache.get(cacheKey), cached: true };
  }

  const fallbackHint = `Hint for ${topicName}: Look closely at the signs and structure of the terms. If you see a difference of squares or middle terms, try grouping or factoring first before calculating!`;

  if (!aiClient) {
    return {
      hint: fallbackHint,
      source: 'offline_fallback',
      modelUsed: config.gemini.model,
      disclaimer: '⚠️ Standard curriculum hint. Please verify with your textbook.',
    };
  }

  try {
    const prompt = `You are a supportive math teacher. Give a gentle 2-sentence hint for this question WITHOUT revealing the final answer or option:
Question: "${questionText}"
Topic: "${topicName}"
Encourage the student to recall the foundational rule.`;

    const response = await aiClient.models.generateContent({
      model: config.gemini.model,
      contents: prompt,
    });

    const hintText = response.text || fallbackHint;

    const result = {
      hint: hintText,
      source: 'gemini_api',
      modelUsed: config.gemini.model,
      disclaimer: '⚠️ AI-generated, please verify with your textbook.',
    };

    aiResponseCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('[Gemini Hint Call Failed]:', err.message);
    return {
      hint: fallbackHint,
      source: 'error_fallback',
      modelUsed: config.gemini.model,
      disclaimer: '⚠️ Standard curriculum hint. Please verify with your textbook.',
    };
  }
}

/**
 * 3. Generate practice questions for a weak topic
 */
export async function generatePracticeQuestions({ topicName, count = 3 }) {
  const cacheKey = `practice:${topicName}:${count}`;
  if (aiResponseCache.has(cacheKey)) {
    return { ...aiResponseCache.get(cacheKey), cached: true };
  }

  // Curated fallback practice questions for Class 9 Maths
  const fallbackQuestions = [
    {
      id: 'ai-gen-1',
      question_text: `Which identity is used to factorize x² - 16?`,
      option_a: '(x - 4)(x + 4)',
      option_b: '(x - 4)(x - 4)',
      option_c: '(x + 4)(x + 4)',
      option_d: '(x - 16)(x + 1)',
      correct_option: 'A',
      explanation: 'Use a² - b² = (a - b)(a + b). Here 16 = 4², so (x - 4)(x + 4).',
    },
    {
      id: 'ai-gen-2',
      question_text: `What are the roots of y² - 4y + 4 = 0?`,
      option_a: 'y = 2 (repeated)',
      option_b: 'y = -2, 2',
      option_c: 'y = -2 (repeated)',
      option_d: 'y = 4, 1',
      correct_option: 'A',
      explanation: 'Factoring yields (y - 2)² = 0, giving a repeated real root at y = 2.',
    },
    {
      id: 'ai-gen-3',
      question_text: `In ax² + bx + c = 0, if the discriminant D = 0, what are the roots?`,
      option_a: 'Real and equal',
      option_b: 'Real and unequal',
      option_c: 'No real roots',
      option_d: 'Imaginary only',
      correct_option: 'A',
      explanation: 'When D = 0, the quadratic equation possesses two identical real roots: -b / (2a).',
    },
  ];

  if (!aiClient) {
    return {
      questions: fallbackQuestions,
      source: 'offline_fallback',
      modelUsed: config.gemini.model,
      disclaimer: '⚠️ Verified curriculum practice set. Please verify with your textbook.',
    };
  }

  try {
    const prompt = `Generate exactly ${count} Class 9 Mathematics multiple-choice questions for the topic: "${topicName}".
Return ONLY a valid JSON array of objects with this exact format:
[
  {
    "id": "ai-1",
    "question_text": "...",
    "option_a": "...",
    "option_b": "...",
    "option_c": "...",
    "option_d": "...",
    "correct_option": "A",
    "explanation": "..."
  }
]
Do not add markdown formatting or backticks around the JSON.`;

    const response = await aiClient.models.generateContent({
      model: config.gemini.model,
      contents: prompt,
    });

    let raw = response.text || '';
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(raw);

    const result = {
      questions: parsed,
      source: 'gemini_api',
      modelUsed: config.gemini.model,
      disclaimer: '⚠️ AI-generated, please verify with your textbook.',
    };

    aiResponseCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('[Gemini Practice Generation Failed]:', err.message);
    return {
      questions: fallbackQuestions,
      source: 'error_fallback',
      modelUsed: config.gemini.model,
      disclaimer: '⚠️ Standard curriculum practice set. Please verify with your textbook.',
    };
  }
}
