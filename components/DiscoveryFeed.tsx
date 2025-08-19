// Import necessary hooks from React and components from React Native & local files.
import { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import DiscoveryFilterBar from './DiscoveryFilterBar'; // Component for filtering options (tags, keyword, sort).
import EventFeed from './EventFeed'; // Component to display events in a list/card format.
import EventMap from './EventMap'; // Component to display events on a map.

// Define the main component for the discovery screen.
export default function DiscoveryFeed() {
  // --- STATE MANAGEMENT ---
  // useState hooks to manage the component's state.

  // Holds an array of tags selected by the user for filtering.
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Holds the text input by the user for a keyword search.
  const [keyword, setKeyword] = useState('');
  // Holds the current sorting option (e.g., 'upcoming', 'popular').
  const [sort, setSort] = useState('upcoming');
  // Toggles the view between 'card' (list) and 'map'.
  const [viewMode, setViewMode] = useState<'card' | 'map'>('card');
  // Holds the user's latitude and longitude for location-based filtering.
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);

  // --- SIDE EFFECTS ---
  // useEffect hook to perform side effects, like fetching data.

  useEffect(() => {
    // This effect runs once when the component first mounts (due to the empty dependency array []).
    // --- TEMPORARY FIX FOR TESTING ---
    // It currently hardcodes coordinates for the University of Minnesota campus.
    // In a real app, you would replace this with a function to get the user's actual GPS location.
    const minneapolisCoords = {
      latitude: 44.9742,
      longitude: -93.2354,
    };
    setUserLat(minneapolisCoords.latitude);
    setUserLng(minneapolisCoords.longitude);
    // ---------------------------------
  }, []); // The empty array [] means this effect runs only once after the initial render.

  // --- MEMOIZATION FOR PERFORMANCE ---
  // useMemo hook to optimize performance by re-calculating a value only when its dependencies change.

  const additionalFilters = useMemo(() => ({
    // This creates an object that will be passed as props to child components.
    // It only re-creates this object if selectedTags, keyword, sort, userLat, or userLng change.
    // This prevents unnecessary re-renders in child components that rely on this object.
    tags: selectedTags.length ? selectedTags : undefined, // Include tags only if at least one is selected.
    keyword: keyword || undefined, // Include keyword only if it's not an empty string.
    sort,
    userLat: userLat ?? undefined, // Use the nullish coalescing operator for safety.
    userLng: userLng ?? undefined,
  }), [selectedTags, keyword, sort, userLat, userLng]); // Dependencies array.

  // --- RENDER LOGIC ---
  // The JSX that defines what the component looks like.
  return (
    <View style={{ flex: 1 }}>
      {/* The filter bar component at the top of the screen. */}
      <DiscoveryFilterBar
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags} // Passes the state setter function down as a prop.
        keyword={keyword}
        onKeywordChange={setKeyword} // Passes the state setter function down as a prop.
        // This is a neat trick: conditionally spread props. The sort/onSortChange props
        // are only passed to the filter bar if the viewMode is 'card'.
        {...(viewMode === 'card' && {
          sort,
          onSortChange: setSort,
        })}
      />

      {/* A simple toggle switch for changing the view mode. */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 8 }}>
        <TouchableOpacity onPress={() => setViewMode('card')}>
          <Text style={{ padding: 8, color: viewMode === 'card' ? 'blue' : 'gray' }}>
            Card View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('map')}>
          <Text style={{ padding: 8, color: viewMode === 'map' ? 'blue' : 'gray' }}>
            Map View
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditional rendering based on the viewMode state. */}
      {viewMode === 'card' ? (
        // If viewMode is 'card', render the EventFeed component.
        <EventFeed
          headerTitle="Discover Events"
          initialFilter="upcoming"
          additionalFilters={additionalFilters} // Pass the memoized filter object.
        />
      ) : (
        // Otherwise, render the EventMap component.
        <EventMap 
          additionalFilters={additionalFilters} // Pass the memoized filter object.
          initialFilter="upcoming"
        />
      )}
    </View>
  );
}
