import { useAuth } from "@/contexts/AuthContext"; // Adjust path as needed
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { supabase } from "@/lib/supabase"; // adjust path to your supabase client
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEvent } from "../../hooks/useEvent";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const eventId = typeof id === "string" ? id : null;

  const [rsvpsList, setRsvpsList] = useState<
    { user_id: string; username: string; status: string }[]
  >([]);
  const [loadingRsvpsList, setLoadingRsvpsList] = useState(false);

  useEffect(() => {
    async function fetchRsvpsList() {
      if (!eventId) return;
      setLoadingRsvpsList(true);

      const { data, error } = await supabase
        .from("rsvps")
        .select(`
          user_id,
          status,
          profiles!rsvps_user_id_fkey(username)
        `)
        .eq("event_id", eventId);

      if (!error && data) {
        // data is an array with profiles included as profiles property
        const formatted = data.map((rsvp: any) => ({
          user_id: rsvp.user_id,
          status: rsvp.status,
          username: rsvp.profiles?.username ?? "Unknown",
        }));
        setRsvpsList(formatted);
      } else {
        setRsvpsList([]);
      }
      setLoadingRsvpsList(false);
    }

    fetchRsvpsList();
  }, [eventId]);

  const { event, loading, error } = useEvent(eventId);
  const navigation = useNavigation();

  const {
    deleteEvent,
    loading: deleting,
    error: deleteError,
  } = useDeleteEvent();

  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null); // 'going' | 'interested' | 'not_going' | null
  const [loadingRsvp, setLoadingRsvp] = useState(false);

  // Load current user's RSVP status for this event
  useEffect(() => {
    async function fetchRsvp() {
      if (!eventId || !session?.user?.id) return;

      setLoadingRsvp(true);
      const { data, error } = await supabase
        .from("rsvps")
        .select("status")
        .eq("event_id", eventId)
        .eq("user_id", session.user.id)
        .single();

      if (!error && data) {
        setRsvpStatus(data.status);
      } else {
        setRsvpStatus(null);
      }
      setLoadingRsvp(false);
    }

    fetchRsvp();
  }, [eventId, session?.user?.id]);

  // RSVP function (upsert)
  async function rsvp(status = "going") {
    if (!eventId || !session?.user?.id) return;

    setLoadingRsvp(true);
    const { error } = await supabase
      .from("rsvps")
      .upsert(
        {
          user_id: session.user.id,
          event_id: eventId,
          status,
        },
        { onConflict: ["user_id", "event_id"] }
      );

    if (!error) {
      setRsvpStatus(status);
    } else {
      Alert.alert("Error", "Could not RSVP. Please try again.");
    }
    setLoadingRsvp(false);
  }

  // Un-RSVP (delete)
  async function unRsvp() {
    if (!eventId || !session?.user?.id) return;

    setLoadingRsvp(true);
    const { error } = await supabase
      .from("rsvps")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", session.user.id);

    if (!error) {
      setRsvpStatus(null);
    } else {
      Alert.alert("Error", "Could not cancel RSVP. Please try again.");
    }
    setLoadingRsvp(false);
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEvent(event.id);
              navigation.goBack(); // or navigation.replace('/events') if needed
            } catch (err) {
              console.error("Deletion failed:", err.message);
            }
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;
  if (!event) return <Text style={styles.errorText}>Event not found.</Text>;

  const isCreator = event.creator_id === session?.user?.id;

  return (
    <>
      <Stack.Screen
        options={{
          title: event?.title ?? "Event",
          headerBackTitle: "",
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{event.title}: {event.rsvp_count} RSVPs </Text>

        <Text style={styles.meta}>
          Hosted by: <Text style={styles.bold}>{event.creator?.username ?? "Unknown"}</Text>
        </Text>

        <Text style={styles.meta}>
          Location: <Text style={styles.bold}>{event.location ?? "TBD"}</Text>
        </Text>

        <Text style={styles.meta}>
          When: <Text style={styles.bold}>{formatDateTime(event.start_time)}</Text>
        </Text>

        <Text style={styles.sectionHeader}>Description</Text>
        <Text style={styles.description}>
          {event.description || "No description provided."}
        </Text>

        {/* RSVP Button, only if not creator */}
        {!isCreator && (
          <View style={{ marginVertical: 20 }}>
            {loadingRsvp ? (
              <ActivityIndicator />
            ) : rsvpStatus ? (
              <Button
                title={`Cancel RSVP (${rsvpStatus})`}
                onPress={unRsvp}
                color="red"
              />
            ) : (
              <Button title="RSVP" onPress={() => rsvp("going")} />
            )}
          </View>
        )}

        {/* Delete button only if creator */}
        {isCreator && (
          <View style={styles.deleteButton}>
            <Button
              title={deleting ? "Deleting..." : "Delete Event"}
              onPress={handleDelete}
              color="red"
              disabled={deleting}
            />
            {deleteError && <Text style={styles.errorText}>{deleteError}</Text>}
          </View>
        )}
        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionHeader}>Who RSVPed</Text>
          {loadingRsvpsList ? (
            <ActivityIndicator />
          ) : rsvpsList.length === 0 ? (
            <Text>No RSVPs yet.</Text>
          ) : (
            <>
              {["going", "interested", "not_going"].map((statusKey) => {
                const filtered = rsvpsList.filter((r) => r.status === statusKey);
                if (filtered.length === 0) return null;

                // Friendly labels
                const statusLabels: Record<string, string> = {
                  going: "Going",
                  interested: "Interested",
                  not_going: "Not Going",
                };

                return (
                  <View key={statusKey} style={{ marginBottom: 15 }}>
                    <Text style={{ fontWeight: "600", marginBottom: 6 }}>
                      {statusLabels[statusKey]} ({filtered.length})
                    </Text>
                    {filtered.map((rsvp) => (
                      <Text key={rsvp.user_id} style={{ marginLeft: 10 }}>
                        • {rsvp.username}
                      </Text>
                    ))}
                  </View>
                );
              })}
            </>
          )}
        </View>

      </ScrollView>
    </>
  );
}

function formatDateTime(datetime: string | null) {
  if (!datetime) return "Date/time not set";
  const date = new Date(datetime);
  return date.toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  meta: {
    fontSize: 16,
    marginBottom: 4,
  },
  bold: {
    fontWeight: "600",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    color: "red",
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 30,
  },
});

