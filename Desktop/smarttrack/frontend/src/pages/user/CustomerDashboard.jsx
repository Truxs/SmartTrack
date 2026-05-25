import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ShipmentSidebar from '../../components/ShipmentSidebar';
import ShipmentGrid from '../../components/ShipmentGrid';
import { Bell, Search, MapPin, Zap } from 'lucide-react';

const sampleShipments = {
  active: [
    {
      id: 'ship_001',
      trackingNumber: 'TRK-001234',
      origin: 'Manila Hub',
      destination: 'Quezon City',
      status: 'in_transit',
      progress: 65,
      estimatedDelivery: '2026-05-27',
      carrier: 'SmartTrack Express',
      items: [
        { name: 'Electronics Package', qty: 1 },
        { name: 'Accessories', qty: 3 },
      ],
      weight: '3.5 kg',
      value: 4500.0,
      lastUpdate: '2026-05-24T14:30:00Z',
    },
    {
      id: 'ship_002',
      trackingNumber: 'TRK-001235',
      origin: 'Manila Hub',
      destination: 'Cebu City',
      status: 'ready_pickup',
      progress: 100,
      estimatedDelivery: '2026-05-26',
      carrier: 'DHL Parcel',
      items: [
        { name: 'Furniture Item', qty: 1 },
      ],
      weight: '25.0 kg',
      value: 8750.0,
      lastUpdate: '2026-05-24T12:15:00Z',
    },
    {
      id: 'ship_003',
      trackingNumber: 'TRK-001236',
      origin: 'Manila Hub',
      destination: 'Davao City',
      status: 'in_transit',
      progress: 45,
      estimatedDelivery: '2026-05-29',
      carrier: 'FedEx International',
      items: [
        { name: 'Documents', qty: 1 },
        { name: 'Samples', qty: 5 },
      ],
      weight: '1.2 kg',
      value: 2100.0,
      lastUpdate: '2026-05-24T10:45:00Z',
    },
  ],
  in_transit: [
    {
      id: 'ship_004',
      trackingNumber: 'TRK-001237',
      origin: 'Laguna Hub',
      destination: 'Bulacan',
      status: 'in_transit',
      progress: 55,
      estimatedDelivery: '2026-05-25',
      carrier: 'SmartTrack Express',
      items: [
        { name: 'Clothing Items', qty: 4 },
      ],
      weight: '5.8 kg',
      value: 3200.0,
      lastUpdate: '2026-05-24T09:20:00Z',
    },
  ],
  ready_pickup: [
    {
      id: 'ship_005',
      trackingNumber: 'TRK-001238',
      origin: 'Cebu Hub',
      destination: 'Mandaue City',
      status: 'ready_pickup',
      progress: 95,
      estimatedDelivery: '2026-05-24',
      carrier: 'Local Courier',
      items: [
        { name: 'Food Items', qty: 2 },
        { name: 'Kitchen Supplies', qty: 3 },
      ],
      weight: '8.5 kg',
      value: 2450.0,
      lastUpdate: '2026-05-24T08:00:00Z',
    },
  ],
  delivered: [
    {
      id: 'ship_101',
      trackingNumber: 'TRK-000999',
      origin: 'Manila Hub',
      destination: 'Makati City',
      status: 'delivered',
      progress: 100,
      estimatedDelivery: '2026-05-23',
      carrier: 'SmartTrack Express',
      items: [
        { name: 'Office Supplies', qty: 10 },
      ],
      weight: '2.0 kg',
      value: 1500.0,
      lastUpdate: '2026-05-23T16:45:00Z',
    },
  ],
  pending: [
    {
      id: 'ship_102',
      trackingNumber: 'TRK-001240',
      origin: 'Manila Hub',
      destination: 'Iloilo City',
      status: 'pending',
      progress: 10,
      estimatedDelivery: '2026-05-30',
      carrier: 'SmartTrack Express',
      items: [
        { name: 'Industrial Parts', qty: 15 },
      ],
      weight: '18.0 kg',
      value: 12500.0,
      lastUpdate: '2026-05-24T00:01:00Z',
    },
  ],
  delayed: [
    {
      id: 'ship_103',
      trackingNumber: 'TRK-001241',
      origin: 'Manila Hub',
      destination: 'Mindanao Region',
      status: 'delayed',
      progress: 70,
      estimatedDelivery: '2026-05-28',
      carrier: 'International Express',
      items: [
        { name: 'Premium Items', qty: 2 },
      ],
      weight: '12.0 kg',
      value: 15800.0,
      lastUpdate: '2026-05-23T22:30:00Z',
      badge: 'URGENT',
    },
  ],
};

