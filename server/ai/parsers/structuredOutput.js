const { z } = require('zod');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

// --- Shared Zod schemas -----------------------------------------------------
// These define the CONTRACT the LLM must satisfy. Every AI response is
// validated against one of these before it is ever written to MongoDB.

const resumeAnalysisSchema = z.object({
  contactInfo: z.object({
    name: z.string().optional().default(''),
    email: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    linkedin: z.string().optional().default(''),
    github: z.string().optional().default(''),
    portfolio: z.string().optional().default(''),
  }),
  career: z.object({
    currentRole: z.string().optional().default(''),
    targetRole: z.string().optional().default(''),
    experienceLevel: z.string().optional().default(''),
  }),
  skills: z.object({
    technical: z.array(z.string()).default([]),
    soft: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    frameworks: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
  }),
  experience: z
    .array(
      z.object({
        company: z.string().default(''),
        role: z.string().default(''),
        responsibilities: z.array(z.string()).default([]),
        achievements: z.array(z.string()).default([]),
        quantifiedImpact: z.array(z.string()).default([]),
      })
    )
    .default([]),
  education: z
    .array(z.object({ degree: z.string().default(''), university: z.string().default(''), graduationYear: z.string().default('') }))
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().default(''),
        technologies: z.array(z.string()).default([]),
        description: z.string().default(''),
        impact: z.string().default(''),
      })
    )
    .default([]),
  certifications: z.array(z.string()).default([]),

  overallScore: z.number().min(0).max(100),
  atsScore: z.number().min(0).max(100),
  skillsScore: z.number().min(0).max(100),
  experienceScore: z.number().min(0).max(100),
  projectScore: z.number().min(0).max(100),
  educationScore: z.number().min(0).max(100),
  impactScore: z.number().min(0).max(100),
  formattingScore: z.number().min(0).max(100),
  keywordScore: z.number().min(0).max(100),
  summaryScore: z.number().min(0).max(100),

  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
  atsIssues: z.array(z.object({ problem: z.string(), recommendation: z.string() })).default([]),
  recommendations: z.array(z.string()).default([]),
});

const jobAnalysisSchema = z.object({
  jobTitle: z.string().default(''),
  company: z.string().default(''),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  experienceRequirements: z.array(z.string()).default([]),
  educationRequirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
});

const matchingSchema = z.object({
  matchScore: z.number().min(0).max(100).default(0),
  skillMatchScore: z.number().min(0).max(100),
  experienceMatchScore: z.number().min(0).max(100),
  educationMatchScore: z.number().min(0).max(100),
  keywordMatchScore: z.number().min(0).max(100),
  categoryScores: z.object({
    requiredSkills: z.number().min(0).max(100).default(0),
    preferredSkills: z.number().min(0).max(100).default(0),
    relevantExperience: z.number().min(0).max(100).default(0),
    projectRelevance: z.number().min(0).max(100).default(0),
    educationMatch: z.number().min(0).max(100).default(0),
    keywordMatch: z.number().min(0).max(100).default(0),
    resumeQuality: z.number().min(0).max(100).default(0),
  }).default({}),
  experienceBreakdown: z.object({
    formalExperiencePresent: z.boolean().default(false),
    internshipPresent: z.boolean().default(false),
    freelancePresent: z.boolean().default(false),
    projectExperiencePresent: z.boolean().default(false),
  }).default({}),
  matchedSkills: z.array(z.union([
    z.object({
      skill: z.string(),
      status: z.literal('STRONG_MATCH').default('STRONG_MATCH'),
      resumeEvidence: z.array(z.string()).default([]),
      jobRequirement: z.string().default(''),
      explanation: z.string().default(''),
    }),
    z.string(),
  ])).default([]),
  partialMatches: z.array(z.union([
    z.object({
      skill: z.string(),
      status: z.literal('PARTIAL_MATCH').default('PARTIAL_MATCH'),
      resumeEvidence: z.array(z.string()).default([]),
      jobRequirement: z.string().default(''),
      explanation: z.string().default(''),
    }),
    z.string(),
  ])).default([]),
  missingSkills: z.array(z.union([
    z.object({
      skill: z.string(),
      status: z.literal('MISSING').default('MISSING'),
      priority: z.enum(['REQUIRED', 'PREFERRED', 'NICE_TO_HAVE']).default('PREFERRED'),
      jobRequirement: z.string().default(''),
      reason: z.string().default(''),
    }),
    z.string(),
  ])).default([]),
  criticalSkillGaps: z.array(z.string()).default([]),
  recommendedSkills: z.array(z.string()).default([]),
  matchedKeywords: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
  resumeImprovements: z.array(z.string()).default([]),
  interviewPrepAreas: z.array(z.string()).default([]),
});

