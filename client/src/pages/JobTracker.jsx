import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KanbanSquare, Plus, ExternalLink } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import { jobService } from '../services/jobService';
import { getErrorMessage } from '../services/api';

const COLUMNS = [
  { key: 'saved', label: 'Saved' },
  { key: 'applied', label: 'Applied' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'rejected', label: 'Rejected' },
];

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await jobService.list();
      setJobs(items);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const moveJob = async (jobId, status) => {
    setJobs((prev) => prev.map((j) => (j._id === jobId ? { ...j, status } : j)));
    try {
      await jobService.update(jobId, { status });
    } catch (err) {
      toast.error(getErrorMessage(err));
      load();
    }
  };

  if (loading) return <div className="skeleton h-64 w-full" />;

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={KanbanSquare}
        title="No jobs tracked yet"
        description="Analyze a job description and save it to start tracking your applications."
        action={<Link to="/jobs/analyze" className="btn-primary"><Plus size={16} /> Analyze a job</Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Tracker</h1>
          <p className="text-sm text-slate-500">Drag cards between stages as your applications progress.</p>
        </div>
        <Link to="/jobs/analyze" className="btn-primary"><Plus size={16} /> New job</Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="w-72 shrink-0 rounded-2xl bg-slate-100/70 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dragId && moveJob(dragId, col.key)}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-600">{col.label}</h3>
              <span className="text-xs text-slate-400">{jobs.filter((j) => j.status === col.key).length}</span>
            </div>
            <div className="space-y-2">
              {jobs.filter((j) => j.status === col.key).map((job) => (
                <div
                  key={job._id}
                  draggable
                  onDragStart={() => setDragId(job._id)}
                  className="cursor-grab rounded-xl bg-white p-3 shadow-sm active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between">
                    <Link to={`/jobs/${job._id}`} className="text-sm font-semibold text-slate-800 hover:text-brand-600">
                      {job.position}
                    </Link>
                    {job.jobUrl && (
                      <a href={job.jobUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-brand-500">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{job.company}</p>
                  {typeof job.matchScore === 'number' && (
                    <span className="badge mt-2 bg-brand-50 text-brand-600">{job.matchScore}% match</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
