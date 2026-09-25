import { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Checkbox } from '../components/Checkbox';
import { GoldButton } from '../components/GoldButton';
import { GoogleButton } from '../components/GoogleButton';
import { Logo } from '../components/Logo';
import { UnderlineInput } from '../components/UnderlineInput';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, shadow } from '../theme';

const bgAsset = require('../../assets/craft_workshop_blurred.jpg');

type ScreenMode = 'login' | 'register';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function WelcomeScreen() {
  const { signIn } = useAuth();

  // Screen state
  const [mode, setMode] = useState<ScreenMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Busy state
  const [busy, setBusy] = useState<'submit' | 'google' | null>(null);

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState<'terms' | 'privacy' | null>(null);

  // Animations (state-initialized to avoid accessing ref.current during render)
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(24));
  const [shakeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -7, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 7, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -3, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const validateForm = (): boolean => {
    let valid = true;

    // Email validation
    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError(null);
    }

    // Password validation
    if (!password) {
      setPasswordError('Please enter your password.');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must contain at least 8 characters.');
      valid = false;
    } else {
      setPasswordError(null);
    }

    // Register mode name validation
    if (mode === 'register') {
      if (!fullName.trim()) {
        setNameError('Please enter your full name.');
        valid = false;
      } else {
        setNameError(null);
      }
    }

    if (!valid) {
      triggerShake();
    }

    return valid;
  };

  const handleLoginSubmit = async () => {
    if (busy) return;
    if (!validateForm()) return;

    setBusy('submit');
    try {
      await signIn({
        identifier: email.trim(),
        method: 'email',
        mode: mode === 'register' ? 'signup' : 'signin',
      });
    } catch {
      setPasswordError('Sign in failed. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const handleGoogleSubmit = async () => {
    if (busy) return;
    setBusy('google');
    try {
      await signIn({
        identifier: 'Google Account',
        method: 'google',
        mode: mode === 'register' ? 'signup' : 'signin',
      });
    } catch {
      setEmailError('Google sign in could not be completed.');
    } finally {
      setBusy(null);
    }
  };

  const handleForgotPasswordSubmit = () => {
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(forgotEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setForgotError(null);
    setForgotSent(true);
  };

  return (
    <ImageBackground
      source={bgAsset}
      resizeMode="cover"
      style={styles.fullScreenBg}
    >
      {/* Cinematic dark warm-brown overlay */}
      <LinearGradient
        colors={['rgba(35, 20, 12, 0.42)', 'rgba(25, 14, 8, 0.60)']}
        style={StyleSheet.absoluteFill}
      />

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
            {/* Glassmorphism Card */}
            <View style={styles.glassCard}>
              {/* 1. KARIGAAR Logo with Hindi mark & emblem */}
              <View style={styles.logoContainer}>
                <Logo size="lg" showTagline />
              </View>

              {/* 3. Welcome Section */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeHeading}>
                  {mode === 'login' ? 'Welcome to KARIGAAR' : 'Create an Account'}
                </Text>
                <Text style={styles.welcomeSubheading}>
                  {mode === 'login'
                    ? 'Discover. Create. Connect.'
                    : 'Join our handmade marketplace community.'}
                </Text>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                {mode === 'register' && (
                  <UnderlineInput
                    leftIcon="person-outline"
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={(val) => {
                      setFullName(val);
                      if (nameError) setNameError(null);
                    }}
                    autoCapitalize="words"
                    error={nameError}
                    editable={!busy}
                  />
                )}

                {/* 5. Email field */}
                <UnderlineInput
                  leftIcon="mail-outline"
                  rightAction={
                    email.trim() && !emailError && isValidEmail(email) ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.goldBright} />
                    ) : null
                  }
                  placeholder="Email"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (emailError) setEmailError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  accessibilityLabel="Email"
                  error={emailError}
                  editable={!busy}
                  returnKeyType="next"
                />

                {/* 6. Password field */}
                <UnderlineInput
                  leftIcon="lock-closed-outline"
                  rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  onRightIconPress={() => setShowPassword((prev) => !prev)}
                  placeholder="Password"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (passwordError) setPasswordError(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Password"
                  textContentType={mode === 'register' ? 'newPassword' : 'password'}
                  error={passwordError}
                  editable={!busy}
                  returnKeyType="done"
                  onSubmitEditing={handleLoginSubmit}
                />

                {/* 7. Forgot Password (right aligned) */}
                {mode === 'login' && (
                  <Pressable
                    onPress={() => {
                      setForgotEmail(email);
                      setForgotSent(false);
                      setForgotError(null);
                      setShowForgotModal(true);
                    }}
                    hitSlop={8}
                    style={styles.forgotPasswordContainer}
                    accessibilityRole="button"
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </Pressable>
                )}

                {/* 8. Remember Me */}
                <View style={styles.rememberMeRow}>
                  <Checkbox
                    checked={rememberMe}
                    onChange={setRememberMe}
                    label="Remember Me"
                    disabled={Boolean(busy)}
                  />
                </View>

                {/* 9. Login / Register Button */}
                <View style={styles.buttonWrapper}>
                  <GoldButton
                    label={mode === 'login' ? 'Login' : 'Create Account'}
                    loadingLabel={mode === 'login' ? 'Signing in…' : 'Creating account…'}
                    onPress={handleLoginSubmit}
                    loading={busy === 'submit'}
                    disabled={busy !== null}
                  />
                </View>

                {/* 10. Register Option */}
                <View style={styles.switchAuthRow}>
                  <Text style={styles.switchAuthPrompt}>
                    {mode === 'login' ? "Don't have an Account? " : 'Already have an account? '}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setMode((m) => (m === 'login' ? 'register' : 'login'));
                      setEmailError(null);
                      setPasswordError(null);
                      setNameError(null);
                    }}
                    hitSlop={6}
                    accessibilityRole="button"
                  >
                    <Text style={styles.switchAuthLink}>
                      {mode === 'login' ? 'Register' : 'Login'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Divider before social login */}
              <View style={styles.socialDivider} />

              {/* 11. Google Login Pill Button */}
              <View style={styles.googleContainer}>
                <GoogleButton onPress={handleGoogleSubmit} loading={busy === 'google'} />
              </View>

              {/* 12. Terms & Privacy */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By continuing, you agree to our{' '}
                  <Text
                    onPress={() => setShowPolicyModal('terms')}
                    style={styles.termsLink}
                  >
                    Terms
                  </Text>{' '}
                  &{' '}
                  <Text
                    onPress={() => setShowPolicyModal('privacy')}
                    style={styles.termsLink}
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <Pressable
                onPress={() => setShowForgotModal(false)}
                hitSlop={10}
                accessibilityRole="button"
              >
                <Ionicons name="close" size={22} color={colors.creamMuted} />
              </Pressable>
            </View>

            {forgotSent ? (
              <View style={styles.modalSuccessBlock}>
                <Ionicons name="checkmark-circle-outline" size={44} color={colors.goldBright} />
                <Text style={styles.modalSuccessTitle}>Reset Link Sent</Text>
                <Text style={styles.modalSuccessBody}>
                  If an account exists for {forgotEmail}, you will receive password reset
                  instructions shortly.
                </Text>
                <View style={{ marginTop: 20, width: '100%' }}>
                  <GoldButton
                    label="Back to Login"
                    onPress={() => setShowForgotModal(false)}
                  />
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>
                  Enter the email address associated with your KARIGAAR account and we will send
                  you instructions to reset your password.
                </Text>

                <UnderlineInput
                  leftIcon="mail-outline"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChangeText={(val) => {
                    setForgotEmail(val);
                    if (forgotError) setForgotError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={forgotError}
                />

                <View style={{ marginTop: 20 }}>
                  <GoldButton
                    label="Send Reset Link"
                    loadingLabel="Sending…"
                    onPress={handleForgotPasswordSubmit}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Terms & Privacy Policy Modal */}
      <Modal
        visible={showPolicyModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPolicyModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showPolicyModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </Text>
              <Pressable
                onPress={() => setShowPolicyModal(null)}
                hitSlop={10}
                accessibilityRole="button"
              >
                <Ionicons name="close" size={22} color={colors.creamMuted} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.policyText}>
                {showPolicyModal === 'terms'
                  ? 'Welcome to KARIGAAR. By accessing or using our marketplace, you agree to respect and celebrate the intellectual property, crafts, and heritage of genuine artisans across India. We ensure fair compensation, authentic handmade goods, transparent transactions, and community-first trade policies.'
                  : 'At KARIGAAR, we respect your privacy. We protect customer and artisan data with industry-standard encryption. We never sell your personal information to third parties. Data collected is solely used to deliver an authentic, seamless craft shopping and selling experience.'}
              </Text>
            </ScrollView>

            <View style={{ marginTop: 18 }}>
              <GoldButton
                label="I Understand"
                onPress={() => setShowPolicyModal(null)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fullScreenBg: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.walnutDark,
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
    maxWidth: 540,
    alignItems: 'center',
  },
  glassCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassCardBorder,
    backgroundColor: colors.glassCard,
    paddingHorizontal: 36,
    paddingTop: 36,
    paddingBottom: 32,
    ...shadow.card,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.40)',
        } as never)
      : {}),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeHeading: {
    color: colors.cream,
    fontFamily: fonts.serif.bold,
    fontSize: 27,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  welcomeSubheading: {
    color: colors.beige,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    letterSpacing: 0.5,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
    gap: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: colors.gold,
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    letterSpacing: 0.2,
  },
  rememberMeRow: {
    marginVertical: 10,
  },
  buttonWrapper: {
    marginTop: 6,
    marginBottom: 14,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  switchAuthPrompt: {
    color: colors.creamMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
  },
  switchAuthLink: {
    color: colors.goldBright,
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
  },
  googleContainer: {
    width: '100%',
    maxWidth: 340,
    marginTop: 22,
    alignSelf: 'center',
  },
  socialDivider: {
    height: 1,
    backgroundColor: colors.goldFaint,
    marginTop: 24,
  },
  termsContainer: {
    marginTop: 18,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    color: colors.creamFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.gold,
    textDecorationLine: 'underline',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 4, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        } as never)
      : {}),
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassCardBorder,
    padding: 24,
    ...shadow.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: colors.cream,
    fontFamily: fonts.serif.bold,
    fontSize: 21,
  },
  modalSubtitle: {
    color: colors.creamMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalSuccessBlock: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalSuccessTitle: {
    color: colors.cream,
    fontFamily: fonts.serif.bold,
    fontSize: 19,
    marginTop: 12,
  },
  modalSuccessBody: {
    color: colors.creamMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  policyText: {
    color: colors.creamMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 22,
  },
});