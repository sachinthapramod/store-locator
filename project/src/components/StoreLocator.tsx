import React, { useState, useEffect } from 'react';
import { Map, Home, Navigation, Info, MapPin, Search, Filter, User, LogOut, Phone, Clock, ParkingSquare, Accessibility } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { fetchStores } from '../services/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = { lat: 7.873054, lng: 80.771797 }; // Sri Lanka coordinates
const defaultZoom = 8; // Adjusted for Sri Lanka view

/**
 * Store Interface
 * Defines the structure of store data including:
 * - Basic information (name, address, contact details)
 * - Location coordinates
 * - Features and amenities
 * - Capacity and equipment details
 */
export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  coordinates: { lat: number; lng: number };
  description: string;
  features: {
    parking: boolean;
    wheelchair: boolean;
    sewingPlant?: boolean;
    machinery?: boolean
  };
  email?: string;
  capacity?: {
    employees: string;
    knitGarments: string;
    wovenGarments: string;
  };
  equipment?: {
    normalMachines: string;
    overlockMachines: string;
    doubleNeedleMachines: string;
    specializedEquipment: string[];
  };
  isNewStore?: boolean;
}

/**
 * Props interface for StoreLocator component
 * Handles authentication state and view switching
 */
interface StoreLocatorProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  onAdminView: () => void;
}

/**
 * StoreLocator Component
 * Main component for displaying store locations on a map
 * Features:
 * - Interactive Google Maps integration
 * - Store search and filtering
 * - Detailed store information display
 * - Navigation and directions
 */
