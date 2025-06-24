import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useProfile } from '../../hooks/useProfile'; // your existing hook

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  if (loading) return <Text>Loading...</Text>;
  if (!profile) return <Text>No profile found.</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text>Username: {profile.username}</Text>
      <Text>Full Name: {profile.full_name ?? 'N/A'}</Text>

      {/* Followers button */}
      <TouchableOpacity
        onPress={() => router.push('/followers')}
        style={{ marginTop: 20, padding: 10, backgroundColor: 'lightblue' }}
      >
        <Text>Followers ({profile.follower_count ?? 0})</Text>
      </TouchableOpacity>

      {/* Following button */}
      <TouchableOpacity
        onPress={() => router.push('/following')}
        style={{ marginTop: 10, padding: 10, backgroundColor: 'lightgreen' }}
      >
        <Text>Following ({profile.following_count ?? 0})</Text>
      </TouchableOpacity>
    </View>
  );
}
