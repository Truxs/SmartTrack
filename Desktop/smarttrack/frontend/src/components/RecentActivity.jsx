import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * RecentActivity Component
 * Displays a list-based section of recent shipment status changes.
 * Uses Bootstrap Icons for visual indicators.
 */

const ACTIVITY_ICONS = {
  in_transit:       { icon: 'bi-truck', color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  out_for_delivery: { icon: 'bi-bicycle', color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20' },
  delivered:        { icon: 'bi-check2-circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  delayed:          { icon: 'bi-exclamation-triangle-fill', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  pending:          { icon: 'bi-hourglass-split', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
  ready_pickup:     { icon: 'bi-box-seam-fill', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
};

const ActivityRow = ({ activity, isLast }) => {
  const cfg = ACTIVITY_ICONS[activity.status] || ACTIVITY_ICONS.pending;

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'Just now';
  };

  return (
    <div className={`flex items-start gap-3.5 py-3.5 ${!isLast ? 'border-b border-gray-800/60' : ''} group`}>
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
        <i className={`bi ${cfg.icon} text-sm ${cfg.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{activity.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{activity.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <StatusBadge status={activity.status} size="sm" />
            <span className="text-[10px] text-gray-600 flex items-center gap-1">
              <i className="bi bi-clock text-[9px]" />
              {timeAgo(activity.timestamp)}
            </span>
          </div>
        </div>

        {/* Tracking number pill */}
        <p className="text-[10px] text-gray-600 font-mono mt-1.5 flex items-center gap-1">
          <i className="bi bi-hash text-[9px]" />
          {activity.trackingNumber}
        </p>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities = [], onViewAll }) => {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <i className="bi bi-inbox text-3xl text-gray-700 mb-3" />
        <p className="text-gray-500 text-sm font-medium">No recent activity</p>
        <p className="text-gray-600 text-xs mt-1">Status updates will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y-0">
        {activities.map((activity, i) => (
          <ActivityRow
            key={activity.id || i}
            activity={activity}
            isLast={i === activities.length - 1}
          />
        ))}
      </div>

      {onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full mt-3 py-2.5 text-xs font-semibold text-blue-400 hover:text-blue-300
            border border-blue-600/20 hover:border-blue-600/40 rounded-xl transition-all duration-200
            flex items-center justify-center gap-2 hover:bg-blue-600/5"
        >
          <i className="bi bi-list-ul" />
          View All Activity
          <i className="bi bi-arrow-right text-[10px]" />
        </button>
      )}
    </div>
  );
};

export default RecentActivity;
