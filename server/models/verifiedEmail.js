//server\models\verifiedEmail.js

const mongoose = require('mongoose');

const verifiedEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
  },
  verifiedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VerifiedEmail', verifiedEmailSchema);

