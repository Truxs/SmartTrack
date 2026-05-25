import React from 'react';

const ShipmentSidebar = () => {
  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <span className="text-lg font-bold text-white">SmartTrack</span>
      </div>
      <div className="flex-1 p-4">
        <p className="text-slate-500 text-sm">Sidebar Content</p>
      </div>
    </aside>
  );
};

export default ShipmentSidebar;
