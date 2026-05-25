import React from 'react';

const ShipmentGrid = ({ shipments }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {shipments.map(shipment => (
        <div key={shipment.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-white font-semibold">{shipment.trackingNumber}</p>
          <p className="text-slate-400 text-sm mt-1">{shipment.destination}</p>
        </div>
      ))}
    </div>
  );
};

export default ShipmentGrid;
