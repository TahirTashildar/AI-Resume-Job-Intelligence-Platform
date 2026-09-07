import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-bold text-slate-900">ResumeIQ</span>
        </Link>
        <div className="card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
