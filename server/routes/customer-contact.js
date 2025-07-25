//server\routes\customer-contact.js

const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const CustomerContact = require('../models/customer-contact');
const VerifiedEmail = require('../models/verifiedEmail');
const UnverifiedEmail = require('../models/unverifiedEmail');

router.post('/', async (req, res) => {
  const { name, email, phone, area, subject, message, isVerified } = req.body;

  if (!name || !email || !phone || !area || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    let verified = false;

    const existingVerified = await VerifiedEmail.findOne({ email });

    if (existingVerified || isVerified === true || isVerified === "true") {
      verified = true;
    }

    // Save form data
    const newContact = new CustomerContact({
      name,
      email,
      phone,
      area,
      subject,
      message,
      isVerified: verified
    });
    await newContact.save();

    // Handle verified/unverified logic
    if (!verified) {
      // Save to unverifiedEmails if not already there
      await UnverifiedEmail.updateOne(
        { email },
        { $setOnInsert: { email, firstSeen: new Date() } },
        { upsert: true }
      );
    } else {
      // Email is verified – remove from unverifiedEmails if it exists
      await UnverifiedEmail.deleteOne({ email });
    }

    // Email setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const adminMail = {
      from: `"Customer Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'New Contact Form Submission',
      html: `
        <h3>New Customer Inquiry</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Area:</strong> ${area}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p style="color: gray;"><i>✅ Email Verified: ${verified ? "Yes" : "No"}</i></p>
      `
    };

    const customerMail = {
      from: `"Customer Contact Form" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank You for Contacting Us',
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out. We’ve received your request regarding <strong>${subject}</strong>.</p>
        <p>Our team will get back to you soon.</p>
        <br>
        <p>— Enagic Support Team</p>
      `
    };

    await transporter.sendMail(adminMail);
    await transporter.sendMail(customerMail);

    return res.status(200).json({ success: true, message: "Message saved and emails sent." });
  } catch (err) {
    console.error("Email sending or DB error:", err);
    return res.status(500).json({ error: "Internal error. Try again later." });
  }
});

module.exports = router;

