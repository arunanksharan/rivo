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
import { Link, useRouter } from 'expo-router';

export default function SignupScreen() {
  const { theme } = useTheme();
  const { signUp, signInWithGoogle, isLoading } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [debugLog, setDebugLog] = useState<string>('');

  const addDebugLog = (message: string) => {
    setDebugLog(prev => `${prev}\n${message}`);
    console.log(message);
  };

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      addDebugLog(`Starting signup process... ${email}`);
      await signUp({
        email,
        password,
        firstName,
        lastName,
      });
      addDebugLog('Signup successful');
      Alert.alert(
        'Registration Successful',
        'Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      const errorMsg = `Signup failed: ${error.message}`;
      addDebugLog(errorMsg);
      Alert.alert('Registration Failed', error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      addDebugLog('Signing up with Google...');
      await signInWithGoogle();
      // The auth context will handle the redirect after successful signup
    } catch (error: any) {
      const errorMsg = `Google signup failed: ${error.message}`;
      addDebugLog(errorMsg);
      Alert.alert('Google Signup Failed', error.message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoContainer}>
        {/* <Image
          source={require('../../../src/assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        /> */}
        <Text variant="h2" style={styles.title}>
          Create Account
        </Text>
        <Text
          variant="body1"
          style={[styles.subtitle, { color: theme.colors.text }]}
        >
          Sign up to get started with Rivo
        </Text>
      </View>

      {/* Debug log display */}
      {__DEV__ && debugLog ? (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>{debugLog}</Text>
        </View>
      ) : null}

      <View style={styles.formContainer}>
        <View style={styles.nameRow}>
          <TextInput
            label="First Name"
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
            error={errors.firstName}
            containerStyle={styles.nameInput}
          />
          <View style={styles.nameGap} />
          <TextInput
            label="Last Name"
            placeholder="Enter your last name"
            value={lastName}
            onChangeText={setLastName}
            error={errors.lastName}
            containerStyle={styles.nameInput}
          />
        </View>

        <TextInput
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />

        <TextInput
          label="Password"
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        <TextInput
          label="Confirm Password"
          placeholder="Confirm your password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
        />

        <Button
          title="Sign Up"
          onPress={handleSignup}
          isLoading={isLoading}
          fullWidth
          style={styles.signUpButton}
        />

        <View style={styles.orContainer}>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
          <Text
            variant="body2"
            color={theme.colors.textLight}
            style={styles.orText}
          >
            OR
          </Text>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
        </View>

        <Button
          title="Sign Up with Google"
          variant="outline"
          onPress={handleGoogleSignup}
          fullWidth
          style={styles.googleButton}
        />
      </View>

      <View style={styles.footer}>
        <Text variant="body2" color={theme.colors.textLight}>
          Already have an account?
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.signInLink}>
            <Text variant="body2" color={theme.colors.primary}>
              Sign In
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
  },
  nameInput: {
    flex: 1,
  },
  nameGap: {
    width: 16,
  },
  signUpButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 16,
  },
  googleButton: {
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signInLink: {
    marginLeft: 4,
  },
  debugContainer: {
    margin: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
