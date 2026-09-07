import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import AiLoadingState from '../ui/AiLoadingState';
import { resumeService } from '../../services/resumeService';
import { getErrorMessage } from '../../services/api';

export default function ResumeImproveModal({ resumeId, onClose }) {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [improvement, setImprovement] = useState(null);

  const handleGenerate = async () => {
    if (jobDescription.trim().length < 50) {
      toast.error('Paste a fuller job description (at least 50 characters)');
      return;
    }
    setLoading(true);
    try {
      const { improvement } = await resumeService.improve(resumeId, jobDescription);
      setImprovement(improvement);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">AI Resume Improvement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {!improvement && (
          <>
            <label className="label">Target job description</label>
            <textarea
              className="input min-h-[160px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
            />
            <button className="btn-primary mt-4 w-full" onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate improvements'}
            </button>
            {loading && (
              <div className="mt-4">
                <AiLoadingState messages={['Comparing with job requirements...', 'Rewriting your summary...', 'Strengthening bullets truthfully...']} />
              </div>
            )}
          </>
        )}

        {improvement && (
          <div className="space-y-5">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Professional Summary</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-slate-400">BEFORE</p>
                  <p className="text-sm text-slate-600">{improvement.professionalSummary.before || '(none provided)'}</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-emerald-600">AFTER</p>
                  <p className="text-sm text-emerald-800">{improvement.professionalSummary.after}</p>
                </div>
              </div>
            </div>

            {improvement.experienceBullets?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Experience Bullets</h3>
                <div className="space-y-3">
                  {improvement.experienceBullets.map((b, i) => (
                    <div key={i} className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">{b.before}</div>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">{b.after}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {improvement.keywordsToAdd?.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Keywords to Incorporate</h3>
                <div className="flex flex-wrap gap-2">
                  {improvement.keywordsToAdd.map((k) => <span key={k} className="badge bg-brand-50 text-brand-600">{k}</span>)}
                </div>
              </div>
            )}

            {improvement.notes && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">{improvement.notes}</div>
            )}

            <button className="btn-secondary w-full" onClick={() => setImprovement(null)}>Try a different job</button>
          </div>
        )}
      </div>
    </div>
  );
}
