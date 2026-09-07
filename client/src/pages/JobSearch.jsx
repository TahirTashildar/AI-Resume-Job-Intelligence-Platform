import React, { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BriefcaseBusiness, CheckCircle2, ExternalLink, MapPin, Search, Sparkles, Upload, X,
} from 'lucide-react';
import AiLoadingState from '../components/ui/AiLoadingState';
import EmptyState from '../components/ui/EmptyState';
import { jobSearchService } from '../services/jobSearchService';
import { getErrorMessage } from '../services/api';

const DEFAULT_PREFERENCES = {
  roles: [],
  location: 'India',
  jobType: 'Full-Time',
  experienceLevel: 'Fresher',
  remotePreference: 'Any',
  recency: 'Last Week',
};

function MatchPill({ children, tone = 'blue' }) {
  const colors = {
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    blue: 'bg-brand-50 text-brand-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return <span className={`badge ${colors[tone]}`}>{children}</span>;
}

function scoreLabel(score) {
  if (score >= 90) return 'Excellent Match';
  if (score >= 75) return 'Strong Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Partial Match';
  return 'Low Match';
}

export default function JobSearch() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [jobs, setJobs] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sort, setSort] = useState('best');
  const [minScore, setMinScore] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [remoteFilter, setRemoteFilter] = useState('all');
  const [freshnessFilter, setFreshnessFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedUrls, setSavedUrls] = useState(new Set());

  const updatePreference = (key, value) => setPreferences((current) => ({ ...current, [key]: value }));

  const processFile = async (selectedFile) => {
    if (!selectedFile || (!/\.pdf$/i.test(selectedFile.name) && selectedFile.type !== 'application/pdf')) {
      toast.error('Please upload a PDF resume');
      return;
    }
    setLoadingProfile(true);
    setJobs([]);
    try {
      const result = await jobSearchService.profile(selectedFile);
      setFile(selectedFile);
      setProfile(result.profile);
      setPreferences((current) => ({
        ...current,
        roles: current.roles.length ? current.roles : (result.profile.targetRoles || []).slice(0, 3),
      }));
      toast.success('Resume processed successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingProfile(false);
    }
  };

  const runSearch = async () => {
    if (!profile) {
      toast.error('Please upload a resume before searching for jobs.');
      return;
    }
    setSearching(true);
    try {
      const result = await jobSearchService.search(profile, preferences);
      setJobs(result.jobs || []);
      if (!result.jobs?.length) toast.error('No recent matching jobs were found. Try changing your preferences.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const saveJob = async (job) => {
    try {
      await jobSearchService.save(job);
      setSavedUrls((current) => new Set(current).add(job.sourceUrl));
      toast.success('Job saved to Job Tracker');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const visibleJobs = useMemo(() => jobs
    .filter((job) => minScore === 'all' || job.matchScore >= Number(minScore))
    .filter((job) => locationFilter === 'all' || (locationFilter === 'remote' ? job.isRemote : (job.location || '').toLowerCase().includes(locationFilter.toLowerCase())))
    .filter((job) => jobTypeFilter === 'all' || (job.employmentType || '').toLowerCase().includes(jobTypeFilter.toLowerCase()))
    .filter((job) => remoteFilter === 'all' || (remoteFilter === 'remote' ? job.isRemote : !job.isRemote))
    .filter((job) => freshnessFilter === 'all'
      || (freshnessFilter === 'today' && job.freshnessScore >= 85)
      || (freshnessFilter === '3days' && job.freshnessScore >= 65)
      || (freshnessFilter === 'week' && job.freshnessScore >= 45)
      || (freshnessFilter === 'month' && job.freshnessScore >= 30))
    .sort((a, b) => sort === 'recent' ? b.freshnessScore - a.freshnessScore : b.rankingScore - a.rankingScore), [jobs, minScore, sort, locationFilter, jobTypeFilter, remoteFilter, freshnessFilter]);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Career Tools</p>
        <h1 className="text-2xl font-bold text-slate-900">Job Search</h1>
        <p className="text-sm text-slate-500">Discover recent job opportunities that match your skills and experience.</p>
      </div>

      {!profile && (
        <div className="card space-y-5 p-6">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Sparkles size={20} /></div><div><h2 className="font-semibold text-slate-900">Start with a fresh resume</h2><p className="text-sm text-slate-500">We process this session's resume temporarily and never expose a resume library here.</p></div></div>
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(event) => { processFile(event.target.files?.[0]); event.target.value = ''; }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); processFile(event.dataTransfer.files?.[0]); }} disabled={loadingProfile} className="flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 text-center transition hover:border-brand-300 hover:bg-brand-50/30"><Upload size={28} className="mb-2 text-brand-500" /><span className="font-semibold text-slate-800">{loadingProfile ? 'Understanding your resume...' : 'Upload your resume'}</span><span className="mt-1 text-sm text-slate-500">Drag and drop a PDF here, or click to browse</span><span className="mt-2 text-xs text-slate-400">PDF supported</span></button>
        </div>
      )}

      {profile && !jobs.length && !searching && (
        <div className="card space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><CheckCircle2 size={16} /> Resume processed successfully</p><p className="mt-1 text-sm text-slate-500">{file?.name}</p></div><button className="btn-secondary !px-3 !py-2" onClick={() => { setProfile(null); setFile(null); setPreferences(DEFAULT_PREFERENCES); }}><X size={15} /> Change Resume</button></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Detected Profile</p><p className="font-semibold text-slate-800">{profile.targetRoles?.[0] || profile.experienceLevel}</p><div className="mt-3 flex flex-wrap gap-2">{(profile.skills || []).slice(0, 12).map((skill) => <MatchPill key={skill}>{skill}</MatchPill>)}</div></div>
          <PreferenceForm preferences={preferences} updatePreference={updatePreference} />
          <button className="btn-primary w-full justify-center sm:w-auto" onClick={runSearch}><Search size={16} /> Find Recent Matching Jobs</button>
        </div>
      )}

      {searching && <AiLoadingState messages={['Analyzing your resume profile...', 'Finding relevant job openings...', 'Checking job freshness...', 'Matching jobs with your skills...', 'Ranking opportunities...']} />}

      {jobs.length > 0 && !searching && (
        <div className="space-y-5">
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4"><div><h2 className="font-semibold text-slate-900">{visibleJobs.length} recent matching jobs found</h2><p className="text-xs text-slate-500">Based on your resume profile · {preferences.location} · {preferences.recency}</p></div><div className="flex flex-wrap gap-2"><select className="input !w-auto !py-2 text-xs" value={sort} onChange={(event) => setSort(event.target.value)}><option value="best">Best Match</option><option value="recent">Most Recent</option></select><select className="input !w-auto !py-2 text-xs" value={minScore} onChange={(event) => setMinScore(event.target.value)}><option value="all">All scores</option><option value="90">90%+</option><option value="80">80%+</option><option value="70">70%+</option><option value="60">60%+</option></select><select className="input !w-auto !py-2 text-xs" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}><option value="all">All locations</option><option value="remote">Remote</option><option value="Bengaluru">Bengaluru</option><option value="Hyderabad">Hyderabad</option><option value="Mumbai">Mumbai</option><option value="Pune">Pune</option></select><select className="input !w-auto !py-2 text-xs" value={jobTypeFilter} onChange={(event) => setJobTypeFilter(event.target.value)}><option value="all">All job types</option><option value="full-time">Full-Time</option><option value="internship">Internship</option><option value="part-time">Part-Time</option><option value="contract">Contract</option></select><select className="input !w-auto !py-2 text-xs" value={remoteFilter} onChange={(event) => setRemoteFilter(event.target.value)}><option value="all">Any workplace</option><option value="remote">Remote</option><option value="onsite">On-site</option></select><select className="input !w-auto !py-2 text-xs" value={freshnessFilter} onChange={(event) => setFreshnessFilter(event.target.value)}><option value="all">Any freshness</option><option value="today">Today</option><option value="3days">Last 3 days</option>          <option value="week">Last 7 days</option><option value="month">Last 30 days</option></select></div></div>
          {!visibleJobs.length ? <EmptyState icon={Search} title="No strong job matches were found right now" description="Try expanding your location, role, or freshness filters." /> : <div className="grid gap-4">{visibleJobs.map((job) => <JobCard key={job.sourceUrl} job={job} saved={savedUrls.has(job.sourceUrl)} onSave={saveJob} onDetails={setSelectedJob} />)}</div>}
        </div>
      )}
      {selectedJob && <JobDetails job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}

function PreferenceForm({ preferences, updatePreference }) {
  const rolesText = preferences.roles.join(', ');
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><div className="sm:col-span-2 lg:col-span-3"><label className="label">Job roles</label><input className="input" value={rolesText} onChange={(event) => updatePreference('roles', event.target.value.split(',').map((role) => role.trim()).filter(Boolean))} placeholder="Software Developer, Backend Developer" /></div><div><label className="label">Location</label><input className="input" value={preferences.location} onChange={(event) => updatePreference('location', event.target.value)} /></div><div><label className="label">Job type</label><select className="input" value={preferences.jobType} onChange={(event) => updatePreference('jobType', event.target.value)}>{['Full-Time', 'Internship', 'Part-Time', 'Contract'].map((item) => <option key={item}>{item}</option>)}</select></div><div><label className="label">Experience level</label><select className="input" value={preferences.experienceLevel} onChange={(event) => updatePreference('experienceLevel', event.target.value)}>{['Fresher', 'Entry Level', 'Internship', '1–3 Years', 'Experienced'].map((item) => <option key={item}>{item}</option>)}</select></div><div><label className="label">Remote preference</label><select className="input" value={preferences.remotePreference} onChange={(event) => updatePreference('remotePreference', event.target.value)}>{['Any', 'Remote', 'Hybrid', 'On-site'].map((item) => <option key={item}>{item}</option>)}</select></div><div><label className="label">Recency</label><select className="input" value={preferences.recency} onChange={(event) => updatePreference('recency', event.target.value)}>{['Last 24 Hours', 'Last 3 Days', 'Last Week', 'Last 30 Days'].map((item) => <option key={item}>{item}</option>)}</select></div></div>;
}

function JobCard({ job, saved, onSave, onDetails }) {
  return <article className="card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-semibold text-slate-900">{job.title}</h3><p className="text-sm text-slate-600">{job.company || 'Company not specified'}</p><div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">{job.location && <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>}{job.employmentType && <span>· {job.employmentType}</span>}{job.workplaceType && <MatchPill tone="blue">{job.workplaceType}</MatchPill>}{job.freshnessLabel && <MatchPill tone={job.freshnessScore >= 85 ? 'green' : 'amber'}>{job.freshnessLabel}</MatchPill>}</div></div><div className="text-right"><p className="text-2xl font-bold text-brand-600">{job.matchScore}%</p><p className="text-xs text-slate-500">{job.matchLabel || scoreLabel(job.matchScore)}</p></div></div><p className="mt-4 line-clamp-3 text-sm text-slate-600">{job.description || 'Job details are available on the source page.'}</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{job.matchedSkills?.length > 0 && <div><p className="mb-1 text-xs font-semibold text-emerald-700">Matched</p><div className="flex flex-wrap gap-1.5">{job.matchedSkills.slice(0, 4).map((item) => <MatchPill key={item} tone="green">{item}</MatchPill>)}</div></div>}{job.partialSkills?.length > 0 && <div><p className="mb-1 text-xs font-semibold text-amber-700">Partial</p><div className="flex flex-wrap gap-1.5">{job.partialSkills.slice(0, 3).map((item) => <MatchPill key={item} tone="amber">{item}</MatchPill>)}</div></div>}{job.missingSkills?.length > 0 && <div><p className="mb-1 text-xs font-semibold text-rose-700">Missing</p><div className="flex flex-wrap gap-1.5">{job.missingSkills.slice(0, 3).map((item) => <MatchPill key={item} tone="red">{item}</MatchPill>)}</div></div>}</div><div className="mt-5 flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => onDetails(job)}><BriefcaseBusiness size={15} /> View Details</button><button className="btn-primary" onClick={() => onSave(job)} disabled={saved}>{saved ? 'Saved to Tracker' : 'Save Job'}</button><a className="btn-ghost" href={job.applyUrl || job.sourceUrl} target="_blank" rel="noreferrer">{job.applyUrl ? 'Apply' : 'View Source'}</a></div></article>;
}

function JobDetails({ job, onClose }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4" role="dialog" aria-modal="true"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">{job.title}</h2><p className="text-sm text-slate-600">{job.company || 'Company not listed'} · {job.location || 'Location not listed'}</p></div><button className="btn-ghost !p-2" onClick={onClose} aria-label="Close details"><X size={18} /></button></div><div className="mt-4 flex flex-wrap gap-2"><MatchPill tone="blue">{job.matchScore}% match</MatchPill><MatchPill tone="green">{job.freshnessLabel || 'Date not available'}</MatchPill>{job.workplaceType && <MatchPill tone="slate">{job.workplaceType}</MatchPill>}{job.employmentType && <MatchPill tone="slate">{job.employmentType}</MatchPill>}</div><p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">{job.description || 'No description was available.'}</p><div className="mt-5 rounded-xl bg-brand-50/60 p-4"><p className="label">Why this matches</p>{(job.matchReasons || []).map((reason) => <p key={reason} className="text-sm text-slate-700">• {reason}</p>)}</div><div className="mt-5 grid gap-4 sm:grid-cols-3"><div><p className="label">Matched skills</p>{(job.matchedSkills || []).map((item) => <p key={item} className="text-sm text-emerald-700">✓ {item}</p>)}</div><div><p className="label">Partial matches</p>{(job.partialMatches || []).map((item) => <p key={item} className="text-sm text-amber-700">⚠ {item}</p>)}</div><div><p className="label">Missing skills</p>{(job.missingSkills || []).map((item) => <p key={item} className="text-sm text-rose-700">✕ {item}</p>)}</div></div><div className="mt-6 flex flex-wrap gap-2"><a className="btn-primary" href={job.applyUrl || job.sourceUrl} target="_blank" rel="noreferrer">Apply</a><a className="btn-secondary" href={job.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open source</a></div></div></div>;
}
