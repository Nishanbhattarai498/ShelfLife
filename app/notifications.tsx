import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, LoadingView } from '../components/ui/States';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

type NotificationType = 'MESSAGE' | 'ITEM_UPDATE' | 'SYSTEM';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const badgeStyles = useMemo(
    () => ({
      baseBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
      cardBg: isDark ? '#0b1220' : '#ffffff',
      border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
      muted: isDark ? '#cbd5e1' : '#475569',
      text: isDark ? '#e2e8f0' : '#0f172a',
      unread: isDark ? 'rgba(34,197,94,0.16)' : 'rgba(34,197,94,0.12)',
      unreadDot: '#22c55e',
    }),
    [isDark]
  );

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    api.put('/notifications/read-all').catch(console.error);
  }, []);

  const handleMarkAll = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: { type?: NotificationType; relatedId?: string; message: string; createdAt: string; read?: boolean; [key: string]: any } }) => {
    const typeMetaMap: Record<NotificationType, { label: string; icon: string; color: string }> = {
      MESSAGE: { label: 'Message', icon: 'chatbubble-ellipses-outline', color: '#22c55e' },
      ITEM_UPDATE: { label: 'Item update', icon: 'cube-outline', color: '#0ea5e9' },
      SYSTEM: { label: 'System', icon: 'notifications-outline', color: '#a855f7' },
    };

    const typeMeta = item.type && typeMetaMap[item.type]
      ? typeMetaMap[item.type]
      : { label: 'Update', icon: 'ellipse-outline', color: '#22c55e' };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (item.type === 'MESSAGE' && item.relatedId) {
            router.push(`/chat/${item.relatedId}`);
          }
        }}
        style={{
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 20,
          padding: 16,
          backgroundColor: item.read ? badgeStyles.cardBg : badgeStyles.unread,
          borderWidth: 1,
          borderColor: badgeStyles.border,
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.25 : 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 10 },
        }}
      >
        <View className="flex-row items-start">
          <View
            className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)' }}
          >
            <Ionicons name={typeMeta.icon as any} size={22} color={typeMeta.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold" style={{ color: badgeStyles.text }} numberOfLines={2}>
                {typeMeta.label}
              </Text>
              <Text className="text-[11px]" style={{ color: badgeStyles.muted }}>
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </Text>
            </View>
            <Text className="text-base font-medium mt-1" style={{ color: badgeStyles.text }} numberOfLines={3}>
              {item.message}
            </Text>
            <View className="flex-row items-center mt-3">
              <View
                className="px-3 py-1 rounded-full mr-3"
                style={{ backgroundColor: badgeStyles.baseBg, borderWidth: 1, borderColor: badgeStyles.border }}
              >
                <Text className="text-[12px] font-semibold" style={{ color: badgeStyles.muted }}>
                  {item.type || 'Update'}
                </Text>
              </View>
              {!item.read && (
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full" style={{ backgroundColor: badgeStyles.unreadDot }} />
                  <Text className="text-[12px] ml-2" style={{ color: badgeStyles.muted }}>
                    New
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? '#0b1220' : '#f8fafc' }}>
      <LinearGradient
        colors={isDark ? ['#0b1220', '#0f172a'] : ['#ecfdf3', '#e0f2fe']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 14, paddingBottom: 18, paddingHorizontal: 18, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginRight: 12 }}>
              <Ionicons name="chevron-back" size={22} color={isDark ? '#e2e8f0' : '#0f172a'} />
            </Pressable>
            <View>
              <Text className="text-lg font-bold" style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>Notifications</Text>
              <Text className="text-[12px]" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Stay updated on items & chats</Text>
            </View>
          </View>
          <Pressable onPress={handleMarkAll} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)' }}>
            <Text className="text-[12px] font-semibold" style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>Mark all read</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {loading ? (
        <LoadingView message="Checking for updates..." />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 16, paddingBottom: 28 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
              }}
              tintColor="#22c55e"
              colors={[isDark ? '#22c55e' : '#16a34a']}
              progressBackgroundColor={isDark ? '#0f172a' : '#ffffff'}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="You are all caught up"
              description="Notifications about messages and item updates will show here."
            />
          }
        />
      )}
    </View>
  );
}
