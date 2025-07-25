//server\models\checkoutForm.js

const mongoose = require('mongoose');

const checkoutFormSchema = new mongoose.Schema({
  fullName: String,
  mobile: String,
  email: String,
  streetNumber: String,
  houseNumber: String,
  locality: String,
  city: String,
  pincode: String,
  state: String,
  landmark: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CheckoutForm', checkoutFormSchema);
