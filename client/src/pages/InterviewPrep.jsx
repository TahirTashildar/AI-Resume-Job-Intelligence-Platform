import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessagesSquare } from 'lucide-react';
import AiLoadingState from '../components/ui/AiLoadingState';
import EmptyState from '../components/ui/EmptyState';
import { resumeService } from '../services/resumeService';
import { jobService } from '../services/jobService';
import { interviewService } from '../services/interviewService';
import { getErrorMessage } from '../services/api';

const SECTIONS = [
  ['technicalQuestions', 'Technical Questions'],
  ['behavioralQuestions', 'Behavioral Questions'],
  ['resumeBasedQuestions', 'Resume-Based Questions'],
  ['projectQuestions', 'Project Questions'],
  ['roleSpecificQuestions', 'Role-Specific Questions'],
];

export default function InterviewPrep() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [jobId, setJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [openSection, setOpenSection] = useState('technicalQuestions');

  useEffect(() => {
    (async () => {
      const [r, j] = await Promise.all([resumeService.list(), jobService.list()]);
      setResumes(r.items);
      setJobs(j.items);
      if (r.items[0]) setResumeId(r.items[0]._id);
      if (j.items[0]) setJobId(j.items[0]._id);
    })();
  }, []);

  const run = async () => {
    if (!resumeId || !jobId) {
      toast.error('Select a resume and a job first');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { result } = await interviewService.generate(resumeId, jobId);
      setResult(result);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (resumes.length === 0 || jobs.length === 0) {
    return <EmptyState icon={MessagesSquare} title="Add a resume and a job first" description="You need at least one resume and one saved job to generate interview prep." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Interview Preparation</h1>
        <p className="text-sm text-slate-500">Practice questions grounded in your actual resume and the job description.</p>
      </div>

      <div className="card flex flex-wrap items-end gap-3 p-5">
        <div className="flex-1 min-w-[200px]">
          <label className="label">Resume</label>
          <select className="input" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
            {resumes.map((r) => <option key={r._id} value={r._id}>{r.label}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="label">Target Job</label>
          <select className="input" value={jobId} onChange={(e) => setJobId(e.target.value)}>
            {jobs.map((j) => <option key={j._id} value={j._id}>{j.position} @ {j.company}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={run} disabled={loading}>{loading ? 'Generating...' : 'Generate questions'}</button>
      </div>

      {loading && <AiLoadingState messages={['Reviewing your resume...', 'Drafting technical questions...', 'Preparing behavioral scenarios...']} />}

      {result && !loading && (
        <div className="space-y-4">
          <p className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">{result.disclaimer}</p>

          <div className="flex flex-wrap gap-2">
            {SECTIONS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setOpenSection(key)}
                className={`badge border ${openSection === key ? 'border-brand-300 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-500'}`}
              >
                {label} ({result[key]?.length || 0})
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {result[openSection]?.map((q, i) => (
              <div key={i} className="card p-4">
                <p className="font-semibold text-slate-800">{q.question}</p>
                <p className="mt-2 text-sm text-slate-500"><span className="font-medium text-slate-600">Why it may be asked:</span> {q.whyAsked}</p>
                <p className="mt-1 text-sm text-slate-500"><span className="font-medium text-slate-600">What's expected:</span> {q.interviewerExpectation}</p>
                {q.keyConceptsToCover?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.keyConceptsToCover.map((c) => <span key={c} className="badge bg-slate-100 text-slate-600">{c}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
