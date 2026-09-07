const { URL } = require('url');

const BLOCKED_HOSTS = new Set([
  'instagram.com', 'www.instagram.com', 'facebook.com', 'www.facebook.com',
  'twitter.com', 'x.com', 'youtube.com', 'tiktok.com',
]);
const COMMON_SKILLS = [
  'Docker', 'Kubernetes', 'Redis', 'AWS', 'Azure', 'GCP', 'Terraform', 'Jenkins',
  'GraphQL', 'TypeScript', 'JavaScript', 'Python', 'Java', 'React', 'Node.js',
  'MongoDB', 'PostgreSQL', 'SQL', 'REST API', 'FastAPI', 'Spring Boot', 'Git',
];

const SOCIAL_HOSTS = new Set([
  'reddit.com', 'www.reddit.com', 'instagram.com', 'www.instagram.com',
  'facebook.com', 'www.facebook.com', 'twitter.com', 'x.com',
  't.me', 'telegram.me', 'youtube.com', 'www.youtube.com',
]);
const JOB_BOARD_HOSTS = ['linkedin.com', 'indeed.com', 'naukri.com', 'wellfound.com', 'greenhouse.io', 'lever.co', 'workday.com', 'myworkdayjobs.com'];

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && !BLOCKED_HOSTS.has(url.hostname);
  } catch (_) {
    return false;
  }
}

