
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Serve Angular static files
const angularPath = path.join(__dirname, '../CarConnect/dist/CarConnect/browser');
app.use(express.static(angularPath));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/districts', require('./routes/districts'));
app.use('/api/new-cars', require('./routes/new-cars'));
app.use('/api/bookings', require('./routes/bookings'));

// Catch-all route to serve Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(angularPath, 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
