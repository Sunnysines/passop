import express from 'express';
import Password from '../models/Password.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Apply JWT authentication to all password routes
router.use(authMiddleware);

// GET /api/passwords - Get all passwords for the authenticated user
router.get('/', async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      passwords: passwords.map(item => ({
        id: item.id,
        name: item.name || '',
        email: item.email || '',
        site: item.site,
        username: item.username,
        password: item.password
      }))
    });
  } catch (error) {
    console.error('Error fetching passwords:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve passwords from database.' });
  }
});

// POST /api/passwords - Save a new password or update if existing
router.post('/', async (req, res) => {
  try {
    const { id, name, email, site, username, password } = req.body;

    if (!site || !username || !password) {
      return res.status(400).json({ success: false, message: 'Site, username, and password are required.' });
    }

    const entryId = id || Date.now().toString();

    // Check if entry with this id already exists for this user
    let existing = await Password.findOne({ userId: req.user.userId, id: entryId });

    if (existing) {
      existing.name = name || '';
      existing.email = email || '';
      existing.site = site;
      existing.username = username;
      existing.password = password;
      await existing.save();

      return res.json({
        success: true,
        message: 'Password updated successfully in database!',
        password: {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          site: existing.site,
          username: existing.username,
          password: existing.password
        }
      });
    }

    const newPassword = await Password.create({
      userId: req.user.userId,
      id: entryId,
      name: name || '',
      email: email || '',
      site,
      username,
      password
    });

    res.status(201).json({
      success: true,
      message: 'Password saved successfully to MongoDB!',
      password: {
        id: newPassword.id,
        name: newPassword.name,
        email: newPassword.email,
        site: newPassword.site,
        username: newPassword.username,
        password: newPassword.password
      }
    });
  } catch (error) {
    console.error('Error saving password:', error);
    res.status(500).json({ success: false, message: 'Failed to save password to database.' });
  }
});

// PUT /api/passwords/:id - Update an existing password
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, site, username, password } = req.body;

    const updated = await Password.findOneAndUpdate(
      { userId: req.user.userId, id },
      {
        name: name || '',
        email: email || '',
        site,
        username,
        password
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Password updated successfully in database!',
      password: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        site: updated.site,
        username: updated.username,
        password: updated.password
      }
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Failed to update password in database.' });
  }
});

// DELETE /api/passwords/:id - Delete a password entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Password.findOneAndDelete({ userId: req.user.userId, id });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Password entry not found.' });
    }

    res.json({
      success: true,
      message: 'Password deleted successfully from database!'
    });
  } catch (error) {
    console.error('Error deleting password:', error);
    res.status(500).json({ success: false, message: 'Failed to delete password from database.' });
  }
});

// POST /api/passwords/sync - Bulk sync passwords from local storage
router.post('/sync', async (req, res) => {
  try {
    const { passwords } = req.body;

    if (!Array.isArray(passwords) || passwords.length === 0) {
      return res.json({ success: true, message: 'No passwords to sync.' });
    }

    for (const item of passwords) {
      if (item.site && item.username && item.password) {
        await Password.findOneAndUpdate(
          { userId: req.user.userId, id: item.id },
          {
            userId: req.user.userId,
            id: item.id,
            name: item.name || '',
            email: item.email || '',
            site: item.site,
            username: item.username,
            password: item.password
          },
          { upsert: true, new: true }
        );
      }
    }

    const allPasswords = await Password.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Passwords synced successfully with MongoDB!',
      passwords: allPasswords.map(p => ({
        id: p.id,
        name: p.name || '',
        email: p.email || '',
        site: p.site,
        username: p.username,
        password: p.password
      }))
    });
  } catch (error) {
    console.error('Error syncing passwords:', error);
    res.status(500).json({ success: false, message: 'Failed to sync passwords with database.' });
  }
});

export default router;
