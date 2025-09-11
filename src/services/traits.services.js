// Personality & learning path stub utilities

export function inferPersonalityType({ strengths, interests, averageScore }) {
  if (strengths.includes('analytical') && strengths.includes('problem-solving')) return 'INTP-like';
  if (averageScore > 0.8) return 'INTJ-like';
  if (strengths.includes('communication') && interests.includes('design')) return 'ENFP-like';
  return 'Explorer';
}

export function buildLearningPath(skillGaps) {
  return skillGaps.slice(0, 10).map(s => `Complete an introductory course for ${s}.`);
}

export function buildActionPlan(skillGaps) {
  return [
    {
      timeline: '0-1 Month',
      actions: [
        'Establish daily 1 hour study schedule.',
        ...skillGaps.slice(0, 2).map(s => `Learn fundamentals of ${s}.`)
      ]
    },
    {
      timeline: '1-3 Months',
      actions: [
        'Build a mini project applying new skills.',
        'Get peer or mentor feedback.'
      ]
    },
    {
      timeline: '3-6 Months',
      actions: [
        'Contribute to open source / build portfolio project.',
        'Attempt an intermediate certification.'
      ]
    }
  ];
}