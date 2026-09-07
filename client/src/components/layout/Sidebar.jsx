import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Search, KanbanSquare, MessagesSquare, User, Settings, Sparkles, PanelLeftClose,
  PanelLeftOpen, X,
} from 'lucide-react';

const sections = [
  {
    label: 'Main',
    links: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Resume Intelligence',
    links: [{ to: '/resume-analysis', label: 'Resume Analysis', icon: Sparkles }],
  },
  {
    label: 'Career Tools',
    links: [
      { to: '/job-search', label: 'Job Search', icon: Search },
      { to: '/job-tracker', label: 'Job Tracker', icon: KanbanSquare },
      { to: '/interview-prep', label: 'Interview Prep', icon: MessagesSquare },
    ],
  },
  {
    label: 'Account',
    links: [
      { to: '/profile', label: 'Profile', icon: User },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function SidebarItem({ link, collapsed, onNavigate }) {
  const { to, label, icon: Icon } = link;

  return (
    <NavLink
      to={to}
      end={to === '/dashboard' || to === '/resumes'}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
          collapsed ? 'md:justify-center md:px-2' : ''
        } ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      <Icon
        size={18}
        strokeWidth={1.9}
        className="shrink-0 transition-colors duration-200 group-hover:text-brand-600"
      />
      <span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-[1px] md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-5 shadow-xl transition-transform duration-300 md:relative md:z-0 md:translate-x-0 md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-[4.75rem]' : 'md:w-64'}`}
      >
        <div className={`mb-8 flex items-center ${collapsed ? 'justify-center md:justify-center' : 'justify-between px-2'}`}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-200">
              <Sparkles size={18} />
            </div>
            <span className={`text-lg font-bold tracking-tight text-slate-900 ${collapsed ? 'md:hidden' : ''}`}>
              ResumeIQ
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 md:block"
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close navigation"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <nav aria-label="Primary navigation" className="flex-1 space-y-6 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.label}>
              <p
                className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 ${
                  collapsed ? 'md:hidden' : ''
                }`}
              >
                {section.label}
              </p>
              <div className="space-y-1">
                {section.links.map((link) => (
                  <SidebarItem
                    key={link.to}
                    link={link}
                    collapsed={collapsed}
                    onNavigate={onMobileClose}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
