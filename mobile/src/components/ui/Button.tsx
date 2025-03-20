import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
  disabled = false,
  ...rest
}) => {
  const { theme } = useTheme();
  
  const getButtonStyles = () => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    };
    
    // Size styles
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: { height: 36 },
      medium: { height: 44 },
      large: { height: 52 },
    };
    
    // Variant styles
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };
    
    // Disabled styles
    const disabledStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: theme.colors.gray300,
      },
      secondary: {
        backgroundColor: theme.colors.gray300,
      },
      outline: {
        borderColor: theme.colors.gray300,
      },
      ghost: {
        opacity: 0.5,
      },
    };
    
    // Full width style
    const fullWidthStyle: ViewStyle = fullWidth ? { width: '100%' } : {};
    
    return [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
      disabled ? disabledStyles[variant] : {},
      fullWidthStyle,
      style,
    ];
  };
  
  const getTextStyles = () => {
    const baseStyle: TextStyle = {
      fontWeight: theme.fontWeight.medium,
      textAlign: 'center',
    };
    
    // Size styles
    const sizeStyles: Record<ButtonSize, TextStyle> = {
      small: { fontSize: theme.fontSize.sm },
      medium: { fontSize: theme.fontSize.md },
      large: { fontSize: theme.fontSize.lg },
    };
    
    // Variant styles
    const variantStyles: Record<ButtonVariant, TextStyle> = {
      primary: {
        color: theme.colors.white,
      },
      secondary: {
        color: theme.colors.white,
      },
      outline: {
        color: theme.colors.primary,
      },
      ghost: {
        color: theme.colors.primary,
      },
    };
    
    // Disabled styles
    const disabledStyles: Record<ButtonVariant, TextStyle> = {
      primary: {
        color: theme.colors.gray600,
      },
      secondary: {
        color: theme.colors.gray600,
      },
      outline: {
        color: theme.colors.gray500,
      },
      ghost: {
        color: theme.colors.gray500,
      },
    };
    
    return [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
      disabled ? disabledStyles[variant] : {},
      textStyle,
    ];
  };
  
  const getSpacerSize = () => {
    switch (size) {
      case 'small':
        return 4;
      case 'medium':
        return 6;
      case 'large':
        return 8;
      default:
        return 6;
    }
  };
  
  const spacerSize = getSpacerSize();
  
  return (
    <TouchableOpacity
      style={getButtonStyles()}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? theme.colors.white : theme.colors.primary}
        />
      ) : (
        <>
          {leftIcon && (
            <>
              {leftIcon}
              <Text style={{ width: spacerSize }} />
            </>
          )}
          <Text style={getTextStyles()}>{title}</Text>
          {rightIcon && (
            <>
              <Text style={{ width: spacerSize }} />
              {rightIcon}
            </>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
