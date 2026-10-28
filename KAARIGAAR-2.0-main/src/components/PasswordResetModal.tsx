import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, radius, shadow } from '../theme';
import { GoldButton } from './GoldButton';
import { UnderlineInput } from './UnderlineInput';

interface PasswordResetModalProps {
  visible: boolean;
  initialIdentifier?: string;
  onRequestOtp: (identifier: string) => Promise<{ otp: string; target: string }>;
  onConfirmReset: (identifier: string, otp: string, newPassword: string) => Promise<boolean>;
  onClose: () => void;
  onSuccessLogin: (identifier: string) => void;
}

type Step = 'request' | 'verify_and_new' | 'success';

export function PasswordResetModal({
  visible,
  initialIdentifier = '',
  onRequestOtp,
  onConfirmReset,
  onClose,
  onSuccessLogin,
}: PasswordResetModalProps) {
  const [step, setStep] = useState<Step>('request');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);
  const [targetDisplay, setTargetDisplay] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetState = () => {
    setStep('request');
    setError(null);
    setEnteredOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setDispatchedOtp(null);
  };

  const handleRequestOtp = async () => {
    if (!identifier.trim()) {
      setError('Please enter your registered email or mobile number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await onRequestOtp(identifier.trim());
      setDispatchedOtp(result.otp);
      setTargetDisplay(result.target);
      setStep('verify_and_new');
    } catch (err: any) {
      setError(err?.message || 'Could not find an account with that identifier.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!enteredOtp.trim() || enteredOtp.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirmReset(identifier.trim(), enteredOtp.trim(), newPassword);
      setStep('success');
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        handleResetState();
        onClose();
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={step === 'success' ? 'checkmark-circle' : 'key-outline'}
                size={22}
                color={colors.goldBright}
              />
            </View>
            <Pressable
              onPress={() => {
                handleResetState();
                onClose();
              }}
              hitSlop={10}
              accessibilityRole="button"
            >
              <Ionicons name="close" size={20} color={colors.creamDim} />
            </Pressable>
          </View>

          {step === 'request' && (
            <View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter the email address or mobile number linked to your KARIGAAR account to receive a security code.
              </Text>

              <UnderlineInput
                leftIcon="person-outline"
                placeholder="Email or Mobile (+91)"
                value={identifier}
                onChangeText={(val) => {
                  setIdentifier(val);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                error={error}
                editable={!loading}
              />

              <View style={styles.buttonWrapper}>
                <GoldButton
                  label="Send Security Code"
                  loadingLabel="Sending code…"
                  loading={loading}
                  onPress={handleRequestOtp}
                  disabled={loading}
                />
              </View>
            </View>
          )}

          {step === 'verify_and_new' && (
            <View>
              <Text style={styles.title}>Enter Code & New Password</Text>
              <Text style={styles.subtitle}>
                A 6-digit code was sent to <Text style={styles.highlight}>{targetDisplay}</Text>.
              </Text>

              {dispatchedOtp ? (
                <Pressable
                  onPress={() => {
                    setEnteredOtp(dispatchedOtp);
                    setError(null);
                  }}
                  style={styles.dispatchBanner}
                >
                  <Text style={styles.dispatchTitle}>🔐 Security Code Dispatched:</Text>
                  <Text style={styles.dispatchCode}>{dispatchedOtp}</Text>
                  <Text style={styles.tapToFill}>Tap to auto-fill</Text>
                </Pressable>
              ) : null}

              <UnderlineInput
                leftIcon="shield-checkmark-outline"
                placeholder="6-Digit Security Code"
                value={enteredOtp}
                onChangeText={(val) => {
                  setEnteredOtp(val.replace(/[^0-9]/g, '').slice(0, 6));
                  if (error) setError(null);
                }}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />

              <UnderlineInput
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setShowPassword((p) => !p)}
                placeholder="New Password (min 8 chars)"
                value={newPassword}
                onChangeText={(val) => {
                  setNewPassword(val);
                  if (error) setError(null);
                }}
                secureTextEntry={!showPassword}
                editable={!loading}
              />

              <UnderlineInput
                leftIcon="lock-closed-outline"
                rightIcon={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                onRightIconPress={() => setShowConfirmPassword((p) => !p)}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (error) setError(null);
                }}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />

              {error ? (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle-outline" size={13} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.buttonWrapper}>
                <GoldButton
                  label="Update Password"
                  loadingLabel="Updating…"
                  loading={loading}
                  onPress={handleConfirmReset}
                  disabled={loading}
                />
              </View>

              <Pressable
                onPress={() => setStep('request')}
                style={styles.backBtn}
                accessibilityRole="button"
              >
                <Text style={styles.backBtnText}>← Change Email or Mobile</Text>
              </Pressable>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.successContainer}>
              <Text style={styles.title}>Password Reset Successful!</Text>
              <Text style={styles.subtitle}>
                Your KARIGAAR account password has been updated securely. You can now log in with your new credentials.
              </Text>

              <View style={styles.buttonWrapper}>
                <GoldButton
                  label="Log In Now"
                  onPress={() => {
                    handleResetState();
                    onSuccessLogin(identifier);
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 4, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1E140E',
    borderRadius: radius.xl,
    padding: 26,
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.35)',
    ...shadow.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(197, 147, 65, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.serif.bold,
    fontSize: 21,
    color: colors.cream,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.creamDim,
    lineHeight: 19,
    marginBottom: 16,
  },
  highlight: {
    fontFamily: fonts.sans.semibold,
    color: colors.goldBright,
  },
  dispatchBanner: {
    backgroundColor: 'rgba(197, 147, 65, 0.15)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.40)',
    padding: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dispatchTitle: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.cream,
  },
  dispatchCode: {
    fontFamily: fonts.sans.bold,
    fontSize: 16,
    color: colors.goldBright,
    letterSpacing: 2,
  },
  tapToFill: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    color: colors.goldLight,
    fontStyle: 'italic',
  },
  buttonWrapper: {
    marginTop: 18,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.danger,
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  backBtnText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.creamFaint,
  },
  successContainer: {
    paddingVertical: 10,
  },
});
