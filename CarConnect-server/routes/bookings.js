const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const NewCar = require('../models/NewCar');
const User = require('../models/User'); // Import User model
const auth = require('../middleware/auth');

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, async (req, res) => {
  const {
    carId,
    pickupDate,
    dropOffDate,
    departureTime,
    locationId,
    pickupLocation,
    dropLocation,
    pickupAddress,
    alternateContact,
    withDriver,
  } = req.body;

  try {
    let car = null;
    
    // robust car lookup
    if (mongoose.isValidObjectId(carId)) {
      car = await NewCar.findById(carId);
    }
    
    if (!car) {
      // try finding by numeric/string carId field
      car = await NewCar.findOne({ carId: carId });
    }

    if (!car) {
      return res.status(404).json({ message: 'Car not found', result: false, data: null });
    }

    // Check if the user is the owner of the car
    if (car.ownerUserId && String(car.ownerUserId).trim() === String(req.user.id).trim()) {
      return res.status(400).json({ message: 'You cannot book your own car.', result: false, data: null });
    }

    // Fetch names...
    let ownerName = 'Car Host';
    try {
      if (car.ownerUserId && mongoose.isValidObjectId(car.ownerUserId)) {
          const owner = await User.findById(car.ownerUserId);
          if (owner) ownerName = owner.username;
      }
    } catch (err) {
      console.error('Error fetching owner name for booking:', err);
    }

    let customerName = 'Customer';
    try {
      const customer = await User.findById(req.user.id);
      if (customer) customerName = customer.username;
    } catch (err) {
      console.error('Error fetching customer name:', err);
    }

    // Check for existing booking overlap
    const existingBooking = await Booking.findOne({
      carId: String(carId),
      status: { $ne: 'cancelled' },
      $and: [
        { pickupDate: { $lte: dropOffDate } },
        { dropOffDate: { $gte: pickupDate } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: `This car is already booked from ${existingBooking.pickupDate} to ${existingBooking.dropOffDate}.`, result: false, data: null });
    }

    // Calculate total price based on days
    let calculatedTotalPrice = car.pricing || 0;
    try {
      const start = new Date(pickupDate);
      const end = new Date(dropOffDate);
      // Calculate difference in time (milliseconds)
      const diffTime = end.getTime() - start.getTime();
      // Calculate difference in days (round up to handle partial days as full days if needed, or just standard logic)
      // Assuming standard daily rental: difference in days. If 0 (same day), charge for 1 day.
      let diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
      
      if (diffDays <= 0) diffDays = 1; // Minimum 1 day rental
      
      calculatedTotalPrice = (car.pricing || 0) * diffDays;
    } catch (dateErr) {
      console.error('Error calculating price:', dateErr);
      // Fallback to daily price is already set
    }

    const newBooking = new Booking({
      bookingUserId: req.user.id,
      customerName: customerName,
      totalPrice: calculatedTotalPrice,
      carId: String(carId),
      pickupDate,
      dropOffDate,
      departureTime,
      locationId: locationId || pickupLocation || '',
      pickupLocation: pickupLocation || '',
      dropLocation: dropLocation || '',
      pickupAddress: pickupAddress || '',
      alternateContact: alternateContact || '',
      bookingNo: `BKG-${Date.now()}`,
      brand: car.brand,
      name: car.name,
      imageUrl: car.imageUrl || 'https://example.com/placeholder.jpg',
      carBrand: car.brand,
      pricingDescription: car.pricingDescription || '',
      locationTitle: pickupLocation || car.locationId || '',
      carOwnerName: ownerName,
      carOwnerMobileNumber: car.ownerNumber || alternateContact || '',
      bookingId: Date.now(),
      status: 'pending',
      withDriver: withDriver || false,
      isCompleted: false,
    });

    const booking = await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully', result: true, data: booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

// @route   PUT api/bookings/:id/confirm
// @desc    Confirm a booking (Host only)
// @access  Private
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found', result: false, data: null });
    }

    // Verify host ownership
    let car = null;
    if (booking.carId.match(/^[0-9a-fA-F]{24}$/)) {
        car = await NewCar.findById(booking.carId);
    } else {
        car = await NewCar.findOne({ carId: Number(booking.carId) });
    }

    if (!car) {
       return res.status(404).json({ message: 'Associated car not found', result: false, data: null });
    }

    const isOwner = String(car.ownerUserId).trim() === String(req.user.id).trim();
    if (!isOwner) {
      return res.status(401).json({ message: 'Unauthorized', result: false, data: null });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.json({ message: 'Booking confirmed', result: true, data: booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

// @route   PUT api/bookings/:id/complete
// @desc    Mark a booking as completed (Host only)
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found', result: false, data: null });
    }

    // Verify requesting user is the car owner
    // We need to fetch the car to check ownerUserId
    // Note: booking.carId stores the ID string
    // We need robust car finding logic similar to enrichment
    let car = null;
    if (booking.carId.match(/^[0-9a-fA-F]{24}$/)) {
        car = await NewCar.findById(booking.carId);
    } else {
        car = await NewCar.findOne({ carId: Number(booking.carId) });
    }

    if (!car) {
       return res.status(404).json({ message: 'Associated car not found', result: false, data: null });
    }

    // Check ownership
    const isOwner = String(car.ownerUserId).trim() === String(req.user.id).trim();
    if (!isOwner) {
      return res.status(401).json({ message: 'Unauthorized: Only the host can complete this trip', result: false, data: null });
    }

    booking.isCompleted = true;
    // Also ensure status is not cancelled?
    if (booking.status === 'cancelled') {
       return res.status(400).json({ message: 'Cannot complete a cancelled booking', result: false, data: null });
    }
    
    // Explicitly set status to completed if we are using that field
    booking.status = 'completed';
    
    await booking.save();
    res.json({ message: 'Trip marked as completed', result: true, data: booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

// @route   PUT api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found', result: false, data: null });
    }

    // Check user
    if (booking.bookingUserId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized', result: false, data: null });
    }

    // Check if already completed or cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled', result: false, data: null });
    }
    
    // Optional: Check if cancellation is allowed (e.g. 24h before)
    // For now, allow anytime

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', result: true, data: booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

// @route   GET api/bookings/my-bookings
// @desc    Get bookings made by the logged-in user (as customer)
// @access  Private
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ bookingUserId: req.user.id }).lean(); // Use lean() for performance and modification

    // Enrich bookings with real owner name if currently generic
    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      if (!booking.carOwnerName || booking.carOwnerName === 'Car Owner' || booking.carOwnerName === 'Car Host') {
        try {
          // Try finding by _id if carId match fails or try both
          let realCar = null;
          if (booking.carId && booking.carId.match(/^[0-9a-fA-F]{24}$/)) {
             realCar = await NewCar.findById(booking.carId);
          } 
          
          if (!realCar) {
             // Try numeric carId lookup
             const numericId = Number(booking.carId);
             if (!isNaN(numericId)) {
               realCar = await NewCar.findOne({ carId: numericId });
             }
          }

          if (realCar && realCar.ownerUserId) {
            // Check if ownerUserId is a valid ObjectId (24 hex chars)
            if (String(realCar.ownerUserId).match(/^[0-9a-fA-F]{24}$/)) {
              const owner = await User.findById(realCar.ownerUserId);
              if (owner) {
                booking.carOwnerName = owner.username;
              } else {
                console.log(`Owner not found for user ID: ${realCar.ownerUserId}`);
              }
            } else {
              // Legacy ID, cannot look up in User collection
              // Keep generic name or set to 'Legacy Owner' if preferred
            }
          } else {
            console.log(`Car not found for booking carId: ${booking.carId}`);
          }
        } catch (err) {
          console.error('Error enriching booking:', err.message);
        }
      }
      return booking;
    }));

    res.json({ message: 'Bookings fetched successfully', result: true, data: enrichedBookings });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

