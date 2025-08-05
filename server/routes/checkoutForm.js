//server\routes\checkoutForm.js

const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
dotenv.config();

const CheckoutForm = require('../models/checkoutForm');
const VerifiedEmail = require('../models/verifiedEmail');
const UnverifiedEmail = require('../models/unverifiedEmail');

router.post('/', async (req, res) => {
  console.log('🟢 Checkout form received:', req.body);

  const {
    fullName, mobile, email, streetNumber,
    houseNumber, locality, city, pincode,
    state, landmark
  } = req.body;

const requiredFields = { fullName, mobile, email, streetNumber, locality, city, pincode, state };
for (const [key, value] of Object.entries(requiredFields)) {
  if (!value) return res.status(400).json({ message: `Missing field: ${key}` });

  }

  try {
    const isVerified = await VerifiedEmail.findOne({ email });

    const newEntry = new CheckoutForm({
      fullName, mobile, email, streetNumber,
      houseNumber, locality, city, pincode,
      state, landmark,
      emailVerified: !!isVerified
    });

    await newEntry.save();

    // If not verified, save to unverifiedEmails
    if (!isVerified) {
      await UnverifiedEmail.updateOne(
        { email },
        { $setOnInsert: { email, firstSeen: new Date() } },
        { upsert: true }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const verified = await VerifiedEmail.findOne({ email });

if (!verified) {
  // Save to unverified collection as a fallback
  await UnverifiedEmail.updateOne(
    { email },
    { $set: { email, submittedAt: new Date() } },
    { upsert: true }
  );
  return res.status(400).json({ success: false, message: 'Email not verified.' });
}

    const html = `
      <h3>New Checkout Form</h3>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Street Number:</strong> ${streetNumber}</p>
      <p><strong>House Number:</strong> ${houseNumber}</p>
      <p><strong>Locality:</strong> ${locality}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>Pin Code:</strong> ${pincode}</p>
      <p><strong>State:</strong> ${state}</p>
      <p><strong>Landmark:</strong> ${landmark}</p>
      <p><strong>Email Status:</strong> ${isVerified ? '✅ Verified' : '❌ Unverified'}</p>
    `;

    await transporter.sendMail({
      from: `Website Form <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'New Checkout Form Submission',
      html
    });

    res.status(200).json({
      success: true,
      message: isVerified
        ? '✅ Form submitted with verified email.'
        : '⚠️ Form submitted with unverified email.'
    });
  } catch (err) {
    console.error('❌ Submission error:', err);
    res.status(500).json({ message: 'Something went wrong while submitting the form.' });
  }
});

module.exports = router;
