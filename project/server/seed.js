import mongoose from 'mongoose';
import Store from './models/Store.js';
import { MONGODB_URI } from './config.js';

// Initial store data from your existing frontend
const initialStores = [
  {
    name: "Downtown Store",
    address: "123 Main Street, Downtown",
    phone: "(555) 123-4567",
    hours: "Mon-Fri: 9AM-9PM, Sat-Sun: 10AM-6PM",
    coordinates: { lat: 40.7128, lng: -74.006 },
    description: "Our flagship store located in the heart of downtown with a wide selection of products and expert staff ready to assist you.",
    features: { parking: true, wheelchair: true }
  },
  {
    name: "Westside Mall",
    address: "456 West Avenue, Westside Mall",
    phone: "(555) 987-6543",
    hours: "Mon-Sat: 10AM-9PM, Sun: 11AM-6PM",
    coordinates: { lat: 40.7300, lng: -74.025 },
    description: "Located in the popular Westside Mall, this location offers convenient shopping with extended weekend hours.",
    features: { parking: true, wheelchair: true }
  },
  {
    name: "Eastside Plaza",
    address: "789 East Boulevard, Eastside",
    phone: "(555) 456-7890",
    hours: "Mon-Fri: 8AM-8PM, Sat: 9AM-7PM, Sun: 10AM-5PM",
    coordinates: { lat: 40.7250, lng: -73.980 },
    description: "Our newest location at Eastside Plaza featuring our complete product line and a dedicated customer service center.",
    features: { parking: false, wheelchair: true }
  },
  {
    name: "North Heights",
    address: "321 North Road, Heights District",
    phone: "(555) 234-5678",
    hours: "Mon-Thu: 9AM-8PM, Fri-Sat: 9AM-10PM, Sun: 11AM-7PM",
    coordinates: { lat: 40.7400, lng: -74.000 },
    description: "Serving the Heights District with premium products and personalized shopping experiences.",
    features: { parking: true, wheelchair: false }
  },
  {
    name: "South Gardens",
    address: "654 South Lane, Garden District",
    phone: "(555) 876-5432",
    hours: "Mon-Sun: 8AM-10PM",
    coordinates: { lat: 40.7050, lng: -73.990 },
    description: "Extended hours every day of the week in the scenic Garden District. Features a coffee shop inside.",
    features: { parking: false, wheelchair: false }
  },
  {
    name: "Royal Apparel Lanka Pvt Ltd",
    address: "Pugoda, Gampaha",
    phone: "771648300",
    email: "royal@gmail.com",
    hours: "Mon-Fri: 8AM-5PM",
    coordinates: { lat: 7.0878, lng: 80.1456 },
    description: "Located in Gampaha, Royal Apparel Lanka Pvt Ltd is a private company focused on woven apparel production. The company boasts a significant production capacity, handling 1,000 to 3,000 units of knitted garments and 7,000 to 10,000 units of woven garments monthly. With a workforce of 25 to 50 employees.",
    features: { 
      parking: true, 
      wheelchair: true,
      sewingPlant: true,
      machinery: true
    },
    capacity: {
      employees: "25-50",
      knitGarments: "1,000-3,000 monthly",
      wovenGarments: "7,000-10,000 monthly"
    },
    equipment: {
      normalMachines: "5-10",
      overlockMachines: "1-3",
      doubleNeedleMachines: "1-3",
      specializedEquipment: ["Button hole", "Button attach", "Kansai", "Feed-of-the-arm"]
    }
  }
];

// Function to seed the database
export const seedDatabase = async () => {
  try {
    // Check if stores already exist
    const count = await Store.countDocuments();
    
    if (count === 0) {
      // Only seed if the database is empty
      console.log('Seeding database with initial store data...');
      await Store.insertMany(initialStores);
      console.log('Database seeded successfully!');
    } else {
      console.log('Database already contains stores, skipping seed operation.');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

// Call the function if this script is run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  // Connect to database first
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return seedDatabase();
    })
    .then(() => {
      mongoose.disconnect();
      console.log('Database connection closed');
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
} 