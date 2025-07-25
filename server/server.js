//server\server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

dotenv.config();

const app = express(); 
app.use(cors({ origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], credentials: true }));

app.use(bodyParser.json());

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

app.use(express.static(path.join(__dirname, '../client')));

// ✅ Serve HTML only if it's not an API route
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/customer-contact.html'));
});

//--------------------------------------------------


// Root route test
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Form submitted and email sent successfully."
  });
});

// ✅ START SERVER AFTER DB CONNECTS
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)

  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {

      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err);
  });
