// Updated HomeFeed with animation-based enlarge/shrink toggle using a dedicated button
// while maintaining the recenter ('find me') button cleanly below it.

import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { Feather } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EventItem from './EventItem';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeFeed() {
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const animation = useRef(new Animated.Value(0)).current; // 0 = collapsed, 1 = expanded
  const [isExpanded, setIsExpanded] = useState(false);

  const animatedWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [180, SCREEN_WIDTH],
  });

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [180, SCREEN_HEIGHT / 3],
  });

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

  const toggleMapSize = () => {
    Animated.timing(animation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  return (
    <ImageBackground
      source={require('../assets/images/cork-texture.png')} // replace with your texture
      style={{ flex: 1 }}
      resizeMode="repeat" // or "cover" if you prefer
    >
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              height: SCREEN_HEIGHT * 0.85, // smaller height
              width: SCREEN_WIDTH * 0.92, // smaller width
              alignSelf: 'center', // center card horizontally
              marginVertical: 10, // spacing for top/bottom cork visibility
            }}
          >
            <EventItem
              title={item.title}
              hostName={item.host_name}
              rsvpCount={item.rsvp_count}
              date={item.start_time}
              endTime={item.ends_at}
              tags={item.tags}
              location={item.location}
              description={item.description}
              reserveMiniMapSpace
            />
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
        ListEmptyComponent={!loading && !refreshing ? (
          <Text style={styles.emptyText}>No events to show.</Text>
        ) : null}
      />

      {currentEvent && currentEvent.latitude && currentEvent.longitude && (
        <Animated.View style={[
          styles.miniMapContainer,
          { width: animatedWidth, height: animatedHeight },
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
          >
            <Marker coordinate={{
              latitude: currentEvent.latitude,
              longitude: currentEvent.longitude,
            }} />
          </MapView>

          {/* Expand/Collapse button */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={toggleMapSize}
          >
            <Feather name={isExpanded ? "minimize" : "maximize"} size={20} color="#fff" />
          </TouchableOpacity>

          {/* Recenter button below expand button */}
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
        </Animated.View>
      )}
    </ImageBackground>
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
  miniMapContainerExpanded: {
    borderRadius: 0,
  },
  miniMap: {
    flex: 1,
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#777',
  },
  expandButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterButton: {
    position: 'absolute',
    top: 45,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
