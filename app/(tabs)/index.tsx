import EventFeed from '@/components/EventFeed';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <EventFeed />
    </SafeAreaView>
  );
}
