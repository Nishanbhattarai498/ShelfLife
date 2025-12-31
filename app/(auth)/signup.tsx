import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Alert, ScrollView } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Mail, Lock, Key, ArrowRight, User, Store } from 'lucide-react-native';
import * as Location from 'expo-location';
import { api } from '../../services/api';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SHOPKEEPER'>('CUSTOMER');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      if (Platform.OS === 'android') {
        setKeyboardHeight(e.endCoordinates.height);
      }
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
        unsafeMetadata: { role },
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (err.status === 429) {
        const retryAfter = err.retryAfter || 60;
        const minutes = Math.ceil(retryAfter / 60);
        Alert.alert('Too Many Attempts', `Please wait ${minutes} minute(s) before trying again.`);
      } else {
        const errorMessage = err.errors ? err.errors[0].message : 'An unexpected error occurred';
        Alert.alert('Sign Up Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      await setActive({ session: completeSignUp.createdSessionId });

      try {
        await api.put('/users/me/role', { role });
      } catch (roleError) {
        console.error('Failed to set role:', roleError);
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Note', 'Location access is needed to find nearby food items.');
      } else {
        Alert.alert('Location Setup', 'Location access confirmed. We will use your location to find nearby items.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (err.status === 429) {
        const retryAfter = err.retryAfter || 60;
        const minutes = Math.ceil(retryAfter / 60);
        Alert.alert('Too Many Attempts', `Please wait ${minutes} minute(s) before trying again.`);
      } else {
        const errorMessage = err.errors ? err.errors[0].message : 'An unexpected error occurred';
        Alert.alert('Verification Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white dark:bg-gray-900"
      style={{ paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View className="px-8 py-8">
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">🌱</Text>
            </View>
            <Text className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Join Us</Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-lg text-center">Start sharing with your community.</Text>
          </View>

          <View className="space-y-5">
            {!pendingVerification ? (
              <>
                <View>
                  <Text className="text-gray-800 dark:text-gray-200 font-semibold mb-2 ml-1">I am a...</Text>
                  <View className="flex-row space-x-3">
                    <TouchableOpacity
                      onPress={() => setRole('CUSTOMER')}
                      className={`flex-1 p-4 rounded-xl border-2 items-center ${role === 'CUSTOMER' ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-700'}`}
                      activeOpacity={0.9}
                    >
                      <User size={24} color={role === 'CUSTOMER' ? '#16a34a' : '#6b7280'} />
                      <Text className={`mt-2 font-bold ${role === 'CUSTOMER' ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>Customer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setRole('SHOPKEEPER')}
                      className={`flex-1 p-4 rounded-xl border-2 items-center ${role === 'SHOPKEEPER' ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-700'}`}
                      activeOpacity={0.9}
                    >
                      <Store size={24} color={role === 'SHOPKEEPER' ? '#16a34a' : '#6b7280'} />
                      <Text className={`mt-2 font-bold ${role === 'SHOPKEEPER' ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>Shopkeeper</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="space-y-4">
                  <InputField
                    label="First Name"
                    icon={<User size={20} color="#6b7280" />}
                    autoCapitalize="words"
                    value={firstName}
                    placeholder="Jane"
                    onChangeText={setFirstName}
                  />

                  <InputField
                    label="Last Name"
                    icon={<User size={20} color="#6b7280" />}
                    autoCapitalize="words"
                    value={lastName}
                    placeholder="Doe"
                    onChangeText={setLastName}
                  />

                  <InputField
                    label="Email Address"
                    icon={<Mail size={20} color="#6b7280" />}
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="you@domain.com"
                    onChangeText={setEmailAddress}
                  />

                  <InputField
                    label="Password"
                    icon={<Lock size={20} color="#6b7280" />}
                    value={password}
                    placeholder="Create a strong password"
                    secureTextEntry
                    onChangeText={setPassword}
                  />
                </View>

                <Button
                  label="Create Account"
                  onPress={onSignUpPress}
                  disabled={loading || !isLoaded}
                  loading={loading}
                  iconRight={<ArrowRight size={20} color="white" />}
                  className="mt-4"
                />
              </>
            ) : (
              <>
                <InputField
                  label="Verification Code"
                  icon={<Key size={20} color="#6b7280" />}
                  value={code}
                  placeholder="Enter code from email"
                  onChangeText={setCode}
                  keyboardType="number-pad"
                />

                <Button
                  label="Verify Email"
                  onPress={onPressVerify}
                  disabled={loading || !isLoaded}
                  loading={loading}
                  className="mt-4"
                />
              </>
            )}

            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-base">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text className="text-green-600 dark:text-green-400 font-bold text-base">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
