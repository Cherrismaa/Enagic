// server/routes/emailVerify.js

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const VerifiedEmail = require('../models/verifiedEmail');

const otpStore = new Map(); // In-memory OTP store

// Send OTP
router.post('/request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const existing = await VerifiedEmail.findOne({ email });
    if (existing) {
      return res.status(200).json({ verified: true, message: 'Email already verified.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const UnverifiedEmail = require('../models/unverifiedEmail');
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
      from: `"Verification Bot" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Email Verification Code",
      html: `
        <div style="font-family: sans-serif; font-size: 16px;">
          <p>Dear Customer,</p>
          <p>Your OTP for verifying your email is:</p>
          <h2 style="color: #2563eb; font-size: 24px;">${otp}</h2>
          <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
          <p>— Kangen Water Support Team</p>
        </div>`
    });

    // ✅ Only this response
    res.status(200).json({ verified: false, message: 'OTP sent to email.' });

  } catch (err) {
    console.error("EMAIL SEND ERROR:", err);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
});


// Verify OTP
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  const UnverifiedEmail = require('../models/unverifiedEmail');
  const record = await UnverifiedEmail.findOne({ email, otp });

  if (!record) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
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


  if (!record) {
    return res.status(400).json({ error: 'No OTP found for this email. Please request a new one.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
  }

  try {
    // Save to DB
    await VerifiedEmail.updateOne(
      { email },
      { $setOnInsert: { email, verifiedAt: new Date() } },
      { upsert: true }
    );

    const UnverifiedEmail = require('../models/unverifiedEmail');
    await UnverifiedEmail.deleteOne({ email });

    otpStore.delete(email);
    res.status(200).json({ success: true, message: 'Email verified successfully.' });
  } catch (err) {
    console.error('Failed to save verified email:', err);
    res.status(500).json({ error: 'Failed to verify email. Please try again.' });
  }
});

module.exports = router;
