import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { updateUserProfile } from '../services/users';
import { useAuth } from '../context/AuthContext';

interface BecomeArtisanModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BecomeArtisanModal({ visible, onClose }: BecomeArtisanModalProps) {
  const { colors } = useTheme();
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setError(null);
    if (bio.trim().length < 10) {
      setError('Por favor, escribe al menos 10 caracteres en tu biografía.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateUserProfile(profile.id, { 
        tipo: 'Artesano', 
        bio: bio.trim(),
        fechaConversion: new Date().toISOString()
      });

      if (res.success) {
        onClose();
        // El toast se muestra después de cerrar para que sea visible
        setTimeout(() => {
          toast.success('¡Bienvenido, Artesano!', 'Ahora puedes publicar tus obras y gestionar tus ventas. ✨');
        }, 300);
        await refreshProfile();
      } else {
        setError('No pudimos procesar tu solicitud. Inténtalo más tarde.');
      }
    } catch (err) {
      setError('Ocurrió un problema inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.modalContainer, { backgroundColor: colors.surface }]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="color-palette" size={40} color={colors.primary} />
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.title, { color: colors.textPrimary }]}>¡Tu viaje artístico comienza aquí!</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Estás a un paso de convertirte en Artesano. Podrás vender tus obras, dar clases y conectar con coleccionistas de todo el mundo.
            </Text>

            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Icon name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>Publica productos ilimitados</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>Gestiona tus propias ventas</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>Crea una marca personal</Text>
              </View>
            </View>

            <Text style={[styles.label, { color: colors.textPrimary }]}>Tu biografía artística</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.background, borderColor: colors.border }]}
              placeholder="Ej: Soy un ceramista apasionado por las técnicas ancestrales..."
              placeholderTextColor="#999"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#d9534f" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.upgradeBtn, { backgroundColor: colors.primary }]} 
              onPress={handleUpgrade}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.upgradeBtnText}>¡Empezar a Vender!</Text>
                  <Icon name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 30,
    padding: 25,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
  },
  infoBox: {
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 30,
  },
  upgradeBtn: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffc9c9',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
});
