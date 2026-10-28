import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Checkbox } from '../components/Checkbox';
import { GoldButton } from '../components/GoldButton';
import { GoogleButton } from '../components/GoogleButton';
import { Logo } from '../components/Logo';
import { OtpVerificationModal } from '../components/OtpVerificationModal';
import { PasswordResetModal } from '../components/PasswordResetModal';
import { TermsPolicyModal } from '../components/TermsPolicyModal';
import { UnderlineInput } from '../components/UnderlineInput';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radius, shadow } from '../theme';

const bgAsset = require('../../assets/craft_workshop_blurred.jpg');

type AuthTab = 'login' | 'customer' | 'seller';

const CRAFT_CATEGORIES = [
  'Pottery & Ceramics',
  'Crochet & Macramé',
  'Resin & Fluid Art',
  'Handmade Jewellery',
  'Woolen Flowers',
  'Scented Candles',
  'Miniature Paintings',
  'Hand Embroidery',
  'Home Décor',
  'Customized Gifts',
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
}

export function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    loginWithCredentials,
    registerCustomer,
    registerSeller,
    verifyOtp,
    resendOtp,
    requestPasswordReset,
    confirmPasswordReset,
    pendingVerificationUser,
    lastDispatchedOtp,
    cancelVerification,
    signIn,
  } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Customer Register State
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custConfirmPassword, setCustConfirmPassword] = useState('');
  const [custCity, setCustCity] = useState('Pune');
  const [custLocality, setCustLocality] = useState('Kothrud');
  const [custAvatar, setCustAvatar] = useState(PRESET_AVATARS[0]);
  const [custTerms, setCustTerms] = useState(true);
  const [showCustPassword, setShowCustPassword] = useState(false);
  const [showCustConfirmPassword, setShowCustConfirmPassword] = useState(false);
  const [custErrors, setCustErrors] = useState<Record<string, string>>({});

  // Seller / Creator Register State
  const [sellerName, setSellerName] = useState('');
  const [sellerBrandName, setSellerBrandName] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerPassword, setSellerPassword] = useState('');
  const [sellerConfirmPassword, setSellerConfirmPassword] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [sellerServiceArea, setSellerServiceArea] = useState('Pan-India');
  const [sellerCategories, setSellerCategories] = useState<string[]>(['Pottery & Ceramics']);
  const [sellerBio, setSellerBio] = useState('');
  const [sellerAvatar, setSellerAvatar] = useState(PRESET_AVATARS[1]);
  const [sellerBankAcc, setSellerBankAcc] = useState('');
  const [sellerIfsc, setSellerIfsc] = useState('');
  const [sellerAccHolder, setSellerAccHolder] = useState('');
  const [sellerUpi, setSellerUpi] = useState('');
  const [sellerBankName, setSellerBankName] = useState('');
  const [sellerPan, setSellerPan] = useState('');
  const [sellerGstin, setSellerGstin] = useState('');
  const [sellerTerms, setSellerTerms] = useState(true);
  const [showSellerPassword, setShowSellerPassword] = useState(false);
  const [showSellerConfirmPassword, setShowSellerConfirmPassword] = useState(false);
  const [sellerErrors, setSellerErrors] = useState<Record<string, string>>({});

  // Busy & UI states
  const [busy, setBusy] = useState<'submit' | 'google' | null>(null);

  // Modals
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTarget, setOtpTarget] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState<'terms' | 'privacy' | 'charter' | null>(null);

  // Success toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animations
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(20));
  const [shakeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Sync OTP modal with pending verification user from auth context
  useEffect(() => {
    if (pendingVerificationUser) {
      setOtpTarget(pendingVerificationUser.email || pendingVerificationUser.phone);
      setShowOtpModal(true);
    }
  }, [pendingVerificationUser]);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 35, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Category selection for Seller
  const toggleCategory = (cat: string) => {
    setSellerCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    if (sellerErrors.categories) {
      setSellerErrors((prev) => ({ ...prev, categories: '' }));
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async () => {
    setLoginError(null);
    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setLoginError('Please enter your email or mobile number.');
      triggerShake();
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      triggerShake();
      return;
    }

    setBusy('submit');
    try {
      const res = await loginWithCredentials(identifier, loginPassword);
      if (!res.success) {
        // Needs OTP verification
        setOtpTarget(identifier);
        setShowOtpModal(true);
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed. Please check your credentials.');
      triggerShake();
    } finally {
      setBusy(null);
    }
  };

  // Handle Customer Registration Submit
  const handleCustomerSubmit = async () => {
    const errors: Record<string, string> = {};

    if (!custName.trim()) errors.name = 'Please enter your full name.';
    if (!custEmail.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!isValidEmail(custEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!custPhone.trim()) {
      errors.phone = 'Please enter your 10-digit mobile number.';
    } else if (!isValidPhone(custPhone)) {
      errors.phone = 'Mobile number must be a valid 10-digit number.';
    }

    if (!custPassword) {
      errors.password = 'Please enter a password.';
    } else if (custPassword.length < 8) {
      errors.password = 'Password must contain at least 8 characters.';
    }

    if (custPassword !== custConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!custTerms) {
      errors.terms = 'You must agree to the Terms of Service & Privacy Policy.';
    }

    if (Object.keys(errors).length > 0) {
      setCustErrors(errors);
      triggerShake();
      return;
    }
    setCustErrors({});

    setBusy('submit');
    try {
      await registerCustomer({
        fullName: custName.trim(),
        email: custEmail.trim(),
        phone: custPhone.trim(),
        password: custPassword,
        avatarUrl: custAvatar,
        city: custCity.trim(),
        locality: custLocality.trim(),
        termsConsent: custTerms,
      });
      setOtpTarget(custEmail.trim());
      setShowOtpModal(true);
    } catch (err: any) {
      setCustErrors({ form: err?.message || 'Registration failed. Please try again.' });
      triggerShake();
    } finally {
      setBusy(null);
    }
  };

  // Handle Seller Registration Submit
  const handleSellerSubmit = async () => {
    const errors: Record<string, string> = {};

    if (!sellerName.trim()) errors.name = 'Please enter your full name.';
    if (!sellerBrandName.trim()) errors.brandName = 'Please enter your Artisan Brand/Studio name.';

    if (!sellerEmail.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!isValidEmail(sellerEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!sellerPhone.trim()) {
      errors.phone = 'Please enter your 10-digit mobile number.';
    } else if (!isValidPhone(sellerPhone)) {
      errors.phone = 'Mobile number must be a valid 10-digit number.';
    }

    if (!sellerPassword) {
      errors.password = 'Please enter a password.';
    } else if (sellerPassword.length < 8) {
      errors.password = 'Password must contain at least 8 characters.';
    }

    if (sellerPassword !== sellerConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!sellerAddress.trim()) {
      errors.address = 'Please enter your workshop or studio address.';
    }

    if (sellerCategories.length === 0) {
      errors.categories = 'Please select at least one craft category.';
    }

    if (!sellerBankAcc.trim()) {
      errors.bankAcc = 'Please enter your bank account number for payouts.';
    }

    if (!sellerIfsc.trim()) {
      errors.ifsc = 'Please enter your IFSC code.';
    }

    if (!sellerAccHolder.trim()) {
      errors.accHolder = 'Please enter the bank account holder name.';
    }

    if (!sellerTerms) {
      errors.terms = 'You must accept the KARIGAAR Artisan Charter.';
    }

    if (Object.keys(errors).length > 0) {
      setSellerErrors(errors);
      triggerShake();
      return;
    }
    setSellerErrors({});

    setBusy('submit');
    try {
      await registerSeller({
        fullName: sellerName.trim(),
        brandName: sellerBrandName.trim(),
        email: sellerEmail.trim(),
        phone: sellerPhone.trim(),
        password: sellerPassword,
        businessAddress: sellerAddress.trim(),
        serviceArea: sellerServiceArea.trim(),
        categories: sellerCategories,
        bio: sellerBio.trim() || 'Master artisan crafting handmade treasures with heritage passion.',
        avatarUrl: sellerAvatar,
        bankAccountNumber: sellerBankAcc.trim(),
        ifscCode: sellerIfsc.trim(),
        accountHolderName: sellerAccHolder.trim(),
        upiId: sellerUpi.trim() || `${sellerBrandName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`,
        bankName: sellerBankName.trim() || 'HDFC Bank',
        panNumber: sellerPan.trim(),
        gstin: sellerGstin.trim(),
        businessType: 'Individual Artisan / Proprietorship',
        termsConsent: sellerTerms,
      });
      setOtpTarget(sellerEmail.trim());
      setShowOtpModal(true);
    } catch (err: any) {
      setSellerErrors({ form: err?.message || 'Artisan registration failed. Please try again.' });
      triggerShake();
    } finally {
      setBusy(null);
    }
  };

  // Quick fill test credentials helper
  const handleQuickFillAccount = (type: 'customer' | 'seller') => {
    setActiveTab('login');
    if (type === 'customer') {
      setLoginIdentifier('sanket@kaarigaar.com');
      setLoginPassword('Kaarigaar@123');
    } else {
      setLoginIdentifier('meera@clayworks.com');
      setLoginPassword('Artisan@123');
    }
    setLoginError(null);
    showToast(`Loaded ${type === 'customer' ? 'Customer' : 'Artisan'} credentials`);
  };

  // Google Sign In
  const handleGoogleSubmit = async () => {
    if (busy) return;
    setBusy('google');
    try {
      await signIn({
        identifier: 'artisan.google@kaarigaar.com',
        method: 'google',
        mode: 'signin',
        fullName: 'Aarav Sharma (Google)',
      });
    } catch {
      setLoginError('Google sign-in could not be completed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <ImageBackground source={bgAsset} resizeMode="cover" style={styles.fullScreenBg}>
      {/* Cinematic dark warm-brown overlay */}
      <LinearGradient
        colors={['rgba(28, 16, 10, 0.52)', 'rgba(20, 11, 7, 0.76)']}
        style={StyleSheet.absoluteFill}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={16} color={colors.goldBright} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.centerWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
              },
            ]}
          >
            {/* Main Auth Card */}
            <View style={[styles.glassCard, isDesktop && styles.glassCardDesktop]}>
              {/* KARIGAAR Brand Header */}
              <View style={styles.logoContainer}>
                <Logo size="lg" showTagline />
              </View>

              {/* Three-Way Mode Segmented Switcher */}
              <View style={styles.tabContainer}>
                <Pressable
                  onPress={() => {
                    setActiveTab('login');
                    setLoginError(null);
                  }}
                  style={[styles.tabBtn, activeTab === 'login' && styles.tabBtnActive]}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="log-in-outline"
                    size={16}
                    color={activeTab === 'login' ? colors.charcoal : colors.creamDim}
                  />
                  <Text
                    style={[styles.tabBtnText, activeTab === 'login' && styles.tabBtnTextActive]}
                  >
                    Sign In
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setActiveTab('customer');
                    setCustErrors({});
                  }}
                  style={[styles.tabBtn, activeTab === 'customer' && styles.tabBtnActive]}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="bag-handle-outline"
                    size={16}
                    color={activeTab === 'customer' ? colors.charcoal : colors.creamDim}
                  />
                  <Text
                    style={[styles.tabBtnText, activeTab === 'customer' && styles.tabBtnTextActive]}
                  >
                    Customer Sign Up
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setActiveTab('seller');
                    setSellerErrors({});
                  }}
                  style={[styles.tabBtn, activeTab === 'seller' && styles.tabBtnActive]}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="hammer-outline"
                    size={16}
                    color={activeTab === 'seller' ? colors.charcoal : colors.creamDim}
                  />
                  <Text
                    style={[styles.tabBtnText, activeTab === 'seller' && styles.tabBtnTextActive]}
                  >
                    Artisan / Seller
                  </Text>
                </Pressable>
              </View>

              {/* Quick Fill Credentials Bar */}
              {activeTab === 'login' && (
                <View style={styles.quickFillBar}>
                  <Text style={styles.quickFillLabel}>Quick Test Accounts:</Text>
                  <View style={styles.quickFillButtons}>
                    <Pressable
                      onPress={() => handleQuickFillAccount('customer')}
                      style={styles.quickFillBadge}
                      accessibilityRole="button"
                    >
                      <Ionicons name="person-circle-outline" size={13} color={colors.goldBright} />
                      <Text style={styles.quickFillBadgeText}>Customer Demo</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleQuickFillAccount('seller')}
                      style={styles.quickFillBadge}
                      accessibilityRole="button"
                    >
                      <Ionicons name="sparkles-outline" size={13} color={colors.goldBright} />
                      <Text style={styles.quickFillBadgeText}>Artisan Demo</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* ========================================================= */}
              {/* TAB 1: LOGIN                                              */}
              {/* ========================================================= */}
              {activeTab === 'login' && (
                <View style={styles.formContainer}>
                  <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeHeading}>Welcome Back</Text>
                    <Text style={styles.welcomeSubheading}>
                      Sign in with your email or registered mobile number to continue.
                    </Text>
                  </View>

                  {/* Identifier: Email or Mobile */}
                  <UnderlineInput
                    leftIcon="person-outline"
                    placeholder="Email or Mobile (+91)"
                    value={loginIdentifier}
                    onChangeText={(val) => {
                      setLoginIdentifier(val);
                      if (loginError) setLoginError(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!busy}
                    returnKeyType="next"
                  />

                  {/* Password with toggle */}
                  <UnderlineInput
                    leftIcon="lock-closed-outline"
                    rightIcon={showLoginPassword ? 'eye-outline' : 'eye-off-outline'}
                    onRightIconPress={() => setShowLoginPassword((p) => !p)}
                    placeholder="Password"
                    value={loginPassword}
                    onChangeText={(val) => {
                      setLoginPassword(val);
                      if (loginError) setLoginError(null);
                    }}
                    secureTextEntry={!showLoginPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!busy}
                    returnKeyType="done"
                    onSubmitEditing={handleLoginSubmit}
                  />

                  {/* Forgot Password */}
                  <View style={styles.forgotRow}>
                    <View style={styles.rememberMeRow}>
                      <Checkbox
                        checked={rememberMe}
                        onChange={setRememberMe}
                        label="Remember Me"
                        disabled={Boolean(busy)}
                      />
                    </View>

                    <Pressable
                      onPress={() => setShowResetModal(true)}
                      hitSlop={8}
                      accessibilityRole="button"
                    >
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </Pressable>
                  </View>

                  {/* Login Error Display */}
                  {loginError ? (
                    <View style={styles.errorBanner}>
                      <Ionicons name="alert-circle" size={16} color={colors.danger} />
                      <Text style={styles.errorBannerText}>{loginError}</Text>
                    </View>
                  ) : null}

                  {/* Submit Button */}
                  <View style={styles.buttonWrapper}>
                    <GoldButton
                      label="Sign In to KARIGAAR"
                      loadingLabel="Signing in…"
                      onPress={handleLoginSubmit}
                      loading={busy === 'submit'}
                      disabled={busy !== null}
                    />
                  </View>

                  {/* Social Divider */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Google OAuth Button */}
                  <GoogleButton onPress={handleGoogleSubmit} loading={busy === 'google'} />
                </View>
              )}

              {/* ========================================================= */}
              {/* TAB 2: CUSTOMER SIGN UP                                    */}
              {/* ========================================================= */}
              {activeTab === 'customer' && (
                <View style={styles.formContainer}>
                  <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeHeading}>Join as a Customer</Text>
                    <Text style={styles.welcomeSubheading}>
                      Discover genuine handmade treasures, connect with artisans & customize gifts.
                    </Text>
                  </View>

                  {/* Full Name */}
                  <UnderlineInput
                    leftIcon="person-outline"
                    placeholder="Full Name"
                    value={custName}
                    onChangeText={(val) => {
                      setCustName(val);
                      if (custErrors.name) setCustErrors((e) => ({ ...e, name: '' }));
                    }}
                    autoCapitalize="words"
                    error={custErrors.name}
                    editable={!busy}
                  />

                  {/* Email */}
                  <UnderlineInput
                    leftIcon="mail-outline"
                    placeholder="Email Address"
                    value={custEmail}
                    onChangeText={(val) => {
                      setCustEmail(val);
                      if (custErrors.email) setCustErrors((e) => ({ ...e, email: '' }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={custErrors.email}
                    editable={!busy}
                  />

                  {/* Mobile Number */}
                  <UnderlineInput
                    leftIcon="call-outline"
                    placeholder="Mobile Number (10 digits)"
                    value={custPhone}
                    onChangeText={(val) => {
                      setCustPhone(val);
                      if (custErrors.phone) setCustErrors((e) => ({ ...e, phone: '' }));
                    }}
                    keyboardType="phone-pad"
                    maxLength={14}
                    error={custErrors.phone}
                    editable={!busy}
                  />

                  {/* Password */}
                  <UnderlineInput
                    leftIcon="lock-closed-outline"
                    rightIcon={showCustPassword ? 'eye-outline' : 'eye-off-outline'}
                    onRightIconPress={() => setShowCustPassword((p) => !p)}
                    placeholder="Password (min 8 characters)"
                    value={custPassword}
                    onChangeText={(val) => {
                      setCustPassword(val);
                      if (custErrors.password) setCustErrors((e) => ({ ...e, password: '' }));
                    }}
                    secureTextEntry={!showCustPassword}
                    error={custErrors.password}
                    editable={!busy}
                  />

                  {/* Confirm Password */}
                  <UnderlineInput
                    leftIcon="shield-checkmark-outline"
                    rightIcon={showCustConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    onRightIconPress={() => setShowCustConfirmPassword((p) => !p)}
                    placeholder="Confirm Password"
                    value={custConfirmPassword}
                    onChangeText={(val) => {
                      setCustConfirmPassword(val);
                      if (custErrors.confirmPassword)
                        setCustErrors((e) => ({ ...e, confirmPassword: '' }));
                    }}
                    secureTextEntry={!showCustConfirmPassword}
                    error={custErrors.confirmPassword}
                    editable={!busy}
                  />

                  {/* Optional Avatar Selector */}
                  <View style={styles.avatarPickerSection}>
                    <Text style={styles.fieldSectionLabel}>Choose Profile Photo:</Text>
                    <View style={styles.avatarRow}>
                      {PRESET_AVATARS.map((url, idx) => (
                        <Pressable
                          key={idx}
                          onPress={() => setCustAvatar(url)}
                          style={[
                            styles.avatarOption,
                            custAvatar === url && styles.avatarOptionSelected,
                          ]}
                          accessibilityRole="button"
                        >
                          <Image source={{ uri: url }} style={styles.avatarThumb} />
                          {custAvatar === url && (
                            <View style={styles.avatarCheckmark}>
                              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* City and Locality Defaults */}
                  <View style={styles.twoColRow}>
                    <View style={styles.colHalf}>
                      <UnderlineInput
                        leftIcon="location-outline"
                        placeholder="City"
                        value={custCity}
                        onChangeText={setCustCity}
                        editable={!busy}
                      />
                    </View>
                    <View style={styles.colHalf}>
                      <UnderlineInput
                        leftIcon="home-outline"
                        placeholder="Locality"
                        value={custLocality}
                        onChangeText={setCustLocality}
                        editable={!busy}
                      />
                    </View>
                  </View>

                  {/* Terms and Consent Checkbox */}
                  <View style={styles.termsConsentRow}>
                    <Checkbox
                      checked={custTerms}
                      onChange={setCustTerms}
                      label=""
                      disabled={Boolean(busy)}
                    />
                    <Text style={styles.consentText}>
                      I agree to the{' '}
                      <Text
                        onPress={() => setShowPolicyModal('terms')}
                        style={styles.consentLink}
                      >
                        Terms of Service
                      </Text>{' '}
                      &{' '}
                      <Text
                        onPress={() => setShowPolicyModal('privacy')}
                        style={styles.consentLink}
                      >
                        Privacy Policy
                      </Text>
                      .
                    </Text>
                  </View>
                  {custErrors.terms ? (
                    <Text style={styles.fieldError}>{custErrors.terms}</Text>
                  ) : null}

                  {custErrors.form ? (
                    <View style={styles.errorBanner}>
                      <Ionicons name="alert-circle" size={16} color={colors.danger} />
                      <Text style={styles.errorBannerText}>{custErrors.form}</Text>
                    </View>
                  ) : null}

                  {/* Submit Button */}
                  <View style={styles.buttonWrapper}>
                    <GoldButton
                      label="Create Customer Account"
                      loadingLabel="Creating Account…"
                      onPress={handleCustomerSubmit}
                      loading={busy === 'submit'}
                      disabled={busy !== null}
                    />
                  </View>
                </View>
              )}

              {/* ========================================================= */}
              {/* TAB 3: SELLER / CREATOR SIGN UP                            */}
              {/* ========================================================= */}
              {activeTab === 'seller' && (
                <View style={styles.formContainer}>
                  <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeHeading}>Become a KARIGAAR Artisan</Text>
                    <Text style={styles.welcomeSubheading}>
                      Showcase your handmade craft, receive custom orders & enjoy transparent payouts.
                    </Text>
                  </View>

                  {/* Section 1: Artisan & Brand Info */}
                  <Text style={styles.groupHeading}>1. Artisan & Workshop Details</Text>

                  <UnderlineInput
                    leftIcon="person-outline"
                    placeholder="Your Full Name (Artisan)"
                    value={sellerName}
                    onChangeText={(val) => {
                      setSellerName(val);
                      if (sellerErrors.name) setSellerErrors((e) => ({ ...e, name: '' }));
                    }}
                    error={sellerErrors.name}
                    editable={!busy}
                  />

                  <UnderlineInput
                    leftIcon="sparkles-outline"
                    placeholder="Brand / Studio Name (e.g. Meera's Clayworks)"
                    value={sellerBrandName}
                    onChangeText={(val) => {
                      setSellerBrandName(val);
                      if (sellerErrors.brandName) setSellerErrors((e) => ({ ...e, brandName: '' }));
                    }}
                    error={sellerErrors.brandName}
                    editable={!busy}
                  />

                  <UnderlineInput
                    leftIcon="mail-outline"
                    placeholder="Studio Email Address"
                    value={sellerEmail}
                    onChangeText={(val) => {
                      setSellerEmail(val);
                      if (sellerErrors.email) setSellerErrors((e) => ({ ...e, email: '' }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={sellerErrors.email}
                    editable={!busy}
                  />

                  <UnderlineInput
                    leftIcon="call-outline"
                    placeholder="Artisan Mobile Number (10 digits)"
                    value={sellerPhone}
                    onChangeText={(val) => {
                      setSellerPhone(val);
                      if (sellerErrors.phone) setSellerErrors((e) => ({ ...e, phone: '' }));
                    }}
                    keyboardType="phone-pad"
                    maxLength={14}
                    error={sellerErrors.phone}
                    editable={!busy}
                  />

                  <UnderlineInput
                    leftIcon="lock-closed-outline"
                    rightIcon={showSellerPassword ? 'eye-outline' : 'eye-off-outline'}
                    onRightIconPress={() => setShowSellerPassword((p) => !p)}
                    placeholder="Create Password (min 8 chars)"
                    value={sellerPassword}
                    onChangeText={(val) => {
                      setSellerPassword(val);
                      if (sellerErrors.password) setSellerErrors((e) => ({ ...e, password: '' }));
                    }}
                    secureTextEntry={!showSellerPassword}
                    error={sellerErrors.password}
                    editable={!busy}
                  />

                  <UnderlineInput
                    leftIcon="shield-checkmark-outline"
                    rightIcon={showSellerConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    onRightIconPress={() => setShowSellerConfirmPassword((p) => !p)}
                    placeholder="Confirm Password"
                    value={sellerConfirmPassword}
                    onChangeText={(val) => {
                      setSellerConfirmPassword(val);
                      if (sellerErrors.confirmPassword)
                        setSellerErrors((e) => ({ ...e, confirmPassword: '' }));
                    }}
                    secureTextEntry={!showSellerConfirmPassword}
                    error={sellerErrors.confirmPassword}
                    editable={!busy}
                  />

                  <UnderlineInput
                    leftIcon="home-outline"
                    placeholder="Workshop / Studio Address"
                    value={sellerAddress}
                    onChangeText={(val) => {
                      setSellerAddress(val);
                      if (sellerErrors.address) setSellerErrors((e) => ({ ...e, address: '' }));
                    }}
                    error={sellerErrors.address}
                    editable={!busy}
                  />

                  <UnderlineInput
                    leftIcon="navigate-outline"
                    placeholder="Service Area (e.g. Pan-India, Pune, Maharashtra)"
                    value={sellerServiceArea}
                    onChangeText={setSellerServiceArea}
                    editable={!busy}
                  />

                  {/* Section 2: Craft Categories Multi-Select */}
                  <View style={styles.categoryPickerSection}>
                    <Text style={styles.fieldSectionLabel}>
                      Handmade Craft Categories <Text style={styles.requiredStar}>*</Text>:
                    </Text>
                    <View style={styles.categoryChipsWrap}>
                      {CRAFT_CATEGORIES.map((cat) => {
                        const selected = sellerCategories.includes(cat);
                        return (
                          <Pressable
                            key={cat}
                            onPress={() => toggleCategory(cat)}
                            style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                            accessibilityRole="button"
                          >
                            <Ionicons
                              name={selected ? 'checkmark-circle' : 'add-circle-outline'}
                              size={14}
                              color={selected ? colors.charcoal : colors.goldBright}
                            />
                            <Text
                              style={[
                                styles.categoryChipText,
                                selected && styles.categoryChipTextSelected,
                              ]}
                            >
                              {cat}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {sellerErrors.categories ? (
                      <Text style={styles.fieldError}>{sellerErrors.categories}</Text>
                    ) : null}
                  </View>

                  {/* Creator Bio / Story */}
                  <UnderlineInput
                    leftIcon="create-outline"
                    placeholder="Artisan Bio & Story (Materials, heritage, technique)"
                    value={sellerBio}
                    onChangeText={setSellerBio}
                    multiline
                    numberOfLines={3}
                    editable={!busy}
                  />

                  {/* Section 3: Payout & Bank Details */}
                  <Text style={styles.groupHeading}>2. Payout & Bank Information</Text>

                  <UnderlineInput
                    leftIcon="card-outline"
                    placeholder="Bank Account Number"
                    value={sellerBankAcc}
                    onChangeText={(val) => {
                      setSellerBankAcc(val);
                      if (sellerErrors.bankAcc) setSellerErrors((e) => ({ ...e, bankAcc: '' }));
                    }}
                    keyboardType="number-pad"
                    error={sellerErrors.bankAcc}
                    editable={!busy}
                  />

                  <UnderlineInput
                    leftIcon="business-outline"
                    placeholder="IFSC Code (e.g. HDFC0001248)"
                    value={sellerIfsc}
                    onChangeText={(val) => {
                      setSellerIfsc(val.toUpperCase());
                      if (sellerErrors.ifsc) setSellerErrors((e) => ({ ...e, ifsc: '' }));
                    }}
                    autoCapitalize="characters"
                    error={sellerErrors.ifsc}
                    editable={!busy}
                  />

                  <UnderlineInput
                    leftIcon="person-circle-outline"
                    placeholder="Bank Account Holder Name"
                    value={sellerAccHolder}
                    onChangeText={(val) => {
                      setSellerAccHolder(val);
                      if (sellerErrors.accHolder) setSellerErrors((e) => ({ ...e, accHolder: '' }));
                    }}
                    error={sellerErrors.accHolder}
                    editable={!busy}
                  />

                  <UnderlineInput
                    leftIcon="wallet-outline"
                    placeholder="UPI ID (e.g. artisan@okhdfcbank)"
                    value={sellerUpi}
                    onChangeText={setSellerUpi}
                    editable={!busy}
                  />

                  {/* Section 4: Tax & Compliance */}
                  <Text style={styles.groupHeading}>3. Tax & Business Compliance</Text>

                  <View style={styles.twoColRow}>
                    <View style={styles.colHalf}>
                      <UnderlineInput
                        leftIcon="document-text-outline"
                        placeholder="PAN Number"
                        value={sellerPan}
                        onChangeText={(val) => setSellerPan(val.toUpperCase())}
                        autoCapitalize="characters"
                        editable={!busy}
                      />
                    </View>
                    <View style={styles.colHalf}>
                      <UnderlineInput
                        leftIcon="receipt-outline"
                        placeholder="GSTIN (Optional)"
                        value={sellerGstin}
                        onChangeText={(val) => setSellerGstin(val.toUpperCase())}
                        autoCapitalize="characters"
                        editable={!busy}
                      />
                    </View>
                  </View>

                  {/* Terms & Artisan Charter Consent */}
                  <View style={styles.termsConsentRow}>
                    <Checkbox
                      checked={sellerTerms}
                      onChange={setSellerTerms}
                      label=""
                      disabled={Boolean(busy)}
                    />
                    <Text style={styles.consentText}>
                      I pledge to uphold the{' '}
                      <Text
                        onPress={() => setShowPolicyModal('charter')}
                        style={styles.consentLink}
                      >
                        KARIGAAR Artisan Charter
                      </Text>{' '}
                      and accept the maker fee & payout terms.
                    </Text>
                  </View>
                  {sellerErrors.terms ? (
                    <Text style={styles.fieldError}>{sellerErrors.terms}</Text>
                  ) : null}

                  {sellerErrors.form ? (
                    <View style={styles.errorBanner}>
                      <Ionicons name="alert-circle" size={16} color={colors.danger} />
                      <Text style={styles.errorBannerText}>{sellerErrors.form}</Text>
                    </View>
                  ) : null}

                  {/* Submit Button */}
                  <View style={styles.buttonWrapper}>
                    <GoldButton
                      label="Register as KARIGAAR Creator"
                      loadingLabel="Registering Studio…"
                      onPress={handleSellerSubmit}
                      loading={busy === 'submit'}
                      disabled={busy !== null}
                    />
                  </View>
                </View>
              )}

              {/* Bottom Switch Note */}
              <View style={styles.switchAuthRow}>
                <Text style={styles.switchAuthPrompt}>
                  {activeTab === 'login'
                    ? 'New to KARIGAAR? '
                    : 'Already registered on KARIGAAR? '}
                </Text>
                <Pressable
                  onPress={() => {
                    setActiveTab(activeTab === 'login' ? 'customer' : 'login');
                    setLoginError(null);
                    setCustErrors({});
                    setSellerErrors({});
                  }}
                  hitSlop={6}
                  accessibilityRole="button"
                >
                  <Text style={styles.switchAuthLink}>
                    {activeTab === 'login' ? 'Join as Customer or Creator' : 'Sign In'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Interactive 6-Digit OTP Verification Modal */}
      <OtpVerificationModal
        visible={showOtpModal}
        target={otpTarget}
        dispatchedCode={lastDispatchedOtp?.otp}
        onVerify={async (code) => {
          await verifyOtp(code);
          setShowOtpModal(false);
          showToast('Account verified successfully!');
        }}
        onResend={async () => {
          return await resendOtp();
        }}
        onClose={() => {
          setShowOtpModal(false);
          cancelVerification();
        }}
      />

      {/* Interactive Password Reset Modal */}
      <PasswordResetModal
        visible={showResetModal}
        initialIdentifier={loginIdentifier}
        onRequestOtp={async (id) => {
          return await requestPasswordReset(id);
        }}
        onConfirmReset={async (id, otp, newPass) => {
          return await confirmPasswordReset(id, otp, newPass);
        }}
        onClose={() => setShowResetModal(false)}
        onSuccessLogin={(id) => {
          setShowResetModal(false);
          setLoginIdentifier(id);
          setActiveTab('login');
          showToast('Password updated! Please log in with your new password.');
        }}
      />

      {/* Terms & Privacy & Charter Modal */}
      <TermsPolicyModal type={showPolicyModal} onClose={() => setShowPolicyModal(null)} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fullScreenBg: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  centerWrapper: {
    width: '100%',
    maxWidth: 620,
    alignItems: 'center',
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 20, 14, 0.88)',
    borderRadius: radius.xl,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.32)',
    ...shadow.lg,
  },
  glassCardDesktop: {
    paddingHorizontal: 36,
    paddingVertical: 36,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  toast: {
    position: 'absolute',
    top: 24,
    alignSelf: 'center',
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E140E',
    borderWidth: 1,
    borderColor: colors.goldBright,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    ...shadow.md,
  },
  toastText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.cream,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 8, 5, 0.60)',
    borderRadius: radius.full,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.20)',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: radius.full,
    gap: 5,
  },
  tabBtnActive: {
    backgroundColor: colors.gold,
  },
  tabBtnText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.creamDim,
  },
  tabBtnTextActive: {
    fontFamily: fonts.sans.semibold,
    color: colors.charcoal,
  },
  quickFillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(197, 147, 65, 0.12)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 6,
  },
  quickFillLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.creamDim,
  },
  quickFillButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickFillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(220, 175, 95, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.40)',
  },
  quickFillBadgeText: {
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    color: colors.goldBright,
  },
  welcomeSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  welcomeHeading: {
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    color: colors.cream,
    textAlign: 'center',
    marginBottom: 6,
  },
  welcomeSubheading: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.creamDim,
    textAlign: 'center',
    lineHeight: 19,
  },
  formContainer: {
    width: '100%',
  },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.goldBright,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(226, 109, 92, 0.15)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginVertical: 10,
  },
  errorBannerText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.danger,
    flex: 1,
  },
  buttonWrapper: {
    marginTop: 14,
    marginBottom: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(250, 246, 240, 0.12)',
  },
  dividerText: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.creamFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarPickerSection: {
    marginVertical: 12,
  },
  fieldSectionLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.creamDim,
    marginBottom: 8,
  },
  requiredStar: {
    color: colors.danger,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarOption: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatarOptionSelected: {
    borderColor: colors.goldBright,
  },
  avatarThumb: {
    width: '100%',
    height: '100%',
  },
  avatarCheckmark: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.gold,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  termsConsentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  consentText: {
    flex: 1,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.creamDim,
    lineHeight: 18,
  },
  consentLink: {
    fontFamily: fonts.sans.semibold,
    color: colors.goldBright,
    textDecorationLine: 'underline',
  },
  fieldError: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.danger,
    marginTop: 2,
    marginBottom: 6,
  },
  groupHeading: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: colors.goldBright,
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(220, 175, 95, 0.20)',
    paddingBottom: 4,
  },
  categoryPickerSection: {
    marginVertical: 12,
  },
  categoryChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.30)',
  },
  categoryChipSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.goldBright,
  },
  categoryChipText: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.cream,
  },
  categoryChipTextSelected: {
    fontFamily: fonts.sans.semibold,
    color: colors.charcoal,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  switchAuthPrompt: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.creamFaint,
  },
  switchAuthLink: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.goldBright,
    textDecorationLine: 'underline',
  },
});