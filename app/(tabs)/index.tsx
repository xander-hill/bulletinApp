import DiscoveryFeed from '@/components/DiscoveryFeed';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DiscoveryFeed />
    </SafeAreaView>
  );
}
