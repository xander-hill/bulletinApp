import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Button, Text, TouchableOpacity, View } from 'react-native';
import { useProfile } from '../../hooks/useProfile';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  if (loading) return <Text>Loading...</Text>;
  if (!profile) return <Text>No profile found.</Text>;

  const handleSignOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Error signing out', error.message);
      } else {
        router.replace('/signin'); // send user back to sign-in
      }
    };

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
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}