export default function StoreLocator({ isAuthenticated, onLogout, onAdminView }: StoreLocatorProps) {
  // State management for stores data and UI
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter state for store features
  const [filters, setFilters] = useState({
    openNow: false,
    hasParking: false,
    wheelchair: false,
    sewingPlant: false,
    machinery: false
  });

  const [activeMarker, setActiveMarker] = useState<Store | null>(null);

  // Initialize Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCF8_dzWv819uV63-5ahXvzoH_phDAQrPU',
  });

  /**
   * Load stores data from MongoDB via API
   * Runs once when component mounts
   */
  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);
        const storesData = await fetchStores();
        setStores(storesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to load stores. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  /**
   * Handle store selection from list or map
   * Updates map center and zoom level to focus on selected store
   */
  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    setMapCenter(store.coordinates);
    setMapZoom(15);
  };

  /**
   * Handle marker click on map
   * Shows store details in InfoWindow
   */
  const handleMarkerClick = (store: Store) => {
    setActiveMarker(store);
    setMapCenter(store.coordinates);
  };

  /**
   * Open Google Maps directions to selected store
   */
  const viewDirections = (store: Store) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`);
  };

  /**
   * View detailed store profile
   */
  const viewProfile = (store: Store) => {
    handleStoreSelect(store);
  };

  /**
   * Reset view to show all stores
   */
  const viewAllStores = () => {
    setSelectedStore(null);
    setMapCenter(defaultCenter);
    setMapZoom(8);
  };

  /**
   * Handle map click to clear selected marker
   */
  const handleMapClick = () => {
    setActiveMarker(null);
  };

  /**
   * Filter stores based on search term and selected filters
   */
  const filteredStores = stores.filter(store => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesParking = !filters.hasParking || (store.features && store.features.parking);
    const matchesWheelchair = !filters.wheelchair || (store.features && store.features.wheelchair);
    const matchesOpenNow = !filters.openNow || true;
    const matchesSewingPlant = !filters.sewingPlant || (store.features && store.features.sewingPlant);
    const matchesMachinery = !filters.machinery || (store.features && store.features.machinery);

    return matchesSearch && matchesParking && matchesWheelchair && matchesOpenNow &&
      matchesSewingPlant && matchesMachinery;
  });

  // Loading and error states
  if (loadError) {
    return <div className="flex items-center justify-center h-screen">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading maps...</div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading stores data...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Main component render
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header section with title and navigation buttons */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Map className="mr-2" /> Store Locator
              </h1>
              <div className="text-sm text-blue-100">
                Powered by Team Teczey
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={viewAllStores}
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
              >
                View All
              </button>
              {isAuthenticated ? (
                <button
                  onClick={onLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={onAdminView}
                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                >
                  Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search and filter section */}
      <div className="bg-white p-4 shadow-sm border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="relative flex-grow mr-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by store name or address..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded flex items-center hover:bg-gray-200"
          >
            <Filter className="mr-2 h-4 w-4" /> Filters
          </button>
        </div>

        {/* Filter options panel */}
        {filterOpen && (
          <div className="container mx-auto mt-2 p-3 bg-gray-50 rounded border">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={filters.openNow}
                  onChange={() => setFilters({ ...filters, openNow: !filters.openNow })}
                />
                <span>Open Now</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={filters.hasParking}
                  onChange={() => setFilters({ ...filters, hasParking: !filters.hasParking })}
                />
                <span>Parking Available</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={filters.wheelchair}
                  onChange={() => setFilters({ ...filters, wheelchair: !filters.wheelchair })}
                />
                <span>Wheelchair Accessible</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={filters.sewingPlant}
                  onChange={() => setFilters({ ...filters, sewingPlant: !filters.sewingPlant })}
                />
                <span>Sewing Plant</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={filters.machinery}
                  onChange={() => setFilters({ ...filters, machinery: !filters.machinery })}
                />
                <span>Machinery Available</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Main content area with map and store list */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Map container */}
        <div className="w-full md:w-2/3 h-96 md:h-auto">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={mapZoom}
            onClick={handleMapClick}
          >
            {/* Render store markers on map */}
            {filteredStores.map(store => (
              <Marker
                key={store.id}
                position={store.coordinates}
                onClick={() => handleMarkerClick(store)}
              />
            ))}

            {/* InfoWindow for selected store */}
            {activeMarker && (
              <InfoWindow
                position={activeMarker.coordinates}
                onCloseClick={() => setActiveMarker(null)}
              >
                <div className="p-2 max-w-xs">
                  <h3 className="font-bold text-lg mb-2">{activeMarker.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{activeMarker.address}</p>
                  <div className="space-y-2">
                    {activeMarker.phone && (
                      <p className="text-sm flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {activeMarker.phone}
                      </p>
                    )}
                    {activeMarker.hours && (
                      <p className="text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {activeMarker.hours}
                      </p>
                    )}
                    {activeMarker.features.parking && (
                      <p className="text-sm flex items-center">
                        <ParkingSquare className="h-4 w-4 mr-2" />
                        Parking Available
                      </p>
                    )}
                    {activeMarker.features.wheelchair && (
                      <p className="text-sm flex items-center">
                        <Accessibility className="h-4 w-4 mr-2" />
                        Wheelchair Accessible
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex justify-between">
                    <button
                      onClick={() => viewDirections(activeMarker)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Directions
                    </button>
                    <button
                      onClick={() => {
                        setActiveMarker(null);
                        handleStoreSelect(activeMarker);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Info className="h-4 w-4 mr-1" />
                      View Profile
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        {/* Store list sidebar */}
        <div className="w-full md:w-1/3 bg-white overflow-y-auto">
          {selectedStore ? (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedStore.name}</h2>
              <p className="text-gray-600 mb-4">{selectedStore.address}</p>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-1">Hours</h3>
                <p className="text-gray-600">{selectedStore.hours}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-1">Contact</h3>
                <p className="text-gray-600">{selectedStore.phone}</p>
              </div>

              {selectedStore.email && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-1">Email</h3>
                  <p className="text-gray-600">{selectedStore.email}</p>
                </div>
              )}

              {selectedStore.capacity && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-1">Capacity</h3>
                  <p className="text-gray-600">Employees: {selectedStore.capacity.employees}</p>
                  <p className="text-gray-600">Knit Garments: {selectedStore.capacity.knitGarments}</p>
                  <p className="text-gray-600">Woven Garments: {selectedStore.capacity.wovenGarments}</p>
                </div>
              )}

              {selectedStore.equipment && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-1">Equipment</h3>
                  <p className="text-gray-600">Normal Machines: {selectedStore.equipment.normalMachines}</p>
                  <p className="text-gray-600">Overlock Machines: {selectedStore.equipment.overlockMachines}</p>
                  <p className="text-gray-600">Double Needle Machines: {selectedStore.equipment.doubleNeedleMachines}</p>
                  {selectedStore.equipment.specializedEquipment && (
                    <p className="text-gray-600">Specialized Equipment: {selectedStore.equipment.specializedEquipment.join(", ")}</p>
                  )}
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-1">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStore.features?.parking && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Parking</span>
                  )}
                  {selectedStore.features?.wheelchair && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Wheelchair Accessible</span>
                  )}
                  {selectedStore.features?.sewingPlant && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Sewing Plant</span>
                  )}
                  {selectedStore.features?.machinery && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Machinery</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                  onClick={() => viewProfile(selectedStore)}
                >
                  <Info className="mr-2 h-4 w-4" /> View Profile
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-1">About</h3>
                <p className="text-gray-600">{selectedStore.description}</p>
              </div>

              <div className="flex space-x-4">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                  onClick={() => viewDirections(selectedStore)}
                >
                  <Navigation className="mr-2 h-4 w-4" /> Directions
                </button>
                <button
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center"
                  onClick={viewAllStores}
                >
                  <Map className="mr-2 h-4 w-4" /> View All
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold">Our Locations</h2>
                <p className="text-gray-600">Select a store to view details</p>
              </div>
              {filteredStores.length > 0 ? (
                <ul>
                  {filteredStores.map(store => (
                    <li
                      key={store.id}
                      className="border-b hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleStoreSelect(store)}
                    >
                      <div className="p-4">
                        <h3 className="font-semibold">{store.name}</h3>
                        <p className="text-gray-600 text-sm">{store.address}</p>
                        <div className="flex mt-1 gap-2">
                          {store.features?.parking && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">P</span>
                          )}
                          {store.features?.wheelchair && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">♿</span>
                          )}
                          {store.features?.sewingPlant && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">SP</span>
                          )}
                          {store.features?.machinery && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">M</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No stores found matching your criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({
                        openNow: false,
                        hasParking: false,
                        wheelchair: false,
                        sewingPlant: false,
                        machinery: false
                      });
                    }}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}