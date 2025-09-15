// career.services.js

import axios from 'axios';

// Gemini API details
const GEMINI_API_URL =  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GEMINI_API_KEY = "AIzaSyC5Ps_Q3FI5Z0CNcFzbix31R5YNC3-Plwo";

export const generateCareerInsights = async (report) => {
  try {
    // Generate Career Insights
    const careerPrompt = createCareerPrompt(report);
    const careerResponse = await callGeminiAPI(careerPrompt);
    const careerInsights = parseGeminiResponse(careerResponse);

    // Generate Nearby Colleges based on location
    const locationPrompt = createLocationPrompt(report);
    const locationResponse = await callGeminiAPI(locationPrompt);
    const nearbyColleges = parseGeminiResponse(locationResponse);

    return {
      topCareerPaths: careerInsights.topCareerPaths || [],
      learningPath: careerInsights.learningPath || [],
      actionPlan: careerInsights.actionPlan || [],
      nearbyColleges: nearbyColleges.nearbyColleges || []
    };

  } catch (error) {
    console.error('Gemini API error:', error.message);
    return {
      topCareerPaths: [],
      learningPath: [],
      actionPlan: [],
      nearbyColleges: []
    };
  }
};

async function callGeminiAPI(prompt) {
  const response = await axios.post(
    GEMINI_API_URL,
    {
      prompt: prompt,
      max_tokens: 1000,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      },
      timeout: 10000
    }
  );

  if (response.status !== 200 || !response.data) {
    throw new Error('Invalid response from Gemini');
  }
  return response.data;
}

function createCareerPrompt(report) {
  return `
You are an expert career counselor. Based on the following assessment data, recommend the top career paths, learning paths, and action plans.

User Interests: ${report.interests.join(', ')}
User Strengths: ${report.strengths.join(', ') || 'None'}
User Weaknesses: ${report.weaknesses.join(', ')}

Please generate:
1. Top 3 career paths with explanations, required skills, and industries.
2. Recommended learning path steps for the next 6 months.
3. A structured action plan with timelines.

Provide the output in JSON format with fields: topCareerPaths, learningPath, actionPlan.
`;
}

function createLocationPrompt(report) {
  const state = report.userLocation?.state || 'your state';
  return `
You are an education consultant. Provide a list of the top 10 colleges in the state of ${state} in India.  
For each college, include:
- Name of the college
- Website link

Please provide the response in JSON format as an object named "nearbyColleges", with each entry containing "name" and "website".
`;
}

function parseGeminiResponse(data) {
  try {
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return data;
  } catch (error) {
    console.error('Parsing Gemini response failed:', error.message);
    return {};
  }
}
