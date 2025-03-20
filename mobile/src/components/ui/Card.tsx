import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  elevation?: number;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  style,
  children,
  elevation = 1,
  padding = true,
  ...rest
}) => {
  const { theme } = useTheme();
  
  const getElevationStyle = (elevation: number): ViewStyle => {
    return {
      shadowColor: theme.colors.black,
      shadowOffset: {
        width: 0,
        height: elevation,
      },
      shadowOpacity: 0.1,
      shadowRadius: elevation * 2,
      elevation: elevation,
    };
  };
  
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      padding: padding ? theme.spacing.md : 0,
    },
    getElevationStyle(elevation),
    style,
  ];
  
  return (
    <View style={cardStyle} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
  },
});
