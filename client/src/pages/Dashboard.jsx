import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Briefcase, Target, TrendingUp, Award, ListChecks } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import StatCard from '../components/ui/StatCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { dashboardService } from '../services/dashboardService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.get();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

  const pipelineData = Object.entries(data.pipeline || {}).map(([status, count]) => ({ status, count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-slate-500">Here's your job search intelligence at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={FileText} label="Best Resume Score" value={data.resumeScore ?? '—'} sublabel={`${data.numberOfResumes} resume(s)`} accent="brand" />
        <StatCard icon={Briefcase} label="Jobs Analyzed" value={data.jobsAnalyzed} accent="amber" />
        <StatCard icon={Target} label="Avg Match Score" value={data.averageMatchScore != null ? `${data.averageMatchScore}%` : '—'} accent="green" />
        <StatCard icon={Award} label="High-Match Jobs" value={data.highMatchJobs} sublabel="≥ 75% match" accent="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <TrendingUp size={16} /> Resume Score History
          </h3>
          {data.resumeScoreHistory?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.resumeScoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#1a4dff" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={FileText} title="No resume history yet" description="Upload and analyze a resume to see your score trend." />
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ListChecks size={16} /> Application Pipeline
          </h3>
          {pipelineData.some((p) => p.count > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f8" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1a4dff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={Briefcase} title="No jobs tracked yet" description="Save a job in the tracker to see your pipeline." />
          )}
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Most Common Missing Skills</h3>
          {data.missingSkills?.length ? (
            <div className="flex flex-wrap gap-2">
              {data.missingSkills.map((s) => (
                <span key={s.skill} className="badge bg-rose-50 text-rose-600">
                  {s.skill} · {s.count}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Run a job match analysis to surface skill gaps here.</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Recent Activity</h3>
          {data.recentActivity?.length ? (
            <ul className="space-y-3">
              {data.recentActivity.map((a, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{a.label}</span>
                  <span className="text-xs text-slate-400">{new Date(a.at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No activity yet — upload a resume to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
}
