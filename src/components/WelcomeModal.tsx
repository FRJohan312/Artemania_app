import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ConfigContext';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export default function WelcomeModal({ visible, onClose }: WelcomeModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {/* Imagen Decorativa / Logo */}
          <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
             <View style={[styles.circleBg, { backgroundColor: colors.surface, shadowColor: colors.primary }]}>
                <Icon name="color-palette" size={60} color={colors.primary} />
             </View>
             {/* Decoración de puntos */}
             <View style={[styles.dot, { backgroundColor: colors.primary, top: 10, left: 20, width: 8, height: 8 }]} />
             <View style={[styles.dot, { backgroundColor: colors.primary, top: 40, right: 30, width: 12, height: 12, opacity: 0.3 }]} />
             <View style={[styles.dot, { backgroundColor: colors.primary, bottom: 20, left: 40, width: 10, height: 10, opacity: 0.5 }]} />
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>¡Bienvenido a Artemanía!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Descubre la magia del trabajo hecho a mano. Aquí, cada pieza cuenta una historia y cada artesano comparte su alma.
            </Text>

            <View style={[styles.featureRow, { backgroundColor: colors.primary + '15' }]}>
               <Icon name="people" size={22} color={colors.primary} />
               <Text style={[styles.featureText, { color: colors.textPrimary }]}>Conecta con artesanos locales</Text>
            </View>
            <View style={[styles.featureRow, { backgroundColor: colors.primary + '15' }]}>
               <Icon name="cart" size={22} color={colors.primary} />
               <Text style={[styles.featureText, { color: colors.textPrimary }]}>Adquiere obras únicas y auténticas</Text>
            </View>
            <View style={[styles.featureRow, { backgroundColor: colors.primary + '15' }]}>
               <Icon name="videocam" size={22} color={colors.primary} />
               <Text style={[styles.featureText, { color: colors.textPrimary }]}>Aprende procesos con tutoriales</Text>
            </View>

            <TouchableOpacity 
              style={[styles.startBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.startBtnText}>Empezar a explorar</Text>
              <Icon name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
            
            <Text style={[styles.footerText, { color: colors.textMuted }]}>Hecho con ❤️ para amantes del arte</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  imageContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  dot: {
    position: 'absolute',
    borderRadius: 10,
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    padding: 12,
    borderRadius: 15,
  },
  featureText: {
    marginLeft: 15,
    fontSize: 15,
    fontWeight: '600',
  },
  startBtn: {
    flexDirection: 'row',
    width: '100%',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 20,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  }
});
