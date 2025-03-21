import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { resetPassword, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    }

    setEmailError(undefined);
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error: any) {
      Alert.alert('Reset Password Failed', error.message);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        {!isSubmitted ? (
          <>
            <View style={styles.headerContainer}>
              {/* <Image
                source={require('../../../src/assets/icon.png')}
                style={styles.image}
                resizeMode="contain"
              /> */}
              <Text variant="h2" style={styles.title}>
                Forgot Password
              </Text>
              <Text
                variant="body1"
                color={theme.colors.textLight}
                style={styles.subtitle}
              >
                Enter your email address and we'll send you a link to reset your
                password
              </Text>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                error={emailError}
                onBlur={validateEmail}
              />

              <Button
                title="Reset Password"
                onPress={handleResetPassword}
                isLoading={isLoading}
                fullWidth
                style={styles.resetButton}
              />

              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={handleBackToLogin}
              >
                <Text variant="body2" color={theme.colors.primary}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.successContainer}>
            <View
              style={[
                styles.successIconContainer,
                { backgroundColor: theme.colors.success + '20' },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={theme.colors.success}
              />
            </View>

            <Text variant="h2" style={styles.successTitle}>
              Email Sent
            </Text>

            <Text
              variant="body1"
              color={theme.colors.textLight}
              style={styles.successText}
            >
              We've sent a password reset link to:
            </Text>

            <Text variant="subtitle1" style={styles.emailText}>
              {email}
            </Text>

            <Text
              variant="body2"
              color={theme.colors.textLight}
              style={styles.instructionText}
            >
              Please check your email and follow the instructions to reset your
              password. If you don't see the email, check your spam folder.
            </Text>

            <Button
              title="Back to Login"
              onPress={handleBackToLogin}
              fullWidth
              style={styles.backToLoginSuccessButton}
            />

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResetPassword}
            >
              <Text variant="body2" color={theme.colors.primary}>
                Didn't receive the email? Resend
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  formContainer: {
    width: '100%',
  },
  resetButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  backToLoginButton: {
    alignSelf: 'center',
    padding: 8,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    marginBottom: 16,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    marginBottom: 24,
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 32,
  },
  backToLoginSuccessButton: {
    marginBottom: 16,
  },
  resendButton: {
    padding: 8,
  },
});
