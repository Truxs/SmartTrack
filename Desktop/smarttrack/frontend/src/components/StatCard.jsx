import React from 'react';

/**
 * StatCard Component
 * Displays a key logistics KPI with an icon, value, label, and optional trend.
 * Used in the dashboard overview stats strip.
 */
const StatCard = ({
  icon,
  label,
  value,
  sublabel,
  trend,          // e.g. '+12%' or '-3%'
  trendUp,        // boolean
  gradient,       // Tailwind gradient classes for icon bg
  iconColor,      // Tailwind text color for icon
  accentColor,    // Tailwind text color for value
}) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-4 hover:border-gray-700 transition-colors duration-200 group">
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
        <i className={`bi ${icon} text-lg ${iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-extrabold leading-none tracking-tight ${accentColor || 'text-white'}`}>
          {value}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {sublabel && (
            <span className="text-[11px] text-gray-500">{sublabel}</span>
          )}
          {trend && (
            <span className={`text-[10px] font-semibold flex items-center gap-0.5
              ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              <i className={`bi ${trendUp ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}`} />
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
