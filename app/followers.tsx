import { useAuth } from '@/contexts/AuthContext'; // import your hook
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { getFollowers, getPendingFollowRequests } from '../lib/queries/follows'; // your api calls

export default function FollowersScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'accepted' | 'requests'>('accepted');
  const [followers, setFollowers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!user) return;
    setLoading(true);
    if (activeTab === 'accepted') {
      getFollowers(user.id).then(data => {
        setFollowers(data);
        setLoading(false);
      });
    } else {
      getPendingFollowRequests(user.id).then(data => {
        setRequests(data);
        setLoading(false);
      });
    }
  }, [activeTab, user]);

  if (!user) return <Text>Please log in to see your followers.</Text>;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 10,
            backgroundColor: activeTab === 'accepted' ? 'blue' : 'grey',
          }}
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 10,
            backgroundColor: activeTab === 'requests' ? 'blue' : 'grey',
          }}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Requests</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <Text>Loading...</Text>
      ) : activeTab === 'accepted' ? (
        <FlatList
          data={followers}
          keyExtractor={item => item.profiles.id}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text>{item.profiles.username}</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.profiles.id}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text>{item.profiles.username}</Text>
              {/* TODO: Add accept/reject buttons here */}
            </View>
          )}
        />
      )}
    </View>
  );
}
