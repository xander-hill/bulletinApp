import { followImmediately, unfollow } from '@/lib/actions/follow'; // add unfollow if available
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<string | null>(null);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  const [refreshing, setRefreshing] = useState(false);

  // Fetch profile and follower/following counts
  const fetchProfileData = useCallback(async () => {
    if (!id || typeof id !== 'string') return;
    setLoadingProfile(true);

    try {
      const [{ data: profileData, error: profileError }, 
             { data: followersData, error: followersError },
             { data: followingData, error: followingError },
             authResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('follows').select('follower_id', { count: 'exact' }).eq('following_id', id),
        supabase.from('follows').select('following_id', { count: 'exact' }).eq('follower_id', id),
        supabase.auth.getUser(),
      ]);

      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        setProfile(null);
      } else {
        setProfile(profileData);
      }

      if (followersError) {
        console.error('Error fetching followers count:', followersError.message);
        setFollowersCount(0);
      } else {
        setFollowersCount(followersData?.count ?? 0);
      }

      if (followingError) {
        console.error('Error fetching following count:', followingError.message);
        setFollowingCount(0);
      } else {
        setFollowingCount(followingData?.count ?? 0);
      }

      setCurrentUserId(authResponse.data.user?.id ?? null);

    } catch (error) {
      console.error('Unexpected error fetching profile data:', error);
      setProfile(null);
      setFollowersCount(0);
      setFollowingCount(0);
    } finally {
      setLoadingProfile(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Fetch follow status for current user
  useEffect(() => {
    if (!id || typeof id !== 'string' || !currentUserId || currentUserId === id) {
      setFollowStatus(null);
      return;
    }

    const fetchFollowStatus = async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('status')
        .eq('follower_id', currentUserId)
        .eq('following_id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching follow status:', error.message);
        setFollowStatus(null);
      } else {
        setFollowStatus(data?.status ?? null);
      }
    };

    fetchFollowStatus();
  }, [id, currentUserId]);

  const handleFollow = async () => {
    if (!currentUserId || !id) {
      Alert.alert('Error', 'User IDs missing.');
      return;
    }
    setLoadingFollow(true);

    try {
      await followImmediately(currentUserId, id);
      setFollowStatus('accepted');
      setFollowersCount(count => count + 1);
    } catch (error) {
      Alert.alert('Error', 'Failed to follow user.');
      console.error('Follow error:', error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUserId || !id) {
      Alert.alert('Error', 'User IDs missing.');
      return;
    }
    setLoadingFollow(true);

    try {
      await unfollow(currentUserId, id);
      setFollowStatus(null);
      setFollowersCount(count => Math.max(0, count - 1));
    } catch (error) {
      Alert.alert('Error', 'Failed to unfollow user.');
      console.error('Unfollow error:', error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  if (loadingProfile) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Profile not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {profile.avatar_url && (
        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
      )}
      <Text style={styles.username}>@{profile.username}</Text>
      {profile.full_name && <Text style={styles.fullName}>{profile.full_name}</Text>}
      {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

      <View style={styles.countsContainer}>
        <View style={styles.countBox}>
          <Text style={styles.countNumber}>{followersCount}</Text>
          <Text style={styles.countLabel}>Followers</Text>
        </View>
        <View style={styles.countBox}>
          <Text style={styles.countNumber}>{followingCount}</Text>
          <Text style={styles.countLabel}>Following</Text>
        </View>
      </View>

      {/* Follow button logic */}
      {currentUserId && currentUserId !== id && (
        <View style={{ marginTop: 20, width: '100%' }}>
          {followStatus === 'accepted' ? (
            <TouchableOpacity
              style={[styles.followButton, styles.unfollowButton]}
              onPress={handleUnfollow}
              disabled={loadingFollow}
            >
              <Text style={styles.unfollowButtonText}>
                {loadingFollow ? 'Unfollowing...' : 'Unfollow'}
              </Text>
            </TouchableOpacity>
          ) : followStatus === 'pending' ? (
            <Text style={styles.pendingText}>Follow Request Sent</Text>
          ) : (
            <TouchableOpacity
              style={styles.followButton}
              onPress={handleFollow}
              disabled={loadingFollow}
            >
              <Text style={styles.followButtonText}>
                {loadingFollow ? 'Following...' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fullName: {
    fontSize: 18,
    marginBottom: 6,
    color: '#555',
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  countsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  countBox: {
    alignItems: 'center',
  },
  countNumber: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  countLabel: {
    fontSize: 14,
    color: '#666',
  },
  followButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  unfollowButton: {
    backgroundColor: '#ff3b30',
  },
  unfollowButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  pendingText: {
    textAlign: 'center',
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