const SECTION_TITLES = {
  active: 'Active Shipments',
  in_transit: 'In Transit',
  ready_pickup: 'Ready for Pickup',
  delivered: 'Delivered',
  pending: 'Pending',
  delayed: 'Delayed Shipments',
};

const sectionFilter = (section) => {
  if (section === 'active') return (shipment) => ['in_transit', 'out_for_delivery', 'ready_pickup'].includes(shipment.status);
  if (section === 'in_transit') return (shipment) => shipment.status === 'in_transit';
  if (section === 'ready_pickup') return (shipment) => shipment.status === 'ready_pickup';
  if (section === 'delivered') return (shipment) => shipment.status === 'delivered';
  if (section === 'pending') return (shipment) => shipment.status === 'pending';
  if (section === 'delayed') return (shipment) => shipment.status === 'delayed';
  return () => true;
};

const CustomerDashboard = () => {
  const [activeSection, setActiveSection] = useState('active');
  const [shipments, setShipments] = useState(sampleShipments);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userInfo = {
    name: 'Juan Dela Cruz',
    shipmentCount: 5,
    accountStatus: 'Active',
  };

  useEffect(() => {
    const loadShipments = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setShipments(sampleShipments);
          setLoading(false);
        }, 300);
      } catch (err) {
        setError('Failed to load shipments');
        console.error('Error loading shipments:', err);
        setLoading(false);
      }
    };

    loadShipments();
  }, [activeSection]);

  const handleViewDetails = useCallback((shipmentId) => {
    console.log('View details for:', shipmentId);
    setSelectedShipment(shipmentId);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const sectionShipments = useMemo(() => {
    const all = Object.values(shipments).flat();
    return all.filter(sectionFilter(activeSection));
  }, [activeSection, shipments]);

  const filteredShipments = useMemo(() => {
    return sectionShipments.filter((shipment) =>
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sectionShipments, searchQuery]);

  return (
    <div className="flex h-screen bg-slate-950">
      <ShipmentSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userInfo={userInfo}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-white text-3xl font-bold">Shipment Tracking</h1>
              <p className="text-slate-400 mt-2">Monitor your deliveries in real time.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Bell size={24} />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {notificationCount}
                  </span>
                )}
              </button>
              <button className="p-2 text-white hover:bg-slate-800 rounded-lg transition-colors">
                <MapPin size={24} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-3xl bg-slate-950/80 border border-white/10 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by tracking number or destination..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-transparent text-white placeholder-slate-500 outline-none text-sm"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-slate-700 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400">Loading shipments...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-rose-400 text-lg font-semibold">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredShipments.length > 0 ? (
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">{SECTION_TITLES[activeSection] || 'Shipments'}</h2>
                <p className="mt-2 text-sm text-slate-400">{filteredShipments.length} shipment{filteredShipments.length !== 1 ? 's' : ''} found</p>
              </div>
              <ShipmentGrid
                shipments={filteredShipments}
                onTrackLive={(id) => console.log('Track live', id)}
                onViewDetails={handleViewDetails}
              />
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Zap size={48} className="text-slate-600 mb-4" />
              <h2 className="text-white text-xl font-semibold mb-2">No Shipments Found</h2>
              <p className="text-slate-400 text-sm max-w-md">
                {searchQuery
                  ? 'Try adjusting your search or clear the search field.'
                  : `There are no ${SECTION_TITLES[activeSection]?.toLowerCase()} right now.`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 text-blue-400 hover:text-blue-300 border border-blue-600/30 rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
