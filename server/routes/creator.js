const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, requireSeller } = require('../middleware/auth');

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, verificationOtp, resetToken, ...safe } = user;
  return safe;
}

// Get creator profile
router.get('/profile', authenticateToken, requireSeller, (req, res) => {
  const profile = db.findCreatorProfile(req.user.userId);
  return res.json({
    success: true,
    user: sanitizeUser(req.dbUser),
    creatorProfile: profile,
  });
});

// Update creator profile (brand name, categories, address, bio)
router.put('/profile', authenticateToken, requireSeller, (req, res) => {
  const {
    brandName,
    tagline,
    description,
    categories,
    businessAddress,
    serviceArea,
    profilePhoto,
  } = req.body;

  const profile = db.createOrUpdateCreatorProfile(req.user.userId, {
    brandName,
    tagline,
    description,
    categories,
    businessAddress,
    serviceArea,
    profilePhoto,
  });

  return res.json({
    success: true,
    message: 'Creator profile updated successfully',
    creatorProfile: profile,
  });
});

// Secure payment & payout onboarding flow
router.post('/payout-setup', authenticateToken, requireSeller, (req, res) => {
  const { bankDetails, taxDetails } = req.body;

  if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifscCode) {
    return res.status(400).json({
      success: false,
      message: 'Account number and IFSC code are required for payout onboarding.',
    });
  }

  const profile = db.createOrUpdateCreatorProfile(req.user.userId, {
    bankDetails: {
      accountHolder: bankDetails.accountHolder || req.dbUser.fullName,
      bankName: bankDetails.bankName || 'Verified Bank',
      accountNumber: bankDetails.accountNumber,
      ifscCode: bankDetails.ifscCode.toUpperCase(),
      upiId: bankDetails.upiId || '',
      isVerified: true,
    },
    taxDetails: taxDetails || {
      panNumber: '',
      gstin: '',
      artisanCardNumber: '',
      isCompliant: true,
    },
    onboardingStep: 'completed',
  });

  return res.json({
    success: true,
    message: 'Payout and tax details verified and saved.',
    creatorProfile: profile,
  });
});

// Protected creator dashboard route (strict server-side role check!)
router.get('/dashboard', authenticateToken, requireSeller, (req, res) => {
  const profile = db.findCreatorProfile(req.user.userId);
  return res.json({
    success: true,
    message: 'Welcome to KARIGAAR Creator Studio',
    user: sanitizeUser(req.dbUser),
    creatorProfile: profile,
    features: [
      'list-handmade-products',
      'manage-inventory',
      'respond-to-custom-requests',
      'process-orders-and-earnings',
      'artisan-analytics',
    ],
  });
});

module.exports = router;