const jobSearchProfileSchema = z.object({
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  libraries: z.array(z.string()).default([]),
  databases: z.array(z.string()).default([]),
  developerTools: z.array(z.string()).default([]),
  cloudSkills: z.array(z.string()).default([]),
  aiMlSkills: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  education: z.array(z.string()).default([]),
  workExperience: z.array(z.string()).default([]),
  internshipExperience: z.array(z.string()).default([]),
  experienceLevel: z.enum(['Fresher', 'Entry Level', 'Experienced', 'Unknown']).default('Unknown'),
  targetRoles: z.array(z.string()).max(5).default([]),
  keywords: z.array(z.string()).default([]),
});

const improvementSchema = z.object({
  professionalSummary: z.object({ before: z.string().default(''), after: z.string().default('') }),
  skillsSuggestions: z.array(z.string()).default([]),
  experienceBullets: z
    .array(z.object({ before: z.string(), after: z.string() }))
    .default([]),
  projectSuggestions: z
    .array(z.object({ before: z.string(), after: z.string() }))
    .default([]),
  keywordsToAdd: z.array(z.string()).default([]),
  notes: z.string().default(''),
});

const bulletImproverSchema = z.object({
  original: z.string(),
  alternatives: z.array(z.object({ style: z.string(), text: z.string() })).min(1),
});

const skillGapSchema = z.object({
  highPriority: z
    .array(z.object({ skill: z.string(), whyItMatters: z.string(), foundInJobDescription: z.string(), learningDirection: z.string() }))
    .default([]),
  mediumPriority: z
    .array(z.object({ skill: z.string(), whyItMatters: z.string(), foundInJobDescription: z.string(), learningDirection: z.string() }))
    .default([]),
  lowPriority: z
    .array(z.object({ skill: z.string(), whyItMatters: z.string(), foundInJobDescription: z.string(), learningDirection: z.string() }))
    .default([]),
});

const interviewPrepSchema = z.object({
  technicalQuestions: z.array(questionShape()).default([]),
  behavioralQuestions: z.array(questionShape()).default([]),
  resumeBasedQuestions: z.array(questionShape()).default([]),
  projectQuestions: z.array(questionShape()).default([]),
  roleSpecificQuestions: z.array(questionShape()).default([]),
  disclaimer: z.string().default('These are AI-generated practice questions, not guaranteed interview questions.'),
});

function questionShape() {
  return z.object({
    question: z.string(),
    whyAsked: z.string().default(''),
    interviewerExpectation: z.string().default(''),
    keyConceptsToCover: z.array(z.string()).default([]),
  });
}

// --- Parsing helpers ---------------------------------------------------------

/** Strips markdown code fences some models wrap JSON in, then parses it. */
function safeParseJson(rawText) {
  if (typeof rawText !== 'string') return rawText; // already an object (structured output)
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    logger.error('Failed to parse AI JSON output', { error: err.message });
    throw ApiError.internal('The AI returned a response we could not parse. Please try again.');
  }
}

function validateWithSchema(schema, raw) {
  const data = safeParseJson(raw);
  const result = schema.safeParse(data);
  if (!result.success) {
    logger.error('AI response failed schema validation', { issues: result.error.issues });
    throw ApiError.internal('The AI response did not match the expected format. Please try again.');
  }
  return result.data;
}

module.exports = {
  schemas: {
    resumeAnalysisSchema,
    jobAnalysisSchema,
    matchingSchema,
    jobSearchProfileSchema,
    improvementSchema,
    bulletImproverSchema,
    skillGapSchema,
    interviewPrepSchema,
  },
  safeParseJson,
  validateWithSchema,
};
