import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ConfigContext';

interface SuccessRegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  isArtesano?: boolean;
}

export default function SuccessRegistrationModal({ visible, onClose, userName, isArtesano }: SuccessRegistrationModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
             <Icon name={isArtesano ? "brush" : "sparkles"} size={50} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {isArtesano ? '¡Tu taller está listo!' : '¡Ya eres parte de Artemanía!'}
          </Text>
          <Text style={[styles.welcomeName, { color: colors.primary }]}>¡Hola, {userName}! ✨</Text>
          
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {isArtesano 
              ? 'Estamos emocionados de tener tu talento con nosotros. Este es el espacio perfecto para que el mundo conozca tus creaciones y la pasión que pones en cada detalle.'
              : 'Tu cuenta ha sido creada con éxito. Ahora tienes el poder de apoyar el arte local, guardar tus obras favoritas y ser parte de esta gran comunidad artesanal.'
            }
          </Text>

          <View style={[styles.tipBox, { backgroundColor: colors.primary + '10' }]}>
            <Text style={[styles.tipTitle, { color: colors.textPrimary }]}>¿Cómo empezar?</Text>
            {isArtesano ? (
              <>
                <View style={styles.tipItem}>
                  <Icon name="cloud-upload-outline" size={20} color={colors.primary} />
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>Publica tu primera obra en el Mercado.</Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="camera-outline" size={20} color={colors.primary} />
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>Comparte tus procesos en la Comunidad.</Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="color-wand-outline" size={20} color={colors.primary} />
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>Personaliza tu perfil de Artesano.</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.tipItem}>
                  <Icon name="person-circle-outline" size={20} color={colors.primary} />
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>Personaliza tu perfil con una foto única.</Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="heart-outline" size={20} color={colors.primary} />
                  <Text style={[styles.tipText, { color: colors.textSecondary }]}>Guarda las obras que más te inspiren.</Text>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.primary }]} 
            onPress={onClose}
          >
            <Text style={styles.actionBtnText}>
              {isArtesano ? '¡Abrir mi taller!' : '¡Empezar mi aventura!'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 5,
  },
  welcomeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  tipBox: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  actionBtn: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
