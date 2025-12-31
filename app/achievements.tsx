import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { api } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import {
  ArrowLeft,
  Award,
  Flame,
  Zap,
  Trophy,
  Star,
  Heart,
  Crown,
  TrendingUp,
  Medal,
  Users,
  Target
} from 'lucide-react-native';

type LeaderboardEntry = {
  position: number;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  count: number;
};

type AchievementResponse = {
  stats: {
    shared: number;
    claimed: number;
    streak: {
      current: number;
      best: number;
      lastActive: string | null;
    };
  };
  leaderboard: {
    sharers: LeaderboardEntry[];
    claimers: LeaderboardEntry[];
  };
  rank: {
    shared: number | null;
    claimed: number | null;
  };
};

type AchievementConfig = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  target: number;
  value: (data: AchievementResponse) => number;
};

const ACHIEVEMENT_CONFIG: AchievementConfig[] = [
  {
    id: 'first-share',
    title: 'First Share',
    description: 'Post your first item',
    icon: Award,
    color: '#22c55e',
    target: 1,
    value: (data) => data.stats.shared,
  },
  {
    id: 'community-helper',
    title: 'Community Helper',
    description: 'Share 5 items',
    icon: Heart,
    color: '#f97316',
    target: 5,
    value: (data) => data.stats.shared,
  },
  {
    id: 'super-sharer',
    title: 'Super Sharer',
    description: 'Share 15 items',
    icon: Crown,
    color: '#a855f7',
    target: 15,
    value: (data) => data.stats.shared,
  },
  {
    id: 'active-claimer',
    title: 'Active Claimer',
    description: 'Claim 5 items',
    icon: Target,
    color: '#06b6d4',
    target: 5,
    value: (data) => data.stats.claimed,
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Claim 15 items',
    icon: Medal,
    color: '#eab308',
    target: 15,
    value: (data) => data.stats.claimed,
  },
  {
    id: 'streaker',
    title: 'On A Roll',
    description: '7-day active streak',
    icon: Flame,
    color: '#ef4444',
    target: 7,
    value: (data) => data.stats.streak.best,
  },
  {
    id: 'speedster',
    title: 'Weekly Habit',
    description: '3-day current streak',
    icon: Zap,
    color: '#3b82f6',
    target: 3,
    value: (data) => data.stats.streak.current,
  },
  {
    id: 'top-10',
    title: 'Leaderboard Ready',
    description: 'Reach top 10 sharers or claimers',
    icon: Trophy,
    color: '#f59e0b',
    target: 10,
    value: (data) => {
      const ranks = [data.rank.shared, data.rank.claimed].filter((r): r is number => !!r);
      if (ranks.length === 0) return 0;
      return Math.max(0, 11 - Math.min(...ranks));
    },
  },
];

