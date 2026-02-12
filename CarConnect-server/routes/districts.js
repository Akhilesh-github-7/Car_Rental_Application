const express = require('express');
const router = express.Router();

// @route   GET api/districts
// @desc    Get all districts in Kerala
// @access  Public
router.get('/', (req, res) => {
  const districts = [
    "Thiruvananthapuram",
    "Kollam",
    "Pathanamthitta",
    "Alappuzha",
    "Kottayam",
    "Idukki",
    "Ernakulam",
    "Thrissur",
    "Palakkad",
    "Malappuram",
    "Kozhikode",
    "Wayanad",
    "Kannur",
    "Kasaragod"
  ];
  res.json({ message: 'Districts fetched successfully', result: true, data: districts });
});

module.exports = router;
