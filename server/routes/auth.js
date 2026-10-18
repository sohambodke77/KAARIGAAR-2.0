const express = require('express');
const router = express.Router();
const db = require('../db/database');
const {
  hashPassword,
  verifyPassword,
  generateOtp,
  generateToken,
} = require('../utils/security');
const { authenticateToken } = require('../middleware/auth');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function cleanMobile(mobile) {
  return String(mobile || '').replace(/\D/g, '').slice(-10);
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, verificationOtp, resetToken, ...safe } = user;
  return safe;
}

// ---------------------------------------------------------------------------
// 1. REGISTER CUSTOMER
// ---------------------------------------------------------------------------
router.post('/register/customer', (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      password,
      confirmPassword,
      profilePhoto,
      termsAccepted,
    } = req.body;

    // Field validations
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    const mobileDigits = cleanMobile(mobile);
    if (!mobileDigits || mobileDigits.length !== 10) {
      return res.status(400).json({ success: false, message: 'A valid 10-digit mobile number is required.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }
    if (!termsAccepted) {
      return res.status(400).json({ success: false, message: 'You must agree to the Terms & Privacy Policy.' });
    }

    // Duplicate check
    if (db.findUserByEmail(email)) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }
    if (db.findUserByMobile(mobileDigits)) {
      return res.status(409).json({ success: false, message: 'An account with this mobile number already exists.' });
    }

    // Create user
    const otp = generateOtp();
    const otpExpiresAt = Date.now() + 15 * 60 * 1000; // 15 mins
    const passwordHash = hashPassword(password);

    const user = db.createUser({
      fullName,
      email,
      mobile: mobileDigits,
      passwordHash,
      role: 'customer',
      roles: ['customer'],
      profilePhoto: profilePhoto || null,
      isEmailVerified: false,
      isMobileVerified: false,
      verificationOtp: otp,
      otpExpiresAt,
      termsAccepted: true,
    });

    db.createOrUpdateCustomerProfile(user.id, {
      addresses: [],
      preferences: { favoriteCategories: [], newsletter: true },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      roles: user.roles,
    });

    return res.status(201).json({
      success: true,
      message: 'Customer account registered successfully.',
      token,
      user: sanitizeUser(user),
      requiresVerification: true,
      otpPreview: otp, // For ease of testing & simulation
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// ---------------------------------------------------------------------------
// 2. REGISTER SELLER / CREATOR
// ---------------------------------------------------------------------------
router.post('/register/seller', (req, res) => {
  try {
    const {
      fullName,
      brandName,
      email,
      mobile,
      password,
      confirmPassword,
      businessAddress,
      serviceArea,
      categories,
      description,
      profilePhoto,
      bankDetails,
      taxDetails,
      termsAccepted,
    } = req.body;

    // Field validations
    const sellerName = (fullName || brandName || '').trim();
    if (!sellerName) {
      return res.status(400).json({ success: false, message: 'Full name or brand name is required.' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    const mobileDigits = cleanMobile(mobile);
    if (!mobileDigits || mobileDigits.length !== 10) {
      return res.status(400).json({ success: false, message: 'A valid 10-digit mobile number is required.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one handmade product category.' });
    }
    if (!termsAccepted) {
      return res.status(400).json({ success: false, message: 'You must agree to the Terms & Privacy Policy.' });
    }

    // Duplicate check
    if (db.findUserByEmail(email)) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }
    if (db.findUserByMobile(mobileDigits)) {
      return res.status(409).json({ success: false, message: 'An account with this mobile number already exists.' });
    }

    const otp = generateOtp();
    const otpExpiresAt = Date.now() + 15 * 60 * 1000;
    const passwordHash = hashPassword(password);

    const user = db.createUser({
      fullName: sellerName,
      email,
      mobile: mobileDigits,
      passwordHash,
      role: 'seller',
      roles: ['customer', 'seller'], // Creators can also shop!
      profilePhoto: profilePhoto || null,
      isEmailVerified: false,
      isMobileVerified: false,
      verificationOtp: otp,
      otpExpiresAt,
      termsAccepted: true,
    });

    const creatorProfile = db.createOrUpdateCreatorProfile(user.id, {
      brandName: brandName ? brandName.trim() : sellerName,
      tagline: 'Har Haath Ki Kahani, Aap Tak.',
      description: (description || '').trim() || 'Handmade artisan studio on KARIGAAR.',
      categories,
      businessAddress: businessAddress || {
        street: '',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '',
      },
      serviceArea: serviceArea || 'Pan-India',
      bankDetails: bankDetails || {
        accountHolder: sellerName,
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        isVerified: false,
      },
      taxDetails: taxDetails || {
        panNumber: '',
        gstin: '',
        artisanCardNumber: '',
        isCompliant: false,
      },
      profilePhoto: profilePhoto || null,
      onboardingStep: 'completed',
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      roles: user.roles,
    });

    return res.status(201).json({
      success: true,
      message: 'Creator account registered successfully.',
      token,
      user: sanitizeUser(user),
      creatorProfile,
      requiresVerification: true,
      otpPreview: otp,
    });
  } catch (error) {
    console.error('Seller registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during seller registration.' });
  }
});

// ---------------------------------------------------------------------------
// 3. LOGIN (EMAIL OR MOBILE NUMBER)
// ---------------------------------------------------------------------------
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your email address or mobile number.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password.' });
    }

    const user = db.findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No KARIGAAR account found with those details.',
      });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check and try again.',
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      roles: user.roles,
    });

    const creatorProfile = user.roles.includes('seller') ? db.findCreatorProfile(user.id) : null;
    const customerProfile = db.findCustomerProfile(user.id);

    return res.status(200).json({
      success: true,
      message: 'Sign in successful.',
      token,
      user: sanitizeUser(user),
      creatorProfile,
      customerProfile,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ---------------------------------------------------------------------------
// 4. VERIFY OTP (EMAIL OR MOBILE)
// ---------------------------------------------------------------------------
router.post('/verify-otp', (req, res) => {
  try {
    const { userId, identifier, otp } = req.body;

    if (!otp || !otp.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit OTP.' });
    }

    let user = null;
    if (userId) {
      user = db.findUserById(userId);
    } else if (identifier) {
      user = db.findUserByIdentifier(identifier);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (!user.verificationOtp) {
      return res.status(400).json({ success: false, message: 'No active OTP verification pending for this account.' });
    }

    if (Date.now() > (user.otpExpiresAt || 0)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (user.verificationOtp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP code. Please check and try again.' });
    }

    // Mark as verified
    const updatedUser = db.updateUser(user.id, {
      isEmailVerified: true,
      isMobileVerified: true,
      verificationOtp: null,
      otpExpiresAt: null,
    });

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully.',
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
});

// ---------------------------------------------------------------------------
// 5. RESEND OTP
// ---------------------------------------------------------------------------
router.post('/resend-otp', (req, res) => {
  try {
    const { userId, identifier } = req.body;

    let user = null;
    if (userId) user = db.findUserById(userId);
    else if (identifier) user = db.findUserByIdentifier(identifier);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const newOtp = generateOtp();
    const otpExpiresAt = Date.now() + 15 * 60 * 1000;

    db.updateUser(user.id, {
      verificationOtp: newOtp,
      otpExpiresAt,
    });

    return res.status(200).json({
      success: true,
      message: 'A new 6-digit verification code has been dispatched.',
      otpPreview: newOtp,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error resending OTP.' });
  }
});

// ---------------------------------------------------------------------------
// 6. FORGOT PASSWORD (REQUEST RESET CODE)
// ---------------------------------------------------------------------------
router.post('/forgot-password', (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your registered email or mobile number.' });
    }

    const user = db.findUserByIdentifier(identifier);
    if (!user) {
      // Don't leak user existence in generic message, but return structured state
      return res.status(200).json({
        success: true,
        message: 'If an account matches those details, password reset instructions have been sent.',
      });
    }

    const resetOtp = generateOtp();
    const resetExpiresAt = Date.now() + 20 * 60 * 1000; // 20 mins

    db.updateUser(user.id, {
      resetToken: resetOtp,
      resetTokenExpiresAt: resetExpiresAt,
    });

    return res.status(200).json({
      success: true,
      message: `Password reset OTP has been generated for ${user.email}.`,
      resetTokenPreview: resetOtp,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing password reset.' });
  }
});

// ---------------------------------------------------------------------------
// 7. RESET PASSWORD (SUBMIT NEW PASSWORD WITH OTP)
// ---------------------------------------------------------------------------
router.post('/reset-password', (req, res) => {
  try {
    const { identifier, otp, newPassword, confirmPassword } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Identifier is required.' });
    }
    if (!otp || !otp.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter the reset code.' });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const user = db.findUserByIdentifier(identifier);
    if (!user || !user.resetToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset request.' });
    }

    if (Date.now() > (user.resetTokenExpiresAt || 0)) {
      return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' });
    }

    if (user.resetToken !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid reset code. Please check and try again.' });
    }

    const newHash = hashPassword(newPassword);
    db.updateUser(user.id, {
      passwordHash: newHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    });

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
});

// ---------------------------------------------------------------------------
// 8. GOOGLE SIGN-IN
// ---------------------------------------------------------------------------
router.post('/google', (req, res) => {
  try {
    const { email, fullName, profilePhoto, roleChoice } = req.body;

    const chosenEmail = email ? email.trim().toLowerCase() : 'artisan.google@kaarigaar.in';
    const chosenName = fullName ? fullName.trim() : 'Google Artisan';
    let user = db.findUserByEmail(chosenEmail);

    if (!user) {
      // First time Google sign in -> create user
      const assignedRole = roleChoice === 'seller' ? 'seller' : 'customer';
      const assignedRoles = assignedRole === 'seller' ? ['customer', 'seller'] : ['customer'];
      const dummyPasswordHash = hashPassword(`Google_${Date.now()}_oauth`);

      user = db.createUser({
        fullName: chosenName,
        email: chosenEmail,
        mobile: '9990001122',
        passwordHash: dummyPasswordHash,
        role: assignedRole,
        roles: assignedRoles,
        profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        isEmailVerified: true,
        isMobileVerified: true,
        termsAccepted: true,
      });

      if (assignedRole === 'seller') {
        db.createOrUpdateCreatorProfile(user.id, {
          brandName: `${chosenName}'s Craft Studio`,
          tagline: 'Handmade with care and tradition.',
          description: 'Contemporary handmade products crafted with natural sustainable materials.',
          categories: ['crochet', 'candles', 'home-decor'],
        });
      } else {
        db.createOrUpdateCustomerProfile(user.id, {
          addresses: [],
          preferences: { favoriteCategories: ['crochet', 'pottery'], newsletter: true },
        });
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      roles: user.roles,
    });

    const creatorProfile = user.roles.includes('seller') ? db.findCreatorProfile(user.id) : null;
    const customerProfile = db.findCustomerProfile(user.id);

    return res.status(200).json({
      success: true,
      message: 'Signed in with Google successfully.',
      token,
      user: sanitizeUser(user),
      creatorProfile,
      customerProfile,
    });
  } catch (error) {
    console.error('Google sign in error:', error);
    return res.status(500).json({ success: false, message: 'Server error during Google sign-in.' });
  }
});

// ---------------------------------------------------------------------------
// 9. CURRENT USER / SESSION (ME)
// ---------------------------------------------------------------------------
router.get('/me', authenticateToken, (req, res) => {
  const user = req.dbUser;
  const creatorProfile = user.roles.includes('seller') ? db.findCreatorProfile(user.id) : null;
  const customerProfile = db.findCustomerProfile(user.id);

  return res.status(200).json({
    success: true,
    user: sanitizeUser(user),
    creatorProfile,
    customerProfile,
  });
});

// ---------------------------------------------------------------------------
// 10. LOGOUT
// ---------------------------------------------------------------------------
router.post('/logout', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
});

module.exports = router;
