import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Keyboard, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight, Key } from 'lucide-react-native';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import * as Location from 'expo-location';

export default function Login() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [loading, setLoading] = useState(false);

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

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Allow location access',
          'We use your location to show nearby food items. You can enable it anytime in Settings.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.log('Location permission request failed', error);
      return false;
    }
  };

  const onSignInPress = async () => {
    if (!isLoaded) return;
    
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      
      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        await requestLocationPermission();
      } else if (completeSignIn.status === 'needs_first_factor') {
        // Check for email code factor
        const emailFactor = completeSignIn.supportedFirstFactors?.find(
          (factor: any) => factor.strategy === 'email_code'
        ) as any;

        if (emailFactor) {
          // Send the code!
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailFactor.emailAddressId,
          });
          
          setPendingVerification(true);
          Alert.alert('Verification Required', 'A verification code has been sent to your email.');
        } else {
          Alert.alert('Error', 'No supported verification method found.');
        }
      } else {
        console.log('Sign in status:', completeSignIn.status);
        // If the status is not complete, we need to handle the next step.
        // This usually means email verification or MFA.
        setPendingVerification(true);
        Alert.alert('Verification Required', 'Please enter the verification code sent to your email.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (err.status === 429) {
        const retryAfter = err.retryAfter || 60;
        const minutes = Math.ceil(retryAfter / 60);
        Alert.alert('Too Many Attempts', `You have made too many requests. Please wait ${minutes} minute(s) before trying again.`);
      } else {
        const errorMessage = err.errors ? err.errors[0].message : 'An unexpected error occurred';
        Alert.alert('Login Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      });

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        await requestLocationPermission();
      } else {
        console.log('Sign in status:', completeSignIn.status);
        Alert.alert('Verification Failed', 'Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const errorMessage = err.errors ? err.errors[0].message : 'An unexpected error occurred';
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResendPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
        const emailFactor = signIn.supportedFirstFactors?.find(
          (factor: any) => factor.strategy === 'email_code'
        ) as any;

        if (emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailFactor.emailAddressId,
          });
          Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
        } else {
           Alert.alert('Error', 'Could not find email verification method.');
        }
    } catch (err: any) {
      console.error('Resend error:', err);
      Alert.alert('Error', 'Failed to resend code.');
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
              <Text className="text-4xl">🥬</Text>
            </View>
            <Text className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">ShelfLife</Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Share food, save the planet.</Text>
          </View>
          
          <View className="space-y-4">
            {!pendingVerification ? (
              <>
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
                  placeholder="••••••••"
                  secureTextEntry
                  onChangeText={setPassword}
                />

                <Button
                  label="Sign In"
                  onPress={onSignInPress}
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
                
                <TouchableOpacity 
                  onPress={onResendPress}
                  disabled={loading}
                  className="mt-4 items-center"
                >
                  <Text className="text-green-600 dark:text-green-400 font-medium">Resend Code</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setPendingVerification(false)}
                  className="mt-4 items-center"
                >
                  <Text className="text-gray-500 dark:text-gray-400">Back to Login</Text>
                </TouchableOpacity>
              </>
            )}

            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-base">Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text className="text-green-600 dark:text-green-400 font-bold text-base">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
