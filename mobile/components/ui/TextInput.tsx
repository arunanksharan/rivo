import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  isPassword = false,
  secureTextEntry,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);
  
  const handleFocus = () => {
    setIsFocused(true);
    props.onFocus && props.onFocus();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    props.onBlur && props.onBlur();
  };
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  const getBorderColor = () => {
    if (error) return theme.colors.error || 'red';
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };
  
  const renderPasswordIcon = () => {
    if (!isPassword) return null;
    
    return (
      <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
        <Ionicons
          name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={theme.colors.gray600}
        />
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          variant="caption"
          color={error ? (theme.colors.error || 'red') : theme.colors.textLight}
          style={styles.label}
        >
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: props.editable === false ? theme.colors.gray100 : theme.colors.white,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        
        <RNTextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
            },
            inputStyle,
          ]}
          placeholderTextColor={theme.colors.gray500}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
          {...props}
        />
        
        {renderPasswordIcon() || (rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>)}
      </View>
      
      {error && (
        <Text
          variant="caption"
          color={theme.colors.error || 'red'}
          style={styles.errorText}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  iconContainer: {
    paddingHorizontal: 4,
  },
  errorText: {
    marginTop: 4,
  },
});
