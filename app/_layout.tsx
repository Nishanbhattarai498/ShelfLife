import "../global.css";
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef } from 'react';
import { setupAuthInterceptor } from '../services/api';
import { MessagesProvider } from './contexts/MessagesContext';
import { connectSocket, disconnectSocket } from '../services/socket';
import * as Device from 'expo-device';
import * as NavigationBar from 'expo-navigation-bar';
import { AppState, Platform, StatusBar, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
// Note: do NOT import 'expo-notifications' at module scope — it triggers
// runtime behavior that's incompatible with Expo Go (SDK 53+).
// We'll dynamically import it only when running in a development build / not Expo Go.
import { api } from '../services/api';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
};

function InitialLayout() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { colorScheme, setColorScheme } = useColorScheme();
  const segments = useSegments() as string[];
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const askedLocationRef = useRef(false);

  useEffect(() => {
    // Set up the interceptor to fetch a fresh token for every request
    setupAuthInterceptor(getToken);
  }, [getToken]);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('sl_theme_preference');
        if (saved === 'dark' || saved === 'light') {
          setColorScheme(saved);
        }
      } catch (e) {
        console.log('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, [setColorScheme]);

  useEffect(() => {
    // Mark daily active to count toward streaks (login-based)
    const pingActive = async () => {
      try {
        if (!isSignedIn) return;
        await api.post('/users/active');
      } catch (e) {
        console.warn('Failed to mark daily active', e);
      }
    };

    pingActive();
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) {
      askedLocationRef.current = false; // allow re-prompt on next login
      return;
    }
    if (askedLocationRef.current) return;
    askedLocationRef.current = true;

    const promptLocation = async () => {
      try {
        const current = await Location.getForegroundPermissionsAsync();
        if (current.status === 'granted') return;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Allow location access',
            'Turn on location to see nearby food items. You can also enable it later in Settings.'
          );
        }
      } catch (err) {
        console.log('Location permission prompt failed', err);
      }
    };

    promptLocation();
  }, [isSignedIn]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state !== 'active' || !isSignedIn) return;
      try {
        const current = await Location.getForegroundPermissionsAsync();
        if (current.status === 'granted') return;
        await Location.requestForegroundPermissionsAsync();
      } catch (err) {
        console.log('Location permission check on resume failed', err);
      }
    });

    return () => sub.remove();
  }, [isSignedIn]);

  useEffect(() => {
    // Enable immersive mode - hide navigation bar on Android and re-apply on resume/theme change
    const applyImmersive = () => {
      if (Platform.OS !== 'android') return;
      NavigationBar.setVisibilityAsync('hidden').catch(() => NavigationBar.setVisibilityAsync('hidden'));
      // setBehaviorAsync triggers warnings with edge-to-edge; guard with try/catch and ignore failures
      try {
        NavigationBar.setBehaviorAsync('overlay-swipe').catch(() => undefined);
      } catch (e) {
        // ignore unsupported behavior warnings
      }
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setHidden(false, 'slide');
    };

    applyImmersive();
    StatusBar.setBarStyle('light-content');
    if (Platform.OS !== 'android') {
      StatusBar.setHidden(false, 'fade');
    }

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        applyImmersive();
      }
    });

    return () => {
      sub.remove();
    };
  }, [colorScheme]);

  useEffect(() => {
    // Notification response handler: ensure conversation exists then navigate
    // Behavior controlled by env var `EXPO_PUBLIC_NOTIFICATION_OPEN_TARGET`:
    // - 'chat' (default): open chat screen for the conversation
    // - 'messages': open the Messages tab instead
    let responseListener: any = null;

    const setup = async () => {
      try {
        if (!Device.isDevice) return;

        // Determine if we're running in Expo Go — if so, skip remote push setup.
        // Using dynamic import of expo-constants to avoid adding it at module scope.
        const Constants = (await import('expo-constants')) as any;
        const appOwnership = Constants?.default?.appOwnership ?? Constants?.appOwnership;
        if (appOwnership === 'expo') {
          // Running in Expo Go — remote push is not supported. Skip registration.
          console.warn('Skipping expo-notifications registration in Expo Go. Use a development build for push notifications.');
          return;
        }

        // Dynamically import expo-notifications only when not in Expo Go.
        const Notifications = await import('expo-notifications');

        // Request permission if needed (no-op if already granted)
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;

        responseListener = Notifications.addNotificationResponseReceivedListener(async (response) => {
          try {
            const data: any = response?.notification?.request?.content?.data ?? {};
            const convId = data?.conversationId ?? data?.conversation?.id ?? data?.conversationIdString;
            const openTarget = process.env.EXPO_PUBLIC_NOTIFICATION_OPEN_TARGET || 'chat';

            if (convId) {
              try {
                // Ensure conversation exists in backend/inbox before navigating
                await api.get(`/messages/${String(convId)}`);
                if (openTarget === 'messages') {
                  router.push('/(tabs)/messages');
                } else {
                  router.push(`/chat/${String(convId)}`);
                }
                return;
              } catch (e) {
                console.error('Notification tap: failed to fetch conversation', e);
                // fallthrough to open Messages tab as a safe default
              }
            }

            // No conversation id or fetch failed — open Messages tab
            router.push('/(tabs)/messages');
          } catch (err) {
            console.error('Error handling notification response:', err);
          }
        });
      } catch (err) {
        console.error('Failed to initialize notification listeners:', err);
      }
    };

    setup();

    return () => {
      try {
        responseListener?.remove?.();
      } catch (e) {
        // ignore
      }
    };
  }, [router, isLoaded, user?.id]);

  useEffect(() => {
    // Connect global socket when user is signed in so app receives user-targeted emits
    if (isSignedIn && user?.id) {
      connectSocket(user.id);
    }

    return () => {
      // Disconnect on unmount/sign-out
      disconnectSocket();
    };
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    // Use setTimeout to ensure navigation happens after the component is fully mounted
    const timer = setTimeout(() => {
      if (isSignedIn && (inAuthGroup || segments.length === 0)) {
        // Redirect to home if user is signed in and tries to access auth screens or root
        router.replace('/(tabs)/home');
      } else if (!isSignedIn && !inAuthGroup) {
        // Redirect to login if user is not signed in and tries to access protected screens
        router.replace('/(auth)/login');
      }
    }, 100); // Small delay to prevent "Attempted to navigate before mounting" error

    return () => clearTimeout(timer);
  }, [isSignedIn, isLoaded, segments, router, rootNavigationState?.key]);

  return <Slot />;
}
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <MessagesProvider>
            <InitialLayout />
          </MessagesProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
