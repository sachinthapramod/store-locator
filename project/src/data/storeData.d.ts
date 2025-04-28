import { Store } from '../components/StoreLocator';

interface StoreEquipment {
  normalMachines: string;
  overlockMachines: string;
  doubleNeedleMachines: string;
  specializedEquipment: string[];
}

interface Capacity {
  employees: string;
  knitGarments: string;
  wovenGarments: string;
}

interface StoreFeatures {
  parking: boolean;
  wheelchair: boolean;
  sewingPlant?: boolean;
  machinery?: boolean;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  features: StoreFeatures;
  email?: string;
  capacity?: Capacity;
  equipment?: StoreEquipment;
}

export const storeLocations: Store[]; 