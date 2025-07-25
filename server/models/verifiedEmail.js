//server\models\verifiedEmail.js

const mongoose = require('mongoose');

const verifiedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  verifiedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VerifiedEmail', verifiedEmailSchema);
