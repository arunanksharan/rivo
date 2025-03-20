import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TypographyType } from '@/theme/typography';

interface TextProps extends RNTextProps {
  variant?: TypographyType;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body1',
  color,
  style,
  children,
  ...rest
}) => {
  const { theme } = useTheme();
  
  const textStyle: StyleProp<TextStyle> = [
    theme.typography[variant],
    color ? { color } : {},
    style,
  ];
  
  return (
    <RNText style={textStyle} {...rest}>
      {children}
    </RNText>
  );
};
