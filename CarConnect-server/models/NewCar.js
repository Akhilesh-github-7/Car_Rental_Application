const mongoose = require('mongoose');

const carAccessorySchema = new mongoose.Schema({
  accessoriesId: {
    type: Number,
    required: true
  },
  accessoriesTitle: {
    type: String,
    required: true
  },
  showOnWebsite: {
    type: Boolean,
    default: false
  },
  carId: {
    type: Number,
    required: true
  }
});

const newCarSchema = new mongoose.Schema({
  carId: {
    type: Number,
    required: true,
    unique: true
  },
  brand: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  pricingDescription: {
    type: String,
    required: true
  },
  pricing: {
    type: Number,
    required: true
  },
  locationId: {
    type: String,
    required: true
  },
  registeredOn: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  vehicleNo: {
    type: String,
    required: true,
    unique: true // Assuming vehicle number should be unique
  },
  ownerUserId: {
    type: String,
    required: true
  },
  ownerNumber: {
    type: String,
    required: true
  },
  carAccessories: [carAccessorySchema] // Add carAccessories array
});

module.exports = mongoose.model('NewCar', newCarSchema);
