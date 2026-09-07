import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import ScoreRing from '../components/ui/ScoreRing';
import ProgressBar from '../components/ui/ProgressBar';
import AiLoadingState from '../components/ui/AiLoadingState';
import ErrorState from '../components/ui/ErrorState';
import { resumeService } from '../services/resumeService';
import { getErrorMessage } from '../services/api';
import BulletImprover from '../components/resume/BulletImprover';
import ResumeImproveModal from '../components/resume/ResumeImproveModal';

const SUB_SCORES = [
  ['atsScore', 'ATS Compatibility'],
  ['skillsScore', 'Skills'],
  ['experienceScore', 'Experience'],
  ['projectScore', 'Projects'],
  ['educationScore', 'Education'],
  ['impactScore', 'Impact'],
  ['formattingScore', 'Formatting'],
  ['keywordScore', 'Keywords'],
  ['summaryScore', 'Summary'],
];

export default function ResumeDetail() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [showImprove, setShowImprove] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resumeService.get(id);
      setResume(data.resume);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const runAnalysis = async (force = false) => {
    setAnalyzing(true);
    try {
      const { analysis, cached } = await resumeService.analyze(id, force);
      setAnalysis(analysis);
      toast.success(cached ? 'Loaded existing analysis (unchanged since last run)' : 'Analysis complete');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="skeleton h-64 w-full" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{resume.label}</h1>
          <p className="text-sm text-slate-500">{resume.originalFilename} · v{resume.resumeVersion}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => runAnalysis(true)} disabled={analyzing}>
            <RefreshCw size={16} /> Re-analyze
          </button>
          <button className="btn-primary" onClick={() => setShowImprove(true)}>
            <Wand2 size={16} /> Improve for a job
          </button>
        </div>
      </div>

      {analyzing && (
        <AiLoadingState
          messages={['Extracting resume sections...', 'Analyzing skills...', 'Checking ATS compatibility...', 'Scoring impact & keywords...']}
        />
      )}

      {!analysis && !analyzing && (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <Sparkles className="text-brand-500" size={28} />
          <h3 className="font-semibold text-slate-800">No analysis yet</h3>
          <p className="max-w-sm text-sm text-slate-500">Run the AI analyzer to get your resume score, ATS issues, and recommendations.</p>
          <button className="btn-primary" onClick={() => runAnalysis(false)}>Analyze this resume</button>
        </div>
      )}

      {analysis && !analyzing && (
        <>
          <div className="card grid gap-6 p-6 sm:grid-cols-[auto,1fr]">
            <ScoreRing score={analysis.overallScore} size={120} label="Overall Score" />
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-3">
              {SUB_SCORES.map(([key, label]) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{label}</span><span>{analysis[key]}</span>
                  </div>
                  <ProgressBar value={analysis[key]} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Strengths</h3>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600">
                {analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                {!analysis.strengths?.length && <p className="text-slate-400">None identified.</p>}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Weaknesses</h3>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600">
                {analysis.weaknesses?.map((s, i) => <li key={i}>{s}</li>)}
                {!analysis.weaknesses?.length && <p className="text-slate-400">None identified.</p>}
              </ul>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">ATS Issues & Recommendations</h3>
            <div className="space-y-3">
              {analysis.atsIssues?.map((issue, i) => (
                <div key={i} className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                  <p className="text-sm font-medium text-amber-800">{issue.problem}</p>
                  <p className="mt-1 text-sm text-amber-700">→ {issue.recommendation}</p>
                </div>
              ))}
              {!analysis.atsIssues?.length && <p className="text-sm text-slate-400">No major ATS issues detected.</p>}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Missing Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords?.map((k) => <span key={k} className="badge bg-rose-50 text-rose-600">{k}</span>)}
              {!analysis.missingKeywords?.length && <p className="text-sm text-slate-400">None detected.</p>}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Recommendations</h3>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600">
              {analysis.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </>
      )}

      <BulletImprover />

      {showImprove && <ResumeImproveModal resumeId={id} onClose={() => setShowImprove(false)} />}
    </div>
  );
}
