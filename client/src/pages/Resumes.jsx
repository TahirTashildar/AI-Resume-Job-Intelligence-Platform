import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, FileText, Star, Copy, Trash2, Pencil, Sparkles } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import ProgressBar from '../components/ui/ProgressBar';
import { resumeService } from '../services/resumeService';
import { getErrorMessage } from '../services/api';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await resumeService.list();
      setResumes(items);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      await resumeService.upload(file, file.name.replace(/\.(pdf|docx)$/i, ''), setProgress);
      toast.success('Resume uploaded');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await resumeService.remove(id);
      toast.success('Resume deleted');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleActivate = async (id) => {
    try {
      await resumeService.activate(id);
      toast.success('Active resume updated');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await resumeService.duplicate(id);
      toast.success('Version duplicated');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRename = async (id, current) => {
    const label = prompt('New resume label', current);
    if (!label) return;
    try {
      await resumeService.rename(id, label);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resumes</h1>
          <p className="text-sm text-slate-500">Upload, version, and analyze your resumes.</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileSelected} />
          <button className="btn-primary" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> {uploading ? `Uploading ${progress}%` : 'Upload resume'}
          </button>
        </div>
      </div>

      {uploading && <ProgressBar value={progress} />}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Upload a PDF or DOCX resume to get an AI-powered score and analysis."
          action={<button className="btn-primary" onClick={() => fileInputRef.current?.click()}>Upload your first resume</button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <div key={r._id} className="card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-brand-500" />
                  <span className="font-semibold text-slate-800">{r.label}</span>
                </div>
                {r.isActive && <span className="badge bg-brand-50 text-brand-600">Active</span>}
              </div>
              <p className="text-xs text-slate-400">v{r.resumeVersion} · {r.fileType.toUpperCase()} · {(r.fileSize / 1024).toFixed(0)} KB</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">{r.score ?? '—'}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link to={`/resumes/${r._id}`} className="btn-secondary justify-center">View</Link>
                <Link to="/resume-analysis" className="btn-primary justify-center">
                  <Sparkles size={15} /> Analyze
                </Link>
              </div>
              <div className="flex items-center justify-between pt-1 text-slate-400">
                <button title="Set active" onClick={() => handleActivate(r._id)} className="hover:text-brand-500"><Star size={16} /></button>
                <button title="Rename" onClick={() => handleRename(r._id, r.label)} className="hover:text-brand-500"><Pencil size={16} /></button>
                <button title="Duplicate as new version" onClick={() => handleDuplicate(r._id)} className="hover:text-brand-500"><Copy size={16} /></button>
                <button title="Delete" onClick={() => handleDelete(r._id)} className="hover:text-rose-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
