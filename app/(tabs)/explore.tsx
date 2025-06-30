import DiscoveryFeed from '@/components/DiscoveryFeed';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <DiscoveryFeed />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
