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

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await signIn({ email, password });
      router.replace('/(app)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // The auth context will handle the redirect after successful login
    } catch (error: any) {
      Alert.alert('Google Login Failed', error.message);
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
          source={require('@/assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        /> */}
        <Text variant="h2" style={styles.title}>
          Welcome Back
        </Text>
        <Text
          variant="body1"
          color={theme.colors.textLight}
          style={styles.subtitle}
        >
          Sign in to continue to Rivo Real Estate
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
          error={errors.email}
        />

        <TextInput
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          <Text variant="body2" color={theme.colors.primary}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <Button
          title="Sign In"
          onPress={handleLogin}
          isLoading={isLoading}
          fullWidth
          style={styles.signInButton}
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
          title="Sign In with Google"
          variant="outline"
          onPress={handleGoogleLogin}
          fullWidth
          style={styles.googleButton}
        />
      </View>

      <View style={styles.footer}>
        <Text variant="body2" color={theme.colors.textLight}>
          Don't have an account?
        </Text>
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.signUpLink}>
            <Text variant="body2" color={theme.colors.primary}>
              Sign Up
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
    marginBottom: 40,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  signInButton: {
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
  signUpLink: {
    marginLeft: 4,
  },
});
