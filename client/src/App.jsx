import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import ResumeDetail from './pages/ResumeDetail';
import ResumeAnalysis from './pages/ResumeAnalysis';
import JobAnalyzer from './pages/JobAnalyzer';
import JobDetail from './pages/JobDetail';
import Matching from './pages/Matching';
import JobTracker from './pages/JobTracker';
import JobSearch from './pages/JobSearch';
import SkillGap from './pages/SkillGap';
import InterviewPrep from './pages/InterviewPrep';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Authenticated */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resumes" element={<Resumes />} />
        <Route path="/resumes/:id" element={<ResumeDetail />} />
        <Route path="/resumes/:id/analysis" element={<ResumeDetail />} />
        <Route path="/resume-analysis" element={<ResumeAnalysis />} />
        <Route path="/jobs" element={<JobTracker />} />
        <Route path="/jobs/analyze" element={<JobAnalyzer />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/job-tracker" element={<JobTracker />} />
        <Route path="/job-search" element={<JobSearch />} />
        <Route path="/skill-gap" element={<SkillGap />} />
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
