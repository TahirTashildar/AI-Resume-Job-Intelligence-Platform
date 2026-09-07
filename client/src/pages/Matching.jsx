import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Target } from 'lucide-react';
import ScoreRing from '../components/ui/ScoreRing';
import ProgressBar from '../components/ui/ProgressBar';
import AiLoadingState from '../components/ui/AiLoadingState';
import EmptyState from '../components/ui/EmptyState';
import { resumeService } from '../services/resumeService';
import { jobService } from '../services/jobService';
import { matchingService } from '../services/matchingService';
import { getErrorMessage } from '../services/api';

export default function Matching() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [jobId, setJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [r, j] = await Promise.all([resumeService.list(), jobService.list()]);
        setResumes(r.items);
        setJobs(j.items);
        if (r.items[0]) setResumeId(r.items[0]._id);
        if (j.items[0]) setJobId(j.items[0]._id);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    })();
  }, []);

  const runMatch = async () => {
    if (!resumeId || !jobId) {
      toast.error('Select a resume and a job first');
      return;
    }
    setLoading(true);
    setApplication(null);
    try {
      const { application, cached } = await matchingService.analyze(resumeId, jobId);
      setApplication(application);
      toast.success(cached ? 'Loaded existing match (unchanged since last run)' : 'Match analysis complete');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (resumes.length === 0 || jobs.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="You need at least one resume and one saved job"
        description="Upload a resume and save a job description to run a match analysis."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resume ↔ Job Matching</h1>
        <p className="text-sm text-slate-500">Compare a resume against a specific job description.</p>
      </div>

      <div className="card flex flex-wrap items-end gap-3 p-5">
        <div className="flex-1 min-w-[200px]">
          <label className="label">Resume</label>
          <select className="input" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
            {resumes.map((r) => <option key={r._id} value={r._id}>{r.label} (v{r.resumeVersion})</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="label">Job</label>
          <select className="input" value={jobId} onChange={(e) => setJobId(e.target.value)}>
            {jobs.map((j) => <option key={j._id} value={j._id}>{j.position} @ {j.company}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={runMatch} disabled={loading}>
          {loading ? 'Matching...' : 'Run match analysis'}
        </button>
      </div>

      {loading && <AiLoadingState messages={['Comparing skills...', 'Checking experience alignment...', 'Calculating match score...']} />}

      {application && !loading && (
        <>
          <div className="card grid gap-6 p-6 sm:grid-cols-[auto,1fr]">
            <ScoreRing score={application.matchScore} size={120} label="Overall Match" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ['skillMatchScore', 'Skills'],
                ['experienceMatchScore', 'Experience'],
                ['educationMatchScore', 'Education'],
                ['keywordMatchScore', 'Keywords'],
              ].map(([key, label]) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-xs text-slate-500"><span>{label}</span><span>{application[key]}</span></div>
                  <ProgressBar value={application[key]} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-2 text-sm font-semibold text-emerald-700">Matched Skills</h3>
              <div className="flex flex-wrap gap-2">
                {application.matchedSkills.map((s) => <span key={s} className="badge bg-emerald-50 text-emerald-700">{s}</span>)}
                {!application.matchedSkills.length && <p className="text-sm text-slate-400">None matched.</p>}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="mb-2 text-sm font-semibold text-rose-700">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {application.missingSkills.map((s) => <span key={s} className="badge bg-rose-50 text-rose-600">{s}</span>)}
                {!application.missingSkills.length && <p className="text-sm text-slate-400">None — great coverage!</p>}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Recommended Skills to Learn</h3>
            <div className="flex flex-wrap gap-2">
              {application.recommendedSkills.map((s) => <span key={s} className="badge bg-brand-50 text-brand-600">{s}</span>)}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Resume Improvements</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                {application.resumeImprovements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Interview Prep Areas</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                {application.interviewPrepAreas.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
