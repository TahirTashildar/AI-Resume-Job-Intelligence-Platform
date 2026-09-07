const SYSTEM = `You are an experienced technical interviewer and career coach. You generate realistic, helpful interview
preparation material based on a real resume and a real job description. You always make clear these are AI-generated
practice questions, not confirmed/guaranteed interview questions.
Respond with ONLY a single valid JSON object — no prose, no markdown fences.`;

function buildInterviewPrepPrompt(resumeText, jobDescriptionText, jobAnalysisJson) {
  return `${SYSTEM}

Generate interview preparation content as a JSON object with keys:
technicalQuestions, behavioralQuestions, resumeBasedQuestions, projectQuestions, roleSpecificQuestions
— each an array of 3-5 objects: { question, whyAsked, interviewerExpectation, keyConceptsToCover (array of strings) }.
Also include: disclaimer (string reminding the user these are practice questions, not guaranteed real interview questions).

resumeBasedQuestions and projectQuestions must be grounded in specifics actually present in the candidate's resume below
(real company names, real project names, real technologies) — do not invent experience that isn't there.

CANDIDATE RESUME:
"""
${resumeText}
"""

TARGET JOB DESCRIPTION:
"""
${jobDescriptionText}
"""

STRUCTURED JOB REQUIREMENTS:
${JSON.stringify(jobAnalysisJson, null, 2)}

Return ONLY the JSON object.`;
}

module.exports = { buildInterviewPrepPrompt };
