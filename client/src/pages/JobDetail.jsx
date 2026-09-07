import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import AiLoadingState from '../components/ui/AiLoadingState';
import ErrorState from '../components/ui/ErrorState';
import { jobService } from '../services/jobService';
import { getErrorMessage } from '../services/api';

const STATUSES = ['saved', 'applied', 'assessment', 'interview', 'offer', 'rejected'];

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.get(id);
      setJob(data.job);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { analysis } = await jobService.analyze(id);
      setAnalysis(analysis);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const { job } = await jobService.update(id, { status });
      setJob(job);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this job?')) return;
    try {
      await jobService.remove(id);
      toast.success('Job deleted');
      navigate('/job-tracker');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <div className="skeleton h-64 w-full" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{job.position}</h1>
          <p className="text-sm text-slate-500">{job.company} {job.location ? `· ${job.location}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input !w-auto" value={job.status} onChange={(e) => updateStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-secondary text-rose-600" onClick={handleDelete}><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Job Description</h3>
        <p className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-slate-600">{job.jobDescription}</p>
      </div>

      {!analysis && !analyzing && (
        <button className="btn-primary" onClick={runAnalysis}>Analyze this job description</button>
      )}
      {analyzing && <AiLoadingState messages={['Extracting job requirements...']} />}

      {analysis && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.requiredSkills?.map((s) => <span key={s} className="badge bg-brand-50 text-brand-600">{s}</span>)}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Preferred Skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.preferredSkills?.map((s) => <span key={s} className="badge bg-slate-100 text-slate-600">{s}</span>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
