import { Event } from "@/lib/types/event";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function EventCard({ item }: { item: Event}) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.rsvp_count} RSVPs</Text>
      <Text style={styles.meta}>{item.location}</Text>
      <Text style={styles.meta}>
        {new Date(item.start_time).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  meta: { fontSize: 14, color: '#555', marginTop: 4 },
});

