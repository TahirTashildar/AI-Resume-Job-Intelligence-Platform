import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Wand2 } from 'lucide-react';
import AiLoadingState from '../ui/AiLoadingState';
import { resumeService } from '../../services/resumeService';
import { getErrorMessage } from '../../services/api';

const STYLES = ['professional', 'technical', 'impact-focused', 'concise'];

export default function BulletImprover() {
  const [bullet, setBullet] = useState('');
  const [style, setStyle] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImprove = async () => {
    if (bullet.trim().length < 5) {
      toast.error('Enter a resume bullet first');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { result } = await resumeService.improveBullet(bullet, style);
      setResult(result);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Wand2 size={16} /> Bullet Point Improver
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        Paste a weak resume bullet — the AI strengthens the language without inventing new numbers or outcomes.
      </p>
      <textarea
        className="input min-h-[80px]"
        placeholder='e.g. "Worked on a website using React."'
        value={bullet}
        onChange={(e) => setBullet(e.target.value)}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`badge border ${style === s ? 'border-brand-300 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-500'}`}
          >
            {s}
          </button>
        ))}
        <button className="btn-primary ml-auto" onClick={handleImprove} disabled={loading}>
          {loading ? 'Improving...' : 'Improve bullet'}
        </button>
      </div>

      {loading && <div className="mt-4"><AiLoadingState messages={['Rewriting for impact...', 'Preserving factual accuracy...']} /></div>}

      {result && !loading && (
        <div className="mt-4 space-y-2">
          {result.alternatives.map((alt, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-500">{alt.style}</p>
              <p className="text-sm text-slate-700">{alt.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
