import React from 'react';

/**
 * StatusBadge Component
 * Displays a styled pill badge for shipment status using Bootstrap Icons
 * Supports: in_transit, ready_pickup, delivered, pending, delayed, out_for_delivery
 */
const STATUS_CONFIG = {
  in_transit: {
    label: 'In Transit',
    icon: 'bi-truck',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    icon: 'bi-bicycle',
    className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  ready_pickup: {
    label: 'Ready for Pickup',
    icon: 'bi-box-seam',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  delivered: {
    label: 'Delivered',
    icon: 'bi-check-circle-fill',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  pending: {
    label: 'Pending',
    icon: 'bi-hourglass-split',
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    dot: 'bg-slate-400',
  },
  delayed: {
    label: 'Delayed',
    icon: 'bi-exclamation-triangle-fill',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
    dot: 'bg-red-400 animate-pulse',
  },
};

const StatusBadge = ({ status, size = 'md', showIcon = true, showDot = false }) => {
  const config = STATUS_CONFIG[status] || {
    label: status?.replace('_', ' ') || 'Unknown',
    icon: 'bi-question-circle',
    className: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    dot: 'bg-gray-400',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold
        ${config.className} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      )}
      {showIcon && (
        <i className={`bi ${config.icon} ${iconSizes[size]} flex-shrink-0`} />
      )}
      <span className="capitalize">{config.label}</span>
    </span>
  );
};

export default StatusBadge;
