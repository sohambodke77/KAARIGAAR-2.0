import { useCallback, useMemo, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoldButton } from '../components/GoldButton';
import { GoogleButton } from '../components/GoogleButton';
import { InputField } from '../components/InputField';
import { Logo } from '../components/Logo';
import { SegmentedControl, type SegmentOption } from '../components/SegmentedControl';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing } from '../theme';

type Mode = 'signin' | 'signup';

function validate(value: string, method: SegmentOption): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your mobile number or email';

  if (method === 'email') {
    return /\S+@\S+\.\S+/.test(trimmed) ? null : 'Enter a valid email address';
  }

  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 12 ? null : 'Enter a valid mobile number';
}

export function WelcomeScreen() {
  const { signIn } = useAuth();

  const [method, setMethod] = useState<SegmentOption>('mobile');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'continue' | 'google' | null>(null);
  const [mode, setMode] = useState<Mode>('signin');

  const [shake] = useState(() => new Animated.Value(0));

  const runShake = useCallback(() => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: -9, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 9, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -5, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 5, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  }, [shake]);

  const submit = useCallback(
    async (kind: 'continue' | 'google') => {
      if (busy) return;

      if (kind === 'continue') {
        const message = validate(value, method);
        if (message) {
          setError(message);
          runShake();
          return;
        }
      }
      setError(null);

      setBusy(kind);
      try {
        await signIn({
          identifier: kind === 'google' ? 'Google account' : value.trim(),
          method: kind === 'google' ? 'google' : method === 'email' ? 'email' : 'phone',
          mode,
        });
        await new Promise((resolve) => setTimeout(resolve, 700));
      } finally {
        setBusy(null);
      }
    },
    [busy, method, mode, runShake, signIn, value],
  );

  const icon = useMemo(() => (method === 'email' ? 'mail-outline' : 'call-outline'), [method]) as
    | 'mail-outline'
    | 'call-outline';

  const placeholder = method === 'email' ? 'you@example.com' : '98765 43210';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoBlock}>
            <Logo showTagline />
          </View>

          <View style={styles.headingBlock}>
            <Text style={styles.heading}>Welcome to KARIGAAR</Text>
            <Text style={styles.subheading}>Discover. Create. Connect.</Text>
          </View>

          <View style={styles.formBlock}>
            <SegmentedControl value={method} onChange={setMethod} />

            <Animated.View style={{ transform: [{ translateX: shake }] }}>
              <InputField
                icon={icon}
                value={value}
                onChangeText={(text) => {
                  setValue(text);
                  if (error) setError(null);
                }}
                placeholder={placeholder}
                keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType={method === 'email' ? 'emailAddress' : 'telephoneNumber'}
                returnKeyType="done"
                onSubmitEditing={() => submit('continue')}
                error={error}
                editable={!busy}
              />
            </Animated.View>

            <GoldButton label="Continue" onPress={() => submit('continue')} loading={busy === 'continue'} disabled={busy !== null} />

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>

            <GoogleButton onPress={() => submit('google')} loading={busy === 'google'} />
          </View>

          <View style={styles.spacer} />

          <Text style={styles.terms}>
            By continuing, you agree to our <Text style={styles.termLink}>Terms</Text> &{' '}
            <Text style={styles.termLink}>Privacy Policy</Text>.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerBase}>
              {mode === 'signin' ? 'New to KARIGAAR? ' : 'Already have an account? '}
            </Text>
            <Text
              onPress={() => {
                setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
                setError(null);
              }}
              style={styles.footerAction}
            >
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingBottom: 12,
  },
  logoBlock: {
    alignItems: 'center',
    marginTop: 58,
  },
  headingBlock: {
    alignItems: 'center',
    marginTop: 44,
  },
  heading: {
    color: colors.cream,
    fontFamily: fonts.serif.bold,
    fontSize: 30,
    textAlign: 'center',
  },
  subheading: {
    color: colors.creamDim,
    fontFamily: fonts.sans.medium,
    fontSize: 15.5,
    letterSpacing: 1.6,
    marginTop: 10,
    textAlign: 'center',
  },
  formBlock: {
    marginTop: 44,
    gap: 14,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 2,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  orText: {
    color: colors.creamFaint,
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  terms: {
    color: colors.creamFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termLink: {
    color: colors.gold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingBottom: 8,
  },
  footerBase: {
    color: colors.creamDim,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
  },
  footerAction: {
    color: colors.gold,
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
  },
});