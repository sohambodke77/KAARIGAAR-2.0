import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, radius, shadow } from '../theme';
import { GoldButton } from './GoldButton';

interface OtpVerificationModalProps {
  visible: boolean;
  target: string;
  dispatchedCode?: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<string>;
  onClose: () => void;
  title?: string;
}

export function OtpVerificationModal({
  visible,
  target,
  dispatchedCode,
  onVerify,
  onResend,
  onClose,
  title = 'Verify Your Account',
}: OtpVerificationModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [activeDispatchedCode, setActiveDispatchedCode] = useState(dispatchedCode);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setCode('');
      setError(null);
      setCooldown(30);
      setActiveDispatchedCode(dispatchedCode);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [visible, dispatchedCode]);

  // Countdown timer for resend
  useEffect(() => {
    if (!visible || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [visible, cooldown]);

  const handleVerify = async () => {
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onVerify(code.trim());
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check the code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const newCode = await onResend();
      setActiveDispatchedCode(newCode);
      setCooldown(30);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleQuickFill = () => {
    if (activeDispatchedCode) {
      setCode(activeDispatchedCode);
      setError(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={24} color={colors.goldBright} />
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn} accessibilityRole="button">
              <Ionicons name="close" size={20} color={colors.creamDim} />
            </Pressable>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            We have sent a 6-digit security code to{' '}
            <Text style={styles.targetHighlight}>{target}</Text>
          </Text>

          {/* Real-time KARIGAAR Security Dispatch Card */}
          {activeDispatchedCode ? (
            <Pressable onPress={handleQuickFill} style={styles.dispatchBanner}>
              <View style={styles.dispatchHeader}>
                <Ionicons name="notifications-outline" size={14} color={colors.goldBright} />
                <Text style={styles.dispatchHeaderText}>KARIGAAR Security Dispatch</Text>
              </View>
              <Text style={styles.dispatchBody}>
                Your code is <Text style={styles.dispatchCode}>{activeDispatchedCode}</Text>
              </Text>
              <Text style={styles.dispatchTapToFill}>Tap to auto-fill code</Text>
            </Pressable>
          ) : null}

          {/* 6-Digit Code Display Boxes */}
          <View style={styles.codeBoxesContainer}>
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const digit = code[index] || '';
              const isCurrent = code.length === index;
              return (
                <Pressable
                  key={index}
                  onPress={() => inputRef.current?.focus()}
                  style={[
                    styles.codeBox,
                    Boolean(digit) && styles.codeBoxFilled,
                    isCurrent && styles.codeBoxActive,
                    Boolean(error) && styles.codeBoxError,
                  ]}
                >
                  <Text style={styles.codeBoxText}>{digit}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Hidden TextInput for native keyboard entry */}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(val) => {
              const cleaned = val.replace(/[^0-9]/g, '').slice(0, 6);
              setCode(cleaned);
              if (error) setError(null);
            }}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.hiddenInput}
            autoFocus
          />

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Resend Cooldown */}
          <View style={styles.resendRow}>
            {cooldown > 0 ? (
              <Text style={styles.resendCooldownText}>
                Resend code in <Text style={styles.cooldownSeconds}>{cooldown}s</Text>
              </Text>
            ) : (
              <Pressable onPress={handleResend} disabled={resending} style={styles.resendBtn}>
                {resending ? (
                  <ActivityIndicator size="small" color={colors.goldBright} />
                ) : (
                  <Text style={styles.resendBtnText}>Resend Security Code</Text>
                )}
              </Pressable>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <GoldButton
              label="Verify & Continue"
              loadingLabel="Verifying…"
              loading={submitting}
              onPress={handleVerify}
              disabled={code.length < 6 || submitting}
            />
          </View>

          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Change Email or Mobile</Text>
          </Pressable>
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(197, 147, 65, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    color: colors.cream,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.creamDim,
    lineHeight: 19,
    marginBottom: 18,
  },
  targetHighlight: {
    fontFamily: fonts.sans.semibold,
    color: colors.goldBright,
  },
  dispatchBanner: {
    backgroundColor: 'rgba(197, 147, 65, 0.14)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.40)',
    padding: 12,
    marginBottom: 20,
  },
  dispatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dispatchHeaderText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: colors.goldBright,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  dispatchBody: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.cream,
    marginVertical: 2,
  },
  dispatchCode: {
    fontFamily: fonts.sans.bold,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dispatchTapToFill: {
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    color: colors.goldLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  codeBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  codeBox: {
    flex: 1,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(220, 175, 95, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFilled: {
    borderColor: colors.goldBright,
    backgroundColor: 'rgba(197, 147, 65, 0.12)',
  },
  codeBoxActive: {
    borderColor: colors.goldLight,
    borderWidth: 2,
  },
  codeBoxError: {
    borderColor: colors.danger,
  },
  codeBoxText: {
    fontFamily: fonts.sans.bold,
    fontSize: 22,
    color: colors.cream,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.danger,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendCooldownText: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.creamFaint,
  },
  cooldownSeconds: {
    fontFamily: fonts.sans.semibold,
    color: colors.goldLight,
  },
  resendBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  resendBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.goldBright,
    textDecorationLine: 'underline',
  },
  actionRow: {
    marginBottom: 12,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.creamFaint,
  },
});
