import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile } from '../../services/users';
import { MetodoPago } from '../../types';

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, refreshProfile } = useAuth();
  const { colors } = useTheme();
  const toast = useToast();

  const [methods, setMethods] = useState<MetodoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [newCard, setNewCard] = useState({ numero: '', titular: '', expiracion: '', cvv: '' });

  useEffect(() => {
    if (profile) {
      setMethods(profile.metodosPago || []);
    }
    setLoading(false);
  }, [profile]);

  const detectFranchise = (number: string): 'Visa' | 'MasterCard' | 'Amex' | 'Otro' => {
    const cleanNum = number.replace(/\D/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleanNum)) return 'MasterCard';
    if (/^3[47]/.test(cleanNum)) return 'Amex';
    return 'Otro';
  };

  const handleSaveToDb = async (newMethods: MetodoPago[]) => {
    if (!profile) return;
    setSaving(true);
    
    const res = await updateUserProfile(profile.id, { metodosPago: newMethods });
    setSaving(false);

    if (res.success) {
      setMethods(newMethods);
      await refreshProfile();
      toast.success('¡Actualizado!', 'Tus métodos de pago se han actualizado.');
    } else {
      toast.error('Error', 'No se pudieron guardar los cambios.');
    }
  };

  const handleAddCard = () => {
    const { numero, titular, expiracion, cvv } = newCard;
    if (!numero || !titular || !expiracion || !cvv) {
      toast.warn('Campos incompletos', 'Por favor llena todos los datos de la tarjeta.');
      return;
    }

    const cleanNum = numero.replace(/\D/g, '');
    if (cleanNum.length < 13) {
      toast.warn('Número inválido', 'El número de tarjeta es demasiado corto.');
      return;
    }

    const franquicia = detectFranchise(cleanNum);
    const last4 = cleanNum.slice(-4);
    const maskedNumber = `**** **** **** ${last4}`;

    const newMethod: MetodoPago = {
      id: Date.now().toString(),
      titular: titular.trim(),
      numero: maskedNumber,
      expiracion: expiracion.trim(),
      franquicia,
    };

    const updatedMethods = [...methods, newMethod];
    handleSaveToDb(updatedMethods);
    setModalVisible(false);
    setNewCard({ numero: '', titular: '', expiracion: '', cvv: '' });
  };

  const handleDelete = (id: string) => {
    toast.confirm({
      type: 'danger',
      title: 'Eliminar Tarjeta',
      message: '¿Estás seguro de que deseas eliminar este método de pago de tu cuenta? Esta acción no se puede deshacer.',
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        const updated = methods.filter(m => m.id !== id);
        handleSaveToDb(updated);
      }
    });
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const getFranchiseLogo = (franquicia: string) => {
    switch (franquicia) {
      case 'Visa': return 'https://img.icons8.com/color/48/000000/visa.png';
      case 'MasterCard': return 'https://img.icons8.com/color/48/000000/mastercard.png';
      case 'Amex': return 'https://img.icons8.com/color/48/000000/amex.png';
      default: return null;
    }
  };

  const getFranchiseColor = (franquicia: string) => {
    switch (franquicia) {
      case 'Visa': return '#1a1f71';
      case 'MasterCard': return '#eb001b';
      case 'Amex': return '#2e77bc';
      default: return colors.primary;
    }
  };

  const renderMethod = ({ item }: { item: MetodoPago }) => (
    <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.franchiseBadge}>
          {getFranchiseLogo(item.franquicia) ? (
            <Image source={{ uri: getFranchiseLogo(item.franquicia)! }} style={{ width: 35, height: 22, resizeMode: 'contain' }} />
          ) : (
            <Icon name="card" size={24} color={getFranchiseColor(item.franquicia)} />
          )}
          <Text style={[styles.franchiseText, { color: getFranchiseColor(item.franquicia) }]}>{item.franquicia}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Icon name="trash-outline" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.cardNumber, { color: colors.textPrimary }]}>{item.numero}</Text>
      
      <View style={styles.cardFooter}>
        <View>
          <Text style={[styles.label, { color: colors.textMuted }]}>Titular</Text>
          <Text style={[styles.value, { color: colors.textSecondary }]} numberOfLines={1}>{item.titular}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Expira</Text>
          <Text style={[styles.value, { color: colors.textSecondary }]}>{item.expiracion}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
      <FlatList
        data={methods}
        keyExtractor={item => item.id}
        renderItem={renderMethod}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="card-outline" size={60} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin métodos de pago</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Añade una tarjeta para facilitar tus futuras compras.
            </Text>
          </View>
        }
      />

      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="add" size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.addBtnText}>Añadir Tarjeta</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          {/* Fondo oscuro para cerrar */}
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => { Keyboard.dismiss(); setModalVisible(false); }} 
          />
          
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.divider }]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Nueva Tarjeta</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.securityNotice}>
              <Icon name="lock-closed" size={16} color="#20c997" style={{ marginRight: 8 }} />
              <Text style={styles.securityText}>
                Tus datos están seguros. No guardamos tu código CVV y tu tarjeta será enmascarada en nuestros servidores.
              </Text>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            >
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Número de Tarjeta</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Icon name="card-outline" size={20} color={colors.textMuted} style={{ marginRight: 10 }} />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="0000 0000 0000 0000"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={19}
                      value={newCard.numero}
                      onChangeText={(t) => setNewCard({ ...newCard, numero: formatCardNumber(t) })}
                    />
                  </View>

                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nombre del Titular</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Icon name="person-outline" size={20} color={colors.textMuted} style={{ marginRight: 10 }} />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="Ej: Juan Pérez"
                      placeholderTextColor="#999"
                      autoCapitalize="words"
                      value={newCard.titular}
                      onChangeText={(t) => setNewCard({ ...newCard, titular: t })}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Vencimiento</Text>
                      <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Icon name="calendar-outline" size={20} color={colors.textMuted} style={{ marginRight: 10 }} />
                        <TextInput
                          style={[styles.input, { color: colors.textPrimary }]}
                          placeholder="MM/AA"
                          placeholderTextColor="#999"
                          keyboardType="numeric"
                          maxLength={5}
                          value={newCard.expiracion}
                          onChangeText={(t) => setNewCard({ ...newCard, expiracion: formatExpiry(t) })}
                        />
                      </View>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CVV</Text>
                      <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Icon name="keypad-outline" size={20} color={colors.textMuted} style={{ marginRight: 10 }} />
                        <TextInput
                          style={[styles.input, { color: colors.textPrimary }]}
                          placeholder="123"
                          placeholderTextColor="#999"
                          keyboardType="numeric"
                          maxLength={4}
                          secureTextEntry
                          value={newCard.cvv}
                          onChangeText={(t) => setNewCard({ ...newCard, cvv: t.replace(/\D/g, '') })}
                        />
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                    onPress={handleAddCard}
                  >
                    <Text style={styles.saveBtnText}>Guardar Tarjeta</Text>
                  </TouchableOpacity>
                </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20, paddingBottom: 100 },
  
  cardContainer: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  franchiseBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  franchiseText: { fontSize: 14, fontWeight: '800', marginLeft: 6 },
  deleteBtn: { padding: 5 },
  
  cardNumber: { fontSize: 22, fontWeight: '600', letterSpacing: 2, marginBottom: 20, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 14, fontWeight: '700' },

  emptyState: { alignItems: 'center', marginTop: 60, padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  addBtn: { flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25, maxHeight: '90%' },
  modalHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  
  securityNotice: { flexDirection: 'row', backgroundColor: 'rgba(32, 201, 151, 0.1)', padding: 12, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  securityText: { flex: 1, color: '#20c997', fontSize: 12, lineHeight: 18 },

  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, height: 56, marginBottom: 20 },
  input: { flex: 1, fontSize: 16 },
  row: { flexDirection: 'row' },
  
  saveBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
