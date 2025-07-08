import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import LabeledDatePicker from "@/components/LabeledDatePicker";
import TagInput from "@/components/TagInput";
import { supabase } from "@/lib/supabase";
import { CreateEventSchema } from "@/lib/validation/eventSchema";

const initialState = {
  title: "",
  description: "",
  location: "",
  locationType: "physical" as "physical" | "online",
  startTime: new Date(),
  endsAt: new Date(),
  tagsArray: [] as string[],
  isPublic: true,
};

export default function CreateEventForm() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof typeof initialState, value: any) => {
    if (key === "locationType" && value === "online") {
      setForm((prev) => ({ ...prev, [key]: value, location: "Online" }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleStartChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) handleChange("startTime", selectedDate);
  };

  const handleEndChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) handleChange("endsAt", selectedDate);
  };

  const handleCreateEvent = async () => {
    const now = new Date();

    if (form.title.trim().length < 4) {
      Alert.alert("Validation Error", "Title must be at least 4 characters.");
      return;
    }

    if (form.startTime <= now) {
      Alert.alert("Validation Error", "Start time must be in the future.");
      return;
    }

    if (form.endsAt <= now) {
      Alert.alert("Validation Error", "End time must be in the future.");
      return;
    }

    if (form.endsAt <= form.startTime) {
      Alert.alert("Validation Error", "End time must be after start time.");
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      location_type: form.locationType,
      start_time: form.startTime.toISOString(),
      ends_at: form.endsAt.toISOString(),
      is_public: form.isPublic,
      tags: form.tagsArray,
    };

    const parseResult = CreateEventSchema.safeParse(payload);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("\n");
      Alert.alert("Validation Error", errorMessages);
      return;
    }

    setLoading(true);
    const { data , error } = await supabase.functions.invoke("create-event", { body: payload });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message || "Could not create event");
    } else {
      setForm(initialState);
      //const newEventId = data.id;
      Alert.alert("Success", "Event created!", [
        {
          text: "OK",
          //change supabase function to return an id and redeploy
          onPress: () => router.back(),
        },
      ]);
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
        <TextInput
          value={form.title}
          onChangeText={(text) => handleChange("title", text)}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={form.description}
          onChangeText={(text) => handleChange("description", text)}
          style={[styles.input, styles.multiline]}
          multiline
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          value={form.location}
          onChangeText={(text) => handleChange("location", text)}
          style={styles.input}
        />

        <Text style={styles.label}>Location Type</Text>
        <View style={styles.toggleRow}>
          {(["physical", "online"] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => handleChange("locationType", type)}
              style={[styles.toggleBtn, form.locationType === type && styles.selected]}
            >
              <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <LabeledDatePicker label="Start Time" value={form.startTime} onChange={handleStartChange} />
        <LabeledDatePicker label="End Time" value={form.endsAt} onChange={handleEndChange} />

        <Text style={styles.label}>Tags</Text>
        <TagInput tags={form.tagsArray} setTags={(tags) => handleChange("tagsArray", tags)} />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Public?</Text>
          <Switch value={form.isPublic} onValueChange={(val) => handleChange("isPublic", val)} />
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.buttonDisabled]}
          onPress={handleCreateEvent}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Event</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  label: {
    marginTop: 12,
    fontWeight: "bold",
    color: "#1c1c1c",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d1d1",
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: "#ffffff",
    color: "#1c1c1c",
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
    borderColor: "#d1d1d1",
    padding: 10,
    borderRadius: 6,
    width: "48%",
    alignItems: "center",
    backgroundColor: "#ffffff",
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
  createButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});