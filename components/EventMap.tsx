import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { FilterType } from '@/lib/types/filterType';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type EventMapProps = {
  userId?: string;
  initialFilter?: FilterType;
  additionalFilters?: Record<string, any>;
};

export default function EventMap({
  userId,
  initialFilter,
  additionalFilters = {},
}: EventMapProps) {
  const { user } = useAuth();
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [locating, setLocating] = useState(false);

  const [currentRegion, setCurrentRegion] = useState({
    latitude: 38.8951,
    longitude: -77.0364,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  });

  React.useEffect(() => {
    const fetchInitialLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission not granted.');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const initialRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

        setCurrentRegion(initialRegion);
        mapRef.current?.animateToRegion(initialRegion, 500);
      } catch (error) {
        console.error('Error fetching initial location:', error);
      }
    };

    fetchInitialLocation();
  }, []);


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

  const onMarkerPress = (event: any) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleZoomIn = () => {
    mapRef.current?.animateToRegion({
      ...currentRegion,
      latitudeDelta: currentRegion.latitudeDelta / 2,
      longitudeDelta: currentRegion.longitudeDelta / 2,
    }, 300);
  };

  const handleZoomOut = () => {
    mapRef.current?.animateToRegion({
      ...currentRegion,
      latitudeDelta: currentRegion.latitudeDelta * 2,
      longitudeDelta: currentRegion.longitudeDelta * 2,
    }, 300);
  };

  const locateUser = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    } catch (error) {
      console.error('Error locating user:', error);
    } finally {
      setLocating(false);
    }
  };

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

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        showsUserLocation
        region={currentRegion}
        onRegionChangeComplete={setCurrentRegion}
      >
        {eventsWithCoordinates.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            title={event.title}
            onPress={() => onMarkerPress(event)}
          />
        ))}
      </MapView>

      {/* Modal for Event Preview */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{selectedEvent?.title}</Text>
            <Text>{selectedEvent?.description}</Text>
            <Button
              title="View Details"
              onPress={() => {
                setModalVisible(false);
                router.push(`/event/${selectedEvent.id}`);
              }}
            />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Refresh Button */}
      <TouchableOpacity
        onPress={onRefresh}
        style={[styles.button, { top: 20, right: 20, backgroundColor: '#007AFF' }]}
      >
        {refreshing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Refresh</Text>
        )}
      </TouchableOpacity>

      {/* Locate Me Button */}
      <TouchableOpacity
        onPress={locateUser}
        style={[styles.button, { top: 80, right: 20, backgroundColor: '#34D399' }]}
      >
        {locating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Locate Me</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleZoomIn}
        style={[styles.button, { top: 140, right: 20, backgroundColor: '#4F46E5' }]}
      >
        <Text style={styles.buttonText}>Zoom In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleZoomOut}
        style={[styles.button, { top: 200, right: 20, backgroundColor: '#F59E0B' }]}
      >
        <Text style={styles.buttonText}>Zoom Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    position: 'absolute',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
