// screens/EditProfileScreen.tsx
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, Switch, Text, TextInput, View } from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setUsername(profile.username ?? '');
      setBio(profile.bio ?? '');
      setInterests(profile.interests?.join(', ') ?? '');
      setIsPrivate(profile.is_private ?? false);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username,
        bio,
        interests: interests.split(',').map((tag) => tag.trim()).filter(Boolean),
        is_private: isPrivate,
      })
      .eq('id', profile.id);

    setSaving(false);

    if (error) {
      Alert.alert('Error updating profile', error.message);
    } else {
      Alert.alert('Profile updated!');
      router.back();
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (!profile) return <Text>No profile found.</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />

      <Text>Full Name</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full Name"
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />

      <Text>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Bio"
        multiline
        style={{ borderWidth: 1, padding: 8, marginBottom: 12, height: 80 }}
      />

      <Text>Interests (comma-separated)</Text>
      <TextInput
        value={interests}
        onChangeText={setInterests}
        placeholder="e.g., music, sports, tech"
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text>Private Account</Text>
        <Switch value={isPrivate} onValueChange={setIsPrivate} style={{ marginLeft: 12 }} />
      </View>

      <Button title={saving ? "Saving..." : "Save Changes"} onPress={handleSave} disabled={saving} />
    </ScrollView>
  );
}
