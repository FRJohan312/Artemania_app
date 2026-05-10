import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

interface MinecraftSplashProps {
  text: string;
  color?: string;
}

export default function MinecraftSplash({ text, color = '#ffff00' }: MinecraftSplashProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de pulso más lenta (600ms en lugar de 350ms)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.12,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  if (!text) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }, { rotate: '-15deg' }] }
      ]}
    >
      <Text style={[styles.splashText, { color }]} numberOfLines={1}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -10,
    right: -35,
    zIndex: 50,
  },
  splashText: {
    fontSize: 11, // Un poco más pequeño
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    textShadowRadius: 1,
    fontFamily: 'monospace',
    textAlign: 'center',
    minWidth: 100, // Ayuda a que no colapse si el texto es muy corto
  },
});
