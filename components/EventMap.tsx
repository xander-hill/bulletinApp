import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/lib/types/event';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import EventCard from './EventCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Default region (center of UMN campus)
const defaultRegion = {
  latitude: 44.9742,
  longitude: -93.2354,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function EventMap({ additionalFilters = {} }) {
  const { user } = useAuth();
  const mapRef = useRef<MapView | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  // --- FIX: State to control the map's region ---
  const [currentRegion, setCurrentRegion] = useState(defaultRegion);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const { events, refreshing, onRefresh } = useEvents({
    userId: user?.id,
    initialFilter: 'upcoming',
    additionalFilters,
  });

  // Effect to animate the sliding panel
  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectedEvent ? 0 : SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedEvent]);

  // --- FIX: Correctly fetches location and updates state ---
  React.useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const initialRegion = { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 };
      
      setCurrentRegion(initialRegion); // Update the state
      mapRef.current?.animateToRegion(initialRegion, 500); // Animate the map
    })();
  }, []);

  const onMarkerPress = (event: Event) => {
    setSelectedEvent(event);
    mapRef.current?.animateToRegion({
      latitude: event.latitude - 0.01, // Center slightly above the marker
      longitude: event.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 500);
  };
  
  const locateUser = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const userRegion = { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    setCurrentRegion(userRegion);
    mapRef.current?.animateToRegion(userRegion, 500);
  };
  
  const eventsWithCoordinates = events.filter(e => e.latitude != null && e.longitude != null);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        region={currentRegion} // Map is controlled by state
        onRegionChangeComplete={setCurrentRegion} // Update state on user pan/zoom
        onPress={() => setSelectedEvent(null)} // Deselect by tapping map
      >
        {eventsWithCoordinates.map((event) => (
          <Marker
            key={event.id}
            coordinate={{ latitude: event.latitude, longitude: event.longitude }}
            title={event.title}
            onPress={() => onMarkerPress(event)}
          />
        ))}
      </MapView>

      <TouchableOpacity onPress={onRefresh} style={[styles.button, { top: 60, right: 20 }]}>
        {refreshing ? <ActivityIndicator color="#000" /> : <Ionicons name="refresh" size={24} color="#000" />}
      </TouchableOpacity>

      <TouchableOpacity onPress={locateUser} style={[styles.button, { top: 120, right: 20 }]}>
        <Ionicons name="locate" size={24} color="#000" />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.slidingPanel,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {selectedEvent && <EventCard event={selectedEvent} />}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  slidingPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
  },
});