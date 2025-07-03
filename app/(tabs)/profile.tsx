import ProfileFeed from '@/components/ProfileFeed';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Button, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      router.replace('/signin');
    }
  };

  console.log('Profile avatar_url:', profile.avatar_url);


  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Profile Header */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
            resizeMode="cover"
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          />
        ) : (
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#ccc',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 32 }}>{profile.username[0].toUpperCase()}</Text>
          </View>
        )}
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>
          {profile.username}
        </Text>
        {profile.full_name && (
          <Text style={{ fontSize: 16, color: '#555' }}>{profile.full_name}</Text>
        )}
        {profile.bio && (
          <Text style={{ fontSize: 14, color: '#333', marginTop: 10, textAlign: 'center' }}>
            {profile.bio}
          </Text>
        )}
        {profile.interests && profile.interests.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 10,
            }}
          >
            {profile.interests.map((interest) => (
              <View
                key={interest}
                style={{
                  backgroundColor: '#e0e0e0',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 15,
                  margin: 4,
                }}
              >
                <Text style={{ fontSize: 12 }}>{interest}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Followers / Following */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.push('/followers')}>
          <Text style={{ fontSize: 16 }}>
            Followers: {profile.follower_count ?? 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/following')}>
          <Text style={{ fontSize: 16 }}>
            Following: {profile.following_count ?? 0}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity
        onPress={() => router.push('/edit-profile')}
        style={{
          backgroundColor: '#4CAF50',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Sign Out Button */}
      <View style={{ marginVertical: 20 }}>
        <Button title="Sign Out" onPress={handleSignOut} color="#f44336" />
      </View>

      <ProfileFeed
        userId={profile.id}
      />
    </SafeAreaView>
  );
}

