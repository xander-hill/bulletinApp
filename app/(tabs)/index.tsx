import EventFeed from '@/components/EventFeed';
import { supabase } from '@/lib/supabase';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error signing out', error.message);
    } else {
      router.replace('/signin'); // send user back to sign-in
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: tabBarHeight + 40 }}>
        <Text style={styles.header}>Welcome to Bulletin 🎉</Text>
        <EventFeed />
        <Button title="Sign Out" onPress={handleSignOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
});