export default function Achievements() {
  const router = useRouter();
  const { user } = useUser();
  const { colorScheme } = useColorScheme();
  const [data, setData] = useState<AchievementResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await api.get('/users/achievements');
        setData(res.data);
      } catch (err: any) {
        console.error('Failed to load achievements', err);
        setError('Could not load achievements right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const computedAchievements = useMemo(() => {
    if (!data) return [];

    return ACHIEVEMENT_CONFIG.map((config) => {
      const current = config.value(data);
      const progress = Math.min(1, current / config.target);
      const unlocked = current >= config.target || progress >= 1;

      return {
        ...config,
        current,
        progress,
        unlocked,
      };
    });
  }, [data]);

  const renderLeaderboard = (title: string, entries: LeaderboardEntry[]) => (
    <View className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">{title}</Text>
        <Users size={18} color="#22c55e" />
      </View>
      {entries.length === 0 && (
        <Text className="text-sm text-gray-500 dark:text-gray-400">No data yet. Be the first!</Text>
      )}
      {entries.map((entry) => {
        const isYou = entry.userId === user?.id;
        return (
          <View
            key={`${title}-${entry.position}-${entry.userId}`}
            className={`flex-row items-center justify-between py-3 ${entry.position !== entries.length ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
                <Text className="text-gray-800 dark:text-white text-xs font-semibold">#{entry.position}</Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center overflow-hidden mr-3">
                {entry.avatarUrl ? (
                  <Image source={{ uri: entry.avatarUrl }} className="w-10 h-10" />
                ) : (
                  <Text className="text-gray-500 text-sm font-semibold">{entry.displayName?.slice(0, 1) || '?'}</Text>
                )}
              </View>
              <View>
                <Text className={`text-sm font-semibold ${isYou ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                  {isYou ? 'You' : entry.displayName || 'Anonymous'}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">{entry.count} {title.toLowerCase().includes('share') ? 'shared' : 'claimed'}</Text>
              </View>
            </View>
            {isYou && (
              <View className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/40">
                <Text className="text-[11px] font-semibold text-green-700 dark:text-green-300">You</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">Loading achievements...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
        <Text className="text-base text-red-500 font-semibold mb-2">{error || 'Something went wrong'}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">Please check your connection and try again.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-4 py-2 bg-green-600 rounded-full">
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-800 shadow-sm z-10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700">
          <ArrowLeft size={24} color={colorScheme === 'dark' ? '#fff' : '#111827'} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Achievements</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Highlight cards */}
        <View className="flex-row mb-4">
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-3xl p-4 mr-2 border border-gray-100 dark:border-gray-700 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Shared Items</Text>
              <TrendingUp size={18} color="#22c55e" />
            </View>
            <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">{data.stats.shared}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rank {data.rank.shared ? `#${data.rank.shared}` : '—'}</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-3xl p-4 ml-2 border border-gray-100 dark:border-gray-700 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Claimed Items</Text>
              <Star size={18} color="#f59e0b" />
            </View>
            <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">{data.stats.claimed}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rank {data.rank.claimed ? `#${data.rank.claimed}` : '—'}</Text>
          </View>
        </View>

        <LinearGradient colors={['#16a34a', '#10b981']} className="rounded-3xl p-4 mb-6 shadow-md">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-sm opacity-80">Active streak</Text>
              <Text className="text-3xl font-extrabold text-white mt-1">{data.stats.streak.current} days</Text>
              <Text className="text-xs text-white/80 mt-1">Best streak: {data.stats.streak.best} days</Text>
            </View>
            <Flame size={48} color="#fff" />
          </View>
        </LinearGradient>

        {/* Achievements grid */}
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Your badges</Text>
        <View className="flex-row flex-wrap justify-between">
          {computedAchievements.map((achievement) => (
            <View
              key={achievement.id}
              className="w-[48%] bg-white dark:bg-gray-800 p-4 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${achievement.color}20` }}>
                  <achievement.icon size={24} color={achievement.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                    {achievement.title}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={2}>
                    {achievement.description}
                  </Text>
                </View>
              </View>
              <View className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <View
                  className="h-2 rounded-full"
                  style={{ backgroundColor: achievement.color, width: `${Math.min(100, achievement.progress * 100)}%` }}
                />
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-xs text-gray-500 dark:text-gray-400">{Math.min(achievement.current, achievement.target)} / {achievement.target}</Text>
                <Text className={`text-xs font-semibold ${achievement.unlocked ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {achievement.unlocked ? 'Unlocked' : `${Math.round(achievement.progress * 100)}%`}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Leaderboards */}
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Leaderboards</Text>
        {renderLeaderboard('Top sharers', data.leaderboard.sharers)}
        {renderLeaderboard('Top claimers', data.leaderboard.claimers)}

        {/* Call to action */}
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm mt-2">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Push your next badge</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Share items to climb the board faster</Text>
            </View>
            <Medal size={32} color="#22c55e" />
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/post')}
              className="flex-1 bg-green-600 rounded-2xl py-3 mr-2 items-center"
            >
              <Text className="text-white font-semibold">Share now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/home')}
              className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl py-3 ml-2 items-center"
            >
              <Text className="text-gray-900 dark:text-white font-semibold">Find items</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
