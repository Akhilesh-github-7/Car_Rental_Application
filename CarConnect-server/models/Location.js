const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  locationId: {
    type: Number,
    required: true,
    unique: true
  },
  city: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Location', locationSchema);