function cleanText(value) {
  return String(value || '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/(?:cookie|privacy policy|terms of use|read more|sign in|log in|subscribe|menu|navigation)\b/gi, ' ')
    .replace(/[*_`#>~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sourceQuality(urlValue) {
  try {
    const host = new URL(urlValue).hostname.toLowerCase();
    if (host.includes('greenhouse.io') || host.includes('lever.co') || host.includes('myworkdayjobs.com')) return 95;
    if (host.includes('linkedin.com') || host.includes('indeed.com') || host.includes('wellfound.com')) return 82;
    if (host.includes('jobs.') || host.includes('careers.') || host.includes('workable.com')) return 90;
    return 60;
  } catch (_) {
    return 0;
  }

}

function classifySource(urlValue, title, content) {
  let host = '';
  let path = '';
  try {
    const url = new URL(urlValue);
    host = url.hostname.toLowerCase();
    path = url.pathname.toLowerCase();
  } catch (_) {
    return 'UNKNOWN';
  }
  const text = `${title} ${content}`.toLowerCase();
  if (SOCIAL_HOSTS.has(host)) {
    if (/\/(jobs?|careers?|positions?|vacancies?)\//i.test(path) && /\b(apply|responsibilities|required skills|qualifications)\b/i.test(text)) {
      return 'JOB_BOARD_POSTING';
    }
    return host.includes('reddit') ? 'FORUM_POST' : 'SOCIAL_POST';
  }
  if (host.includes('linkedin.com') && /\/(in|posts|feed|activity)\//i.test(path)) {
    return /\/in\//i.test(path) ? 'PROFILE' : 'SOCIAL_POST';
  }
  if (/\b(monthly megathread|who(?:'|’)s looking for work|who(?:'|’)s hiring|discussion|forum|activity feed|view post|like|comment)\b/i.test(text)) return 'DISCUSSION';
  if (/\b(profile|portfolio|expertise|freelancer|available for work|my skills)\b/i.test(`${title} ${path}`)) return 'PROFILE';
  if (/\b(search jobs?|job search|job board|category|jobs in |find jobs?|all jobs|job listings?)\b/i.test(`${title} ${path}`)) return 'SEARCH_PAGE';
  if (/\b(news|blog|salary guide|career advice|how to|tips for)\b/i.test(text)) return 'BLOG';
  if (host.includes('greenhouse.io') || host.includes('lever.co') || host.includes('myworkdayjobs.com') || /\/(careers?|jobs?)\/[^/]+/i.test(path)) return 'COMPANY_CAREERS_PAGE';
  if (JOB_BOARD_HOSTS.some((item) => host.includes(item))) return 'JOB_BOARD_POSTING';
  if (/\b(hiring|apply|responsibilities|requirements|job description)\b/i.test(text)) return 'JOB_POSTING';
  return 'UNKNOWN';
}

function extractCompany(title, content) {
  const fromTitle = String(title || '').match(/\bat\s+([^|–-]+?)(?:\s*-\s*.*)?$/i);
  if (fromTitle) return cleanText(fromTitle[1]).replace(/\s+(?:fresher|jobs?|hiring|careers?)\b.*$/i, '').trim();
  const fromContent = String(content || '').match(/(?:company|employer)\s*:\s*([^.\n|]+)/i);
  return fromContent ? cleanText(fromContent[1]) : '';
}

function extractTitle(title, company) {
  let value = cleanText(title)
    .replace(/\s+(?:hiring|recruiting|careers?|jobs?)\b.*$/i, '')
    .replace(/\s*[-|:]\s*(?:fresher|entry[- ]level|jobs?|careers?).*$/i, '')
    .trim();
  if (company) value = value.replace(new RegExp(`\\s+at\\s+${company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), '').trim();
  return value || 'Job opportunity';
}

function firstUrl(value) {
  const match = String(value || '').match(/https?:\/\/[^\s<>"')]+/i);
  return match ? match[0].replace(/[.,;:]+$/, '') : '';
}

function extractList(content, labels) {
  const pattern = new RegExp(`(?:${labels.join('|')})\\s*[:\\-]\\s*([^.!?]{2,220})`, 'i');
  const match = content.match(pattern);
  return match ? match[1].split(/[,;|•]/).map(cleanText).filter(Boolean).slice(0, 12) : [];
}

function summarize(content) {
  const sentences = cleanText(content)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 25);
  return [...new Set(sentences)].slice(0, 4).join(' ').slice(0, 350);
}

function extractDate(result, content) {
  const explicit = result.published_date || result.publishedDate || result.updated_date || result.updatedDate;
  if (explicit) return explicit;
  const relative = content.match(/\b(today|yesterday|\d+\s+days?\s+ago|\d+\s+hours?\s+ago|this week)\b/i);
  if (relative) return relative[1];
  const absolute = content.match(/(?:posted|published|updated)\s*(?:on)?\s*[:\-]?\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:,?\s+\d{4})?|\d{4}[-/]\d{1,2}[-/]\d{1,2})/i);
  return absolute ? absolute[1] : '';
}

function isGenericListing(result, title, content) {
  const lowerTitle = title.toLowerCase();
  const listingTitle = /\b(search jobs?|jobs? in |1000|\d{3,}\s+jobs?|job listings?|job board|find jobs?)\b/i.test(lowerTitle);
  const listingBody = (content.match(/\b(job|jobs|apply)\b/gi) || []).length > 35;
  const jobHeadingCount = (content.match(/\b(?:job|internship|developer|engineer|designer|analyst)\s+(?:opportunity|role|position)\b/gi) || []).length;
  const negative = /\b(salary guide|course|certification|career advice|news article|blog post|interview tips)\b/i.test(content);
  return listingTitle || listingBody || jobHeadingCount > 1 || negative;
}

function looksLikeJob(result, title, content) {
  const positive = ['job', 'career', 'hiring', 'apply', 'responsibilities', 'requirements', 'employment', 'job description'];
  const signals = positive.filter((term) => `${title} ${content}`.toLowerCase().includes(term)).length;
  return signals >= 2 && !isGenericListing(result, title, content);
}

function normalizeJobResult(result) {
  if (!validHttpUrl(result.url)) return null;
  const rawContent = String(result.raw_content || result.content || '');
  const content = cleanText(rawContent);
  const rawTitle = cleanText(result.title);
  if (!rawTitle || !looksLikeJob(result, rawTitle, content)) return null;
  const sourceType = classifySource(result.url, rawTitle, content);
  if (!['JOB_POSTING', 'COMPANY_CAREERS_PAGE', 'JOB_BOARD_POSTING'].includes(sourceType)) return null;
  if (isGenericListing(result, rawTitle, content)) return null;
  const company = extractCompany(rawTitle, content);
  const title = extractTitle(rawTitle, company);
  if (!title || title.length < 3 || /\b(expertise|profile|megathread|discussion|jobs? in|latest jobs?)\b/i.test(title)) return null;

  const locationMatch = content.match(/(?:location|located in|based in)\s*[:|-]?\s*([^.!?\n|]{2,90})/i);
  const typeMatch = content.match(/\b(full[- ]time|part[- ]time|contract|internship|temporary)\b/i);
  const workplaceType = /\bhybrid\b/i.test(content) ? 'Hybrid' : /\b(remote|work from home)\b/i.test(content) ? 'Remote' : 'On-site';
  const publishedDate = extractDate(result, content);
  const applyUrl = firstUrl(rawContent.match(/(?:apply|application|careers?)\s*(?:at|here|link)?\s*[:\-]?\s*(https?:\/\/[^\s<>"')]+)/i)?.[1]);
  const sourceUrl = result.url;
  const description = summarize(result.content || result.raw_content);
  const requirements = extractList(content, ['requirements', 'qualifications', 'what you will need']);
  const skills = [...new Set([
    ...extractList(content, ['skills', 'technologies', 'tech stack']),
    ...COMMON_SKILLS.filter((skill) => new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i').test(content)),
  ])].slice(0, 12);
  if (description.length < 80 || (!locationMatch && !applyUrl && sourceType === 'JOB_BOARD_POSTING')) return null;
  const qualityScore = Math.max(0,
    (title.length >= 5 ? 25 : 0)
    + (company ? 20 : 0)
    + (description.length >= 100 ? 20 : 0)
    + (requirements.length || skills.length ? 15 : 0)
    + (locationMatch || typeMatch ? 10 : 0)
    + (validHttpUrl(applyUrl || sourceUrl) ? 10 : 0)
    - (isGenericListing(result, rawTitle, content) ? 40 : 0)
  );
  if (qualityScore < 60) return null;

  const job = {
    title,
    company,
    location: locationMatch ? cleanText(locationMatch[1]) : 'Not specified',
    workplaceType,
    isRemote: workplaceType === 'Remote',
    employmentType: typeMatch ? cleanText(typeMatch[1]) : 'Not specified',
    jobType: typeMatch ? cleanText(typeMatch[1]) : null,
    experienceLevel: 'Not specified',
    description,
    requirements,
    requiredSkills: skills,
    skills,
    applyUrl: applyUrl && validHttpUrl(applyUrl) && applyUrl !== sourceUrl ? applyUrl : '',
    sourceUrl,
    source: (() => { try { return new URL(sourceUrl).hostname; } catch (_) { return 'Not specified'; } })(),
    sourceType,
    qualityScore,
    postedDate: publishedDate || null,
    publishedDate: publishedDate || null,
    updatedDate: '',
    fetchedAt: result.fetched_at || new Date().toISOString(),
    sourceQuality: sourceQuality(sourceUrl),
    postingQuality: Math.min(100, 45 + (locationMatch ? 15 : 0) + (typeMatch ? 10 : 0) + (applyUrl ? 20 : 0)),
  };
  return isValidJobPosting(job) ? job : null;
}

function isValidJobPosting(job) {
  if (!job || !validHttpUrl(job.sourceUrl)) return false;
  if (!['JOB_POSTING', 'COMPANY_CAREERS_PAGE', 'JOB_BOARD_POSTING'].includes(job.sourceType)) return false;
  if (!job.title || job.title.length < 3 || /\b(profile|megathread|discussion|expertise)\b/i.test(job.title)) return false;
  if (!job.description || job.description.length < 80) return false;
  if (!job.applyUrl && !job.sourceUrl) return false;
  return Number(job.qualityScore) >= 60;
}

module.exports = { normalizeJobResult, isValidJobPosting, classifySource };
