// src/services/aiService.js

const DEFAULT_SYSTEM_PROMPT = `
You are CHAFADIA NOOR AI Assistant.

You answer every user question based on what the user actually typed.
Do not repeat the same answer for different questions.

You help with Islamic learning, Arabic learning, Quran study, Hadith understanding,
duas, prayer guidance, Ramadan planning, community support, productivity,
and general helpful questions.

Always answer with kindness, respect, clarity and humility.
If the question requires a serious Islamic ruling, remind the user to consult
a qualified scholar.
`;

const AI_CONFIG = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o-mini',
};

const getApiKey = () => {
  return process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
};

const cleanText = text => {
  if (!text) return '';
  return String(text).trim();
};

export const askAI = async ({
  question,
  context = '',
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
}) => {
  try {
    const userQuestion = cleanText(question);

    console.log('AI QUESTION SENT:', userQuestion);

    if (!userQuestion) {
      return {
        success: false,
        answer: 'Please type your question first.',
      };
    }

    const apiKey = getApiKey();

    console.log('OPENAI KEY EXISTS:', Boolean(apiKey));

    if (!apiKey) {
      return {
        success: false,
        answer:
          'OpenAI API key is missing. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file, then restart Expo with npx expo start -c.',
      };
    }

    const finalUserMessage = context
      ? `Context:\n${cleanText(context)}\n\nUser question:\n${userQuestion}`
      : userQuestion;

    const response = await fetch(AI_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: finalUserMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 900,
      }),
    });

    const data = await response.json();

    console.log('OPENAI RAW RESPONSE:', data);

    if (!response.ok) {
      return {
        success: false,
        answer:
          data?.error?.message ||
          'AI request failed. Please check your API key and internet connection.',
      };
    }

    const answer = data?.choices?.[0]?.message?.content;

    return {
      success: true,
      answer: answer || 'I could not generate an answer for this question.',
    };
  } catch (error) {
    console.log('ASK AI ERROR:', error);

    return {
      success: false,
      answer:
        'Something went wrong while contacting the AI assistant. Please try again.',
    };
  }
};

export const askIslamicAI = async question => {
  return askAI({
    question,
    systemPrompt: `
You are CHAFADIA NOOR Islamic Assistant.

Answer the exact Islamic question the user asks.
Use respectful, careful and beneficial language.
Do not invent Quran verses or Hadith.
If the matter needs a fatwa, marriage ruling, divorce ruling, inheritance ruling,
finance ruling, medical ruling or legal ruling, advise the user to consult a qualified scholar.
`,
  });
};

export const askArabicTutorAI = async question => {
  return askAI({
    question,
    systemPrompt: `
You are CHAFADIA NOOR Arabic Tutor.

Answer the exact Arabic learning question the user asks.
Teach Arabic step by step.
Include Arabic, transliteration and English meaning when useful.
Correct mistakes gently and clearly.
`,
  });
};

export const askQuranAI = async question => {
  return askAI({
    question,
    systemPrompt: `
You are CHAFADIA NOOR Quran Study Assistant.

Answer the exact Quran-related question the user asks.
Explain meanings, vocabulary, lessons and reflection points.
Do not claim final tafsir authority.
Encourage checking reliable tafsir and scholars.
`,
  });
};

export const askHadithAI = async question => {
  return askAI({
    question,
    systemPrompt: `
You are CHAFADIA NOOR Hadith Assistant.

Answer the exact Hadith-related question the user asks.
Do not fabricate Hadith.
If authenticity is unknown, clearly say it needs verification.
Explain lessons and practical benefits.
`,
  });
};

export const generateArabicPractice = async level => {
  return askArabicTutorAI(
    `Create an Arabic practice exercise for ${level}. Include Arabic words, transliteration, English meaning, corrections, and 5 quiz questions.`
  );
};

export const generateRamadanPlan = async goal => {
  return askIslamicAI(
    `Create a practical Ramadan worship plan for this goal: ${goal}. Include salah, Quran, dua, charity, food, family, and daily tracking.`
  );
};

export const generateDailyReminder = async () => {
  return askIslamicAI(
    'Give one short daily Islamic reminder with one practical action.'
  );
};

export const correctArabicSentence = async sentence => {
  return askArabicTutorAI(
    `Correct this Arabic sentence. Explain the mistake and give the correct version with English meaning: ${sentence}`
  );
};

export const explainDua = async dua => {
  return askIslamicAI(
    `Explain this dua in a simple, spiritual and practical way: ${dua}`
  );
};

export default {
  askAI,
  askIslamicAI,
  askArabicTutorAI,
  askQuranAI,
  askHadithAI,
  generateArabicPractice,
  generateRamadanPlan,
  generateDailyReminder,
  correctArabicSentence,
  explainDua,
};