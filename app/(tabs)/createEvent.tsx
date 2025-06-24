import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase"; // adjust path if needed


interface CreateEventPayload {
  title: string;
  description: string;
  location: string;
  location_type: "physical" | "online";
  start_time: string;
  ends_at: string;
  is_public: boolean;
  tags: string[];
}

export default function CreateEventScreen({ navigation }: any) {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState<"physical" | "online">("physical");
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endsAt, setEndsAt] = useState<Date>(new Date());
  const [tagsArray, setTagsArray] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleStartChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) setStartTime(selectedDate);
  };

  const handleEndChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) setEndsAt(selectedDate);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tagsArray.includes(trimmed)) {
      setTagsArray([...tagsArray, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTagsArray(tagsArray.filter((t) => t !== tag));
  };


  const handleCreateEvent = async () => {
    if (!title || !description || !location) {
      Alert.alert("Missing required fields");
      return;
    }

    const payload: CreateEventPayload = {
      title,
      description,
      location,
      location_type: locationType,
      start_time: startTime.toISOString(),
      ends_at: endsAt.toISOString(),
      is_public: isPublic,
      tags: tagsArray,
    };

    setLoading(true);

    const { error } = await supabase.functions.invoke("create-event", {
      body: payload,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message || "Could not create event");
    } else {
      setTitle('');
      setDescription('');
      setLocation('');
      setLocationType("physical");
      setEndsAt(new Date());
      setStartTime(new Date());
      setTagsArray([]);
      setTagInput('');
      setIsPublic(true);
      Alert.alert(
        "Success",
        "Event created!",
        [
          {
            text: "OK",
            onPress: () => router.back(), // 👈 Navigate back to previous screen
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={{
            padding: 20,
            paddingBottom: tabBarHeight + 40,
        }}
        >
        <Text style={styles.label}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.multiline]}
          multiline
        />

        <Text style={styles.label}>Location</Text>
        <TextInput value={location} onChangeText={setLocation} style={styles.input} />

        <Text style={styles.label}>Location Type</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setLocationType("physical")}
            style={[styles.toggleBtn, locationType === "physical" && styles.selected]}
          >
            <Text>Physical</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLocationType("online")}
            style={[styles.toggleBtn, locationType === "online" && styles.selected]}
          >
            <Text>Online</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Start Time</Text>
        <DateTimePicker value={startTime} onChange={handleStartChange} mode="datetime" />

        <Text style={styles.label}>End Time</Text>
        <DateTimePicker value={endsAt} onChange={handleEndChange} mode="datetime" />

        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagInputRow}>
        <TextInput
            value={tagInput}
            onChangeText={setTagInput}
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter tag"
        />
        <Button title="Add" onPress={handleAddTag} />
        </View>

        <View style={styles.tagList}>
        {tagsArray.map((tag) => (
            <TouchableOpacity key={tag} onPress={() => handleRemoveTag(tag)} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag} ✕</Text>
            </TouchableOpacity>
        ))}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Public?</Text>
          <Switch value={isPublic} onValueChange={setIsPublic} />
        </View>

        <View style={{ marginTop: 20 }}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Button title="Create Event" onPress={handleCreateEvent} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    marginTop: 12,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  toggleBtn: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 6,
    width: "48%",
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#e0e0e0",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  tagInputRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 8,
  // If your React Native version doesn’t support gap, use marginRight on TextInput instead
    },
    tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    },
    tagPill: {
    backgroundColor: "#eee",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    },
});
