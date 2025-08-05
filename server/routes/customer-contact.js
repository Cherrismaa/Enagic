//server\routes\customer-contact.js

const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const CustomerContact = require('../models/customer-contact');
const VerifiedEmail = require('../models/verifiedEmail');
const UnverifiedEmail = require('../models/unverifiedEmail');

router.post('/', async (req, res) => {
  const { name, email, phone, area, subject, machineType, message, isVerified } = req.body;

  if (!name || !email || !phone || !area || !subject || !machineType || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    let verified = false;

    const existingVerified = await VerifiedEmail.findOne({ email });

    if (existingVerified || isVerified === true || isVerified === "true") {
      verified = true;
    }

    console.log("📩 Creating new customer contact");
    const newContact = new CustomerContact({
      name,
      email,
      phone,
      area,
      subject,
      machineType,
      message,
      emailVerified: verified
    });
    console.log("📩 Saving to database");
    await newContact.save();
    console.log("📦 Handling email verification DB entries");
    if (!verified) {

      await UnverifiedEmail.updateOne(
        { email },
        { $setOnInsert: { email, firstSeen: new Date() } },
        { upsert: true }
      );
    } else {

      await UnverifiedEmail.deleteOne({ email });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("📛 Missing EMAIL_USER or EMAIL_PASS in environment variables");
      return res.status(500).json({ error: "Email configuration is invalid." });
    }

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
        <p><strong>RO Machine Type:</strong> ${machineType}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p style="color: gray;"><i>✅ Email Verified: ${verified ? "Yes" : "No"}</i></p>
      `
    };
    console.log("✉️ Preparing to send emails");
    const customerMail = {
      from: `"Enagic Customer Contact" <${process.env.EMAIL_USER}>`,
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

    try {
      await transporter.sendMail(adminMail);
      await transporter.sendMail(customerMail);
      console.log("✅ All emails sent");
    } catch (emailError) {
      console.error("📛 Email sending failed:");
      console.error(emailError.name, emailError.message);
      return res.status(500).json({ error: "Form saved but email failed." });
    }

    return res.status(200).json({ success: true, message: "Message saved and emails sent." });
    } catch (err) {
      console.error("❌ Error occurred during customer contact submission:");
      console.error("🔍 Request body:", req.body);
      console.error("📛 Error name:", err.name);
      console.error("📛 Error message:", err.message);
      console.error("📛 Error stack:", err.stack);
      return res.status(500).json({ error: "Internal error. Try again later." });
    }


});

module.exports = router;

