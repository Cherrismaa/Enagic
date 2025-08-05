//server\server.js

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({  
  origin: [
    'https://enagickangen.co.in',
    'http://localhost:5500', 
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5502',  
    'http://localhost:5502'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true }));

const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

app.use(express.json());

// ✅ Register routes
const cartRoute = require('./routes/cart');
app.use('/api/cart', cartRoute);

const submitFormRoute = require('./routes/checkoutForm');
app.use('/api/checkoutForm', submitFormRoute);

const customerContactRoute = require('./routes/customer-contact');
app.use('/api/customer-contact', customerContactRoute);

const emailVerifyRoute = require('./routes/emailVerify');
app.use('/api/verify-email', emailVerifyRoute);

const path = require('path');

// Root route test
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend server is live and working."
  });
});

// ✅ START SERVER AFTER DB CONNECTS
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)

  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {

      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err);
  });
