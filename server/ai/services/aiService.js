/**
 * Provider-independent AI service surface.
 *
 * Controllers and business-logic services must ONLY import from here — never
 * from ai/llm, ai/chains, or any provider SDK directly. This is what keeps
 * resumeService, jobService, matchingService, dashboardService etc. completely
 * unaware of which LLM provider is actually configured.
 */
const { analyzeResume } = require('../chains/resumeAnalysisChain');
const { analyzeJobDescription } = require('../chains/jobAnalysisChain');
const { matchResumeToJob } = require('../chains/matchingChain');
const { improveResume } = require('../chains/improvementChain');
const { improveBullet } = require('../chains/bulletImproverChain');
const { analyzeSkillGap } = require('../chains/skillGapChain');
const { generateInterviewPrep } = require('../chains/interviewPrepChain');
const { extractJobSearchProfile } = require('../chains/jobSearchProfileChain');

module.exports = {
  analyzeResume,
  analyzeJobDescription,
  matchResumeToJob,
  improveResume,
  improveResumeBullet: improveBullet,
  analyzeSkillGap,
  generateInterviewQuestions: generateInterviewPrep,
  extractJobSearchProfile,
};
