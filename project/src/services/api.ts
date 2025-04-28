import { Store } from '../components/StoreLocator';

const API_URL = 'http://localhost:5000/api';

// Interface for the store from the server (will have MongoDB _id)
export interface ServerStore extends Omit<Store, 'id'> {
  _id: string;
}

// Convert server store format to client format
const convertToClientStore = (serverStore: ServerStore): Store => {
  const { _id, ...rest } = serverStore;
  return {
    id: parseInt(_id.toString().substring(0, 8), 16), // Convert ObjectId to numeric id
    ...rest
  };
};

// Fetch all stores from the server
export const fetchStores = async (): Promise<Store[]> => {
  try {
    const response = await fetch(`${API_URL}/stores`);
    if (!response.ok) {
      throw new Error('Failed to fetch stores');
    }
    const data: ServerStore[] = await response.json();
    return data.map(convertToClientStore);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
};

// Fetch a single store by ID
export const fetchStoreById = async (id: number): Promise<Store | null> => {
  try {
    // Find the store with MongoDB _id that matches when converted to numeric id
    const stores = await fetchStores();
    return stores.find(store => store.id === id) || null;
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
};

// Create a new store
export const createStore = async (store: Omit<Store, 'id'>): Promise<Store | null> => {
  try {
    const response = await fetch(`${API_URL}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(store),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create store');
    }
    
    const data: ServerStore = await response.json();
    return convertToClientStore(data);
  } catch (error) {
    console.error('Error creating store:', error);
    return null;
  }
};

// Update an existing store
export const updateStore = async (id: number, store: Partial<Store>): Promise<Store | null> => {
  try {
    // Find the MongoDB _id for this store
    const stores = await fetchStores();
    const storeToUpdate = stores.find(s => s.id === id);
    
    if (!storeToUpdate) {
      throw new Error('Store not found');
    }
    
    // Use the MongoDB _id from the matching store
    const mongoId = await getMongoIdFromClientId(id);
    
    if (!mongoId) {
      throw new Error('Could not find MongoDB ID for store');
    }
    
    const response = await fetch(`${API_URL}/stores/${mongoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(store),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update store');
    }
    
    const data: ServerStore = await response.json();
    return convertToClientStore(data);
  } catch (error) {
    console.error('Error updating store:', error);
    return null;
  }
};

// Delete a store
export const deleteStore = async (id: number): Promise<boolean> => {
  try {
    // Find the MongoDB _id for this store
    const mongoId = await getMongoIdFromClientId(id);
    
    if (!mongoId) {
      throw new Error('Could not find MongoDB ID for store');
    }
    
    const response = await fetch(`${API_URL}/stores/${mongoId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete store');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting store:', error);
    return false;
  }
};

// Helper function to get MongoDB _id from client id
const getMongoIdFromClientId = async (clientId: number): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/stores`);
    if (!response.ok) {
      throw new Error('Failed to fetch stores');
    }
    
    const stores: ServerStore[] = await response.json();
    const store = stores.find(s => {
      const converted = convertToClientStore(s);
      return converted.id === clientId;
    });
    
    return store ? store._id : null;
  } catch (error) {
    console.error('Error getting MongoDB ID:', error);
    return null;
  }
}; 