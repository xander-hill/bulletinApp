import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { FilterType } from '@/lib/types/filterType';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Button, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const router = useRouter();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const onMarkerPress = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };
  
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
                onPress={() => onMarkerPress(event)}
            />
        ))}
        
      </MapView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
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
});


