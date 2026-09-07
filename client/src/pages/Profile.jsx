import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const EXPERIENCE_LEVELS = ['student', 'entry-level', 'mid-level', 'senior', 'lead', 'executive'];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [skills, setSkills] = useState((user?.profile?.skills || []).join(', '));
  const [targetRoles, setTargetRoles] = useState((user?.profile?.targetRoles || []).join(', '));
  const [preferredLocations, setPreferredLocations] = useState((user?.profile?.preferredLocations || []).join(', '));
  const [experienceLevel, setExperienceLevel] = useState(user?.profile?.experienceLevel || 'entry-level');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const api = (await import('../services/api')).default;
      await api.put('/auth/me', {
        name,
        profile: {
          skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
          targetRoles: targetRoles.split(',').map((s) => s.trim()).filter(Boolean),
          preferredLocations: preferredLocations.split(',').map((s) => s.trim()).filter(Boolean),
          experienceLevel,
        },
      });
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Keep this up to date — it helps tailor future AI recommendations.</p>
      </div>

      <form onSubmit={handleSave} className="card space-y-4 p-6">
        <div>
          <label className="label">Full name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-slate-50" value={user?.email} disabled />
        </div>
        <div>
          <label className="label">Experience level</label>
          <select className="input" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
            {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Skills (comma-separated)</label>
          <input className="input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, MongoDB" />
        </div>
        <div>
          <label className="label">Target roles (comma-separated)</label>
          <input className="input" value={targetRoles} onChange={(e) => setTargetRoles(e.target.value)} placeholder="Frontend Engineer, Full-Stack Developer" />
        </div>
        <div>
          <label className="label">Preferred locations (comma-separated)</label>
          <input className="input" value={preferredLocations} onChange={(e) => setPreferredLocations(e.target.value)} placeholder="Remote, Bengaluru, Berlin" />
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
      </form>
    </div>
  );
}
