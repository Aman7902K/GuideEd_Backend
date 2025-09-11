/**
 * Aggregates per-answer evaluation to derive strengths, weaknesses, interests.
 */

export function aggregateAnswers(answers) {
  if (!answers.length) {
    return {
      averageScore: 0,
      strengths: [],
      weaknesses: [],
      interests: [],
      skillFrequency: {}
    };
  }

  const averageScore = answers.reduce((s, a) => s + (a.correctnessScore || 0), 0) / answers.length;

  const skillCounts = {};
  const interestCounts = {};

  answers.forEach(a => {
    (a.inferredSkills || []).forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
    (a.inferredInterests || []).forEach(intr => {
      interestCounts[intr] = (interestCounts[intr] || 0) + 1;
    });
  });

  const strengths = Object.entries(skillCounts)
    .filter(([, c]) => c >= Math.max(2, answers.length * 0.25))
    .map(([k]) => k);

  const weaknesses = Object.entries(skillCounts)
    .filter(([, c]) => c <= 1)
    .map(([k]) => k)
    .filter(k => !strengths.includes(k));

  const interests = Object.entries(interestCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
    .slice(0, 8);

  return {
    averageScore: Number(averageScore.toFixed(3)),
    strengths,
    weaknesses,
    interests,
    skillFrequency: skillCounts
  };
}