import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import { AlertTriangle } from 'lucide-react-native';
import { CheckCircle2 } from 'lucide-react-native';

interface LoadingViewProps {
  message?: string;
}

export function LoadingView({ message }: LoadingViewProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const gradient = useMemo(
    () => (isDark ? ['#0b1220', '#0f172a'] : ['#ecfdf3', '#e0f2fe']),
    [isDark]
  );

  return (
    <View className="flex-1 justify-center items-center">
      <LinearGradient
        colors={gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ ...StyleSheet.absoluteFillObject, opacity: isDark ? 0.9 : 1 }}
      />
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 22,
          borderRadius: 20,
          backgroundColor: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,185,129,0.18)',
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          alignItems: 'center',
          minWidth: 220,
        }}
      >
        <ActivityIndicator size="large" color="#22c55e" />
        {message ? (
          <Text
            className="text-center mt-4 text-base font-semibold"
            style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionText, onAction }: EmptyStateProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className="items-center px-8 py-10"
      style={{
        backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : '#f8fafc',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
      }}
    >
      {icon ? <View className="mb-4 opacity-80">{icon}</View> : null}
      <Text className="text-lg font-semibold text-center" style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>
        {title}
      </Text>
      {description ? (
        <Text className="mt-2 text-sm text-center leading-5" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
          {description}
        </Text>
      ) : null}
      {actionText && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          className="mt-5 px-4 py-2 rounded-full"
          style={{ backgroundColor: '#22c55e' }}
          activeOpacity={0.9}
        >
          <Text className="text-white font-semibold">{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  actionText = 'Retry',
  onRetry,
}: ErrorStateProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1 justify-center items-center px-8" style={{ backgroundColor: isDark ? '#0b1220' : '#f8fafc' }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 18,
          borderRadius: 20,
          backgroundColor: isDark ? 'rgba(30,41,59,0.9)' : '#ffffff',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(248,113,113,0.25)',
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 12 },
          alignItems: 'center',
          width: '100%',
          maxWidth: 360,
        }}
      >
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: isDark ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.12)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <AlertTriangle size={26} color={isDark ? '#f87171' : '#dc2626'} />
        </View>
        <Text className="text-lg font-bold text-center" style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>
          {title}
        </Text>
        <Text className="text-sm text-center mt-2" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
          {description}
        </Text>
        {onRetry ? (
          <TouchableOpacity
            onPress={onRetry}
            className="mt-4 px-4 py-2 rounded-full"
            style={{ backgroundColor: '#22c55e' }}
            activeOpacity={0.9}
          >
            <Text className="text-white font-semibold">{actionText}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

interface StatusPopupProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  description?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function StatusPopup({
  visible,
  type,
  title,
  description,
  primaryLabel = 'Ok',
  onPrimary,
  secondaryLabel,
  onSecondary,
}: StatusPopupProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isSuccess = type === 'success';
  const accent = isSuccess ? '#10b981' : '#ef4444';

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', paddingHorizontal: 24 }}
        onPress={secondaryLabel ? onSecondary : onPrimary}
      >
        <Pressable
          style={{ alignItems: 'center' }}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 420,
              paddingHorizontal: 22,
              paddingVertical: 20,
              borderRadius: 24,
              backgroundColor: isDark ? 'rgba(15,23,42,0.94)' : '#ffffff',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : `${accent}30`,
              shadowColor: '#000',
              shadowOpacity: 0.16,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 14 },
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: `${accent}15`,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                marginBottom: 12,
              }}
            >
              {isSuccess ? (
                <CheckCircle2 size={30} color={accent} />
              ) : (
                <AlertTriangle size={30} color={accent} />
              )}
            </View>

            <Text
              className="text-xl font-extrabold text-center"
              style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
            >
              {title}
            </Text>
            {description ? (
              <Text
                className="text-center mt-2 text-sm"
                style={{ color: isDark ? '#94a3b8' : '#475569' }}
              >
                {description}
              </Text>
            ) : null}

            <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
              {secondaryLabel ? (
                <TouchableOpacity
                  onPress={onSecondary}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  }}
                  activeOpacity={0.85}
                >
                  <Text className="text-center font-semibold" style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>
                    {secondaryLabel}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={onPrimary}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: accent,
                  shadowColor: accent,
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 8 },
                }}
                activeOpacity={0.9}
              >
                <Text className="text-center font-semibold" style={{ color: '#fff' }}>
                  {primaryLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
