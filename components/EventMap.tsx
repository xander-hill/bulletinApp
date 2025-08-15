// components/EventMap.tsx
// Refactored to remove the basic Modal and extra buttons.
// Now features a sliding panel from the bottom that renders our polished EventCard.

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
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import EventCard from './EventCard'; // Import our new master component


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EventMap({ additionalFilters = {} }) {
  const { user } = useAuth();
  const mapRef = useRef<MapView | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const { events, loading, refreshing, onRefresh } = useEvents({
    userId: user?.id,
    initialFilter: 'upcoming',
    additionalFilters,
  });
  
  // Animate sliding panel when an event is selected/deselected
  React.useEffect(() => {
    if (selectedEvent) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedEvent]);

  // Request location and center map
  React.useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const region = { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 };
      mapRef.current?.animateToRegion(region, 500);
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
    mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 500);
  };
  
  const eventsWithCoordinates = events.filter(e => e.latitude != null && e.longitude != null);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        showsUserLocation
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

      {/* Sliding Event Card Panel */}
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
    paddingBottom: 40, // Space for home indicator on iOS
  },
});