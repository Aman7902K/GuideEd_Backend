/**
 * Gemini (Google Generative AI) evaluation wrapper.
 * Replace axios call with official SDK if you prefer.
 */
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

function buildPrompt({ question, idealAnswer, userAnswer }) {
  return `
You are an automated assessment evaluator.

Question:
${question}

Reference Ideal Answer:
${idealAnswer}

User's Answer:
${userAnswer}

Evaluate and respond ONLY with strict JSON:
{
  "correctnessScore": <0..1>,
  "feedback": "short constructive feedback",
  "inferredSkills": ["skill1","skill2"],
  "inferredInterests": ["interest1","interest2"]
}
`;
}

export async function evaluateAnswer({ question, idealAnswer, userAnswer }) {
  const prompt = buildPrompt({ question, idealAnswer, userAnswer });

  try {
    const resp = await axios.post(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 20000 }
    );

    const raw = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    return {
      correctnessScore: clamp(parsed.correctnessScore ?? 0, 0, 1),
      feedback: parsed.feedback || 'No feedback generated.',
      inferredSkills: Array.isArray(parsed.inferredSkills) ? parsed.inferredSkills.slice(0, 5) : [],
      inferredInterests: Array.isArray(parsed.inferredInterests) ? parsed.inferredInterests.slice(0, 5) : []
    };
  } catch (e) {
    console.error('Gemini evaluation error:', e.message);
    return {
      correctnessScore: 0,
      feedback: 'Evaluation failed.',
      inferredSkills: [],
      inferredInterests: []
    };
  }
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}