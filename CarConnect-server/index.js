
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

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
app.get('/', (req, res) => {
  res.send('Hello from CarConnect-server!');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
