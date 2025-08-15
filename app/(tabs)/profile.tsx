// app/(tabs)/profile.tsx

import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  // Dummy state for toggles
  const [eventReminders, setEventReminders] = useState(true);
  const [newFollowers, setNewFollowers] = useState(false);

  const styles = getStyles(colorScheme);

  const appVersion = Constants.expoConfig?.version;

  return (
    <ScrollView style={styles.container}>
      {/* --- Account Section --- */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.rowLabel}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={22} color={Colors.light.gray} />
        </TouchableOpacity>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue}>{user?.email}</Text>
        </View>
      </View>

      {/* --- Notifications Section --- */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Event Reminders</Text>
          <Switch
            value={eventReminders}
            onValueChange={setEventReminders}
            trackColor={{ false: '#767577', true: Colors.light.tint }}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>New Followers</Text>
          <Switch value={newFollowers} onValueChange={setNewFollowers} />
        </View>
      </View>

      {/* --- Support Section --- */}
      <Text style={styles.sectionTitle}>Support</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={() => { /* Link to Privacy Policy */ }}>
          <Text style={styles.rowLabel}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={22} color={Colors.light.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => { /* Link to Terms */ }}>
          <Text style={styles.rowLabel}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={22} color={Colors.light.gray} />
        </TouchableOpacity>
      </View>

      {/* --- Logout & App Info --- */}
      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.appInfo}>
        Version {appVersion}
      </Text>
    </ScrollView>
  );
}

const getStyles = (colorScheme: 'light' | 'dark' | null) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
    },
    section: {
      backgroundColor: Colors[colorScheme ?? 'light'].card,
      borderRadius: 12,
      marginBottom: 24,
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.light.gray,
      textTransform: 'uppercase',
      marginBottom: 8,
      marginLeft: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors[colorScheme ?? 'light'].borderColor,
    },
    rowLabel: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'light'].text,
    },
    rowValue: {
      fontSize: 16,
      color: Colors.light.gray,
    },
    logoutButton: {
      backgroundColor: Colors.light.tint,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    logoutButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    appInfo: {
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 40,
      color: Colors.light.gray,
      fontSize: 12,
    },
  });

