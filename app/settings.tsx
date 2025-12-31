import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  Info,
  Shield,
  ChevronRight,
  Mail,
  Sparkles,
  Lock,
  WifiOff,
  Globe2,
  Edit2,
  Palette,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const router = useRouter();
  const { user } = useUser();
  const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);

  const accent = useMemo(() => (colorScheme === 'dark' ? '#38bdf8' : '#0284c7'), [colorScheme]);
    const persistTheme = async (next: 'light' | 'dark') => {
      try {
        await AsyncStorage.setItem('sl_theme_preference', next);
      } catch (e) {
        console.log('Failed to store theme preference', e);
      }
    };

    const handleToggleTheme = () => {
      const next = colorScheme === 'dark' ? 'light' : 'dark';
      setColorScheme(next);
      persistTheme(next);
    };
  const surface = colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const borderTone = colorScheme === 'dark' ? 'border-gray-800' : 'border-gray-100';
  const headerGradient = useMemo(
    () => (colorScheme === 'dark' ? ['#0b1220', '#0f172a'] : ['#e1f1ff', '#f6fbff']),
    [colorScheme]
  );

  const Card: React.FC<{ children: React.ReactNode; padded?: boolean; shadow?: boolean }>
    = ({ children, padded = true, shadow = true }) => (
      <View
        className={`${surface} rounded-3xl ${shadow ? 'shadow-lg' : ''} ${borderTone} border` + (padded ? ' p-5' : '')}
        style={{ backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#ffffffee' }}
      >
        {children}
      </View>
    );

  const SectionTitle = ({ label, hint }: { label: string; hint?: string }) => (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[11px] tracking-[2px]">{label}</Text>
      {hint ? <Text className="text-[11px] text-gray-400 dark:text-gray-500">{hint}</Text> : null}
    </View>
  );

  const SettingRow = ({
    icon: Icon,
    label,
    description,
    color = accent,
    toggleValue,
    onToggle,
    onPress,
    isLast,
  }: {
    icon: any;
    label: string;
    description?: string;
    color?: string;
    toggleValue?: boolean;
    onToggle?: (value: boolean) => void;
    onPress?: () => void;
    isLast?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress || typeof toggleValue === 'boolean'}
      className={`flex-row items-center px-3 py-3 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-2xl items-center justify-center mr-2.5" style={{ backgroundColor: color + '18' }}>
          <Icon size={17} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-white font-semibold text-base">{label}</Text>
          {description ? (
            <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{description}</Text>
          ) : null}
        </View>
      </View>

      {typeof toggleValue === 'boolean' ? (
        <View className="pl-3 pr-1">
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: '#e5e7eb', true: accent }}
            thumbColor={'#fff'}
          />
        </View>
      ) : (
        <ChevronRight size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  const QuickAction = ({ icon: Icon, label, onPress, color, isLast }: { icon: any; label: string; onPress: () => void; color: string; isLast?: boolean }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-1"
      style={{ marginRight: isLast ? 0 : 12 }}
    >
      <View
        className="rounded-2xl px-4 py-3 flex-row items-center"
        style={{
          backgroundColor: color + '1a',
          borderColor: color + '33',
          borderWidth: 1,
          minHeight: 56,
          minWidth: 0,
        }}
      >
        <View className="w-9 h-9 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: color + '22' }}>
          <Icon size={18} color={color} />
        </View>
        <Text
          className="font-semibold"
          style={{ color: colorScheme === 'dark' ? '#fff' : '#0f172a', flexShrink: 1 }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#edf2f7] dark:bg-gray-950">
      <LinearGradient
        colors={headerGradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute top-0 left-0 right-0 h-44"
      />

      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color={colorScheme === 'dark' ? '#fff' : '#0f172a'} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-[13px] font-semibold uppercase tracking-[3px] opacity-80"
            style={{ color: colorScheme === 'dark' ? '#fff' : '#0f172a' }}
          >
            Profile
          </Text>
          <Text
            className="text-2xl font-extrabold"
            style={{ color: colorScheme === 'dark' ? '#fff' : '#0f172a' }}
          >
            Settings
          </Text>
        </View>
        <View className="px-3 py-1 rounded-full bg-white/12 border border-white/20">
          <Text
            className="text-xs font-semibold"
            style={{ color: colorScheme === 'dark' ? '#fff' : '#0f172a' }}
          >
            Personalized
          </Text>
        </View>
      </View>

      <View className="px-5 pb-4 flex-row">
        <QuickAction
          icon={Edit2}
          label="Edit profile"
          color="#38bdf8"
          onPress={() => router.push('/edit-profile')}
        />
        <QuickAction
          icon={Palette}
          label="Themes"
          color="#22c55e"
          onPress={handleToggleTheme}
        />
        <QuickAction
          icon={Bell}
          label="Alerts"
          color="#f59e0b"
          onPress={() => router.push('/notifications')}
          isLast
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 44 }}>
        <View className="px-5 -mt-4 space-y-5">
          <Card>
            <Text className="text-gray-900 dark:text-white text-base font-semibold">Make it feel like you</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">Refine appearance and alerts without leaving this screen.</Text>

            <View className="flex-row items-center justify-between mt-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-900/40 items-center justify-center mr-2.5">
                  {colorScheme === 'dark' ? (
                    <Moon size={18} color={accent} />
                  ) : (
                    <Sun size={18} color={accent} />
                  )}
                </View>
                <View>
                  <Text className="text-gray-900 dark:text-white font-semibold">Dark mode</Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">Currently {colorScheme === 'dark' ? 'On' : 'Off'}</Text>
                </View>
              </View>
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={handleToggleTheme}
                trackColor={{ false: '#e5e7eb', true: accent }}
                thumbColor={'#fff'}
              />
            </View>
          </Card>

          <Card padded={false}>
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
              <View>
                <Text className="text-gray-900 dark:text-white text-base font-semibold">Status & quick checks</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Keep things smooth before you travel or go offline.</Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/50">
                <Text className="text-sky-700 dark:text-sky-200 text-[11px] font-semibold">Adaptive</Text>
              </View>
            </View>

            <View className="border-t border-gray-100 dark:border-gray-800" />
            <SettingRow
              icon={WifiOff}
              label="Low-bandwidth mode"
              description="Reduce image and video preloads"
              color="#475569"
              toggleValue={lowBandwidthMode}
              onToggle={setLowBandwidthMode}
            />
            <SettingRow
              icon={Globe2}
              label="Roaming protection"
              description="Prevent large downloads on roaming"
              color="#6366f1"
              toggleValue={dataSaver}
              onToggle={setDataSaver}
              isLast
            />
          </Card>
        </View>

        <View className="px-5 mt-6">
          <SectionTitle label="Notifications" hint="Stay in the loop" />
          <Card padded={false} shadow={false}>
            <SettingRow
              icon={Bell}
              label="Push alerts"
              description="In-app alerts while you're online; background push is paused"
              color="#ef4444"
              onPress={() => router.push('/notifications')}
            />
            <SettingRow
              icon={Mail}
              label="Weekly digest"
              description="A short recap every Monday"
              color="#2563eb"
              toggleValue={weeklyDigest}
              onToggle={setWeeklyDigest}
            />
            <SettingRow
              icon={Sparkles}
              label="Product updates"
              description="Tips, releases, and experiments"
              color="#f59e0b"
              toggleValue={productUpdates}
              onToggle={setProductUpdates}
              isLast
            />
          </Card>
        </View>

        <View className="px-5 mt-6">
          <SectionTitle label="Experience" hint="Personal flair" />
          <Card padded={false} shadow={false}>
            <SettingRow
              icon={Edit2}
              label="Edit profile"
              description="Update your info and avatar"
              color="#38bdf8"
              onPress={() => router.push('/edit-profile')}
            />
            <SettingRow
              icon={Lock}
              label="Public profile"
              description="View what others can see"
              color="#0ea5e9"
              onPress={() => {
                if (user?.id) {
                  router.push(`/user/${user.id}`);
                } else {
                  router.push('/profile');
                }
              }}
              isLast
            />
          </Card>
        </View>

        <View className="px-5 mt-6">
          <SectionTitle label="Data" hint="Battery & network" />
          <Card padded={false} shadow={false}>
            <SettingRow
              icon={Shield}
              label="Data saver"
              description="Limit background refresh when on cellular"
              color="#8b5cf6"
              toggleValue={dataSaver}
              onToggle={setDataSaver}
            />
            <SettingRow
              icon={Info}
              label="About ShelfLife"
              description="Version 1.0.0"
              color="#6b7280"
              onPress={() => Alert.alert('About', 'ShelfLife v1.0.0\nBuilt with React Native & Expo')}
              isLast
            />
          </Card>
        </View>

        <View className="px-5 mt-6">
          <SectionTitle label="Credits" hint="Craftsmanship" />
          <View className="rounded-3xl p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-[2px] font-semibold">Developer</Text>
            <Text className="text-gray-900 dark:text-white text-2xl font-bold mt-1">Nishan Bhattarai</Text>
            <Text className="text-gray-600 dark:text-gray-300 text-sm mt-2">Built with care for a clean experience.</Text>
          </View>
        </View>

        <View className="px-5 mt-8 items-center">
          <Text className="text-gray-600 dark:text-gray-400 text-sm">Need more control?</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Support', 'Email us at support@shelflife.app')}
            className="mt-3 px-5 py-3 bg-gray-900 dark:bg-white rounded-full flex-row items-center"
          >
            <Text className="text-white dark:text-gray-900 font-semibold text-sm">Talk to support</Text>
          </TouchableOpacity>
          <Text className="text-gray-400 dark:text-gray-500 text-[11px] mt-3">ShelfLife v1.0.0 · Designed for everyday givers</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}