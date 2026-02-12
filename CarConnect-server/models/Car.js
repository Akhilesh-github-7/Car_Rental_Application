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

const carSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true
  },
  carId: {
    type: Number,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  locationId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  priceDescription: {
    type: String,
    required: true
  },
  registeredOn: {
    type: String,
    required: true
  },
  carAccessories: [carAccessorySchema]
});

module.exports = mongoose.model('Car', carSchema);
