import React from 'react';
import { Home, Package, AlertTriangle, ShoppingCart, Settings, Heart, BarChart3, Box, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'active-shipments', label: 'Active Shipments', icon: Package },
  { id: 'inventory', label: 'Inventory Overview', icon: Box },
  { id: 'recent-alerts', label: 'Recent Alerts', icon: AlertTriangle },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'cart', label: 'Shopping Cart', icon: ShoppingCart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const CategorySidebar = ({ activeSection, onSectionChange, userInfo }) => {
  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold">
            ST
          </div>
          <span className="text-lg font-bold text-white">SmartTrack</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Categories
        </div>
        <nav className="space-y-1">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = activeSection === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onSectionChange(category.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                {category.label}
              </button>
            );
          })}
        </nav>
      </div>

      {userInfo && (
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-3 py-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold">
              {userInfo.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userInfo.name}</p>
              <p className="text-xs text-slate-500">{userInfo.shipmentCount} shipments</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default CategorySidebar;
