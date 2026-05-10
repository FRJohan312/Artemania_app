import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useConfig } from '../../context/ConfigContext';

export default function MaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const { refreshConfig, isLoadingConfig } = useConfig();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Respiración muy lenta y sutil (Pulse)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();

    // Flotación elegante (Levitación)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY: floatAnim }] }}>
        <Icon name="construct" size={100} color="#ef4444" style={styles.icon} />
      </Animated.View>
      <Text style={styles.title}>Mantenimiento en curso</Text>
      <Text style={styles.subtitle}>
        Tranquilo, no eres tú, somos nosotros. Estamos puliendo los pinceles y mejorando el lienzo de Artemanía. Volveremos enseguida con increíbles mejoras.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={refreshConfig}
        disabled={isLoadingConfig}
      >
        {isLoadingConfig ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reintentar Conexión</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Outfit-Black',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
