import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Briefcase } from 'lucide-react';
import AiLoadingState from '../components/ui/AiLoadingState';
import { jobService } from '../services/jobService';
import { getErrorMessage } from '../services/api';

export default function JobAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [saveMeta, setSaveMeta] = useState({ company: '', position: '' });
  const [saving, setSaving] = useState(false);

  const handleAnalyze = async () => {
    if (jobDescription.trim().length < 50) {
      toast.error('Paste a fuller job description (at least 50 characters)');
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const { analysis } = await jobService.analyzeText(jobDescription);
      setAnalysis(analysis);
      setSaveMeta({ company: analysis.company || '', position: analysis.jobTitle || '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!saveMeta.company || !saveMeta.position) {
      toast.error('Enter a company and position to save this job');
      return;
    }
    setSaving(true);
    try {
      await jobService.create({ ...saveMeta, jobDescription });
      toast.success('Job saved to your tracker');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job Description Analyzer</h1>
        <p className="text-sm text-slate-500">Paste any job posting to extract structured requirements.</p>
      </div>

      <div className="card p-5">
        <textarea
          className="input min-h-[200px]"
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <button className="btn-primary mt-3" onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze job description'}
        </button>
      </div>

      {loading && <AiLoadingState messages={['Reading job posting...', 'Extracting required skills...', 'Separating required vs preferred...']} />}

      {analysis && !loading && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <div className="flex-1">
                <label className="label">Company</label>
                <input className="input" value={saveMeta.company} onChange={(e) => setSaveMeta({ ...saveMeta, company: e.target.value })} />
              </div>
              <div className="flex-1">
                <label className="label">Position</label>
                <input className="input" value={saveMeta.position} onChange={(e) => setSaveMeta({ ...saveMeta, position: e.target.value })} />
              </div>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                <Briefcase size={16} /> {saving ? 'Saving...' : 'Save to tracker'}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.requiredSkills.map((s) => <span key={s} className="badge bg-brand-50 text-brand-600">{s}</span>)}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Preferred Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.preferredSkills.map((s) => <span key={s} className="badge bg-slate-100 text-slate-600">{s}</span>)}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Responsibilities</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
              {analysis.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Experience & Education</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                {[...analysis.experienceRequirements, ...analysis.educationRequirements].map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((k) => <span key={k} className="badge bg-amber-50 text-amber-700">{k}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
