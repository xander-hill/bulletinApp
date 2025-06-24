import { useAuth } from '@/contexts/AuthContext';
import { Redirect, Stack, useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export default function EventLayout() {
  const router = useRouter();
  const { session, loading } = useAuth();

  if (loading) return null; // or a loading spinner
  if (!session) return <Redirect href="/signin" />;

  return (
    <Stack
      screenOptions={{
        headerBackTitle: '',
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 12 }}>
            <Text>Back</Text>
          </TouchableOpacity>
        ),
      }}
    />
  );
}

