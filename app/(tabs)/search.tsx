// screens/ProfileSearchScreen.tsx
import { supabase } from '@/lib/supabase'; // adjust this path as needed
import { useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PAGE_SIZE = 20;

export default function ProfileSearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();

  const fetchProfiles = useCallback(
    async (search: string, pageNum = 1) => {
      setLoading(true);
      const from = (pageNum - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${search}%`)
        .range(from, to);

      if (error) {
        console.error('Error fetching profiles:', error.message);
      } else {
        if (pageNum === 1) {
          setResults(data);
        } else {
          setResults(prev => [...prev, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE);
      }

      setLoading(false);
    },
    []
  );

  // Debounced search effect
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setPage(1);
      fetchProfiles(text, 1);
    }, 300),
    []
  );

  useEffect(() => {
    if (query.trim().length > 0) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      fetchProfiles(query, nextPage);
      setPage(nextPage);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.profile} onPress={() => router.push(`/profile/${item.id}`)}>
      {item.avatar_url && (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      )}
      <Text style={styles.username}>{item.username}</Text>
      {item.full_name && <Text>{item.full_name}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search profiles..."
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />
      {loading && page === 1 ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
  },
});
