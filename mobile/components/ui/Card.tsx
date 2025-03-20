import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 2,
  ...props
}) => {
  const { theme } = useTheme();
  
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.white,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: elevation },
          shadowOpacity: 0.1,
          shadowRadius: elevation,
          elevation: elevation,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
