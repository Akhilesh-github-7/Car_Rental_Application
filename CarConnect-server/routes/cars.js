const express = require('express');
const router = express.Router();
const Car = require('../models/Car');

// @route   GET api/cars
// @desc    Get all cars
// @access  Public
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json({ message: 'Cars fetched successfully', result: true, data: cars });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

// @route   POST api/cars
// @desc    Add a new car
// @access  Public (should be private/admin in a real app)
router.post('/', async (req, res) => {
  const { brand, carId, imageUrl, locationId, name, priceDescription, registeredOn, carAccessories } = req.body;

  try {
    const newCar = new Car({
      brand,
      carId,
      imageUrl,
      locationId,
      name,
      priceDescription,
      registeredOn,
      carAccessories
    });

    const car = await newCar.save();
    res.status(201).json({ message: 'Car added successfully', result: true, data: car });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});


// @route   GET api/cars/:id
// @desc    Get a single car by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found', result: false, data: null });
    }
    res.json({ message: 'Car fetched successfully', result: true, data: car });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

module.exports = router;
