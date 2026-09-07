const Resume = require('../models/Resume');
const Job = require('../models/Job');
const Application = require('../models/Application');

async function getDashboardData(userId) {
  const [resumes, jobs, applications] = await Promise.all([
    Resume.find({ userId }).sort({ createdAt: -1 }),
    Job.find({ userId }).sort({ createdAt: -1 }),
    Application.find({ userId }).sort({ createdAt: -1 }).limit(50),
  ]);

  const resumeScores = resumes.map((r) => r.score).filter((s) => typeof s === 'number');
  const bestResumeScore = resumeScores.length ? Math.max(...resumeScores) : null;

  const matchScores = jobs.map((j) => j.matchScore).filter((s) => typeof s === 'number');
  const averageMatchScore = matchScores.length
    ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
    : null;

  const highMatchJobs = jobs.filter((j) => typeof j.matchScore === 'number' && j.matchScore >= 75).length;

  const appliedCount = jobs.filter((j) => j.status !== 'saved').length;

  const pipelineCounts = jobs.reduce((acc, j) => {
    acc[j.status] = (acc[j.status] || 0) + 1;
    return acc;
  }, { saved: 0, applied: 0, assessment: 0, interview: 0, offer: 0, rejected: 0 });

  const missingSkillsFrequency = {};
  for (const app of applications) {
    for (const skill of app.missingSkills || []) {
      missingSkillsFrequency[skill] = (missingSkillsFrequency[skill] || 0) + 1;
    }
  }
  const topMissingSkills = Object.entries(missingSkillsFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  const recentActivity = [
    ...resumes.slice(0, 5).map((r) => ({ type: 'resume_uploaded', label: r.label, at: r.createdAt })),
    ...jobs.slice(0, 5).map((j) => ({ type: 'job_saved', label: `${j.position} @ ${j.company}`, at: j.createdAt })),
    ...applications.slice(0, 5).map((a) => ({ type: 'match_analyzed', label: `Match score ${a.matchScore}`, at: a.createdAt })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 10);

  return {
    resumeScore: bestResumeScore,
    numberOfResumes: resumes.length,
    jobsAnalyzed: jobs.length,
    averageMatchScore,
    applications: appliedCount,
    highMatchJobs,
    missingSkills: topMissingSkills,
    pipeline: pipelineCounts,
    recentActivity,
    resumeScoreHistory: resumes
      .filter((r) => typeof r.score === 'number')
      .slice(0, 10)
      .reverse()
      .map((r) => ({ label: r.label, score: r.score, date: r.createdAt })),
  };
}

module.exports = { getDashboardData };
