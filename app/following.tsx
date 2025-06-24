import { useAuth } from '@/contexts/AuthContext'; // import your hook
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { getFollowing } from '../lib/queries/follows';

export default function FollowingScreen() {
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getFollowing(user.id).then(data => {
      setFollowing(data);
      setLoading(false);
    });
  }, [user]);

  if (!user) return <Text>Please log in to see who you follow.</Text>;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ marginBottom: 20, fontWeight: 'bold' }}>Following</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
            data={following}
            keyExtractor={item => item.profiles.id} // or item.following_id
            renderItem={({ item }) => (
                <View style={{ padding: 10, borderBottomWidth: 1 }}>
                <Text>{item.profiles.username}</Text>
                </View>
            )}
            />
      )}
    </View>
  );
}
