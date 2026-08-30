import express from 'express';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Persistent cached transporter instance for local SMTP
let cachedTransporter = null;

const getTransporter = () => {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, '') : null;

  if (!user || !pass) {
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
  }

  return cachedTransporter;
};

// Route: Send OTP (supports Resend HTTPS API & Gmail SMTP fallback)
router.post('/send-otp', async (req, res) => {
  try {
    const { email, mode = 'login' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });

    // 1. If trying to signup but user already exists -> NO OTP
    if (mode === 'signup' && existingUser) {
      return res.status(400).json({
        success: false,
        alreadyExists: true,
        message: 'Account already exists with this email. Please switch to Login.'
      });
    }

    // 2. If trying to login but no account exists -> NO OTP
    if (mode === 'login' && !existingUser) {
      return res.status(400).json({
        success: false,
        notFound: true,
        message: 'No account found with this email. Please Sign Up first.'
      });
    }

    // 3. If deleting account but no account exists
    if (mode === 'delete_account' && !existingUser) {
      return res.status(400).json({
        success: false,
        notFound: true,
        message: 'No account found with this email.'
      });
    }

    const otpCode = generateOTP();

    // Remove any existing OTP for this email
    await Otp.deleteMany({ email: cleanEmail });

    // Store new OTP (auto expires in 5 minutes via MongoDB index)
    await Otp.create({
      email: cleanEmail,
      otp: otpCode,
      createdAt: new Date()
    });

    const isDeleteMode = mode === 'delete_account';
    const emailSubject = isDeleteMode 
      ? `🚨 Security Alert: PassSaver Account Deletion OTP: ${otpCode}`
      : `Your PassSaver Verification Code: ${otpCode}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0; font-size: 24px;">&lt;<span style="color: #3b82f6;">Pass</span> Saver/&gt;</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Secure Password Manager</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
          <p style="color: #334155; font-size: 16px; margin-bottom: 16px;">Hello,</p>
          <p style="color: ${isDeleteMode ? '#dc2626' : '#334155'}; font-size: 15px; margin-bottom: 24px; font-weight: ${isDeleteMode ? 'bold' : 'normal'};">
            ${isDeleteMode 
              ? 'You requested to PERMANENTLY DELETE your PassSaver account and all stored passwords. Use this confirmation code:' 
              : 'Your one-time verification code for PassSaver is:'}
          </p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: ${isDeleteMode ? '#dc2626' : '#2563eb'}; padding: 12px 24px; background: ${isDeleteMode ? '#fef2f2' : '#eff6ff'}; border-radius: 8px; display: inline-block; margin-bottom: 24px; border: 1px dashed ${isDeleteMode ? '#fca5a5' : '#93c5fd'};">
            ${otpCode}
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 0;">This OTP will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this message.</p>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
          © 2026 PassSaver. All rights reserved.
        </p>
      </div>
    `;

    // OPTION 1: Brevo HTTPS API (Sends to ANY email address without domain restriction)
    if (process.env.BREVO_API_KEY) {
      try {
        const senderEmail = process.env.GMAIL_USER?.trim() || 'ghosalsayantan293@gmail.com';
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY.trim(),
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'PassSaver Security', email: senderEmail },
            to: [{ email: cleanEmail }],
            subject: emailSubject,
            htmlContent: htmlBody
          })
        });

        const brevoData = await brevoRes.json();
        if (!brevoRes.ok) {
          throw new Error(brevoData.message || JSON.stringify(brevoData));
        }

        console.log(`[AUTH] OTP successfully sent via Brevo HTTPS API to ${cleanEmail}`);
        return res.json({
          success: true,
          message: `OTP sent successfully to ${cleanEmail}`
        });
      } catch (brevoErr) {
        console.error('[AUTH] Brevo API error:', brevoErr.message);
        console.log(`[AUTH DEV FALLBACK] OTP for ${cleanEmail}: ${otpCode}`);
        return res.json({
          success: true,
          message: `Brevo delivery issue. OTP generated (Check server console): ${otpCode}`,
          devOtp: otpCode
        });
      }
    }

    // OPTION 2: Resend HTTPS API (Note: Resend test domain only delivers to account owner's email)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY.trim());
        const { error } = await resend.emails.send({
          from: 'PassSaver <onboarding@resend.dev>',
          to: cleanEmail,
          subject: emailSubject,
          html: htmlBody
        });

        if (error) {
          throw new Error(error.message);
        }

        console.log(`[AUTH] OTP successfully sent via Resend HTTPS API to ${cleanEmail}`);
        return res.json({
          success: true,
          message: `OTP sent successfully to ${cleanEmail}`
        });
      } catch (resendErr) {
        console.error('[AUTH] Resend API error:', resendErr.message);
        console.log(`[AUTH DEV FALLBACK] OTP for ${cleanEmail}: ${otpCode}`);
        return res.json({
          success: true,
          message: `Resend test mode limits delivery to account email. OTP generated: ${otpCode}`,
          devOtp: otpCode
        });
      }
    }

    // OPTION 2: Nodemailer Gmail SMTP (Works locally on machine)
    const transporter = getTransporter();
    if (transporter) {
      try {
        const mailOptions = {
          from: `"PassSaver Security" <${process.env.GMAIL_USER}>`,
          to: cleanEmail,
          subject: emailSubject,
          html: htmlBody
        };

        await transporter.sendMail(mailOptions);
        console.log(`[AUTH] OTP successfully sent via Gmail to ${cleanEmail} (mode: ${mode})`);
        return res.json({
          success: true,
          message: `OTP sent successfully to ${cleanEmail}`
        });
      } catch (mailErr) {
        console.error('[AUTH] Failed to send email via Gmail transporter:', mailErr.message);
        console.log(`[AUTH DEV FALLBACK] OTP for ${cleanEmail}: ${otpCode}`);
        return res.json({
          success: true,
          message: `SMTP connection blocked by hosting provider. Use Resend API key or check console: ${otpCode}`,
          devOtp: otpCode
        });
      }
    }

    // OPTION 3: Development console fallback
    console.log(`[AUTH DEV MODE] No email credentials configured. OTP for ${cleanEmail} is: ${otpCode}`);
    return res.json({
      success: true,
      message: `OTP generated for ${cleanEmail} (Simulated in Dev Mode: ${otpCode})`,
      devOtp: otpCode
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Server error while generating OTP.' });
  }
});

// Route: Verify OTP & Login/Register
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, mode = 'login' } = req.body;

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
      if (mode === 'login') {
        return res.status(400).json({ success: false, message: 'No account found with this email. Please sign up.' });
      }
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

// Route: Delete Account with Email OTP (deletes user + all saved passwords)
router.post('/delete-account', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required to delete account.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Verify OTP
    const record = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Account deletion cancelled.' });
    }

    // Find user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Delete OTP records
    await Otp.deleteMany({ email: cleanEmail });

    // Dynamic import to avoid circular dependency
    const { default: Password } = await import('../models/Password.js');

    // Delete all passwords belonging to this user
    const deleteResult = await Password.deleteMany({ userId: user._id });

    // Delete the user record
    await User.findByIdAndDelete(user._id);

    console.log(`[AUTH] Account for ${cleanEmail} deleted. Removed ${deleteResult.deletedCount} passwords.`);

    return res.json({
      success: true,
      message: `Account and all ${deleteResult.deletedCount} saved passwords were deleted permanently.`
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting account.' });
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
