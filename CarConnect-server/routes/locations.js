const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// @route   GET api/locations
// @desc    Get all locations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json({ message: 'Locations fetched successfully', result: true, data: locations });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error', result: false, data: null });
  }
});

module.exports = router;
