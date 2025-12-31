import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, ArrowLeft, X, ChevronRight, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { api } from '../services/api';
import InputField from '../components/ui/InputField';
import { EmptyState, LoadingView } from '../components/ui/States';

export default function SearchUsers() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PEOPLE' | 'SHOPKEEPER'>('ALL');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${text}`);
      // Optionally filter client-side by role for quicker UX
      const data = res.data || [];
      if (filter === 'SHOPKEEPER') {
        setResults(data.filter((u: any) => u.role === 'SHOPKEEPER'));
      } else if (filter === 'PEOPLE') {
        setResults(data.filter((u: any) => u.role !== 'SHOPKEEPER'));
      } else {
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/user/${item.id}`)}
      className="flex-row items-center p-4 bg-white dark:bg-gray-800 mb-3 mx-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.avatarUrl || 'https://via.placeholder.com/50' }}
        className="w-12 h-12 rounded-full mr-4 border-2 border-gray-100 dark:border-gray-600"
      />

      <View className="flex-1" style={{ minWidth: 0 }}>
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1} ellipsizeMode="tail">
          {item.displayName}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ minWidth: 0 }}>
            <View className={`px-2 py-0.5 rounded-md mr-2 ${item.role === 'SHOPKEEPER' ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
              <Text className={`text-[10px] font-bold ${item.role === 'SHOPKEEPER' ? 'text-purple-700 dark:text-purple-300' : 'text-blue-700 dark:text-blue-300'}`}>
                {item.role === 'SHOPKEEPER' ? 'Shop' : 'Person'}
              </Text>
            </View>

            <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1} ellipsizeMode="tail">
              {item.email}
            </Text>
          </View>

          {/* Actions removed: tapping the entire card navigates to the user's profile */}
        </View>
      </View>

      <ChevronRight size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-800 shadow-sm z-10">
        <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityLabel="Back"
              className="mr-3 p-3 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm"
            >
              <ArrowLeft size={22} color={colorScheme === 'dark' ? '#ffffff' : '#111827'} />
            </TouchableOpacity>
            <View className="flex-1">
              <InputField
                icon={<SearchIcon size={20} color="#6b7280" />}
                inputRef={inputRef}
                value={query}
                onChangeText={handleSearch}
                placeholder="Search by name or email..."
                autoFocus
                returnKeyType="search"
                onSubmitEditing={() => handleSearch(query)}
                rightElement={
                  query.length > 0 ? (
                    <TouchableOpacity onPress={clearSearch}>
                      <X size={18} color="#9ca3af" />
                    </TouchableOpacity>
                  ) : null
                }
              />

              <View className="flex-row items-center justify-start mt-3">
                {['ALL', 'PEOPLE', 'SHOPKEEPER'].map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => {
                      // update filter and re-run local filtering
                      setFilter(f as any);
                      if (query.length >= 2) handleSearch(query);
                    }}
                    className={`mr-3 px-3 py-1 rounded-full border ${filter === f ? 'bg-green-600 border-green-600' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                  >
                    <Text className={`text-sm font-semibold ${filter === f ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {f === 'ALL' ? 'All' : f === 'PEOPLE' ? 'People' : 'Shopkeepers'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
        </View>
      </View>

      {loading ? (
        <LoadingView message="Searching users..." />
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            query.length > 1 ? (
              <EmptyState
                icon={<User size={48} color="#9ca3af" />}
                title="No users found"
                description="Try a different name or email."
              />
            ) : (
              <EmptyState
                icon={<SearchIcon size={48} color="#9ca3af" />}
                title="Search Community"
                description="Find friends and shopkeepers to connect with."
              />
            )
          }
        />
      )}
    </View>
  );
}
