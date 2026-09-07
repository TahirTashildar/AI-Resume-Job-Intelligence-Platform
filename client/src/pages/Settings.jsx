import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account and session.</p>
      </div>

      <div className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-800">Session</p>
            <p className="text-sm text-slate-500">Log out of ResumeIQ on this device.</p>
          </div>
          <button className="btn-secondary" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <div className="card space-y-4 border-rose-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-800">Danger zone</p>
            <p className="text-sm text-slate-500">
              Account deletion isn't wired up in this build — implement a DELETE /api/auth/me endpoint
              plus cascading cleanup of resumes/jobs/analyses if you need this in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
