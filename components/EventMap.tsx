import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { FilterType } from '@/lib/types/filterType';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type EventMapProps = {
    userId?: string;
    initialFilter?: FilterType;
    additionalFilters?: Record<string, any>;
}

export default function EventMap({
    userId,
    initialFilter,
    additionalFilters = {},
}: EventMapProps) {
  const { user } = useAuth();
  
    const {
        events,
        loading,
        refreshing,
        fetchMore,
        onRefresh
    } = useEvents({
        userId: userId ?? user?.id,
        initialFilter,
        additionalFilters,
    });

  if (loading || refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const eventsWithCoordinates = events.filter(
    (e) => e.latitude !== null && e.longitude !== null
  );

  const initialRegion = {
    latitude: eventsWithCoordinates[0]?.latitude ?? 38.8951, // DC fallback
    longitude: eventsWithCoordinates[0]?.longitude ?? -77.0364,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: eventsWithCoordinates[0]?.latitude || 38.8951,
          longitude: eventsWithCoordinates[0]?.longitude || -77.0364,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
      >
        {eventsWithCoordinates.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            title={event.title}
            description={event.location}
          />
        ))}
      </MapView>

      {/* Refresh Button Overlay */}
      <TouchableOpacity
        onPress={onRefresh}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          backgroundColor: '#007AFF',
          padding: 10,
          borderRadius: 8,
        }}
      >
        {refreshing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Refresh</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


