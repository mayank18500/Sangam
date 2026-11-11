import React from 'react';
import { MatchStatus } from '../../types';

interface BadgeProps {
  status: MatchStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'AUTO_MATCHED':
      styles = 'bg-teal-50 text-teal-800 border-teal-200';
      break;
    case 'MANUALLY_MATCHED':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'REVIEW_REQUIRED':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'UNMATCHED':
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
    case 'REJECTED':
      styles = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    case 'ACTIVE':
    case 'COMPLETED':
      styles = 'bg-teal-50 text-teal-800 border-teal-200';
      break;
    case 'PENDING':
    case 'PROCESSING':
      styles = 'bg-blue-50 text-blue-800 border-blue-200';
      break;
    case 'HOTEL':
      styles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      break;
    case 'SIGHTSEEING':
      styles = 'bg-cyan-50 text-cyan-800 border-cyan-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles} ${className}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
};
