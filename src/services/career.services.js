import axios from 'axios';

// Prefer env var over hardcoding secrets
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export const generateCareerInsights = async (report) => {
  const result = {
    topCareerPaths: [],
    learningPath: [],
    actionPlan: [],
    nearbyColleges: []
  };

  // 1) Career insights
  try {
    const careerPrompt = createCareerPrompt(report);
    const careerResponse = await callGeminiAPI(careerPrompt, { response_mime_type: 'application/json' });
    const careerText = extractTextFromCandidates(careerResponse);
    console.debug('[Gemini Career raw]:', careerText?.slice(0, 500));
    const careerInsights = robustParseJson(careerText);

    result.topCareerPaths = Array.isArray(careerInsights?.topCareerPaths) ? careerInsights.topCareerPaths : [];
    result.learningPath = Array.isArray(careerInsights?.learningPath) ? careerInsights.learningPath : [];
    result.actionPlan = Array.isArray(careerInsights?.actionPlan) ? careerInsights.actionPlan : [];
  } catch (error) {
    console.error('Gemini career insights error:', error?.response?.data || error?.message || error);
  }

  // 2) Nearby colleges
  try {
    const locationPrompt = createLocationPrompt(report);
    const locationResponse = await callGeminiAPI(locationPrompt, { response_mime_type: 'application/json' });
    const locationText = extractTextFromCandidates(locationResponse);
    console.debug('[Gemini Colleges raw]:', locationText?.slice(0, 500));
    const nearbyCollegesObj = robustParseJson(locationText);

    // Accept either:
    // - { nearbyColleges: [...] }
    // - [ {...}, {...} ]
    let colleges = [];
    if (Array.isArray(nearbyCollegesObj)) {
      colleges = nearbyCollegesObj;
    } else if (Array.isArray(nearbyCollegesObj?.nearbyColleges)) {
      colleges = nearbyCollegesObj.nearbyColleges;
    }

    result.nearbyColleges = sanitizeCollegesArray(colleges);
  } catch (error) {
    console.error('Gemini nearby colleges error:', error?.response?.data || error?.message || error);
  }

  return result;
};

async function callGeminiAPI(prompt, generationConfig = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    // For newer Gemini models, this helps force JSON-only responses
    generationConfig
  };

  const response = await axios.post(
    `${GEMINI_API_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    body,
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 25000
    }
  );

  if (response.status !== 200 || !response.data) {
    throw new Error('Invalid response from Gemini');
  }
  return response.data;
}

function extractTextFromCandidates(apiData) {
  try {
    const parts = apiData?.candidates?.[0]?.content?.parts || [];
    const text = parts
      .map((p) => (typeof p?.text === 'string' ? p.text : ''))
      .filter(Boolean)
      .join('\n')
      .trim();
    return text || '';
  } catch {
    return '';
  }
}

// More robust JSON parsing:
// - Strips any backticks anywhere
// - Extracts the first JSON object `{...}` or array `[...]` from the text
// - Parses it safely
function robustParseJson(text) {
  if (!text) return {};
  const cleaned = String(text)
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Try to find the first JSON object or array
  const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!match) {
    // As a last resort, try direct parse
    try {
      return JSON.parse(cleaned);
    } catch {
      return {};
    }
  }

  const jsonCandidate = match[1];
  try {
    return JSON.parse(jsonCandidate);
  } catch (err) {
    console.error('JSON parse failed:', err?.message);
    return {};
  }
}

function sanitizeCollegesArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((c) => ({
      name: typeof c?.name === 'string' ? c.name : '',
      website: typeof c?.website === 'string' ? c.website : '',
      city: typeof c?.city === 'string' ? c.city : '',
      state: typeof c?.state === 'string' ? c.state : '',
      matchingPrograms: Array.isArray(c?.matchingPrograms) ? c.matchingPrograms.filter((x) => typeof x === 'string') : [],
      reason: typeof c?.reason === 'string' ? c.reason : ''
    }))
    .filter((c) => c.name); // keep only items with a name
}

function createCareerPrompt(report) {
  const interests = (report.interests || []).join(', ');
  const strengths = (report.strengths || []).join(', ');
  const weaknesses = (report.weaknesses || []).join(', ');

  return `
You are an expert career counselor. Based on the following assessment data, recommend the top career paths, learning paths, and action plans.

User Interests: ${interests || 'None'}
User Strengths: ${strengths || 'None'}
User Weaknesses: ${weaknesses || 'None'}
Average Score: ${typeof report.averageScore === 'number' ? report.averageScore : 'N/A'}

Please generate:
1. Top 3 career paths with explanations, required skills, and industries.
2. Recommended learning path steps for the next 6 months.
3. A structured action plan with timelines.

Respond ONLY with valid JSON:
{
  "topCareerPaths": [...],
  "learningPath": [...],
  "actionPlan": [...]
}
No extra text, no markdown, no code fences.
`;
}

function createLocationPrompt(report) {
  const state = report.userLocation?.state || '';
  const city = report.userLocation?.city || '';
  const interests = (report.interests || []).join(', ') || 'General Studies';

  const where = city
    ? `${city}, ${state || 'India'}`
    : state
      ? `${state}, India`
      : 'India';

  return `
You are an Indian education counselor. Given the user's interests and location, recommend nearby colleges with strong programs directly aligned to those interests.

User Interests: ${interests}
User Location: ${where}

Instructions:
- Recommend up to 10 colleges that offer strong, reputable programs aligned to the interests.
- Prefer colleges nearest to the provided location (city prioritized over state; if no location, recommend top options in India).
- For each college include:
  - name (string)
  - website (string, direct URL)
  - city (string)
  - state (string)
  - matchingPrograms (array of strings; program names mapped to the given interests)
  - reason (string; one concise line why this is a good match)

Respond ONLY with valid JSON:
{
  "nearbyColleges": [
    {
      "name": "Example Institute of Technology",
      "website": "https://www.example.edu",
      "city": "Pune",
      "state": "Maharashtra",
      "matchingPrograms": ["Computer Science (AI/ML)", "Data Science"],
      "reason": "Strong AI/ML research with industry partnerships; high placement rates."
    }
  ]
}
No extra text, no markdown, no code fences.
`;
}