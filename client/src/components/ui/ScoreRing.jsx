import React from 'react';

function colorFor(score) {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#1a4dff';
  if (score >= 40) return '#f59e0b';
  return '#dc2626';
}

export default function ScoreRing({ score = 0, size = 96, strokeWidth = 8, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#eef1f8" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={colorFor(progress)} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          className="fill-slate-800 font-bold" style={{ fontSize: size * 0.24 }}
        >
          {Math.round(progress)}
        </text>
      </svg>
      {label && <span className="text-xs font-medium text-slate-500">{label}</span>}
    </div>
  );
}