// @route   GET api/bookings/my-hosted-bookings
// @desc    Get bookings for cars hosted by the logged-in user (as host/owner)
// @access  Private
router.get('/my-hosted-bookings', auth, async (req, res) => {
  try {
    console.log(`Fetching hosted bookings for Host ID: ${req.user.id}`);
    const myCars = await NewCar.find({ ownerUserId: String(req.user.id) });
    console.log(`Found ${myCars.length} cars owned by host.`);
    
    // Collect both _id (for new bookings) and carId (for legacy bookings)
    const objIds = myCars.map((c) => c._id.toString());
    const legacyIds = myCars.map((c) => String(c.carId));
    const allCarIds = [...new Set([...objIds, ...legacyIds])]; // Unique IDs
    console.log('Searching for bookings with Car IDs:', allCarIds);

    if (allCarIds.length === 0) {
      return res.json({ message: 'No bookings for your cars', result: true, data: [] });
    }

    const bookings = await Booking.find({ carId: { $in: allCarIds } }).sort({ pickupDate: -1, bookingId: -1 });
    console.log(`Found ${bookings.length} hosted bookings.`);
    res.json({ message: 'Hosted car bookings fetched successfully', result: true, data: bookings });
  } catch (err) {
    console.error('Error in my-hosted-bookings:', err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

module.exports = router;
