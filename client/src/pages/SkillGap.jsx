import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { TrendingUp } from 'lucide-react';
import AiLoadingState from '../components/ui/AiLoadingState';
import EmptyState from '../components/ui/EmptyState';
import { resumeService } from '../services/resumeService';
import { jobService } from '../services/jobService';
import { matchingService } from '../services/matchingService';
import { getErrorMessage } from '../services/api';

const PRIORITY_STYLES = {
  highPriority: { label: 'High Priority', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  mediumPriority: { label: 'Medium Priority', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  lowPriority: { label: 'Low Priority', color: 'bg-slate-50 text-slate-600 border-slate-100' },
};

export default function SkillGap() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [jobId, setJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
      const { result } = await matchingService.skillGap(resumeId, jobId);
      setResult(result);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (resumes.length === 0 || jobs.length === 0) {
    return <EmptyState icon={TrendingUp} title="Add a resume and a job first" description="You need at least one resume and one saved job to run a skill-gap analysis." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Career Skill Gap Analysis</h1>
        <p className="text-sm text-slate-500">A prioritized, honest roadmap for closing the gap to your target job.</p>
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
        <button className="btn-primary" onClick={run} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze skill gap'}</button>
      </div>

      {loading && <AiLoadingState messages={['Comparing your resume to the role...', 'Prioritizing skill gaps...']} />}

      {result && !loading && (
        <div className="space-y-4">
          {['highPriority', 'mediumPriority', 'lowPriority'].map((key) => (
            <div key={key} className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">{PRIORITY_STYLES[key].label}</h3>
              <div className="space-y-3">
                {result[key]?.map((item, i) => (
                  <div key={i} className={`rounded-xl border p-3 ${PRIORITY_STYLES[key].color}`}>
                    <p className="font-semibold">{item.skill}</p>
                    <p className="mt-1 text-sm opacity-90">{item.whyItMatters}</p>
                    <p className="mt-1 text-xs opacity-70">Found in job posting: {item.foundInJobDescription}</p>
                    <p className="mt-1 text-xs font-medium opacity-90">→ {item.learningDirection}</p>
                  </div>
                ))}
                {!result[key]?.length && <p className="text-sm text-slate-400">None in this category.</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
