/**
 * Clear all documents from the Location collection.
 * Run from server root: npm run clear-locations
 * Requires: MONGO_URI in .env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Location = require('../models/Location');

async function clearLocations() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const result = await Location.deleteMany({});
    console.log(`Cleared ${result.deletedCount} location(s) from Location collection.`);

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Clear failed:', err);
    process.exit(1);
  }
}

clearLocations();
