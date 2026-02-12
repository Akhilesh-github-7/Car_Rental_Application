const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true
  },
  bookingNo: {
    type: String,
    required: true,
    unique: true
  },
  pickupDate: {
    type: String,
    required: true
  },
  dropOffDate: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  carId: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  locationId: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  carBrand: {
    type: String,
    required: true
  },
  pricingDescription: {
    type: String,
    required: true
  },
  locationTitle: {
    type: String,
    required: true
  },
  pickupLocation: {
    type: String,
    required: false
  },
  dropLocation: {
    type: String,
    required: false
  },
  pickupAddress: {
    type: String,
    required: false
  },
  alternateContact: {
    type: String,
    required: false
  },
  carOwnerName: {
    type: String,
    required: true
  },
  carOwnerMobileNumber: {
    type: String,
    required: true
  },
  bookingId: {
    type: Number,
    required: true,
    unique: true
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  customerName: {
    type: String,
    required: true,
    default: 'Customer'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'pending', // pending, confirmed, cancelled, completed
    required: false
  },
  withDriver: {
    type: Boolean,
    default: false
  },
  bookingUserId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
