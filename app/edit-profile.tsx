import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, User, Camera, Store } from 'lucide-react-native';
import { api } from '../services/api';
import { useColorScheme } from 'nativewind';
import { LoadingView, StatusPopup } from '../components/ui/States';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

export default function EditProfile() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SHOPKEEPER'>('CUSTOMER');
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; title: string; description?: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        if (Platform.OS === 'android') {
            setKeyboardHeight(e.endCoordinates.height);
        }
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
            if (Platform.OS === 'android') {
                setKeyboardHeight(0);
            }
        }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setDisplayName(res.data.displayName);
      setRole(res.data.role || 'CUSTOMER');
      if (res.data.avatarUrl) {
        setImage(res.data.avatarUrl);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setBase64Image(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setStatus({ type: 'error', title: 'Missing name', description: 'Please enter a display name before saving.' });
      return;
    }

    setSaving(true);
    try {
      const updateData: any = { displayName };
      if (base64Image) {
        // Send as both avatar and avatarUrl to ensure backend compatibility
        updateData.avatar = base64Image;
        updateData.avatarUrl = base64Image;
      }
      
      await api.put('/users/me', updateData);
      await api.put('/users/me/role', { role });
      
      // Force a small delay to allow backend to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus({ type: 'success', title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setStatus({ type: 'error', title: 'Save failed', description: 'Could not update your profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusClose = () => {
    if (status?.type === 'success') {
      router.back();
    }
    setStatus(null);
  };

  if (loading) {
    return <LoadingView message="Loading your profile..." />;
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <LinearGradient
        colors={colorScheme === 'dark' ? ['#0b1220', '#0f172a'] : ['#e0f7ff', '#f5fff8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220, opacity: colorScheme === 'dark' ? 0.9 : 1 }}
      />

      {/* Header */}
      <View className="flex-row items-center p-6 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 rounded-full bg-white/15 dark:bg-white/10 border border-white/20">
          <ArrowLeft size={22} color={colorScheme === 'dark' ? '#fff' : '#0f172a'} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xs font-semibold uppercase tracking-[3px]" style={{ color: colorScheme === 'dark' ? '#cbd5f5' : '#0f172a' }}>Profile</Text>
          <Text className="text-2xl font-extrabold" style={{ color: colorScheme === 'dark' ? '#fff' : '#0f172a' }}>Edit & personalize</Text>
          <Text className="text-sm mt-1" style={{ color: colorScheme === 'dark' ? '#94a3b8' : '#475569' }}>Update your name, role, and avatar in one place.</Text>
        </View>
        <View className="px-3 py-1 rounded-full bg-white/16 border border-white/24">
          <Text className="text-[11px] font-semibold" style={{ color: colorScheme === 'dark' ? '#e2e8f0' : '#0f172a' }}>Live</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 p-6"
        style={{ paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0 }}
      >
        <View
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: colorScheme === 'dark' ? 'rgba(15,23,42,0.9)' : '#ffffffee',
            borderWidth: 1,
            borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 12 },
          }}
        >
          <View className="items-center mb-8">
            <TouchableOpacity onPress={pickImage} className="relative">
              <View className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-900 items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-sm">
                {image ? (
                  <Image source={{ uri: image }} className="w-full h-full" />
                ) : (
                  <User size={40} color="#22c55e" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full border-2 border-white dark:border-gray-800">
                <Camera size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text className="mt-3 text-green-600 dark:text-green-400 font-medium">Change Profile Photo</Text>
          </View>

          <InputField
            label="Display Name"
            icon={<User size={20} color="#6b7280" />}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            containerClassName="mb-6"
          />

          <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2 ml-1">Role</Text>
          <View className="flex-row space-x-3 mb-8">
            <TouchableOpacity 
              onPress={() => setRole('CUSTOMER')}
              className="flex-1"
              activeOpacity={0.9}
            >
              <View
                className="py-3.5 px-3 rounded-2xl flex-row items-center justify-center"
                style={{
                  backgroundColor: role === 'CUSTOMER' ? '#0ea5e9' : (colorScheme === 'dark' ? '#0f172a' : '#f8fafc'),
                  borderWidth: 1,
                  borderColor: role === 'CUSTOMER' ? '#0ea5e9' : (colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'),
                }}
              >
                <User size={18} color={role === 'CUSTOMER' ? '#fff' : '#6b7280'} />
                <Text
                  className="font-bold ml-2"
                  style={{ color: role === 'CUSTOMER' ? '#fff' : (colorScheme === 'dark' ? '#e2e8f0' : '#111827') }}
                >
                  Customer
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setRole('SHOPKEEPER')}
              className="flex-1"
              activeOpacity={0.9}
            >
              <View
                className="py-3.5 px-3 rounded-2xl flex-row items-center justify-center"
                style={{
                  backgroundColor: role === 'SHOPKEEPER' ? '#a855f7' : (colorScheme === 'dark' ? '#0f172a' : '#f8fafc'),
                  borderWidth: 1,
                  borderColor: role === 'SHOPKEEPER' ? '#a855f7' : (colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'),
                }}
              >
                <Store size={18} color={role === 'SHOPKEEPER' ? '#fff' : '#6b7280'} />
                <Text
                  className="font-bold ml-2"
                  style={{ color: role === 'SHOPKEEPER' ? '#fff' : (colorScheme === 'dark' ? '#e2e8f0' : '#111827') }}
                >
                  Shopkeeper
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text className="text-xs mb-4" style={{ color: colorScheme === 'dark' ? '#94a3b8' : '#6b7280' }}>
            Your role helps us tailor tasks and tips. You can switch anytime.
          </Text>

          <Button
            label="Save Changes"
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            iconLeft={<Save size={20} color="white" />}
          />
        </View>
      </KeyboardAvoidingView>

      <StatusPopup
        visible={!!status}
        type={status?.type || 'success'}
        title={status?.title || ''}
        description={status?.description}
        primaryLabel={status?.type === 'success' ? 'Great' : 'Retry'}
        onPrimary={status?.type === 'success' ? handleStatusClose : handleStatusClose}
        secondaryLabel={status?.type === 'error' ? 'Dismiss' : undefined}
        onSecondary={status?.type === 'error' ? () => setStatus(null) : undefined}
      />
    </View>
  );
}
