import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore, Item } from '../../store';
import { MapPin, Clock, User, ArrowLeft, Share2, Heart } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../../services/api';
import { StatusPopup, LoadingView } from '../../components/ui/States';

export default function ItemDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { claimItem } = useStore();
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
      setStatus({ type: 'error', title: 'Claim failed', description: 'Please try again.' });
    } finally {
      setClaiming(false);
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
    <View className="flex-1 bg-white">
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
            <View className="w-full h-96 bg-gray-200 justify-center items-center">
              <Text className="text-gray-400">No Image Available</Text>
            </View>
          )}
          
          {/* Gradient Overlay could go here */}
          <View className="absolute top-0 left-0 right-0 h-24 bg-black/30" />

          <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center">
            <TouchableOpacity 
              className="bg-white/20 backdrop-blur-md p-3 rounded-full"
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={colorScheme === 'dark' ? '#fff' : '#0f172a'} />
            </TouchableOpacity>
            <View className="flex-row space-x-3">
              <TouchableOpacity className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                <Heart size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                <Share2 size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-1 bg-white -mt-10 rounded-t-3xl px-6 pt-8 pb-24">
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{item.title}</Text>
              <View className="flex-row items-center">
                <MapPin size={16} color="#6b7280" />
                <Text className="text-gray-500 ml-1 text-sm">{item.location.address}</Text>
              </View>
            </View>
            <View className="bg-green-100 px-4 py-2 rounded-xl">
              <Text className="text-green-700 font-bold text-lg">{item.quantity} {item.unit}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-8 bg-gray-50 p-4 rounded-2xl">
            <Image 
              source={{ uri: item.user.avatarUrl || 'https://via.placeholder.com/40' }} 
              className="w-12 h-12 rounded-full mr-4 border-2 border-white"
            />
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-base">{item.user.displayName}</Text>
              <Text className="text-gray-500 text-xs">Posted {formatDistanceToNow(new Date(), { addSuffix: true })}</Text>
            </View>
            <TouchableOpacity className="bg-white px-4 py-2 rounded-lg border border-gray-200">
              <Text className="text-gray-700 font-medium text-sm">Message</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-900 font-bold text-xl mb-3">Description</Text>
          <Text className="text-gray-600 text-base leading-7 mb-8">{item.description}</Text>

          <View className="bg-red-50 p-4 rounded-xl flex-row items-center mb-8">
            <Clock size={20} color="#ef4444" />
            <Text className="text-red-500 ml-3 font-medium">
              Expires {formatDistanceToNow(new Date(item.expiryDate), { addSuffix: true })}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="p-6 border-t border-gray-100 bg-white absolute bottom-0 w-full shadow-lg">
        <TouchableOpacity 
          className={`w-full py-4 rounded-2xl items-center shadow-md ${
            item.status === 'AVAILABLE' ? 'bg-green-600 shadow-green-200' : 'bg-gray-300'
          }`}
          onPress={handleClaim}
          disabled={item.status !== 'AVAILABLE' || claiming}
        >
          {claiming ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg tracking-wide">
              {item.status === 'AVAILABLE' ? 'Claim This Item' : 'Not Available'}
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