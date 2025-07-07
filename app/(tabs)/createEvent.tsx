import CreateEventForm from '@/components/forms/CreateEventForm';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function CreateEventScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <CreateEventForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
