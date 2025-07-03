import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const availableTags = ['music', 'sports', 'tech', 'art', 'food', 'gaming'];

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setUsername(profile.username ?? '');
      setBio(profile.bio ?? '');
      setInterests(profile.interests ?? []);
      setIsPrivate(profile.is_private ?? false);
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  // const handlePickImage = async (profileId: string, setAvatarUrl: (url: string) => void) => {

  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();

  //   if (user?.id !== profileId) {
  //     console.error('Profile ID does not match logged-in user ID!');
  //     Alert.alert('Error', 'You can only upload avatars for your own profile.');
  //     return;
  //   }

  //   try {
  //     // Request permission to access media library
  //     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //     if (status !== 'granted') {
  //       Alert.alert('Permission denied', 'Permission to access media library is required!');
  //       return;
  //     }

  //     // Launch the image picker
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       allowsEditing: true,
  //       quality: 0.7,
  //     });

  //     if (result.canceled) {
  //       console.log('User cancelled image picking');
  //       return;
  //     }

  //     const file = result.assets[0];
  //     const uri = file.uri;
  //     console.log('Picked image URI:', uri);

  //     // Fetch the file and convert to Blob
  //     const response = await fetch(uri);
  //     const blob = await response.blob();

  //     console.log('Blob size:', blob.size);
  //     console.log('Blob type:', blob.type);

  //     if (blob.size === 0) {
  //       Alert.alert('Error', 'Selected image is empty or unreadable.');
  //       return;
  //     }

  //     // Construct unique storage path
  //     const ext = uri.split('.').pop() || 'jpg';
  //     const path = `${profileId}/${uuid.v4()}.${ext}`;
  //     console.log('Upload path:', path);

  //     // Upload the image to Supabase Storage
  //     const { error: uploadError } = await supabase.storage
  //       .from('avatars')
  //       .upload(path, blob, { upsert: true });

  //     if (uploadError) {
  //       console.error('Upload error:', uploadError);
  //       Alert.alert('Upload failed', uploadError.message);
  //       return;
  //     }

  //     // Get the public URL for the uploaded image
  //     const { data: urlData, error: urlError } = supabase.storage
  //       .from('avatars')
  //       .getPublicUrl(path);

  //     if (urlError) {
  //       console.error('Error getting public URL:', urlError);
  //       Alert.alert('Error', 'Failed to get image URL');
  //       return;
  //     }

  //     console.log('Public URL:', urlData.publicUrl);

  //     // Update avatar URL in component state (or profile)
  //     setAvatarUrl(urlData.publicUrl);

  //   } catch (err) {
  //     console.error('Unexpected error:', err);
  //     Alert.alert('Error', 'An unexpected error occurred');
  //   }
  // };

  // const handleToggleTag = (tag: string) => {
  //   setInterests((prev) =>
  //     prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
  //   );
  // };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username,
        bio,
        interests,
        is_private: isPrivate,
        avatar_url: avatarUrl,
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
      {/* <Text>Profile Picture</Text>
      {avatarUrl && (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: 100, height: 100, borderRadius: 50, marginVertical: 8 }}
        />
      )}
      <Button
        title="Change Profile Picture"
        onPress={() => handlePickImage(profile.id, setAvatarUrl)}
      />
 */}

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

      <Text>Interests</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
        {availableTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => handleToggleTag(tag)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 20,
              backgroundColor: interests.includes(tag) ? '#007aff' : '#ccc',
              margin: 4,
            }}
          >
            <Text style={{ color: interests.includes(tag) ? '#fff' : '#000' }}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text>Private Account</Text>
        <Switch value={isPrivate} onValueChange={setIsPrivate} style={{ marginLeft: 12 }} />
      </View>

      <Button title={saving ? "Saving..." : "Save Changes"} onPress={handleSave} disabled={saving} />
    </ScrollView>
  );
}
