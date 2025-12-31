import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, ActivityIndicator, GestureResponderEvent, View } from 'react-native';
import { radii } from './theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-green-600 shadow-lg shadow-green-200 dark:shadow-none',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700',
    text: 'text-gray-900 dark:text-white',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-gray-700 dark:text-gray-200',
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = true,
  className = '',
}: ButtonProps) {
  const baseContainer = 'flex-row items-center justify-center py-4 rounded-2xl';
  const widthClass = fullWidth ? 'w-full' : '';
  const stateClass = disabled || loading ? 'opacity-70' : '';
  const { container, text } = variantClasses[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
      className={`${baseContainer} ${widthClass} ${stateClass} ${container} ${className}`.trim()}
      style={{ borderRadius: radii.xl }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : '#16a34a'} />
      ) : (
        <>
          {iconLeft ? <View className="mr-2">{iconLeft}</View> : null}
          <Text className={`font-bold text-lg ${text}`}>{label}</Text>
          {iconRight ? <View className="ml-2">{iconRight}</View> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

export default Button;
