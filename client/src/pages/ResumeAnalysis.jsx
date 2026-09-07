import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRight, CheckCircle2, Lightbulb, Sparkles, Upload, X,
} from 'lucide-react';
import ScoreRing from '../components/ui/ScoreRing';
import ProgressBar from '../components/ui/ProgressBar';
import { resumeService } from '../services/resumeService';
import { jobService } from '../services/jobService';
import { matchingService } from '../services/matchingService';
import AiLoadingState from '../components/ui/AiLoadingState';
import { getErrorMessage } from '../services/api';

const TABS = ['Overview', 'Skills Analysis', 'Resume Improvements', 'Learning Plan', 'Interview Prep'];

function Pill({ children, tone = 'slate' }) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    blue: 'bg-brand-50 text-brand-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

function ScoreGrid({ scores }) {
  const items = [
    ['requiredSkills', 'Skills Match'],
    ['relevantExperience', 'Formal Experience'],
    ['projectRelevance', 'Project Relevance'],
    ['educationMatch', 'Education Match'],
    ['keywordMatch', 'Keyword Match'],
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map(([key, label]) => (
        <div key={key} className="rounded-xl bg-slate-50 p-3">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>{label}</span><span className="font-semibold text-slate-700">{scores?.[key] ?? 0}</span>
          </div>
          <ProgressBar value={scores?.[key] ?? 0} />
        </div>
      ))}
    </div>
  );
}

