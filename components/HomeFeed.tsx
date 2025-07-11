import EventCard from '@/components/EventCard';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeFeed() {
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);

  const {
    events,
    loading,
    refreshing,
    fetchMore,
    onRefresh,
  } = useEvents({
    userId: user?.id,
    initialFilter: 'upcoming',
    additionalFilters: {},
  });

  const [currentEvent, setCurrentEvent] = useState(events[0] ?? null);

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const event = viewableItems[0].item;
      setCurrentEvent(event);
      const { latitude, longitude } = event;
      if (latitude && longitude) {
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 300);
      }
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ height: SCREEN_HEIGHT }}>
            <EventCard item={item} />
          </View>
        )}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.2}
        refreshing={refreshing}
        onRefresh={onRefresh}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <Text style={styles.emptyText}>No events to show.</Text>
          ) : null
        }
      />

      {currentEvent && currentEvent.latitude && currentEvent.longitude && (
        <View style={styles.miniMapContainer}>
          <MapView
            ref={mapRef}
            style={styles.miniMap}
            initialRegion={{
              latitude: currentEvent.latitude,
              longitude: currentEvent.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
          >
            <Marker coordinate={{
              latitude: currentEvent.latitude,
              longitude: currentEvent.longitude,
            }} />
          </MapView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  miniMapContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#eee',
  },
  miniMap: {
    flex: 1,
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#777',
  },
});
