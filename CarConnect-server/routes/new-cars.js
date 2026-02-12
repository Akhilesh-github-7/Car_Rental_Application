const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const NewCar = require('../models/NewCar');
const auth = require('../middleware/auth');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append extension
  }
});

const upload = multer({ storage: storage });

// @route   GET api/new-cars
// @desc    Get all listed cars
// @access  Public
router.get('/', async (req, res) => {
  try {
    const cars = await NewCar.find();
    res.json({ message: 'Cars fetched successfully', result: true, data: cars });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

// @route   GET api/new-cars/:id
// @desc    Get a single car by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const car = await NewCar.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found', result: false, data: null });
    }
    
    // If user is authenticated, check if they own this car
    let isOwner = false;
    const token = req.header('x-auth-token');
    if (token) {
      try {
        // Manually verify the token to check ownership
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user.id;
        
        // Compare with car's ownerUserId (handle both string and number)
        const ownerIdStr = String(car.ownerUserId).trim();
        const userIdStr = String(userId).trim();
        isOwner = ownerIdStr === userIdStr;
      } catch (tokenErr) {
        // Token invalid or missing, isOwner remains false
        console.log('Token verification failed:', tokenErr.message);
      }
    }
    
    const carData = car.toObject();
    carData.isOwner = isOwner; // Add ownership flag to response
    
    // Fetch owner's name
    try {
      const User = require('../models/User');
      if (String(car.ownerUserId).match(/^[0-9a-fA-F]{24}$/)) {
        const owner = await User.findById(car.ownerUserId);
        if (owner) {
          carData.ownerName = owner.username;
        } else {
          carData.ownerName = 'Car Host';
        }
      } else {
        carData.ownerName = 'Car Host'; // Legacy ID
      }
    } catch (userErr) {
      console.error('Error fetching owner name:', userErr.message);
      carData.ownerName = 'Car Host';
    }
    
    res.json({ message: 'Car fetched successfully', result: true, data: carData });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

// @route   POST api/new-cars
// @desc    Add a new car with optional image upload
// @access  Public (should be private/admin in a real app)
router.post('/', upload.single('image'), async (req, res) => {
  const { brand, name, pricingDescription, pricing, locationId, registeredOn, vehicleNo, ownerUserId, ownerNumber, imageUrl, carAccessories } = req.body;
  
  let finalImageUrl = imageUrl;

  // If a file was uploaded, its path will be in req.file.path
  if (req.file) {
    // Construct the URL to access the file
    finalImageUrl = `/uploads/${req.file.filename}`;
  }

  // A carId should be generated, for now we use timestamp
  const carId = Date.now();

  let accessories = [];
  if (carAccessories) {
    const accessoriesArray = Array.isArray(carAccessories) ? carAccessories : [carAccessories];
    if (accessoriesArray.length > 0) {
      accessories = accessoriesArray.map((acc, index) => ({
        accessoriesId: index + 1, // Simple ID generation
        accessoriesTitle: acc,
        showOnWebsite: true,
        carId: carId
      }));
    }
  }

  try {
    const newCar = new NewCar({
      carId,
      brand,
      name,
      pricingDescription,
      pricing,
      locationId,
      registeredOn,
      imageUrl: finalImageUrl,
      vehicleNo,
      ownerUserId,
      ownerNumber,
      carAccessories: accessories
    });

    const car = await newCar.save();
    res.status(201).json({ message: 'Car listed successfully', result: true, data: car });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Vehicle number or Car ID already exists.', result: false, data: null });
    }
    console.error('Error saving car:', err); // Log the full error
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

// @route   PUT api/new-cars/:id
// @desc    Update a car by ID
// @access  Private (car owner only)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const car = await NewCar.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found', result: false, data: null });
    }

    // Check if user is the owner
    const isOwner = String(car.ownerUserId).trim() === String(req.user.id).trim();
    if (!isOwner) {
      // Legacy check: if user is admin or specific condition (optional, sticking to strict ownership for now)
      return res.status(401).json({ message: 'Unauthorized: You are not the owner of this car', result: false, data: null });
    }

    const { brand, name, pricingDescription, pricing, locationId, registeredOn, vehicleNo, ownerNumber, imageUrl, carAccessories } = req.body;
    
    let finalImageUrl = car.imageUrl; // Keep existing image by default

    // If a new file was uploaded, use it
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      // If imageUrl is provided and no file uploaded, use the provided URL
      finalImageUrl = imageUrl;
    }

    // Process accessories
    let accessories = car.carAccessories || [];
    if (carAccessories) {
      const accessoriesArray = Array.isArray(carAccessories) ? carAccessories : [carAccessories];
      if (accessoriesArray.length > 0) {
        accessories = accessoriesArray.map((acc, index) => ({
          accessoriesId: index + 1,
          accessoriesTitle: acc,
          showOnWebsite: true,
          carId: car.carId
        }));
      }
    }

    // Update car fields (preserve existing values when not provided, never set required fields to undefined)
    car.brand = brand || car.brand;
    car.name = name || car.name;
    car.pricingDescription = pricingDescription || car.pricingDescription;
    car.pricing = pricing !== undefined ? Number(pricing) : car.pricing;
    car.locationId = locationId || car.locationId;
    car.registeredOn = registeredOn || car.registeredOn;
    car.vehicleNo = vehicleNo || car.vehicleNo;
    car.ownerNumber = (ownerNumber !== undefined && ownerNumber !== null && String(ownerNumber).trim() !== '')
      ? String(ownerNumber).trim()
      : (car.ownerNumber || '');
    car.imageUrl = finalImageUrl;
    car.carAccessories = accessories;

    const updatedCar = await car.save();
    res.json({ message: 'Car updated successfully', result: true, data: updatedCar });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Vehicle number already exists.', result: false, data: null });
    }
    console.error('Error updating car:', err);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

module.exports = router;
