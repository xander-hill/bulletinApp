import { useEvents } from '@/hooks/useEvents';
import { followImmediately, unfollow } from '@/lib/actions/follow'; // adjust imports if needed
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams();

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<string | null>(null);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const {
    events,
    loading: eventsLoading,
    refreshing,
    fetchMore,
    onRefresh,
    hasMore,
  } = useEvents({
    userId: id as string,
    initialFilter: 'my',
  });

  // Fetch profile data and current user ID
  const fetchProfileData = useCallback(async () => {
    if (!id || typeof id !== 'string') return;
    setLoadingProfile(true);

    try {
      const [{ data: profileData, error: profileError }, authResponse] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('id', id).single(),
          supabase.auth.getUser(),
        ]);

      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        setProfile(null);
      } else {
        setProfile(profileData);
      }

      setCurrentUserId(authResponse.data.user?.id ?? null);
    } catch (error) {
      console.error('Unexpected error fetching profile data:', error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
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
    } catch (error) {
      Alert.alert('Error', 'Failed to unfollow user.');
      console.error('Unfollow error:', error);
    } finally {
      setLoadingFollow(false);
    }
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

      {/* Events feed */}
      <View style={{ width: '100%', marginTop: 30 }}>
        <Text style={styles.sectionTitle}>Events</Text>

        {eventsLoading && events.length === 0 ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : events.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
            No events found.
          </Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            onEndReached={() => {
              if (hasMore) fetchMore();
            }}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.eventCard}>
                {item.image_url && (
                  <Image source={{ uri: item.image_url }} style={styles.eventImage} />
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(item.start_time).toLocaleDateString()}
                  </Text>
                  {item.location && (
                    <Text style={styles.eventLocation}>{item.location}</Text>
                  )}
                </View>
              </View>
            )}
          />
        )}
      </View>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  eventDate: {
    color: '#555',
    fontSize: 13,
  },
  eventLocation: {
    color: '#888',
    fontSize: 12,
  },
});
