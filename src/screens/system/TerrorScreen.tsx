import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function TerrorScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [showInterference, setShowInterference] = useState(false);
  const [tick, setTick] = useState(0);

  // Opacidades individuales
  const algoOpacity = useRef(new Animated.Value(0)).current;
  const salioOpacity = useRef(new Animated.Value(0)).current;
  const malOpacity = useRef(new Animated.Value(0)).current;

  // Flicker
  const flicker = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1,
        duration: 40,
        useNativeDriver: true,
      }),

      Animated.timing(anim, {
        toValue: 0.2,
        duration: 30,
        useNativeDriver: true,
      }),

      Animated.timing(anim, {
        toValue: 1,
        duration: 20,
        useNativeDriver: true,
      }),

      Animated.timing(anim, {
        toValue: 0.7,
        duration: 25,
        useNativeDriver: true,
      }),

      Animated.timing(anim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Efecto de ruido de interferencia (TV estática/glitch)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (showInterference) {
      interval = setInterval(() => {
        setTick((t) => t + 1);
      }, 60); // Cambio muy rápido para simular estática
    }
    return () => clearInterval(interval);
  }, [showInterference]);

  useEffect(() => {

    StatusBar.setHidden(true);

    // Guardar referencias a los timeouts para poder limpiarlos si el componente se desmonta
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Algo
    timers.push(setTimeout(() => {
      setStep(1);
      flicker(algoOpacity);
    }, 2500));

    // salió
    timers.push(setTimeout(() => {
      setStep(2);
      flicker(salioOpacity);
    }, 5200));

    // mal
    timers.push(setTimeout(() => {
      setStep(3);
      flicker(malOpacity);
    }, 7800));

    // micro corrupción
    timers.push(setTimeout(() => {
      malOpacity.setValue(0.1);
      setTimeout(() => {
        malOpacity.setValue(1);
      }, 90);
    }, 9800));

    // INTERFERENCIA: Unos 5 segundos después de que termine la secuencia de texto (9800 + 5000 = 14800)
    timers.push(setTimeout(() => {
      setShowInterference(true);
    }, 14800));

    // VOLVER AL MENÚ: Después de un instante rápido de interferencia (800ms)
    timers.push(setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }, 15600)); // 14800 + 800ms

    return () => {
      StatusBar.setHidden(false);
      timers.forEach((t) => clearTimeout(t));
    };

  }, [navigation]);

  // Generar las barras de interferencia (renderizado dinámico estilo cinta VHS)
  const renderInterference = () => {
    const bars = [];
    const totalBars = 20; // Menos barras pero más anchas para el efecto VHS
    for (let i = 0; i < totalBars; i++) {
      const isRgbGlitch = Math.random() > 0.8;
      let barColor = '#ffffff';
      
      // Añadir colores RGB característicos de daño VHS (Rojo, Cyan, Verde)
      if (isRgbGlitch) {
        const colors = ['rgba(255,0,0,0.5)', 'rgba(0,255,255,0.5)', 'rgba(0,255,0,0.3)', 'rgba(255,255,255,0.6)'];
        barColor = colors[Math.floor(Math.random() * colors.length)];
      } else {
         barColor = Math.random() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.8)';
      }

      bars.push(
        <View
          key={i}
          style={{
            height: (height / totalBars) + (Math.random() * 20 - 10),
            width: width * 1.5, // Más ancho para desplazar horizontalmente
            backgroundColor: barColor,
            opacity: Math.random() * 0.9 + 0.1,
            transform: [
              { translateX: (Math.random() * 40) - 20 },
              { translateY: (Math.random() * 10) - 5 }
            ],
          }}
        />
      );
    }
    
    // Franja gruesa de "Tracking" (error de cinta VHS rodando por la pantalla)
    const trackingBand = (
       <View style={{
         position: 'absolute',
         top: Math.random() * height,
         width: width,
         height: 80,
         backgroundColor: 'rgba(255,255,255,0.08)',
         borderTopWidth: 1,
         borderBottomWidth: 3,
         borderColor: 'rgba(255,255,255,0.2)',
         transform: [{ skewY: `${(Math.random() * 2 - 1)}deg` }]
       }} />
    );

    return (
      <View style={[StyleSheet.absoluteFill, styles.interferenceContainer, { backgroundColor: 'rgba(15,20,15,0.9)' }]}>
        {bars}
        {trackingBand}
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <StatusBar hidden />

      {!showInterference && (
        <>
          {/* Algo */}
          {step >= 1 && (
            <Animated.Text
              style={[
                styles.word,
                styles.algo,
                { opacity: algoOpacity },
              ]}
            >
              Algo
            </Animated.Text>
          )}

          {/* salió */}
          {step >= 2 && (
            <Animated.Text
              style={[
                styles.word,
                styles.salio,
                { opacity: salioOpacity },
              ]}
            >
              salió
            </Animated.Text>
          )}

          {/* mal */}
          {step >= 3 && (
            <Animated.Text
              style={[
                styles.word,
                styles.mal,
                { opacity: malOpacity },
              ]}
            >
              mal
            </Animated.Text>
          )}
        </>
      )}

      {showInterference && renderInterference()}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  word: {
    position: 'absolute',
    color: '#d8d8d8',
    fontSize: 34,
    fontWeight: '300',
    letterSpacing: 2,
  },

  algo: {
    left: width * 0.18,
    top: height * 0.42,
  },

  salio: {
    left: width * 0.40,
    top: height * 0.50,
  },

  mal: {
    left: width * 0.67,
    top: height * 0.60,
  },

  interferenceContainer: {
    flexDirection: 'column',
    zIndex: 999,
  },

});
