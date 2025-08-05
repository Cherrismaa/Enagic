//server\models\unverifiedEmail.js

const mongoose = require('mongoose');
const unverifiedEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [ /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format' ]
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    match: [/^\d{6}$/, 'OTP must be a 6-digit number']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300  
  }
});

module.exports = mongoose.model('UnverifiedEmail', unverifiedEmailSchema);