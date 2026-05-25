import React from 'react';
import { MapPin, Truck, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * TrackingCard Component
 * Displays shipment tracking information with progress bar and actions
 * Replaces ItemCard for logistics tracking dashboard
 */
const TrackingCard = ({
  id,
  trackingNumber,
  origin,
  destination,
  status, // 'in_transit', 'ready_pickup', 'delivered', 'pending', 'delayed'
  progress, // 0-100
  estimatedDelivery,
  carrier,
  items,
  weight,
  value,
  lastUpdate,
  onViewDetails,
  onPrintLabel,
  onContactSupport,
  badge, // Optional: 'URGENT', 'DELAYED'
}) => {
  // Determine color based on status
  const getStatusColor = () => {
    switch (status) {
      case 'delivered':
        return 'text-green-400 bg-green-900/30';
      case 'in_transit':
        return 'text-blue-400 bg-blue-900/30';
      case 'ready_pickup':
        return 'text-amber-400 bg-amber-900/30';
      case 'delayed':
        return 'text-red-400 bg-red-900/30';
      case 'pending':
        return 'text-gray-400 bg-gray-700/30';
      default:
        return 'text-gray-400 bg-gray-700/30';
    }
  };

  // Determine progress bar color
  const getProgressColor = () => {
    if (status === 'delivered') return 'bg-green-500';
    if (status === 'delayed') return 'bg-red-500';
    if (status === 'ready_pickup') return 'bg-amber-500';
    return 'bg-blue-500';
  };

  // Determine status icon
  const StatusIcon = () => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'delayed':
        return <AlertCircle size={20} className="text-red-400" />;
      case 'in_transit':
        return <Truck size={20} className="text-blue-400" />;
      default:
        return <MapPin size={20} className="text-gray-400" />;
    }
  };

  // Format tracking number display
  const displayTrackingNumber = trackingNumber || `#${id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="flex-shrink-0 w-80 bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-800">
      {/* Card Header with Status */}
      <div className="p-4 border-b border-gray-800 bg-gray-800/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-xs font-mono text-gray-400 mb-1">
              Tracking ID
            </div>
            <h3 className="text-lg font-bold text-white font-mono">
              {displayTrackingNumber}
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor()}`}>
            <StatusIcon />
            <span className="capitalize">{status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Badge (Optional) */}
        {badge && (
          <div className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
            {badge}
          </div>
        )}
      </div>

      {/* Route Information */}
      <div className="p-4 space-y-3 border-b border-gray-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">FROM</p>
            <p className="text-sm font-semibold text-white line-clamp-1">
              {origin}
            </p>
          </div>
          <div className="text-gray-500">→</div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-1">TO</p>
            <p className="text-sm font-semibold text-white line-clamp-1">
              {destination}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4 space-y-3 border-b border-gray-800">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Progress</span>
            <span className="text-xs font-bold text-white">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Estimated Delivery</p>
            <p className="font-semibold text-white">
              {new Date(estimatedDelivery).toLocaleDateString('en-PH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Shipment Details */}
      <div className="p-4 space-y-2 border-b border-gray-800 bg-gray-800/20">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Carrier:</span>
          <span className="text-white font-semibold">{carrier}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Weight:</span>
          <span className="text-white font-semibold">{weight}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Items:</span>
          <span className="text-white font-semibold">{items?.length || 0} item(s)</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Total Value:</span>
          <span className="text-white font-semibold">₱{value?.toFixed(2)}</span>
        </div>
        {lastUpdate && (
          <div className="flex justify-between text-xs pt-2 border-t border-gray-700">
            <span className="text-gray-400">Last Update:</span>
            <span className="text-gray-300 text-xs">
              {new Date(lastUpdate).toLocaleString('en-PH', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Items List (Expandable in production) */}
      {items && items.length > 0 && (
        <div className="p-4 border-b border-gray-800 bg-gray-800/10">
          <p className="text-xs font-semibold text-gray-400 mb-2">Contents</p>
          <div className="space-y-1">
            {items.slice(0, 2).map((item, idx) => (
              <div key={idx} className="text-xs text-gray-300 flex justify-between">
                <span>{item.name}</span>
                <span className="text-gray-500">× {item.qty}</span>
              </div>
            ))}
            {items.length > 2 && (
              <div className="text-xs text-gray-500 pt-1">
                +{items.length - 2} more item(s)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        {/* Primary Button */}
        <button
          onClick={() => onViewDetails && onViewDetails(id)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
          View Details
        </button>

        {/* Secondary Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onPrintLabel && onPrintLabel(id)}
            className="flex-1 text-blue-400 hover:text-blue-300 text-xs font-semibold border border-blue-600/30 hover:border-blue-600/60 py-2 rounded transition-all duration-200"
          >
            Print Label
          </button>
          <button
            onClick={() => onContactSupport && onContactSupport(id)}
            className="flex-1 text-gray-400 hover:text-gray-300 text-xs font-semibold border border-gray-600/30 hover:border-gray-600/60 py-2 rounded transition-all duration-200"
          >
            Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingCard;
