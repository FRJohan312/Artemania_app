import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ConfigContext';

interface BottomNavProps {
  navigation: any;
  activeRoute?: 'Comunidad' | 'Tienda' | 'Carrito' | 'Perfil' | string;
  profile?: any;
}

export default function BottomNav({ navigation, activeRoute, profile }: BottomNavProps) {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const getIndex = () => {
    switch (activeRoute) {
      case 'Tutorials': return 0;
      case 'Marketplace': return 1;
      case 'Cart': return 2;
      case 'Home': return 3;
      default: return 0;
    }
  };

  const tabWidth = (containerWidth - 12) / 4;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const navScale = useRef(new Animated.Value(0.8)).current;
  const navOpacity = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(navScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(navOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start(() => {
        Animated.spring(bubbleScale, {
          toValue: 1,
          tension: 80,
          friction: 5,
          useNativeDriver: true,
        }).start();
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (containerWidth > 0) {
      Animated.spring(translateX, {
        toValue: getIndex() * tabWidth,
        useNativeDriver: true,
        stiffness: 150,
        damping: 18,
        mass: 0.8,
      }).start();

      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [activeRoute, containerWidth]);

  const onLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
    translateX.setValue(getIndex() * ((width - 12) / 4));
  };

  return (
    <Animated.View
      style={[
        styles.bottomNav,
        {
          backgroundColor: colors.surface,
          opacity: navOpacity,
          transform: [{ scale: navScale }]
        }
      ]}
      onLayout={onLayout}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.bubble,
            {
              width: tabWidth - 10,
              left: 11,
              backgroundColor: colors.bubble,
              transform: [
                { translateX: translateX },
                { scale: Animated.multiply(scale, bubbleScale) }
              ]
            }
          ]}
        />
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.navItem}
        onPress={() => navigation.navigate('Tutorials')}
      >
        <Icon
          name={activeRoute === 'Tutorials' ? "planet" : "planet-outline"}
          size={24}
          color={activeRoute === 'Tutorials' ? '#fff' : colors.textMuted}
        />
        <Text style={[styles.navText, { color: activeRoute === 'Tutorials' ? '#fff' : colors.textMuted }]}>Muro</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.navItem}
        onPress={() => navigation.navigate('Marketplace')}
      >
        <Icon
          name={activeRoute === 'Marketplace' ? "storefront" : "storefront-outline"}
          size={24}
          color={activeRoute === 'Marketplace' ? '#fff' : colors.textMuted}
        />
        <Text style={[styles.navText, { color: activeRoute === 'Marketplace' ? '#fff' : colors.textMuted }]}>Tienda</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.navItem}
        onPress={() => navigation.navigate('Cart')}
      >
        <Icon
          name={activeRoute === 'Cart' ? "cart" : "cart-outline"}
          size={24}
          color={activeRoute === 'Cart' ? '#fff' : colors.textMuted}
        />
        <Text style={[styles.navText, { color: activeRoute === 'Cart' ? '#fff' : colors.textMuted }]}>Carrito</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.navItem}
        onPress={() => navigation.navigate('Home')}
      >
        <Icon
          name={activeRoute === 'Home' ? "person" : "person-outline"}
          size={24}
          color={activeRoute === 'Home' ? '#fff' : colors.textMuted}
        />
        <Text style={[styles.navText, { color: activeRoute === 'Home' ? '#fff' : colors.textMuted }]}>Perfil</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 25,
    left: 45,
    right: 45,
    height: 65,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 20,
    zIndex: 1000
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  navText: { fontSize: 10, marginTop: 2, fontWeight: '700' },
  bubble: {
    position: 'absolute',
    height: '80%',
    borderRadius: 28,
    zIndex: 1,
  }
});
