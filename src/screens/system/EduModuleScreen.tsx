import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EduModuleScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Módulo de Contenido Educativo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
