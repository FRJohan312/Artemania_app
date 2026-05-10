import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Keyboard, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { MetodoPago } from '../types';
import { useToast } from '../context/ToastContext';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPay: (method: MetodoPago, saveForLater: boolean) => void;
  total: number;
}

export default function PaymentModal({ visible, onClose, onPay, total }: PaymentModalProps) {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const toast = useToast();

  const savedMethods = profile?.metodosPago || [];
  const hasSavedMethods = savedMethods.length > 0;

  const [viewMode, setViewMode] = useState<'list' | 'add'>(hasSavedMethods ? 'list' : 'add');
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(hasSavedMethods ? savedMethods[0].id : null);
  
  const [newCard, setNewCard] = useState({ numero: '', titular: '', expiracion: '', cvv: '' });
  const [saveForLater, setSaveForLater] = useState(true);

  // Resetear estados cuando se abre el modal
  useEffect(() => {
    if (visible) {
      if (hasSavedMethods) {
        setViewMode('list');
        setSelectedMethodId(savedMethods[0].id);
      } else {
        setViewMode('add');
        setSaveForLater(true); // Siempre true por defecto
      }
      setNewCard({ numero: '', titular: '', expiracion: '', cvv: '' });
    }
  }, [visible, hasSavedMethods, savedMethods]);

  const detectFranchise = (number: string): 'Visa' | 'MasterCard' | 'Amex' | 'Otro' => {
    const cleanNum = number.replace(/\D/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleanNum)) return 'MasterCard';
    if (/^3[47]/.test(cleanNum)) return 'Amex';
    return 'Otro';
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

  const handleProcessPayment = () => {
    if (viewMode === 'list') {
      const selected = savedMethods.find((m: MetodoPago) => m.id === selectedMethodId);
      if (selected) {
        onPay(selected, false);
      } else {
        toast.warn('Selección requerida', 'Por favor selecciona un método de pago.');
      }
    } else {
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
        id: Date.now().toString(), // ID temporal
        titular: titular.trim(),
        numero: maskedNumber,
        expiracion: expiracion.trim(),
        franquicia,
      };

      onPay(newMethod, saveForLater);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
        {/* Fondo oscuro cerrable */}
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => { Keyboard.dismiss(); onClose(); }} />
        
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.divider }]} />
          
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {viewMode === 'list' ? 'Selecciona un pago' : 'Nueva Tarjeta'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
            
            {viewMode === 'list' ? (
              <>
                {savedMethods.map((method: MetodoPago) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.savedCardItem, 
                      { backgroundColor: colors.background, borderColor: colors.border },
                      selectedMethodId === method.id && { borderColor: colors.primary, borderWidth: 2, backgroundColor: 'rgba(185, 106, 74, 0.05)' }
                    ]}
                    onPress={() => setSelectedMethodId(method.id)}
                  >
                    <View style={styles.savedCardIcon}>
                      {getFranchiseLogo(method.franquicia) ? (
                        <Image source={{ uri: getFranchiseLogo(method.franquicia)! }} style={{ width: 35, height: 22, resizeMode: 'contain' }} />
                      ) : (
                        <Icon name="card" size={24} color={colors.textPrimary} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.savedCardTitle, { color: colors.textPrimary }]}>{method.franquicia} terminada en {method.numero.slice(-4)}</Text>
                      <Text style={[styles.savedCardSub, { color: colors.textSecondary }]}>{method.titular}</Text>
                    </View>
                    <Icon name={selectedMethodId === method.id ? "radio-button-on" : "radio-button-off"} size={24} color={selectedMethodId === method.id ? colors.primary : colors.textMuted} />
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.addNewBtn} onPress={() => setViewMode('add')}>
                  <Icon name="add" size={20} color={colors.primary} />
                  <Text style={[styles.addNewText, { color: colors.primary }]}>Añadir nueva tarjeta</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.securityNotice}>
                  <Icon name="lock-closed" size={16} color="#20c997" style={{ marginRight: 8 }} />
                  <Text style={styles.securityText}>
                    Tus datos están encriptados. No guardamos tu código CVV por seguridad.
                  </Text>
                </View>

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
                  style={styles.checkboxRow} 
                  onPress={() => setSaveForLater(!saveForLater)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: saveForLater ? colors.primary : colors.surface }]}>
                    {saveForLater && <Icon name="checkmark" size={16} color="#fff" />}
                  </View>
                  <Text style={[styles.checkboxText, { color: colors.textPrimary }]}>Guardar tarjeta para compras futuras</Text>
                </TouchableOpacity>

                {hasSavedMethods && (
                  <TouchableOpacity style={styles.backToListBtn} onPress={() => setViewMode('list')}>
                    <Text style={[styles.backToListText, { color: colors.textSecondary }]}>Volver a mis tarjetas guardadas</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            
            <View style={[styles.paySummary, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.payTotalLabel, { color: colors.textMuted }]}>Total a pagar</Text>
              <Text style={[styles.payTotalAmount, { color: colors.primary }]}>${Math.round(total).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.payBtn, { backgroundColor: colors.primary }]}
              onPress={handleProcessPayment}
            >
              <Icon name="lock-closed" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.payBtnText}>Pagar Pedido</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25, maxHeight: '90%' },
  modalHandle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  
  savedCardItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  savedCardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  savedCardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  savedCardSub: { fontSize: 13 },
  
  addNewBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginBottom: 20 },
  addNewText: { fontSize: 15, fontWeight: '700', marginLeft: 8 },

  securityNotice: { flexDirection: 'row', backgroundColor: 'rgba(32, 201, 151, 0.1)', padding: 12, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  securityText: { flex: 1, color: '#20c997', fontSize: 12, lineHeight: 18 },

  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, height: 56, marginBottom: 15 },
  input: { flex: 1, fontSize: 16 },
  row: { flexDirection: 'row' },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkboxText: { fontSize: 14, fontWeight: '500' },
  
  backToListBtn: { alignSelf: 'center', marginTop: 15, marginBottom: 5 },
  backToListText: { fontSize: 14, textDecorationLine: 'underline' },

  paySummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, marginTop: 20, marginBottom: 15 },
  payTotalLabel: { fontSize: 16, fontWeight: '600' },
  payTotalAmount: { fontSize: 22, fontWeight: '900' },

  payBtn: { flexDirection: 'row', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
