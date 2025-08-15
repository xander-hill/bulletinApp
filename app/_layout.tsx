// app/_layout.tsx
// This is the root layout for the entire application.
// It sets up global providers like the AuthProvider and the top-level Stack navigator.

import { AuthProvider } from '@/contexts/AuthContext';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Add any custom fonts you want to load here
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Return null while the splash screen is visible
  }

  return (
    // Wrap the entire app in the AuthProvider so all routes have access to session info
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  // The RootLayoutNav component is nested so it has access to the AuthProvider context.
  // We can add logic here in the future if needed.

  return (
    <Stack>
      {/* The (tabs) layout is a screen within the stack. */}
      {/* This allows you to navigate to other full-screen modals on top of the tabs. */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* This screen is for displaying a single event's details. */}
      {/* It will be pushed on top of the tab navigator. */}
      <Stack.Screen
        name="event/[id]"
        options={{
          // You can customize the header for the event detail screen here
          headerTitle: 'Event Details',
          headerBackTitle: 'Back',
        }}
      />
      
      {/* Add your authentication screens to the root stack. */}
      {/* This one can be presented as a modal without the tab bar. */}
       <Stack.Screen 
        name="signin" 
        options={{ 
          presentation: 'modal',
          headerTitle: 'Sign In' 
        }} 
      />
    </Stack>
  );
}

