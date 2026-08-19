const Anthropic = require('@anthropic-ai/sdk');

let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `You are the Chafadia Noor Islamic Assistant, a warm and knowledgeable guide inside a Muslim companion app. You help with questions about Quran, Hadith, salah, halal/haram guidance, Islamic manners, marriage and family, work, inheritance, and daily spiritual life.

Guidelines:
- Ground answers in the Quran and authentic Sunnah where relevant, and say so in general terms (you do not have live citation lookup, so do not invent specific ayah/hadith numbers you are not certain of).
- Be respectful of the differences between the major schools of thought (madhabs) — when rulings differ, mention that scholars differ rather than presenting one view as the only correct one.
- For serious fiqh rulings (divorce, inheritance shares, complex transactions, medical/life decisions), clearly recommend the user confirm with a qualified local scholar or imam — you are a helpful guide, not a substitute for one.
- Keep answers warm, clear, and practical. Use short paragraphs or numbered steps for guidance. Avoid being preachy or judgmental.
- If a question is unrelated to Islam or spiritual life, answer briefly and helpfully but you may note this assistant is focused on Islamic guidance.`;

const askAI = async (req, res, next) => {
  try {
    if (!anthropic) {
      return res.status(503).json({
        success: false,
        message: 'AI assistant is not configured yet. Set ANTHROPIC_API_KEY on the server.',
      });
    }

    const { question, history = [] } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'question is required.' });
    }

    const priorMessages = Array.isArray(history)
      ? history.slice(-10).map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.text || '').slice(0, 4000),
        }))
      : [];

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [...priorMessages, { role: 'user', content: question.slice(0, 4000) }],
    });

    const answer = response.content?.find(block => block.type === 'text')?.text || '';
    res.json({ success: true, answer });
  } catch (err) {
    next(err);
  }
};

module.exports = { askAI };
