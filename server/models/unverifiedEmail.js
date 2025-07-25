//server\models\unverifiedEmail.js

const mongoose = require('mongoose');

const unverifiedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UnverifiedEmail', unverifiedEmailSchema);
