import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BannerCardProps {
  banner: {
    id: string;
    titulo: string;
    subtitulo: string;
    color: string;
    icono: string;
  };
  onDismiss: (id: string) => void;
}

// Genera un color de fondo ligeramente más oscuro para el gradiente simulado
function darken(hex: string, amount = 30): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

const mapIcon = (name: string) => {
  const map: { [key: string]: string } = {
    'fa-star': 'star',
    'fa-info-circle': 'information-circle',
    'fa-exclamation-triangle': 'warning',
    'fa-gift': 'gift',
    'fa-heart': 'heart',
    'fa-bell': 'notifications',
    'fa-palette': 'color-palette',
    'fa-shopping-bag': 'bag-handle',
    'fa-rocket': 'rocket',
    'fa-crown': 'ribbon',
    'fa-certificate': 'checkmark-circle',
    'fa-gem': 'sparkles',
  };
  return map[name] || 'information-circle';
};

export default function BannerCard({ banner, onDismiss }: BannerCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current; // Inicia fuera de la pantalla (arriba)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
    ]).start(() => onDismiss(banner.id));
  };

  const baseColor = banner.color || '#B96A4A';

  return (
    <Animated.View style={[
      styles.wrapper, 
      { 
        opacity, 
        transform: [{ translateY }],
        backgroundColor: baseColor.includes('rgba') ? baseColor : `${baseColor}F2` // Un poco más sólido (menos transparente)
      }
    ]}>
      <View style={styles.content}>
        {/* Ícono más grande */}
        <View style={styles.iconBox}>
          <Icon name={mapIcon(banner.icono || 'megaphone-outline')} size={30} color="#fff" />
        </View>

        {/* Texto con fuentes más grandes */}
        <View style={styles.textBody}>
          <Text style={styles.title} numberOfLines={1}>{banner.titulo}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>{banner.subtitulo}</Text>
        </View>

        {/* Botón de cerrar más accesible */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleDismiss}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Icon name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 15,
    left: 12,
    right: 12,
    zIndex: 9999,
    borderRadius: 28,
    paddingVertical: 16, // Más alto
    paddingHorizontal: 20, // Más ancho
    flexDirection: 'row',
    alignItems: 'center',
    // Sombra más profunda
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textBody: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 17, // Más grande
    fontWeight: '900',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14, // Más grande
    fontWeight: '600',
    lineHeight: 19,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
