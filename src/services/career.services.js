/**
 * Simple rule-based career matching (placeholder).
 * If you already have careerpath.model.js you can integrate dynamic data.
 */

const CAREERS = [
  {
    career: 'Software Engineer',
    requiredSkills: ['problem-solving', 'analytical', 'algorithms', 'communication'],
    industryTrends: { growth: 'High', demand: 'High', averageSalary: '$70k-$150k' },
    description: 'Build and maintain software systems.',
    educationPath: 'CS degree or bootcamp + portfolio'
  },
  {
    career: 'Data Analyst',
    requiredSkills: ['data-analysis', 'statistics', 'excel', 'sql'],
    industryTrends: { growth: 'Moderate', demand: 'High', averageSalary: '$60k-$110k' },
    description: 'Interpret data for decisions.',
    educationPath: 'Stats / Data courses + SQL practice'
  },
  {
    career: 'UX Designer',
    requiredSkills: ['design-thinking', 'empathy', 'communication', 'prototyping'],
    industryTrends: { growth: 'Moderate', demand: 'High', averageSalary: '$65k-$120k' },
    description: 'Design intuitive user experiences.',
    educationPath: 'Design courses + portfolio'
  }
];

export function matchCareers({ strengths, interests, averageScore }) {
  return CAREERS.map(c => {
    const overlap = c.requiredSkills.filter(rs => strengths.includes(rs));
    const base = overlap.length / c.requiredSkills.length;
    const interestBoost = interests.some(i => c.career.toLowerCase().includes(i.toLowerCase())) ? 0.05 : 0;
    const total = Math.min(1, base * 0.7 + averageScore * 0.25 + interestBoost);
    return {
      career: c.career,
      matchPercentage: Math.round(total * 100),
      requiredSkills: c.requiredSkills,
      industryTrends: c.industryTrends,
      description: c.description,
      educationPath: c.educationPath
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3);
}

export function deriveSkillGaps(strengths, topCareers) {
  const needed = new Set(topCareers.flatMap(c => c.requiredSkills));
  return Array.from(needed).filter(s => !strengths.includes(s));
}