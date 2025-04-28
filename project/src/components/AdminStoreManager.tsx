import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, X, Edit, Trash, Map, List, LogOut, AlertCircle, Upload } from 'lucide-react';
import { fetchStores, createStore, updateStore as apiUpdateStore, deleteStore as apiDeleteStore } from '../services/api';
import { Store } from './StoreLocator';
import StoreLocator from './StoreLocator';

// Form data interface
interface FormData {
  id: number | null;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  hours: string;
  phone: string;
  email: string;
  description: string;
  features: {
    parking: boolean;
    wheelchair: boolean;
    sewingPlant: boolean;
    machinery: boolean;
  };
  capacity: {
    employees: string;
    knitGarments: string;
    wovenGarments: string;
  };
  equipment: {
    normalMachines: string;
    overlockMachines: string;
    doubleNeedleMachines: string;
    specializedEquipment: string[];
  };
}

export default function AdminStoreManager() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [formData, setFormData] = useState<FormData>({
    id: null,
    name: '',
    address: '',
    coordinates: { lat: 7.8731, lng: 80.7718 }, // Default to Sri Lanka center
    hours: '',
    phone: '',
    email: '',
    description: '',
    features: {
      parking: false,
      wheelchair: false,
      sewingPlant: false,
      machinery: false
    },
    capacity: {
      employees: '',
      knitGarments: '',
      wovenGarments: ''
    },
    equipment: {
      normalMachines: '',
      overlockMachines: '',
      doubleNeedleMachines: '',
      specializedEquipment: ['']
    }
  });

  // Load stores from API
  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);
        const storesData = await fetchStores();
        setStores(storesData);
        setError(null);
      } catch (err) {
        console.error('Failed to load stores:', err);
        setError('Failed to load stores from database');
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      // Handle nested properties
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof typeof prev] as Record<string, any>),
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name === 'lat' || name === 'lng') {
      // Handle coordinates
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [name]: parseFloat(value) || 0
        }
      }));
    } else {
      // Handle top-level properties
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle specialized equipment array
  const handleEquipmentChange = (index: number, value: string) => {
    const updatedEquipment = [...formData.equipment.specializedEquipment];
    updatedEquipment[index] = value;

    setFormData(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        specializedEquipment: updatedEquipment
      }
    }));
  };

  // Add new equipment field
  const addEquipmentField = () => {
    setFormData(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        specializedEquipment: [...prev.equipment.specializedEquipment, '']
      }
    }));
  };

  // Remove equipment field
  const removeEquipmentField = (index: number) => {
    const updatedEquipment = [...formData.equipment.specializedEquipment];
    updatedEquipment.splice(index, 1);

    setFormData(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        specializedEquipment: updatedEquipment
      }
    }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      address: '',
      coordinates: { lat: 7.8731, lng: 80.7718 },
      hours: '',
      phone: '',
      email: '',
      description: '',
      features: {
        parking: false,
        wheelchair: false,
        sewingPlant: false,
        machinery: false
      },
      capacity: {
        employees: '',
        knitGarments: '',
        wovenGarments: ''
      },
      equipment: {
        normalMachines: '',
        overlockMachines: '',
        doubleNeedleMachines: '',
        specializedEquipment: ['']
      }
    });
    setIsAddingStore(false);
    setIsEditingStore(false);
    setSaveError(null);
  };

  // Start adding a new store
  const startAddStore = () => {
    resetForm();
    setIsAddingStore(true);
    setIsEditingStore(false);
  };

  // Start editing a store
  const startEditStore = (store: Store) => {
    setFormData({
      id: store.id,
      name: store.name,
      address: store.address,
      coordinates: store.coordinates,
      hours: store.hours,
      phone: store.phone,
      email: store.email || '',
      description: store.description,
      features: {
        parking: store.features?.parking || false,
        wheelchair: store.features?.wheelchair || false,
        sewingPlant: store.features?.sewingPlant || false,
        machinery: store.features?.machinery || false
      },
      capacity: {
        employees: store.capacity?.employees || '',
        knitGarments: store.capacity?.knitGarments || '',
        wovenGarments: store.capacity?.wovenGarments || ''
      },
      equipment: {
        normalMachines: store.equipment?.normalMachines || '',
        overlockMachines: store.equipment?.overlockMachines || '',
        doubleNeedleMachines: store.equipment?.doubleNeedleMachines || '',
        specializedEquipment: store.equipment?.specializedEquipment || ['']
      }
    });
    setIsAddingStore(false);
    setIsEditingStore(true);
    setSaveError(null);
  };

  // Save new store to database
  const saveNewStore = async () => {
    try {
      setSaveError(null);
      setLoading(true);

      const { id, ...storeData } = formData;
      const newStore = await createStore(storeData);

      if (newStore) {
        // Update local state
        setStores(prevStores => [...prevStores, newStore]);
        resetForm();
      } else {
        throw new Error('Failed to create store');
      }
    } catch (err) {
      console.error('Error saving store:', err);
      setSaveError('Failed to save store to the database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update existing store in database
  const updateStore = async () => {
    if (!formData.id) {
      setSaveError('Cannot update store: No ID provided');
      return;
    }

    try {
      setSaveError(null);
      setLoading(true);

      const { id, ...storeData } = formData;
      const updatedStore = await apiUpdateStore(id, storeData);

      if (updatedStore) {
        // Update local state
        setStores(prevStores => prevStores.map(store =>
          store.id === updatedStore.id ? updatedStore : store
        ));
        resetForm();
      } else {
        throw new Error('Failed to update store');
      }
    } catch (err) {
      console.error('Error updating store:', err);
      setSaveError('Failed to update store in the database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete store from database
  const deleteStore = async (storeId: number) => {
    if (!confirm('Are you sure you want to delete this store?')) {
      return;
    }

    try {
      setLoading(true);
      const success = await apiDeleteStore(storeId);

      if (success) {
        // Update local state
        setStores(prevStores => prevStores.filter(store => store.id !== storeId));
      } else {
        throw new Error('Failed to delete store');
      }
    } catch (err) {
      console.error('Error deleting store:', err);
      setError('Failed to delete store from the database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export stores data as JSON
  const exportStoresData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stores, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "store_locations.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Simulated logout function
  const handleLogout = () => {
    // In a real app, you would handle authentication properly
    window.location.href = '/';
  };

  // Handle bulk import of stores
  const handleBulkImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const storesData = JSON.parse(content);

          if (!Array.isArray(storesData)) {
            throw new Error('Invalid file format. Expected an array of stores.');
          }

          // Validate each store object
          const validStores = storesData.map(store => ({
            name: store.name || '',
            address: store.address || '',
            coordinates: store.coordinates || { lat: 0, lng: 0 },
            hours: store.hours || '',
            phone: store.phone || '',
            email: store.email || '',
            description: store.description || '',
            features: {
              parking: store.features?.parking || false,
              wheelchair: store.features?.wheelchair || false,
              sewingPlant: store.features?.sewingPlant || false,
              machinery: store.features?.machinery || false
            },
            capacity: {
              employees: store.capacity?.employees || '',
              knitGarments: store.capacity?.knitGarments || '',
              wovenGarments: store.capacity?.wovenGarments || ''
            },
            equipment: {
              normalMachines: store.equipment?.normalMachines || '',
              overlockMachines: store.equipment?.overlockMachines || '',
              doubleNeedleMachines: store.equipment?.doubleNeedleMachines || '',
              specializedEquipment: store.equipment?.specializedEquipment || ['']
            }
          }));

          // Create stores in database
          const createdStores = await Promise.all(
            validStores.map(store => createStore(store))
          );

          // Update local state with only valid stores
          setStores(prevStores => [...prevStores, ...createdStores.filter(store => store !== null)]);
          setError(null);
        } catch (err) {
          console.error('Error importing stores:', err);
          setError('Failed to import stores. Please check the file format.');
        } finally {
          setLoading(false);
        }
      };

      reader.readAsText(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read the file. Please try again.');
      setLoading(false);
    }
  };

  // Loading state display
  if (loading && !isAddingStore && !isEditingStore) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stores data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Map className="mr-2" /> Store Locator Admin
            </h1>
            <div className="text-sm text-indigo-200">
              Connected to MongoDB Database
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="bg-white text-indigo-700 px-4 py-2 rounded hover:bg-indigo-50 flex items-center"
            >
              {viewMode === 'list' ? (
                <>
                  <Map className="mr-2 h-4 w-4" /> Map View
                </>
              ) : (
                <>
                  <List className="mr-2 h-4 w-4" /> List View
                </>
              )}
            </button>
            <button
              onClick={startAddStore}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Store
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleBulkImport}
                className="hidden"
                id="bulk-import"
              />
              <label
                htmlFor="bulk-import"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center cursor-pointer"
              >
                <Upload className="mr-2 h-4 w-4" /> Import Data
              </label>
            </div>
            <button
              onClick={exportStoresData}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              <Save className="mr-2 h-4 w-4" /> Export Data
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="container mx-auto">
          {/* Error Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
              <button
                className="ml-auto text-red-700 hover:text-red-900"
                onClick={() => setError(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {saveError && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{saveError}</span>
              <button
                className="ml-auto text-yellow-700 hover:text-yellow-900"
                onClick={() => setSaveError(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Form for Adding/Editing Store */}
          {(isAddingStore || isEditingStore) ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {isAddingStore ? 'Add New Store' : 'Edit Store'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Store Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Basic Information</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address*
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude*
                      </label>
                      <input
                        type="number"
                        name="lat"
                        value={formData.coordinates.lat}
                        onChange={handleInputChange}
                        step="0.000001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude*
                      </label>
                      <input
                        type="number"
                        name="lng"
                        value={formData.coordinates.lng}
                        onChange={handleInputChange}
                        step="0.000001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number*
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours*
                    </label>
                    <input
                      type="text"
                      name="hours"
                      value={formData.hours}
                      onChange={handleInputChange}
                      placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Additional Information</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description*
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Features
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="features.parking"
                          checked={formData.features.parking}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>Parking Available</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="features.wheelchair"
                          checked={formData.features.wheelchair}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>Wheelchair Accessible</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="features.sewingPlant"
                          checked={formData.features.sewingPlant}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>Sewing Plant</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="features.machinery"
                          checked={formData.features.machinery}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span>Machinery</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity and Equipment */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Capacity</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employees
                    </label>
                    <input
                      type="text"
                      name="capacity.employees"
                      value={formData.capacity.employees}
                      onChange={handleInputChange}
                      placeholder="e.g., 25-50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Knit Garments
                    </label>
                    <input
                      type="text"
                      name="capacity.knitGarments"
                      value={formData.capacity.knitGarments}
                      onChange={handleInputChange}
                      placeholder="e.g., 1,000-3,000 monthly"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Woven Garments
                    </label>
                    <input
                      type="text"
                      name="capacity.wovenGarments"
                      value={formData.capacity.wovenGarments}
                      onChange={handleInputChange}
                      placeholder="e.g., 7,000-10,000 monthly"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Equipment</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Normal Machines
                    </label>
                    <input
                      type="text"
                      name="equipment.normalMachines"
                      value={formData.equipment.normalMachines}
                      onChange={handleInputChange}
                      placeholder="e.g., 5-10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Overlock Machines
                    </label>
                    <input
                      type="text"
                      name="equipment.overlockMachines"
                      value={formData.equipment.overlockMachines}
                      onChange={handleInputChange}
                      placeholder="e.g., 1-3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Double Needle Machines
                    </label>
                    <input
                      type="text"
                      name="equipment.doubleNeedleMachines"
                      value={formData.equipment.doubleNeedleMachines}
                      onChange={handleInputChange}
                      placeholder="e.g., 1-3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialized Equipment
                    </label>
                    {formData.equipment.specializedEquipment.map((item, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleEquipmentChange(index, e.target.value)}
                          placeholder="e.g., Button hole"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeEquipmentField(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                          disabled={formData.equipment.specializedEquipment.length <= 1}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEquipmentField}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-1"
                    >
                      + Add Equipment
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 mr-4 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={isAddingStore ? saveNewStore : updateStore}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                >
                  {isAddingStore ? 'Add Store' : 'Update Store'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Store Listing or Map View */}
              {viewMode === 'list' ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Manage Stores</h2>
                    <p className="text-gray-600">Total Stores: {stores.length}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stores.length > 0 ? (
                          stores.map((store) => (
                            <tr key={store.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{store.name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{store.address}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{store.phone}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{store.hours}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {store.features?.parking && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      Parking
                                    </span>
                                  )}
                                  {store.features?.wheelchair && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      Wheelchair
                                    </span>
                                  )}
                                  {store.features?.sewingPlant && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Sewing
                                    </span>
                                  )}
                                  {store.features?.machinery && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                      Machinery
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => startEditStore(store)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteStore(store.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                              No stores found in database
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                // Map View using StoreLocator component
                <div className="rounded-lg overflow-hidden h-[800px] shadow-md">
                  <StoreLocator
                    isAuthenticated={true}
                    onLogout={handleLogout}
                    onAdminView={() => setViewMode('list')}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}