export default function ResumeAnalysis() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [resumeId, setResumeId] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [match, setMatch] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [tab, setTab] = useState('Overview');
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isJobAnalysis = Boolean(match);

  const uploadFile = async (file) => {
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
      && !/\.(pdf|docx)$/i.test(file.name)) {
      toast.error('Please upload a PDF or DOCX resume');
      return;
    }
    setUploading(true);
    try {
      const { resume } = await resumeService.upload(file, file.name.replace(/\.(pdf|docx)$/i, ''));
      setResumeId(resume._id);
      setUploadedFile(file);
      toast.success('Resume uploaded and selected');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) await uploadFile(file);
    event.target.value = '';
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const runAnalysis = async () => {
    if (!resumeId) {
      toast.error('Please upload a resume before starting the analysis.');
      return;
    }
    if (jobDescription.trim() && jobDescription.trim().length < 50) {
      toast.error('Paste a fuller job description (at least 50 characters)');
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);
    setMatch(null);
    setMatchDetails(null);
    try {
      if (!jobDescription.trim()) {
        const result = await resumeService.analyze(resumeId);
        setAnalysis(result.analysis);
      } else {
        const savedJob = await jobService.create({
          company: 'Resume Analysis',
          position: 'Target role',
          jobDescription: jobDescription.trim(),
        });
        const result = await matchingService.analyze(resumeId, savedJob.job._id, true);
        setMatch(result.application);
        setMatchDetails(result.matchDetails);
        setTab('Overview');
      }
      toast.success('Resume intelligence is ready');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const resetResults = () => {
    setResumeId('');
    setUploadedFile(null);
    setJobDescription('');
    setAnalysis(null);
    setMatch(null);
    setMatchDetails(null);
  };

  const categoryScores = matchDetails?.categoryScores;
  const partialMatches = matchDetails?.partialMatches || [];
  const missingDetails = matchDetails?.missingSkillDetails || [];
  const missingSkills = match?.missingSkills || [];
  const recommendations = match?.resumeImprovements || analysis?.recommendations || [];
  const learningSkills = match?.recommendedSkills || missingSkills;

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Resume Intelligence</p>
        <h1 className="text-2xl font-bold text-slate-900">Resume Analysis</h1>
        <p className="text-sm text-slate-500">Connect your resume to a role, or run a focused resume-only review.</p>
      </div>

      {!analysis && !match && (
        <div className="card space-y-6 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Sparkles size={20} /></div>
            <div><h2 className="font-semibold text-slate-900">Build your analysis</h2><p className="text-sm text-slate-500">Two steps to a grounded, actionable result.</p></div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label className="label">1. Upload resume</label>
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleUpload} />
              {!uploadedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  disabled={uploading}
                  className="flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 text-center transition hover:border-brand-300 hover:bg-brand-50/30"
                >
                  <Upload size={26} className="mb-2 text-brand-500" />
                  <span className="font-semibold text-slate-800">{uploading ? 'Uploading resume...' : 'Upload your resume'}</span>
                  <span className="mt-1 text-sm text-slate-500">Drag and drop a PDF or DOCX here, or click to browse</span>
                  <span className="mt-2 text-xs text-slate-400">PDF or DOCX supported</span>
                </button>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                    <div><p className="text-sm font-semibold text-emerald-800">Resume uploaded successfully</p><p className="text-xs text-emerald-700">{uploadedFile.name}</p></div>
                  </div>
                  <button type="button" onClick={() => { setResumeId(''); setUploadedFile(null); }} className="btn-secondary !px-3 !py-2"><X size={15} /> Replace</button>
                </div>
              )}
            </div>
          </div>
          <label className="label">2. Job description <span className="font-normal text-slate-400">(optional)</span></label>
          <textarea
            className="input min-h-[180px] resize-y"
            placeholder="Paste the complete job description here, or leave this blank for a general resume analysis..."
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">{jobDescription.trim() ? 'Job-specific match, skills, learning plan, and interview guidance' : 'Resume score, ATS review, strengths, and profile improvement areas'}</p>
            <button className="btn-primary" onClick={runAnalysis} disabled={analyzing}><Sparkles size={16} /> Analyze Resume</button>
          </div>
        </div>
      )}

      {analyzing && (
        <AiLoadingState messages={['Reading resume evidence...', 'Understanding job requirements...', 'Matching skills and experience...', 'Identifying grounded opportunities...', 'Preparing recommendations...']} />
      )}

      {(analysis || match) && !analyzing && (
        <div className="space-y-5">
          <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div><p className="text-xs uppercase tracking-wider text-slate-400">Analyzed resume</p><h2 className="font-semibold text-slate-900">{uploadedFile?.name}</h2><p className="text-sm text-slate-500">{match ? 'Job-specific analysis' : 'General resume analysis'}</p></div>
            <button className="btn-secondary" onClick={resetResults}>New analysis</button>
          </div>

          {isJobAnalysis ? (
            <>
              <div className="card grid gap-6 p-6 sm:grid-cols-[auto,1fr]">
                <ScoreRing score={match.matchScore} size={128} label="Overall Match" />
                <div className="space-y-4">
                  <div><h2 className="text-lg font-semibold text-slate-900">Your resume is mapped to this role</h2><p className="text-sm text-slate-500">{missingSkills.length ? `The strongest next steps are ${missingSkills.slice(0, 3).join(', ')}.` : 'Your resume shows broad alignment with the role requirements.'}</p></div>
                  <ScoreGrid scores={categoryScores} />
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
                {TABS.map((item) => <button key={item} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${tab === item ? 'border-brand-500 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`} onClick={() => setTab(item)}>{item}</button>)}
              </div>

              {tab === 'Overview' && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="card p-5"><h3 className="mb-3 font-semibold text-slate-800">Experience context</h3><div className="space-y-2 text-sm"><p className="flex justify-between"><span className="text-slate-500">Formal experience</span><strong>{matchDetails?.experienceBreakdown?.formalExperiencePresent ? 'Present' : 'No formal experience listed'}</strong></p><p className="flex justify-between"><span className="text-slate-500">Project experience</span><strong>{matchDetails?.experienceBreakdown?.projectExperiencePresent ? 'Considered in match' : 'Not identified'}</strong></p></div></div>
                  <div className="card p-5"><h3 className="mb-3 font-semibold text-slate-800">Keyword alignment</h3><div className="flex flex-wrap gap-2">{(match.matchedKeywords || []).map((item) => <Pill key={item} tone="blue">{item}</Pill>)}{!(match.matchedKeywords || []).length && <p className="text-sm text-slate-400">No direct keyword matches were returned.</p>}</div></div>
                </div>
              )}

              {tab === 'Skills Analysis' && (
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="card p-5"><h3 className="mb-3 font-semibold text-emerald-700">Strong matches</h3><div className="flex flex-wrap gap-2">{(match.matchedSkills || []).map((item) => <Pill key={item} tone="green">{item}</Pill>)}</div></div>
                  <div className="card p-5"><h3 className="mb-3 font-semibold text-amber-700">Partial matches</h3><div className="space-y-3">{partialMatches.map((item) => <div key={item.skill}><Pill tone="amber">{item.skill}</Pill><p className="mt-2 text-xs text-slate-500">{item.explanation}</p></div>)}</div></div>
                  <div className="card p-5"><h3 className="mb-3 font-semibold text-rose-700">Missing skills</h3><div className="flex flex-wrap gap-2">{missingSkills.map((item) => <Pill key={item} tone="red">{item}</Pill>)}</div></div>
                </div>
              )}

              {tab === 'Resume Improvements' && <RecommendationList items={recommendations} />}
              {tab === 'Learning Plan' && <LearningList items={learningSkills} details={missingDetails} />}
              {tab === 'Interview Prep' && <InterviewPreview onStart={() => navigate('/interview-prep')} existing={match.matchedSkills || []} gaps={missingSkills} />}
            </>
          ) : (
            <GeneralResults analysis={analysis} />
          )}
        </div>
      )}
    </div>
  );
}

