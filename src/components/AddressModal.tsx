import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { updateUserProfile } from '../services/users';
import { useAuth } from '../context/AuthContext';

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  currentAddress?: string;
}

export default function AddressModal({ visible, onClose, currentAddress }: AddressModalProps) {
  const { colors } = useTheme();
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [address, setAddress] = useState(currentAddress || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setAddress(currentAddress || '');
    }
  }, [visible, currentAddress]);

  const handleSave = async () => {
    if (!address.trim()) {
      toast.warn('Dirección requerida', 'Por favor, ingresa una dirección de entrega válida para tus pedidos. 🚚');
      return;
    }

    setLoading(true);
    try {
      const newDir = {
        id: Date.now().toString(),
        titulo: 'Dirección de Entrega',
        calle: address.trim(),
        ciudad: 'Ciudad a editar',
      };
      const nuevasDirecciones = [...(profile.direcciones || []), newDir];

      const res = await updateUserProfile(profile.id, { 
        direccion: address.trim(),
        direcciones: nuevasDirecciones
      });
      
      if (res.success) {
        toast.success('¡Dirección guardada!', 'Tus próximos pedidos se enviarán aquí y se ha añadido a tu gestión de direcciones. ✨');
        await refreshProfile();
        onClose();
      } else {
        toast.error('Error', 'No pudimos guardar tu dirección. Inténtalo más tarde.');
      }
    } catch (error) {
      toast.error('Error', 'Ocurrió un problema inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[styles.modalContainer, { backgroundColor: colors.surface }]}
            >
              <View style={[styles.handle, { backgroundColor: colors.divider }]} />
              
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Dirección de Entrega</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Icon name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {profile ? (
                <>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Ingresa la dirección donde deseas recibir tus artesanías. Asegúrate de incluir ciudad y detalles adicionales.
                  </Text>

                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Icon name="map-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="Ej: Calle 10 # 5-20, Edificio El Sol, Apto 302"
                      placeholderTextColor="#999"
                      value={address}
                      onChangeText={setAddress}
                      multiline
                    />
                  </View>

                  <TouchableOpacity 
                    style={[styles.saveBtn, { backgroundColor: colors.primary }]} 
                    onPress={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.saveBtnText}>Confirmar Dirección</Text>
                        <Icon name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <Icon name="lock-closed-outline" size={60} color={colors.border} style={{ marginBottom: 15 }} />
                  <Text style={[styles.subtitle, { color: colors.textMuted, textAlign: 'center', marginBottom: 30 }]}>
                    Necesitas una cuenta para registrar una dirección de entrega y recibir tus artesanías.
                  </Text>
                  <TouchableOpacity 
                    style={[styles.saveBtn, { backgroundColor: colors.primary, width: '100%' }]} 
                    onPress={() => {
                      onClose();
                      const navigation = require('@react-navigation/native').useNavigation();
                      navigation.navigate('Login');
                    }}
                  >
                    <Text style={styles.saveBtnText}>Inicia sesión para continuar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    minHeight: 350,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
