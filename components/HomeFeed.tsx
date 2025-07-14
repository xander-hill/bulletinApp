import EventCard from '@/components/EventCard';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, FlatList, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeFeed() {
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const animation = useRef(new Animated.Value(0)).current; 
  // 0 = collapsed, 1 = expanded

  const animatedWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [180, SCREEN_WIDTH],
  });

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [180, SCREEN_HEIGHT / 3],
  });


  const [isExpanded, setIsExpanded] = useState(false);


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
        <Animated.View style={[
          styles.miniMapContainer,
          {
            width: animatedWidth,
            height: animatedHeight,
          }
        ]}>
          <TouchableWithoutFeedback
            onPress={() => {
                Animated.timing(animation, {
                  toValue: isExpanded ? 0 : 1,
                  duration: 300,
                  easing: Easing.out(Easing.ease),
                  useNativeDriver: false,
                }).start();
                setIsExpanded(!isExpanded);
            }}
          >
            <View style={[
              styles.miniMapContainer,
              isExpanded ? styles.miniMapContainerExpanded : null
            ]}>
              <MapView
                ref={mapRef}
                style={styles.miniMap}
                initialRegion={{
                  latitude: currentEvent.latitude,
                  longitude: currentEvent.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
                scrollEnabled={true}
                zoomEnabled={true}
                rotateEnabled={false}
                onRegionChangeComplete={(region) => {
                  if (region.latitudeDelta > 0.05 || region.longitudeDelta > 0.05) {
                    mapRef.current?.animateToRegion({
                      latitude: region.latitude,
                      longitude: region.longitude,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    });
                  }
                  if (region.latitudeDelta < 0.01 || region.longitudeDelta < 0.01) {
                    mapRef.current?.animateToRegion({
                      latitude: region.latitude,
                      longitude: region.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    });
                  }
                }}
              >
                <Marker coordinate={{
                  latitude: currentEvent.latitude,
                  longitude: currentEvent.longitude,
                }} />
              </MapView>
            </View>
          </TouchableWithoutFeedback>
          {currentEvent && (
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={() => {
            if (currentEvent.latitude && currentEvent.longitude) {
              mapRef.current?.animateToRegion({
                latitude: currentEvent.latitude,
                longitude: currentEvent.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }, 300);
            }
          }}
        >
          <Ionicons name="locate" size={20} color="#fff" />
        </TouchableOpacity>
      )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  miniMapContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 180, 
    height: 180, 
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
  recenterButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  miniMapContainerExpanded: {
    width: '100%',
    height: SCREEN_HEIGHT / 3,
    top: 0,
    right: 0,
    borderRadius: 0,
  },
});
