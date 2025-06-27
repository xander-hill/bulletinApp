import EventFeed from '@/components/EventFeed';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <EventFeed
        headerTitle="Welcome to Bulletin 🎉"
        filterOptions={[
          { label: 'Upcoming', value: 'upcoming' },
          { label: 'My Events', value: 'my' },
          { label: 'RSVPed', value: 'rsvped' },
        ]}
      />
    </SafeAreaView>
  );
}
