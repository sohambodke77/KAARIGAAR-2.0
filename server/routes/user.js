const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, requireCustomer } = require('../middleware/auth');

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, verificationOtp, resetToken, ...safe } = user;
  return safe;
}

// Get customer profile
router.get('/profile', authenticateToken, (req, res) => {
  const profile = db.findCustomerProfile(req.user.userId);
  return res.json({
    success: true,
    user: sanitizeUser(req.dbUser),
    customerProfile: profile,
  });
});

// Update customer profile
router.put('/profile', authenticateToken, (req, res) => {
  const { fullName, profilePhoto, addresses, preferences } = req.body;
  const updates = {};
  if (fullName) updates.fullName = fullName.trim();
  if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;

  const updatedUser = db.updateUser(req.user.userId, updates);
  const updatedCustomerProfile = db.createOrUpdateCustomerProfile(req.user.userId, {
    addresses: addresses || [],
    preferences: preferences || {},
  });

  return res.json({
    success: true,
    message: 'Profile updated successfully',
    user: sanitizeUser(updatedUser),
    customerProfile: updatedCustomerProfile,
  });
});

// Protected customer dashboard route
router.get('/dashboard', authenticateToken, requireCustomer, (req, res) => {
  return res.json({
    success: true,
    message: 'Welcome to KARIGAAR Customer Experience',
    user: sanitizeUser(req.dbUser),
    features: [
      'discover-handmade-products',
      'explore-artisan-stories',
      'customize-creations',
      'manage-orders-and-wishlist',
    ],
  });
});

module.exports = router;
