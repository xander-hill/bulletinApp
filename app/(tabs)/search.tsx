// screens/ProfileSearchScreen.tsx
import { supabase } from '@/lib/supabase'; // adjust path if needed
import { useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const PAGE_SIZE = 20;

interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

const ProfileItem = ({ item, onPress }: { item: Profile; onPress: () => void }) => (
  <TouchableOpacity style={styles.profile} onPress={onPress}>
    {item.avatar_url && <Image source={{ uri: item.avatar_url }} style={styles.avatar} />}
    <View>
      <Text style={styles.username}>{item.username}</Text>
      {item.full_name && <Text style={styles.fullName}>{item.full_name}</Text>}
    </View>
  </TouchableOpacity>
);

export default function ProfileSearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const router = useRouter();

  const fetchProfiles = useCallback(async (search: string, pageNum = 1) => {
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
    } else if (data) {
      setResults(prev => (pageNum === 1 ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
      setPage(pageNum);
    }
    setLoading(false);
  }, []);

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      fetchProfiles(text, 1);
    }, 300),
    [fetchProfiles]
  );

  useEffect(() => {
    if (query.trim().length > 0) {
      debouncedSearch(query);
    } else {
      setResults([]);
      setHasMore(true);
      setPage(1);
    }
  }, [query, debouncedSearch]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProfiles(query, page + 1);
    }
  };

  const onSearchSubmit = () => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;

    setRecentSearches(prev => {
      const updated = [trimmed, ...prev.filter(s => s !== trimmed)];
      return updated.slice(0, 5);
    });

    fetchProfiles(trimmed, 1);
    Keyboard.dismiss();
  };

  const onRecentSearchPress = (search: string) => {
    setQuery(search);
    fetchProfiles(search, 1);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search profiles..."
        value={query}
        onChangeText={setQuery}
        style={styles.input}
        onSubmitEditing={onSearchSubmit}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
      />

      {query.trim() === '' && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.recentHeader}>Recent Searches</Text>
          {recentSearches.map((search) => (
            <TouchableOpacity
              key={search}
              onPress={() => onRecentSearchPress(search)}
              style={styles.recentItem}
            >
              <Text style={styles.recentText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading && page === 1 ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : results.length === 0 && query.trim() !== '' ? (
        <Text style={styles.noResults}>No profiles found.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProfileItem item={item} onPress={() => router.push(`/profile/${item.id}`)} />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 30, // move search bar down
    marginBottom: 10,
    fontSize: 16,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  fullName: {
    color: '#666',
    fontSize: 12,
  },
  noResults: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
  recentContainer: {
    marginBottom: 20,
  },
  recentHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
    color: '#444',
  },
  recentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentText: {
    fontSize: 15,
    color: '#007AFF',
  },
});
