import { useMemo, useState } from 'react';
import { View } from 'react-native';
import EventFeed from './EventFeed';
import ProfileFilterBar from './ProfileFilterBar';

export default function ProfileFeed({ userId }: { userId: string }) {
  const [selectedFeed, setSelectedFeed] = useState<'my' | 'rsvped'>('my');

  const options = [
    { label: 'My Events', value: 'my' },
    { label: 'RSVPed Events', value: 'rsvped' },
  ];

  const additionalFilters = useMemo(() => {
  if (selectedFeed === 'my') {
    return { creator_id: userId };
  } else if (selectedFeed === 'rsvped') {
    return { rsvped: true, userId };
  } else {
    return {};
  }
}, [selectedFeed, userId]);

  return (
    <View style={{ flex: 1 }}>
      <ProfileFilterBar
        selected={selectedFeed}
        onChange={(value) => setSelectedFeed(value as 'my' | 'rsvped')}
        options={options}
      />
      <EventFeed
        headerTitle={selectedFeed === 'my' ? 'My Events' : 'RSVPed Events'}
        userId={userId}
        initialFilter={selectedFeed}
        additionalFilters={additionalFilters}
      />
    </View>
  );
}
