// app/profile/[id].tsx
import { followImmediately } from '@/lib/actions/follow'; // adjust path as needed
import { supabase } from '@/lib/supabase'; // adjust path as needed
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Button,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<string | null>(null);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Fetch profile data
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [id]);

  // Fetch current user and follow status
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchUserAndFollowStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const currentId = user?.id ?? null;
      setCurrentUserId(currentId);

      if (currentId && currentId !== id) {
        const { data, error } = await supabase
          .from('follows')
          .select('status')
          .eq('follower_id', currentId)
          .eq('following_id', id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching follow status:', error.message);
          setFollowStatus(null);
        } else {
          setFollowStatus(data?.status ?? null);
        }
      }
    };

    fetchUserAndFollowStatus();
  }, [id]);

    const handleFollow = async () => {
    if (!currentUserId || !id) {
        console.log('Missing user ID or profile ID:', { currentUserId, id });
        return;
    }

    try {
        console.log('Starting follow request:', { follower: currentUserId, following: id });
        setLoadingFollow(true);
        const result = await followImmediately(currentUserId, id);
        console.log('Follow immediately result:', result);
        setFollowStatus('accepted'); // or pending, depending on your logic
    } catch (error) {
        console.error('Follow error:', error);
    } finally {
        setLoadingFollow(false);
    }
    };

  if (loadingProfile) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Profile not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile.avatar_url && (
        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
      )}
      <Text style={styles.username}>@{profile.username}</Text>
      {profile.full_name && <Text style={styles.fullName}>{profile.full_name}</Text>}
      {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

      {/* Follow button logic */}
      {currentUserId && currentUserId !== id && (
        <View style={{ marginTop: 20, width: '100%' }}>
          {followStatus === 'accepted' ? (
            <Text style={styles.followingText}>Following</Text>
          ) : followStatus === 'pending' ? (
            <Text style={styles.pendingText}>Follow Request Sent</Text>
          ) : (
            <Button
              title={loadingFollow ? 'Following...' : 'Follow'}
              onPress={handleFollow}
              disabled={loadingFollow}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
  username: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  fullName: { fontSize: 18, marginBottom: 6, color: '#555' },
  bio: { fontSize: 14, textAlign: 'center', marginBottom: 20, color: '#666' },
  followingText: {
    textAlign: 'center',
    color: 'green',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pendingText: {
    textAlign: 'center',
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
