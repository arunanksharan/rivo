import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthUser, SignInParams, SignUpParams, UpdateProfileParams } from '@/services/authService';
import { logger } from '@/utils/logger';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (params: SignInParams) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (params: UpdateProfileParams) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'Auth session missing!') {
          // Don't treat missing auth session as an error for new users
          // Just set the user to null and continue
          setUser(null);
        } else {
          logger.error('Error checking authentication status:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const signIn = async (params: SignInParams) => {
    setError(null);
    setIsLoading(true);

    try {
      const user = await authService.signIn(params);
      setUser(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during sign in');
      }
      logger.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (params: SignUpParams) => {
    setError(null);
    setIsLoading(true);

    try {
      const user = await authService.signUp(params);
      setUser(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during sign up');
      }
      logger.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const user = await authService.signInWithGoogle();
      setUser(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during Google sign in');
      }
      logger.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await authService.signOut();
      setUser(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during sign out');
      }
      logger.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (params: UpdateProfileParams) => {
    setError(null);
    setIsLoading(true);

    try {
      const updatedUser = await authService.updateProfile(params);
      setUser(updatedUser);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during profile update');
      }
      logger.error('Update profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    setIsLoading(true);

    try {
      await authService.resetPassword(email);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during password reset');
      }
      logger.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
