const fs = require('fs');
const path = require('path');
const { hashPassword } = require('../utils/security');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'karigaar_db.json');

class Database {
  constructor() {
    this.data = {
      users: [],
      creatorProfiles: [],
      customerProfiles: [],
    };
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.creatorProfiles) this.data.creatorProfiles = [];
        if (!this.data.customerProfiles) this.data.customerProfiles = [];
      } catch (err) {
        console.error('Failed to read database file, initializing clean database:', err);
        this.seedDefaultAccounts();
        this.persist();
      }
    } else {
      this.seedDefaultAccounts();
      this.persist();
    }
  }

  seedDefaultAccounts() {
    // Seed default verified artisan and customer for testing convenience
    const artisanPasswordHash = hashPassword('Artisan@123');
    const customerPasswordHash = hashPassword('Customer@123');

    const seedArtisan = {
      id: 'usr_artisan_seed',
      fullName: 'Meera Devi',
      email: 'meera.artisan@kaarigaar.in',
      mobile: '9876543210',
      passwordHash: artisanPasswordHash,
      role: 'seller',
      roles: ['customer', 'seller'],
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      isEmailVerified: true,
      isMobileVerified: true,
      verificationOtp: null,
      otpExpiresAt: null,
      resetToken: null,
      resetTokenExpiresAt: null,
      termsAccepted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const seedCreatorProfile = {
      userId: seedArtisan.id,
      brandName: 'Maati & Sunehra Studio',
      tagline: 'Terracotta pottery and gold leaf art from Jaipur',
      description: 'Master terracotta artisan carrying forward five generations of Rajasthani hand pottery traditions.',
      categories: ['pottery', 'home-decor', 'paintings'],
      businessAddress: {
        street: '14, Kumhar Wada, Sanganer',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302029',
      },
      serviceArea: 'Pan-India',
      bankDetails: {
        accountHolder: 'Meera Devi',
        bankName: 'State Bank of India',
        accountNumber: 'XXXXXX4892',
        ifscCode: 'SBIN0001234',
        upiId: 'meera.artisan@sbi',
        isVerified: true,
      },
      taxDetails: {
        panNumber: 'ABCDE1234F',
        gstin: '08ABCDE1234F1Z5',
        artisanCardNumber: 'ART-RJ-2024-8831',
        isCompliant: true,
      },
      profilePhoto: seedArtisan.profilePhoto,
      onboardingStep: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const seedCustomer = {
      id: 'usr_customer_seed',
      fullName: 'Aarav Sharma',
      email: 'aarav.customer@kaarigaar.in',
      mobile: '9812345678',
      passwordHash: customerPasswordHash,
      role: 'customer',
      roles: ['customer'],
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      isEmailVerified: true,
      isMobileVerified: true,
      verificationOtp: null,
      otpExpiresAt: null,
      resetToken: null,
      resetTokenExpiresAt: null,
      termsAccepted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const seedCustomerProfile = {
      userId: seedCustomer.id,
      addresses: [
        {
          id: 'addr_1',
          label: 'Home',
          street: 'Flat 402, Lotus Greens, Baner',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411045',
          isDefault: true,
        },
      ],
      preferences: {
        favoriteCategories: ['crochet', 'candles', 'pottery'],
        newsletter: true,
      },
      createdAt: new Date().toISOString(),
    };

    this.data.users = [seedArtisan, seedCustomer];
    this.data.creatorProfiles = [seedCreatorProfile];
    this.data.customerProfiles = [seedCustomerProfile];
  }

  persist() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  // --- Users ---
  findUserById(id) {
    return this.data.users.find((u) => u.id === id) || null;
  }

  findUserByEmail(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.toLowerCase() === normalized) || null;
  }

  findUserByMobile(mobile) {
    if (!mobile) return null;
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    return this.data.users.find((u) => u.mobile.replace(/\D/g, '').slice(-10) === cleanMobile) || null;
  }

  findUserByIdentifier(identifier) {
    if (!identifier) return null;
    const trimmed = identifier.trim();
    if (trimmed.includes('@')) {
      return this.findUserByEmail(trimmed);
    }
    return this.findUserByMobile(trimmed);
  }

  createUser(userObj) {
    const user = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      fullName: userObj.fullName.trim(),
      email: userObj.email.trim().toLowerCase(),
      mobile: userObj.mobile.replace(/\D/g, '').slice(-10),
      passwordHash: userObj.passwordHash,
      role: userObj.role || 'customer',
      roles: userObj.roles || [userObj.role || 'customer'],
      profilePhoto: userObj.profilePhoto || null,
      isEmailVerified: Boolean(userObj.isEmailVerified),
      isMobileVerified: Boolean(userObj.isMobileVerified),
      verificationOtp: userObj.verificationOtp || null,
      otpExpiresAt: userObj.otpExpiresAt || null,
      resetToken: null,
      resetTokenExpiresAt: null,
      termsAccepted: Boolean(userObj.termsAccepted),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(user);
    this.persist();
    return user;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.users[idx];
  }

  // --- Creator Profiles ---
  findCreatorProfile(userId) {
    return this.data.creatorProfiles.find((cp) => cp.userId === userId) || null;
  }

  createOrUpdateCreatorProfile(userId, profileData) {
    const existingIdx = this.data.creatorProfiles.findIndex((cp) => cp.userId === userId);
    if (existingIdx !== -1) {
      this.data.creatorProfiles[existingIdx] = {
        ...this.data.creatorProfiles[existingIdx],
        ...profileData,
        updatedAt: new Date().toISOString(),
      };
      this.persist();
      return this.data.creatorProfiles[existingIdx];
    }

    const newProfile = {
      userId,
      brandName: profileData.brandName || '',
      tagline: profileData.tagline || 'Har Haath Ki Kahani',
      description: profileData.description || '',
      categories: profileData.categories || [],
      businessAddress: profileData.businessAddress || {
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
      serviceArea: profileData.serviceArea || 'Pan-India',
      bankDetails: profileData.bankDetails || {
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        isVerified: false,
      },
      taxDetails: profileData.taxDetails || {
        panNumber: '',
        gstin: '',
        artisanCardNumber: '',
        isCompliant: false,
      },
      profilePhoto: profileData.profilePhoto || null,
      onboardingStep: profileData.onboardingStep || 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.creatorProfiles.push(newProfile);
    this.persist();
    return newProfile;
  }

  // --- Customer Profiles ---
  findCustomerProfile(userId) {
    return this.data.customerProfiles.find((cp) => cp.userId === userId) || null;
  }

  createOrUpdateCustomerProfile(userId, profileData) {
    const existingIdx = this.data.customerProfiles.findIndex((cp) => cp.userId === userId);
    if (existingIdx !== -1) {
      this.data.customerProfiles[existingIdx] = {
        ...this.data.customerProfiles[existingIdx],
        ...profileData,
        updatedAt: new Date().toISOString(),
      };
      this.persist();
      return this.data.customerProfiles[existingIdx];
    }

    const newProfile = {
      userId,
      addresses: profileData.addresses || [],
      preferences: profileData.preferences || {
        favoriteCategories: [],
        newsletter: true,
      },
      createdAt: new Date().toISOString(),
    };
    this.data.customerProfiles.push(newProfile);
    this.persist();
    return newProfile;
  }
}

const db = new Database();
module.exports = db;
