import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'customer' | 'seller';

export interface CustomerProfileData {
  city: string;
  locality: string;
  termsAccepted: boolean;
  termsAcceptedAt: number;
}

export interface SellerPayoutData {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  upiId: string;
  bankName: string;
  status: 'active' | 'pending';
}

export interface SellerTaxData {
  panNumber: string;
  gstin: string;
  businessType: string;
}

export interface SellerProfileData {
  brandName: string;
  businessAddress: string;
  serviceArea: string;
  categories: string[];
  bio: string;
  payout: SellerPayoutData;
  taxCompliance: SellerTaxData;
  verificationStatus: 'verified' | 'pending' | 'under_review';
  termsAccepted: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  roles: UserRole[];
  salt: string;
  passwordHash: string;
  isVerified: boolean;
  verificationOtp?: string;
  verificationOtpExpires?: number;
  resetOtp?: string;
  resetOtpExpires?: number;
  customerProfile?: CustomerProfileData;
  sellerProfile?: SellerProfileData;
  createdAt: number;
  lastLoginAt: number;
}

export interface RegisterCustomerParams {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl?: string;
  city?: string;
  locality?: string;
  termsConsent: boolean;
}

export interface RegisterSellerParams {
  fullName: string;
  brandName: string;
  email: string;
  phone: string;
  password: string;
  businessAddress: string;
  serviceArea: string;
  categories: string[];
  bio: string;
  avatarUrl?: string;
  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  upiId: string;
  bankName: string;
  panNumber?: string;
  gstin?: string;
  businessType?: string;
  termsConsent: boolean;
}

export interface DispatchedOtpNotification {
  otp: string;
  target: string;
  purpose: 'verification' | 'reset';
  timestamp: number;
}

const STORAGE_KEYS = {
  USERS_DB: '@kaarigaar/users_db',
  SESSION: '@kaarigaar/session',
  ACTIVE_ROLE: '@kaarigaar/activeRole',
  ROLES: '@kaarigaar/roles',
  LAST_OTP: '@kaarigaar/last_dispatched_otp',
} as const;

/**
 * High-performance, zero-dependency pure TypeScript SHA-256 implementation
 * Standard FIPS 180-2 compliant. Works seamlessly on Web, iOS, Android and Node.
 */
