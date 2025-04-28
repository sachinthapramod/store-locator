import mongoose from 'mongoose';

const coordinatesSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

const featuresSchema = new mongoose.Schema({
  parking: { type: Boolean, default: false },
  wheelchair: { type: Boolean, default: false },
  sewingPlant: { type: Boolean, default: false },
  machinery: { type: Boolean, default: false }
});

const capacitySchema = new mongoose.Schema({
  employees: { type: String },
  knitGarments: { type: String },
  wovenGarments: { type: String }
});

const equipmentSchema = new mongoose.Schema({
  normalMachines: { type: String },
  overlockMachines: { type: String },
  doubleNeedleMachines: { type: String },
  specializedEquipment: { type: [String], default: [] }
});

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  hours: { type: String, required: true },
  coordinates: { type: coordinatesSchema, required: true },
  description: { type: String, required: true },
  features: { type: featuresSchema, default: {} },
  capacity: { type: capacitySchema },
  equipment: { type: equipmentSchema }
}, {
  timestamps: true
});

const Store = mongoose.model('Store', storeSchema);

export default Store; 