// server/routes/emailVerify.js

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const VerifiedEmail = require('../models/verifiedEmail');
const UnverifiedEmail = require('../models/unverifiedEmail');

// Send OTP
router.post('/request', async (req, res) => {
  let { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  email = email.toLowerCase().trim();

  try {
    const existing = await VerifiedEmail.findOne({ email });
    if (existing) {
      return res.status(200).json({ verified: true, message: 'Email already verified.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await UnverifiedEmail.findOneAndUpdate(
      { email },
      { email, otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Enagic Verification OTP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Email Verification Code",
      html: `
        <div style="font-family: sans-serif; font-size: 14px;">
          <p>Dear Customer,</p>
          <p>Your OTP for verifying your email is:</p>
          <h2 style="color: #2563eb; font-size: 20px;">${otp}</h2>
          <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
          <p>— Kangen Water Support Team</p>
        </div>`
    });

    res.status(200).json({ verified: false, message: 'OTP sent to email.' });

  } catch (err) {
    console.error("EMAIL SEND ERROR:", err);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  let { email, otp } = req.body;
  email = email.toLowerCase().trim();

  try {
    const record = await UnverifiedEmail.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new one.' });
    }

    const now = Date.now();
    const otpAge = now - new Date(record.createdAt).getTime();

    if (otpAge > 5 * 60 * 1000) {
      await UnverifiedEmail.deleteOne({ email });
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    await VerifiedEmail.updateOne(
      { email },
      { $setOnInsert: { email, verifiedAt: new Date() } },
      { upsert: true }
    );

    await UnverifiedEmail.deleteOne({ email });

    res.status(200).json({ success: true, message: 'Email verified successfully.' });

  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

module.exports = router;