function RecommendationList({ items }) {
  return <div className="card p-5"><h3 className="mb-4 font-semibold text-slate-800">Personalized resume improvements</h3><div className="space-y-3">{items.map((item, index) => <div key={index} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><Lightbulb size={17} className="mt-0.5 shrink-0 text-brand-500" />{item}</div>)}{!items.length && <p className="text-sm text-slate-400">No additional improvements were identified.</p>}</div></div>;
}

function LearningList({ items, details }) {
  return <div className="card p-5"><h3 className="mb-1 font-semibold text-slate-800">Your learning priorities</h3><p className="mb-4 text-sm text-slate-500">Focus on gaps that are relevant to this specific role.</p><div className="space-y-3">{items.map((item, index) => { const detail = details.find((entry) => entry.skill === item); return <div key={item} className="rounded-xl border border-slate-100 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="text-xs font-semibold text-brand-600">Priority {index + 1}</span><strong className="text-slate-800">{item}</strong></div><Pill tone={detail?.priority === 'REQUIRED' ? 'red' : 'amber'}>{detail?.priority || 'Relevant gap'}</Pill></div><p className="mt-2 text-sm text-slate-500">{detail?.reason || 'This requirement is relevant to the selected job and is a useful next step to demonstrate.'}</p></div>; })}{!items.length && <p className="text-sm text-slate-400">No job-specific learning gaps identified.</p>}</div></div>;
}

function InterviewPreview({ existing, gaps, onStart }) {
  return <div className="grid gap-4 lg:grid-cols-3"><div className="card p-5"><h3 className="mb-3 font-semibold text-emerald-700">Existing skills to prepare</h3><div className="flex flex-wrap gap-2">{existing.map((item) => <Pill key={item} tone="green">{item}</Pill>)}</div></div><div className="card p-5"><h3 className="mb-3 font-semibold text-amber-700">Skill gaps to learn</h3><div className="flex flex-wrap gap-2">{gaps.map((item) => <Pill key={item} tone="amber">{item}</Pill>)}</div></div><div className="card flex flex-col justify-between p-5"><div><h3 className="font-semibold text-slate-800">Ready to practice?</h3><p className="mt-2 text-sm text-slate-500">Generate deeper technical and behavioral preparation from your saved resume and job.</p></div><button className="btn-primary mt-4 w-full justify-center" onClick={onStart}>Start Interview Prep <ArrowRight size={16} /></button></div></div>;
}

function GeneralResults({ analysis }) {
  const scores = { requiredSkills: analysis.skillsScore, relevantExperience: analysis.experienceScore, projectRelevance: analysis.projectScore, educationMatch: analysis.educationScore, keywordMatch: analysis.keywordScore };
  return <div className="space-y-5"><div className="card grid gap-6 p-6 sm:grid-cols-[auto,1fr]"><ScoreRing score={analysis.overallScore} size={128} label="Resume Score" /><div><h2 className="mb-3 text-lg font-semibold text-slate-900">General resume review</h2><ScoreGrid scores={scores} /><p className="mt-4 text-sm text-slate-500">This review uses only evidence from your resume. No job-specific missing skills or keywords are inferred.</p></div></div><div className="grid gap-4 lg:grid-cols-2"><div className="card p-5"><h3 className="mb-3 font-semibold text-emerald-700">Strengths</h3><ul className="list-inside list-disc space-y-2 text-sm text-slate-600">{analysis.strengths?.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="card p-5"><h3 className="mb-3 font-semibold text-slate-700">Areas for improvement</h3><ul className="list-inside list-disc space-y-2 text-sm text-slate-600">{analysis.weaknesses?.map((item) => <li key={item}>{item}</li>)}{analysis.recommendations?.map((item) => <li key={item}>{item}</li>)}</ul></div></div></div>;
}
