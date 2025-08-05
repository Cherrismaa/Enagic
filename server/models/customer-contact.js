//server\models\customer-contact.js

const mongoose = require('mongoose');

const customerContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [ /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address' ],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [ /^[6-9]\d{9}$/, 'Invalid phone number' ]
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  machineType: {
    type: String,
    required: [true, 'Machine type is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('CustomerContact', customerContactSchema);
