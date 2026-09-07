import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, FileText, ShieldCheck, Target, TrendingUp,
  Wand2, MessagesSquare, KanbanSquare, Search, ArrowRight,
} from 'lucide-react';

const features = [
  { icon: FileText, title: 'Resume Intelligence', desc: 'AI extracts your skills, experience, and projects, then scores your resume across 10 dimensions.' },
  { icon: ShieldCheck, title: 'ATS Analysis', desc: 'Catch formatting issues, missing keywords, and structural problems before recruiters — or bots — do.' },
  { icon: Target, title: 'Job Matching', desc: 'See exactly how your resume stacks up against any job description, skill by skill.' },
  { icon: Search, title: 'Recent Job Search', desc: 'Discover fresh job openings from across the web, ranked by resume fit and posting freshness.' },
  { icon: TrendingUp, title: 'Skill Gap Analysis', desc: 'A prioritized, honest roadmap of what to learn next for the role you actually want.' },
  { icon: Wand2, title: 'AI Resume Improvement', desc: 'Tailored, truthful rewrites for your summary, bullets, and projects — never fabricated.' },
  { icon: MessagesSquare, title: 'Interview Preparation', desc: 'Practice questions grounded in your real resume and the real job description.' },
  { icon: KanbanSquare, title: 'Job Tracker', desc: 'A Kanban board for every application, from saved to offer.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Sparkles size={18} />
          </div>
          <span className="text-lg font-bold text-slate-900">ResumeIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost">Log in</Link>
          <Link to="/register" className="btn-primary">Get started</Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
        >
          Turn Your Resume Into a
          <span className="block text-brand-500">Job Search Intelligence System.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mx-auto mt-5 max-w-2xl text-lg text-slate-600"
        >
          Upload your resume, discover recent matching opportunities, or paste any job description for an honest,
          AI-powered breakdown of your match score, missing skills, ATS issues, and exactly what to fix.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link to="/register" className="btn-primary px-6 py-3 text-base">
            Start with my resume <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-base">I already have an account</Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass mx-auto mt-14 max-w-3xl rounded-3xl p-6 text-left shadow-glass"
        >
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Resume Score', value: '82/100' },
              { label: 'Job Match', value: '78%' },
              { label: 'Skill Gaps', value: '6' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-brand-600">{s.value}</p>
                <p className="mt-1 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-4">
        <div className="rounded-3xl border border-brand-100 bg-brand-50/60 p-8 sm:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Your career workflow</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">From resume insight to your next opportunity.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Find recent roles that fit your experience, save the ones worth pursuing, and manage every application
              in one focused workspace.
            </p>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Search, title: 'Job Search', desc: 'Find fresh openings matched to your resume.' },
              { icon: KanbanSquare, title: 'Job Tracker', desc: 'Organize saved and active applications.' },
              { icon: MessagesSquare, title: 'Interview Prep', desc: 'Practice with context from your goals.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <item.icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <div className="card bg-gradient-to-br from-brand-500 to-brand-700 p-10 text-white">
          <h2 className="text-2xl font-bold">Ready to see your real resume score?</h2>
          <p className="mt-2 text-brand-100">Free to start. No credit card required.</p>
          <Link to="/register" className="btn-secondary mt-6 inline-flex bg-white text-brand-700 hover:bg-brand-50">
            Create your free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} ResumeIQ. Built with AI, for job seekers.
      </footer>
    </div>
  );
}
