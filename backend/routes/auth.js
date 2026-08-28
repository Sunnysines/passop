import express from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Setup nodemailer transporter
const getTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};

// Route: Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otpCode = generateOTP();

    // Remove any existing OTP for this email
    await Otp.deleteMany({ email: cleanEmail });

    // Store new OTP (auto expires in 5 minutes via MongoDB index)
    await Otp.create({
      email: cleanEmail,
      otp: otpCode,
      createdAt: new Date()
    });

    const transporter = getTransporter();

    if (transporter) {
      try {
        const mailOptions = {
          from: `"PassSaver Security" <${process.env.GMAIL_USER}>`,
          to: cleanEmail,
          subject: `Your PassSaver Verification Code: ${otpCode}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #1e293b; margin: 0; font-size: 24px;">&lt;<span style="color: #3b82f6;">Pass</span> Saver/&gt;</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Secure Password Manager</p>
              </div>
              <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
                <p style="color: #334155; font-size: 16px; margin-bottom: 16px;">Hello,</p>
                <p style="color: #334155; font-size: 15px; margin-bottom: 24px;">Your one-time verification code for PassSaver is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; padding: 12px 24px; background: #eff6ff; border-radius: 8px; display: inline-block; margin-bottom: 24px; border: 1px dashed #93c5fd;">
                  ${otpCode}
                </div>
                <p style="color: #64748b; font-size: 13px; margin: 0;">This OTP will expire in <strong>5 minutes</strong>. If you did not request this code, please ignore this email.</p>
              </div>
              <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
                © 2026 PassSaver. All rights reserved.
              </p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`[AUTH] OTP successfully sent via Gmail to ${cleanEmail}`);
        return res.json({
          success: true,
          message: `OTP sent successfully to ${cleanEmail}`
        });
      } catch (mailErr) {
        console.error('[AUTH] Failed to send email via Gmail transporter:', mailErr.message);
        console.log(`[AUTH DEV FALLBACK] OTP for ${cleanEmail}: ${otpCode}`);
        return res.json({
          success: true,
          message: `Gmail delivery issue. OTP generated (Check server console): ${otpCode}`,
          devOtp: otpCode
        });
      }
    } else {
      console.log(`[AUTH DEV MODE] No Gmail credentials configured. OTP for ${cleanEmail} is: ${otpCode}`);
      return res.json({
        success: true,
        message: `OTP generated for ${cleanEmail} (Simulated in Dev Mode: ${otpCode})`,
        devOtp: otpCode
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Server error while generating OTP.' });
  }
});

// Route: Verify OTP & Login/Register
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Check OTP record in DB
    const record = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try again.' });
    }

    // OTP is valid - remove it so it cannot be reused
    await Otp.deleteMany({ email: cleanEmail });

    // Find or create user
    let user = await User.findOne({ email: cleanEmail });
    let isNewUser = false;

    if (!user) {
      user = await User.create({ email: cleanEmail });
      isNewUser = true;
    }

    // Generate JWT Token (valid for 30 days)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'passop_secret_jwt_key_2026',
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: isNewUser ? 'Account registered and logged in successfully!' : 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || user.email.split('@')[0]
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
});

// Route: Get current authenticated user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-__v');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || user.email.split('@')[0]
      }
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
});

export default router;
