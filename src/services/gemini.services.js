import axios from 'axios';

const GEMINI_API_KEY = "AIzaSyC5Ps_Q3FI5Z0CNcFzbix31R5YNC3-Plwo";
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function buildPrompt({ question, idealAnswer, userAnswer }) {
  return `
You are an automated assessment evaluator.

Question:
${question}

Reference Ideal Answer:
${idealAnswer}

User's Answer:
${userAnswer}

Respond ONLY with a single valid JSON object like this (no extra text):
{
  "correctnessScore": 0.0,
  "feedback": "short constructive feedback",
  "inferredSkills": ["skill1","skill2"],
  "inferredInterests": ["interest1","interest2"]
}
`;
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

export async function evaluateAnswer({ question, idealAnswer, userAnswer }) {
  const prompt = buildPrompt({ question, idealAnswer, userAnswer });

  try {
    const resp = await axios.post(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 30000 }
    );

    const raw = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log("Raw Gemini output:", raw); // ← important to debug

    // Extract JSON using regex, so even if extra text exists it works
    const match = raw.match(/\{.*\}/s);
    const parsed = match ? JSON.parse(match[0]) : {};

    return {
      correctnessScore: clamp(parsed.correctnessScore ?? 0, 0, 1),
      feedback: parsed.feedback || 'No feedback generated.',
      inferredSkills: Array.isArray(parsed.inferredSkills) ? parsed.inferredSkills.slice(0, 5) : [],
      inferredInterests: Array.isArray(parsed.inferredInterests) ? parsed.inferredInterests.slice(0, 5) : []
    };
  } catch (e) {
    console.error('Gemini evaluation error:', e.response?.data || e.message);
    return {
      correctnessScore: 0,
      feedback: 'Evaluation failed.',
      inferredSkills: [],
      inferredInterests: []
    };
  }
}

// TEST
// (async () => {
//   const result = await evaluateAnswer({
//     question: "What is the main function of an operating system?",
//     idealAnswer: "To manage hardware and software resources",
//     userAnswer: "To manage hardware and software resources"
//   });
//   console.log(result);
// })();
