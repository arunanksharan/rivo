import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'subtitle1' 
  | 'subtitle2' 
  | 'body1' 
  | 'body2' 
  | 'button' 
  | 'caption' 
  | 'overline';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  style?: TextStyle;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
  onPress?: () => void;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body1',
  style,
  color,
  align,
  numberOfLines,
  onPress,
  ...props
}) => {
  const { theme } = useTheme();
  
  const textStyles = [
    styles[variant],
    { color: color || theme.colors.text },
    align && { textAlign: align },
    style,
  ];
  
  return (
    <RNText 
      style={textStyles} 
      numberOfLines={numberOfLines}
      onPress={onPress}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
  },
  button: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