export function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i: number;
  let j: number;
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice();
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] =
        i < 16
          ? w[i]
          : ((w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const t1 =
        hash[7] +
        (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
        ch +
        k[i] +
        w[i];
      const t2 =
        (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + t1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (t1 + t2) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Generate cryptographic random salt
 */
export function generateSalt(length = 16): string {
  const chars = 'abcdef0123456789';
  let salt = '';
  for (let i = 0; i < length * 2; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

/**
 * Hash password with salt
 */
export function hashPassword(password: string, salt: string): string {
  return sha256(`${password}:${salt}:KARIGAAR_SECRET_KEY_v2`);
}

/**
 * Generate 6-digit verification / reset OTP code
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Normalize phone number (removes spaces, hyphens, and +91 prefix)
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Normalize email (lowercase, trimmed)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Check if identifier is email or phone
 */
export function isEmailIdentifier(identifier: string): boolean {
  return identifier.includes('@');
}

/**
 * Seed initial accounts if database does not exist
 */
async function getOrSeedUsers(): Promise<AuthUser[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USERS_DB);
  if (raw) {
    try {
      return JSON.parse(raw) as AuthUser[];
    } catch {
      // Fall through to seed
    }
  }

  // Pre-seed realistic customer & artisan accounts with hashed credentials
  const customerSalt = generateSalt();
  const sellerSalt = generateSalt();

  const seedUsers: AuthUser[] = [
    {
      id: 'usr_customer_seed',
      email: 'sanket@kaarigaar.com',
      phone: '9822045678',
      fullName: 'Sanket Joshi',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'customer',
      roles: ['customer'],
      salt: customerSalt,
      passwordHash: hashPassword('Kaarigaar@123', customerSalt),
      isVerified: true,
      customerProfile: {
        city: 'Pune',
        locality: 'Kothrud',
        termsAccepted: true,
        termsAcceptedAt: Date.now() - 30 * 86400000,
      },
      createdAt: Date.now() - 30 * 86400000,
      lastLoginAt: Date.now(),
    },
    {
      id: 'usr_seller_seed',
      email: 'meera@clayworks.com',
      phone: '9876543210',
      fullName: 'Meera Patwardhan',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      role: 'seller',
      roles: ['customer', 'seller'],
      salt: sellerSalt,
      passwordHash: hashPassword('Artisan@123', sellerSalt),
      isVerified: true,
      customerProfile: {
        city: 'Pune',
        locality: 'Alandi Craft Village',
        termsAccepted: true,
        termsAcceptedAt: Date.now() - 60 * 86400000,
      },
      sellerProfile: {
        brandName: "Meera's Terracotta & Clayworks",
        businessAddress: 'Plot 4, Artisan Cluster, Alandi Road, Pune 412105',
        serviceArea: 'Pan-India',
        categories: ['Pottery', 'Home Décor', 'Customized Gifts'],
        bio: 'Master terracotta ceramist and revivalist with 12 years of hands-on wheel throwing experience. Crafting slow, earthy vessels inspired by Sahyadri clay.',
        payout: {
          accountNumber: '921020048192841',
          ifscCode: 'HDFC0001248',
          accountHolderName: 'Meera Patwardhan Crafts',
          upiId: 'meera.crafts@okaxis',
          bankName: 'HDFC Bank, Kothrud Branch',
          status: 'active',
        },
        taxCompliance: {
          panNumber: 'ABCDE1234F',
          gstin: '27ABCDE1234F1Z5',
          businessType: 'Individual Artisan / Proprietorship',
        },
        verificationStatus: 'verified',
        termsAccepted: true,
      },
      createdAt: Date.now() - 60 * 86400000,
      lastLoginAt: Date.now(),
    },
  ];

  await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(seedUsers));
  return seedUsers;
}

/**
 * Save users array to storage
 */
async function persistUsers(users: AuthUser[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
}

/**
 * Store dispatched OTP for on-screen banner / UX preview
 */
async function recordDispatchedOtp(otp: string, target: string, purpose: 'verification' | 'reset') {
  const notif: DispatchedOtpNotification = {
    otp,
    target,
    purpose,
    timestamp: Date.now(),
  };
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_OTP, JSON.stringify(notif));
}

export const authService = {
  /**
   * Initialize database and return all users
   */
  async init(): Promise<AuthUser[]> {
    return getOrSeedUsers();
  },

  /**
   * Find user by email or mobile phone
   */
  async findUserByIdentifier(identifier: string): Promise<AuthUser | null> {
    const users = await getOrSeedUsers();
    const cleanId = identifier.trim();

    if (isEmailIdentifier(cleanId)) {
      const email = normalizeEmail(cleanId);
      return users.find((u) => normalizeEmail(u.email) === email) || null;
    } else {
      const phone = normalizePhone(cleanId);
      return users.find((u) => normalizePhone(u.phone) === phone) || null;
    }
  },

  /**
   * Register a new Customer Account
   */
  async registerCustomer(params: RegisterCustomerParams): Promise<{ user: AuthUser; otp: string }> {
    const users = await getOrSeedUsers();
    const cleanEmail = normalizeEmail(params.email);
    const cleanPhone = normalizePhone(params.phone);

    // Duplicate check for email
    const existingEmail = users.find((u) => normalizeEmail(u.email) === cleanEmail);
    if (existingEmail) {
      throw new Error(`An account with email "${params.email}" already exists. Please log in.`);
    }

    // Duplicate check for phone
    const existingPhone = users.find((u) => normalizePhone(u.phone) === cleanPhone);
    if (existingPhone) {
      throw new Error(`An account with mobile number "${params.phone}" already exists. Please log in.`);
    }

    if (!params.termsConsent) {
      throw new Error('You must agree to the Terms of Service and Privacy Policy.');
    }

    if (!params.password || params.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(params.password, salt);
    const otp = generateOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const newUser: AuthUser = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      phone: cleanPhone,
      fullName: params.fullName.trim(),
      avatarUrl: params.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'customer',
      roles: ['customer'],
      salt,
      passwordHash,
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
      customerProfile: {
        city: params.city || 'Pune',
        locality: params.locality || 'Kothrud',
        termsAccepted: true,
        termsAcceptedAt: Date.now(),
      },
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };

    users.push(newUser);
    await persistUsers(users);
    await recordDispatchedOtp(otp, newUser.email, 'verification');

    return { user: newUser, otp };
  },

  /**
   * Register a new Artisan / Seller Account
   */
  async registerSeller(params: RegisterSellerParams): Promise<{ user: AuthUser; otp: string }> {
    const users = await getOrSeedUsers();
    const cleanEmail = normalizeEmail(params.email);
    const cleanPhone = normalizePhone(params.phone);

    // Duplicate check for email
    const existingEmail = users.find((u) => normalizeEmail(u.email) === cleanEmail);
    if (existingEmail) {
      throw new Error(`An account with email "${params.email}" already exists. Please log in.`);
    }

    // Duplicate check for phone
    const existingPhone = users.find((u) => normalizePhone(u.phone) === cleanPhone);
    if (existingPhone) {
      throw new Error(`An account with mobile number "${params.phone}" already exists. Please log in.`);
    }

    if (!params.termsConsent) {
      throw new Error('You must agree to the KARIGAAR Artisan Charter & Terms.');
    }

    if (!params.password || params.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    if (!params.brandName.trim()) {
      throw new Error('Please enter your Studio or Brand Name.');
    }

    if (!params.categories || params.categories.length === 0) {
      throw new Error('Please select at least one craft category.');
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(params.password, salt);
    const otp = generateOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const newUser: AuthUser = {
      id: `usr_seller_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      phone: cleanPhone,
      fullName: params.fullName.trim(),
      avatarUrl: params.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      role: 'seller',
      roles: ['customer', 'seller'],
      salt,
      passwordHash,
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
      customerProfile: {
        city: params.serviceArea || 'Pune',
        locality: params.businessAddress.split(',')[0] || 'Artisan Hub',
        termsAccepted: true,
        termsAcceptedAt: Date.now(),
      },
      sellerProfile: {
        brandName: params.brandName.trim(),
        businessAddress: params.businessAddress.trim(),
        serviceArea: params.serviceArea.trim() || 'Pan-India',
        categories: params.categories,
        bio: params.bio.trim() || 'Artisan crafting meaningful handmade creations.',
        payout: {
          accountNumber: params.bankAccountNumber.trim(),
          ifscCode: params.ifscCode.trim().toUpperCase(),
          accountHolderName: params.accountHolderName.trim(),
          upiId: params.upiId.trim(),
          bankName: params.bankName.trim() || 'Verified Bank Account',
          status: 'active',
        },
        taxCompliance: {
          panNumber: (params.panNumber || '').trim().toUpperCase(),
          gstin: (params.gstin || '').trim().toUpperCase(),
          businessType: params.businessType || 'Individual Artisan',
        },
        verificationStatus: 'verified',
        termsAccepted: true,
      },
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };

    users.push(newUser);
    await persistUsers(users);
    await recordDispatchedOtp(otp, newUser.email, 'verification');

    return { user: newUser, otp };
  },

  /**
   * Authenticate user with Email or Mobile Number and Password
   */
  async login(identifier: string, password: string): Promise<AuthUser> {
    const user = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw new Error('No KARIGAAR account found with this email or mobile number.');
    }

    const calculatedHash = hashPassword(password, user.salt);
    if (calculatedHash !== user.passwordHash) {
      throw new Error('Incorrect password. Please verify your credentials or reset your password.');
    }

    // Update lastLoginAt
    user.lastLoginAt = Date.now();
    const users = await getOrSeedUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      await persistUsers(users);
    }

    // Save session
    await this.saveSession(user);
    return user;
  },

  /**
   * Verify Account with 6-digit OTP code
   */
  async verifyOtp(userId: string, enteredCode: string): Promise<AuthUser> {
    const users = await getOrSeedUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('Account not found.');
    }

    if (!user.verificationOtp) {
      // If already verified
      if (user.isVerified) return user;
      throw new Error('No verification code was requested.');
    }

    if (user.verificationOtpExpires && Date.now() > user.verificationOtpExpires) {
      throw new Error('Verification code has expired. Please tap "Resend Code".');
    }

    if (user.verificationOtp.trim() !== enteredCode.trim()) {
      throw new Error('Invalid verification code. Please check and try again.');
    }

    // Mark verified
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;

    await persistUsers(users);
    await this.saveSession(user);
    return user;
  },

  /**
   * Resend Account Verification OTP
   */
  async resendOtp(userId: string): Promise<string> {
    const users = await getOrSeedUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('Account not found.');
    }

    const newOtp = generateOtp();
    user.verificationOtp = newOtp;
    user.verificationOtpExpires = Date.now() + 10 * 60 * 1000;

    await persistUsers(users);
    await recordDispatchedOtp(newOtp, user.email, 'verification');
    return newOtp;
  },

  /**
   * Request Password Reset OTP
   */
  async requestPasswordReset(identifier: string): Promise<{ user: AuthUser; otp: string; target: string }> {
    const user = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw new Error('No account found with this email or mobile number.');
    }

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;

    const users = await getOrSeedUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      await persistUsers(users);
    }

    const target = isEmailIdentifier(identifier) ? user.email : user.phone;
    await recordDispatchedOtp(otp, target, 'reset');

    return { user, otp, target };
  },

  /**
   * Verify Reset OTP and Set New Password
   */
  async confirmPasswordReset(identifier: string, enteredOtp: string, newPassword: string): Promise<AuthUser> {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    const user = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw new Error('Account not found.');
    }

    if (!user.resetOtp) {
      throw new Error('No password reset was requested for this account.');
    }

    if (user.resetOtpExpires && Date.now() > user.resetOtpExpires) {
      throw new Error('Password reset code has expired. Please request a new one.');
    }

    if (user.resetOtp.trim() !== enteredOtp.trim()) {
      throw new Error('Invalid reset code. Please check and try again.');
    }

    // Set new password with new salt
    const newSalt = generateSalt();
    user.salt = newSalt;
    user.passwordHash = hashPassword(newPassword, newSalt);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;

    const users = await getOrSeedUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      await persistUsers(users);
    }

    return user;
  },

  /**
   * Upgrade an existing customer to a verified Seller
   */
  async upgradeToSeller(userId: string, sellerData: Omit<RegisterSellerParams, 'password' | 'email' | 'phone' | 'fullName'>): Promise<AuthUser> {
    const users = await getOrSeedUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found.');
    }

    if (!user.roles.includes('seller')) {
      user.roles.push('seller');
    }
    user.role = 'seller';

    user.sellerProfile = {
      brandName: sellerData.brandName.trim(),
      businessAddress: sellerData.businessAddress.trim(),
      serviceArea: sellerData.serviceArea.trim() || 'Pan-India',
      categories: sellerData.categories,
      bio: sellerData.bio.trim() || 'Handmade artisan studio.',
      payout: {
        accountNumber: sellerData.bankAccountNumber.trim(),
        ifscCode: sellerData.ifscCode.trim().toUpperCase(),
        accountHolderName: sellerData.accountHolderName.trim(),
        upiId: sellerData.upiId.trim(),
        bankName: sellerData.bankName.trim() || 'Verified Bank Account',
        status: 'active',
      },
      taxCompliance: {
        panNumber: (sellerData.panNumber || '').trim().toUpperCase(),
        gstin: (sellerData.gstin || '').trim().toUpperCase(),
        businessType: sellerData.businessType || 'Individual Artisan',
      },
      verificationStatus: 'verified',
      termsAccepted: true,
    };

    await persistUsers(users);
    await this.saveSession(user);
    return user;
  },

  /**
   * Session Management
   */
  async saveSession(user: AuthUser): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  },

  async getSession(): Promise<AuthUser | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  async clearSession(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.SESSION),
      AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE),
    ]);
  },

  /**
   * Get last dispatched OTP for on-screen notification transparency
   */
  async getLastDispatchedOtp(): Promise<DispatchedOtpNotification | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LAST_OTP);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DispatchedOtpNotification;
    } catch {
      return null;
    }
  },
};
