import React, { ReactNode } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { radii } from './theme';

interface InputFieldProps extends TextInputProps {
  label?: string;
  icon?: ReactNode;
  helperText?: string;
  errorText?: string;
  containerClassName?: string;
  rightElement?: ReactNode;
  inputRef?: React.RefObject<TextInput>;
}

export function InputField({
  label,
  icon,
  helperText,
  errorText,
  containerClassName = '',
  rightElement,
  multiline,
  inputRef,
  ...textInputProps
}: InputFieldProps) {
  const baseContainer = 'flex-row items-center bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 rounded-xl';
  const heightClass = multiline ? 'py-3 h-auto items-start' : 'h-14';
  const textMargin = icon ? 'ml-3' : 'ml-0';

  return (
    <View className="w-full">
      {label ? (
        <Text className="text-gray-800 dark:text-gray-200 font-semibold mb-2 ml-1">{label}</Text>
      ) : null}
      <View
        className={`${baseContainer} ${heightClass} ${containerClassName}`.trim()}
        style={{ borderRadius: radii.xl }}
      >
        {icon ? <View className="mt-[1px]">{icon}</View> : null}
        <TextInput
          ref={inputRef}
          className={`flex-1 ${textMargin} text-base text-gray-900 dark:text-white`}
          placeholderTextColor="#9ca3af"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...textInputProps}
        />
        {rightElement ? <View className="ml-2">{rightElement}</View> : null}
      </View>
      {helperText ? (
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">{helperText}</Text>
      ) : null}
      {errorText ? (
        <Text className="text-xs text-red-500 mt-2 ml-1">{errorText}</Text>
      ) : null}
    </View>
  );
}

export default InputField;
