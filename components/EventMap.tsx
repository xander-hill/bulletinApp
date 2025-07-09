import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function EventMap({
  userId,
  initialFilter,
  additionalFilters,
}) {
  const { user } = useAuth();

  const {
    events,
    loading,
    refreshing,
    onRefresh,
  } = useEvents({
    userId: userId ?? user?.id,
    initialFilter,
    additionalFilters,
  });

  if (loading || refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const eventsWithCoordinates = events.filter(
    (event) => event.latitude && event.longitude
  );

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: eventsWithCoordinates[0]?.latitude || 38.8951,
        longitude: eventsWithCoordinates[0]?.longitude || -77.0364,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      }}
      onRefresh={onRefresh}
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
  );
}
