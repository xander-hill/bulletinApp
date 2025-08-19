// components/EventFeed.tsx
// This component is responsible for rendering a scrollable feed of event cards.

// Import necessary components and hooks.
import EventCard from '@/components/EventCard'; // A reusable component to display a single event's details.
import { useAuth } from '@/contexts/AuthContext'; // A hook to access the current authenticated user.
import { useEvents } from '@/hooks/useEvents'; // A custom hook that contains all the logic for fetching events.
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

// Define the expected shape of the filters
interface EventFilters {
  tags?: string[];
  keyword?: string;
  sort?: string;
  userLat?: number;
  userLng?: number;
}

// Define the component's props
interface EventFeedProps {
  headerTitle: string; // Make the header title dynamic
  additionalFilters?: EventFilters;
}

// Define the component's props. It accepts 'additionalFilters' to customize the event query.
export default function EventFeed({ headerTitle, additionalFilters = {} }: EventFeedProps) {
  // 1. Get the current user from the authentication context.
  // The user's ID is needed to fetch events relevant to them (e.g., saved events, RSVPs).
  const { user } = useAuth();

  // 2. Use the custom 'useEvents' hook to handle all data fetching and state management.
  // This is the core of the component's logic.
  const {
    events,            // An array of event objects to be displayed.
    loading,           // A boolean that is true when fetching more events (for the footer spinner).
    refreshing,        // A boolean that is true when the user pulls to refresh.
    fetchMore,         // A function to call to load the next page of events.
    onRefresh,         // A function to call to re-fetch the first page of events.
  } = useEvents({
    userId: user?.id,          // Pass the user's ID to the hook.
    initialFilter: 'upcoming', // A default filter, which can be overridden.
    additionalFilters,         // Any dynamic filters from the parent (tags, keyword, location).
  });

  // 3. Render the UI using the data from the hook.
  return (
    <View style={styles.container}>
      {/* FlatList is the standard, performant way to render scrollable lists in React Native. */}
      <FlatList
        data={events} // The array of data to render.
        keyExtractor={(item) => item.id} // Provides a unique key for each item for efficient updates.
        renderItem={({ item }) => <EventCard event={item} />} // The function that renders each item in the list. Here it uses our master EventCard component.
        ListHeaderComponent={<Text style={styles.header}>{headerTitle}</Text>}
        
        // --- Feature Props ---
        onEndReached={fetchMore} // Calls the 'fetchMore' function when the user scrolls to the end of the list.
        onEndReachedThreshold={0.5} // How far from the end (in screen lengths) 'onEndReached' should trigger.
        refreshing={refreshing} // When true, shows the refresh spinner (controlled by the useEvents hook).
        onRefresh={onRefresh} // Calls the 'onRefresh' function when the user pulls down from the top.
        
        // --- UX Component Props ---
        ListHeaderComponent={<Text style={styles.header}>Discover Events</Text>} // A component to render at the top of the list.
        ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null} // Shows a loading spinner at the bottom while 'fetchMore' is running.
        ListEmptyComponent={ // A component to show if the 'data' array is empty.
          !loading && !refreshing ? ( // We check !loading to avoid showing it on the initial load.
            <Text style={styles.emptyText}>No events to show.</Text>
          ) : null
        }
      />
    </View>
  );
}

// Centralized styles for the component.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', padding: 16, backgroundColor: '#fff' },
  emptyText: { marginTop: 40, textAlign: 'center', color: '#777' },
});