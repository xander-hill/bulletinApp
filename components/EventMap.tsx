import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function EventMap() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 38.89,
          longitude: -77.03,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude: 38.89, longitude: -77.03 }}
          title="White House"
          description="Event Location"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

