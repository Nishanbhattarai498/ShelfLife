import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore, Item } from '../../store';
import { MapPin, Clock, ArrowLeft, Share2, Heart, Mail, Navigation } from 'lucide-react-native';
import { formatDistanceToNow, format } from 'date-fns';
import { api } from '../../services/api';
import { useColorScheme } from 'nativewind';
import { getCurrencySymbol } from '../utils/currencies';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusPopup, LoadingView } from '../../components/ui/States';

export default function ItemDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { claimItem } = useStore();
  const { colorScheme } = useColorScheme();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; title: string; description?: string; onConfirm?: () => void } | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(`/items/${id}`);
        setItem(response.data);
      } catch (error) {
        console.error('Error fetching item:', error);
        setStatus({ type: 'error', title: 'Load failed', description: 'Could not load item details.' });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  const handleClaim = async () => {
    if (!item) return;
    
    setClaiming(true);
    try {
      await claimItem(item.id);
      setStatus({ type: 'success', title: 'Item claimed', description: 'We notified the owner.', onConfirm: () => router.back() });
    } catch (error) {
      console.error('Error claiming item:', error);
      setStatus({ type: 'error', title: 'Claim failed', description: 'Please try again.' });
    } finally {
      setClaiming(false);
    }
  };

  const handleMessage = async () => {
    if (!item) return;
    
    try {
      const res = await api.post('/messages/start', {
        itemId: item.id,
        receiverId: item.user.id
      });
      
      // Redirect to chat
      router.push(`/chat/${res.data.id}`);
    } catch (error: any) {
      console.error('Error starting chat:', error);
      setStatus({ type: 'error', title: 'Chat failed', description: error.response?.data?.error || 'Could not start chat' });
    }
  };

  if (loading) {
    return <LoadingView message="Loading item..." />;
  }

  if (!item) {
    return (
      <StatusPopup
        visible
        type="error"
        title="Item not found"
        description="This item is unavailable right now."
        primaryLabel="Go back"
        onPrimary={() => router.back()}
      />
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1" bounces={false}>
        <View className="relative">
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              className="w-full h-96"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-96 bg-gray-200 dark:bg-gray-800 justify-center items-center">
              <Text className="text-gray-400">No Image Available</Text>
            </View>
          )}

          <LinearGradient
            colors={["rgba(0,0,0,0.75)", "rgba(0,0,0,0.4)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="absolute inset-0"
          />

          <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center">
            <TouchableOpacity 
              className="bg-white/15 backdrop-blur-md p-3 rounded-full border border-white/15"
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={22} color={colorScheme === 'dark' ? '#fff' : '#0f172a'} />
            </TouchableOpacity>
            <View className="flex-row space-x-3">
              <TouchableOpacity className="bg-white/15 backdrop-blur-md p-3 rounded-full border border-white/15">
                <Heart size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-white/15 backdrop-blur-md p-3 rounded-full border border-white/15">
                <Share2 size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="absolute bottom-4 left-4 right-4 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <View className="px-3 py-1 rounded-full bg-white/20 border border-white/25">
                <Text className="text-white text-[11px] font-semibold uppercase tracking-wide">{item.status}</Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-black/55 border border-white/15">
                <Text className="text-emerald-100 text-sm font-bold">
                  {item.discountedPrice !== null && item.discountedPrice !== undefined
                    ? (item.discountedPrice === 0
                      ? 'Free'
                      : `${getCurrencySymbol(item.priceCurrency)}${item.discountedPrice}`)
                    : item.originalPrice
                      ? `${getCurrencySymbol(item.priceCurrency)}${item.originalPrice}`
                      : 'Free'}
                </Text>
              </View>
            </View>
            <View className="px-3 py-1 rounded-full bg-emerald-600/90 border border-emerald-400/60">
              <Text className="text-white text-xs font-semibold">{item.quantity} {item.unit}</Text>
            </View>
          </View>
        </View>

        <View className="flex-1 bg-white dark:bg-gray-900 -mt-10 rounded-t-3xl px-6 pt-8 pb-24">
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">{item.title}</Text>
              
              <View className="flex-row items-center mb-2">
                {item.discountedPrice !== null && item.discountedPrice !== undefined ? (
                  <>
                    <Text className="text-emerald-700 dark:text-emerald-200 font-bold text-2xl mr-2">
                      {item.discountedPrice === 0 ? 'Free' : `${getCurrencySymbol(item.priceCurrency)}${item.discountedPrice}`}
                    </Text>
                    {item.originalPrice && (
                      <Text className="text-gray-500 dark:text-gray-400 line-through text-lg">{getCurrencySymbol(item.priceCurrency)}{item.originalPrice}</Text>
                    )}
                  </>
                ) : item.originalPrice ? (
                  <Text className="text-emerald-700 dark:text-emerald-200 font-bold text-2xl">{getCurrencySymbol(item.priceCurrency)}{item.originalPrice}</Text>
                ) : (
                  <Text className="text-emerald-700 dark:text-emerald-200 font-bold text-2xl">Free</Text>
                )}
              </View>

              <View className="flex-row items-center mt-1">
                <MapPin size={16} color="#10b981" />
                <Text className="text-gray-700 dark:text-gray-200 ml-2 text-sm" numberOfLines={2}>{item.location.address}</Text>
              </View>
            </View>
            <View className="items-end">
              <View className="bg-emerald-50 dark:bg-emerald-900/40 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <Text className="text-emerald-700 dark:text-emerald-100 font-bold text-lg">{item.quantity} {item.unit}</Text>
              </View>
              <View className="mt-3 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800 flex-row items-center">
                <Clock size={14} color="#2563eb" />
                <Text className="text-blue-700 dark:text-blue-200 ml-2 text-xs font-semibold">
                  Expires {format(new Date(item.expiryDate), 'MMM d, yyyy')}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
            <TouchableOpacity onPress={() => router.push(`/user/${item.user.id}`)}>
              <Image 
                source={{ uri: item.user.avatarUrl || 'https://via.placeholder.com/40' }} 
                className="w-12 h-12 rounded-full mr-4 border-2 border-white dark:border-gray-700"
              />
            </TouchableOpacity>
            <View className="flex-1">
              <TouchableOpacity onPress={() => router.push(`/user/${item.user.id}`)}>
                <Text className="text-gray-900 dark:text-white font-bold text-[17px] leading-tight">{item.user.displayName}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 flex-row items-center"
              onPress={handleMessage}
            >
              <Mail size={16} color={colorScheme === 'dark' ? '#e5e7eb' : '#374151'} className="mr-2" />
              <Text className="text-gray-700 dark:text-gray-200 font-medium text-sm">Message</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-900 dark:text-white font-bold text-xl mb-3">Description</Text>
          <Text className="text-gray-700 dark:text-gray-200 text-[15px] leading-6 mb-6">{item.description}</Text>
          
          {item.category && (
            <View className="flex-row mb-6">
              <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium">{item.category}</Text>
              </View>
            </View>
          )}

          <View className="mb-8">
            <Text className="text-gray-900 dark:text-white font-bold text-xl mb-3">Location</Text>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <View className="p-4">
                <View className="flex-row items-start">
                  <MapPin size={20} color="#22c55e" className="mt-0.5" />
                  <Text className="text-gray-800 dark:text-gray-100 ml-3 flex-1 text-base font-semibold leading-6">
                    {item.location.address}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                    const latLng = `${item.location.latitude},${item.location.longitude}`;
                    const label = item.title;
                    const url = Platform.select({
                      ios: `${scheme}${label}@${latLng}`,
                      android: `${scheme}${latLng}(${label})`
                    });
                    if (url) Linking.openURL(url);
                  }}
                  className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 py-3 rounded-xl flex-row justify-center items-center border border-emerald-100 dark:border-emerald-800"
                >
                  <Navigation size={16} color="#16a34a" className="mr-2" />
                  <Text className="text-emerald-700 dark:text-emerald-200 font-bold">Get Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl flex-row items-center mb-10 border border-red-100 dark:border-red-800">
            <Clock size={20} color="#ef4444" />
            <View className="ml-3">
              <Text className="text-red-600 dark:text-red-200 font-semibold">Expires {formatDistanceToNow(new Date(item.expiryDate), { addSuffix: true })}</Text>
              <Text className="text-red-500 dark:text-red-300 text-xs mt-1">{format(new Date(item.expiryDate), 'PPP')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 absolute bottom-0 w-full shadow-lg">
        <TouchableOpacity 
          className={`w-full py-4 rounded-2xl items-center shadow-md ${
            item.status === 'AVAILABLE' ? 'bg-green-600 shadow-green-200 dark:shadow-none' : 'bg-gray-300 dark:bg-gray-700'
          }`}
          onPress={handleClaim}
          disabled={item.status !== 'AVAILABLE' || claiming}
        >
          {claiming ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg tracking-wide">
              {item.status === 'AVAILABLE' 
                ? (item.originalPrice || item.discountedPrice ? 'Buy Now' : 'Claim This Item') 
                : 'Not Available'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <StatusPopup
        visible={!!status}
        type={status?.type || 'success'}
        title={status?.title || ''}
        description={status?.description}
        primaryLabel={status?.type === 'success' ? 'Great' : 'Dismiss'}
        onPrimary={() => {
          status?.onConfirm?.();
          setStatus(null);
        }}
        secondaryLabel={status?.type === 'error' ? 'Retry' : undefined}
        onSecondary={() => setStatus(null)}
      />
    </View>
  );
}
