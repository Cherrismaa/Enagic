// server/models/checkoutForm.js

const mongoose = require('mongoose');

const checkoutFormSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Invalid mobile number'],
  },
  emailVerified: {
  type: Boolean,
  default: false
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Invalid email address'],
  },
  streetNumber: {
    type: String,
    required: true,
    trim: true
  },
  houseNumber: {
    type: String,
    required: true,
    trim: true
  },
  locality: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{6}$/, 'Invalid pincode'],
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  landmark: {
    type: String,
    trim: true,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CheckoutForm', checkoutFormSchema);
