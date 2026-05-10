import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile } from '../../services/db';
import { Direccion } from '../../types';

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const { profile, refreshProfile } = useAuth();
  const { colors } = useTheme();
  const toast = useToast();

  const [direcciones, setDirecciones] = useState<Direccion[]>(profile?.direcciones || []);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [calle, setCalle] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [telefono, setTelefono] = useState('');

  const handleSaveToDb = async (newAddresses: Direccion[]) => {
    if (!profile) return;
    setSaving(true);
    
    // Sincronización: guardar la primera dirección como la predeterminada del carrito
    const defaultLegacyAddress = newAddresses.length > 0 
      ? `${newAddresses[0].calle}, ${newAddresses[0].ciudad}`
      : '';

    const res = await updateUserProfile(profile.id, { 
      direcciones: newAddresses,
      direccion: defaultLegacyAddress
    });
    setSaving(false);

    if (res.success) {
      setDirecciones(newAddresses);
      await refreshProfile();
      toast.success('Direcciones actualizadas', 'Tus direcciones han sido guardadas correctamente.');
    } else {
      toast.error('Error al guardar', 'No se pudieron actualizar tus direcciones.');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitulo('');
    setCalle('');
    setCiudad('');
    setCodigoPostal('');
    setTelefono('');
    setShowModal(true);
  };

  const openEditModal = (addr: Direccion) => {
    setEditingId(addr.id);
    setTitulo(addr.titulo);
    setCalle(addr.calle);
    setCiudad(addr.ciudad);
    setCodigoPostal(addr.codigoPostal || '');
    setTelefono(addr.telefono || '');
    setShowModal(true);
  };

  const saveAddress = () => {
    if (!titulo.trim() || !calle.trim() || !ciudad.trim()) {
      Alert.alert('Campos Incompletos', 'Por favor llena al menos el título, la calle y la ciudad.');
      return;
    }

    const newAddr: Direccion = {
      id: editingId || Date.now().toString(),
      titulo: titulo.trim(),
      calle: calle.trim(),
      ciudad: ciudad.trim(),
      codigoPostal: codigoPostal.trim(),
      telefono: telefono.trim(),
    };

    let updatedList;
    if (editingId) {
      updatedList = direcciones.map(d => d.id === editingId ? newAddr : d);
    } else {
      updatedList = [...direcciones, newAddr];
    }

    setShowModal(false);
    handleSaveToDb(updatedList);
  };

  const deleteAddress = (id: string) => {
    Alert.alert(
      'Eliminar Dirección',
      '¿Estás seguro de que deseas eliminar esta dirección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            const updatedList = direcciones.filter(d => d.id !== id);
            handleSaveToDb(updatedList);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {direcciones.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="map-outline" size={60} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tienes direcciones guardadas.</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>Añade una para recibir tus compras más rápido.</Text>
          </View>
        ) : (
          direcciones.map((addr) => (
            <View key={addr.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Icon name={addr.titulo.toLowerCase().includes('casa') ? 'home' : 'business'} size={20} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{addr.titulo}</Text>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => openEditModal(addr)} style={styles.actionBtn}>
                    <Icon name="pencil" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteAddress(addr.id)} style={styles.actionBtn}>
                    <Icon name="trash" size={20} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.addressText, { color: colors.textSecondary }]}>{addr.calle}</Text>
              <Text style={[styles.addressText, { color: colors.textSecondary }]}>{addr.ciudad}{addr.codigoPostal ? `, ${addr.codigoPostal}` : ''}</Text>
              {addr.telefono ? <Text style={[styles.phoneText, { color: colors.textMuted }]}><Icon name="call" size={14} /> {addr.telefono}</Text> : null}
            </View>
          ))
        )}

        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: colors.primary }]} 
          onPress={openAddModal}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Icon name="add" size={24} color="#fff" />
              <Text style={styles.addBtnText}>Añadir Dirección</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* FORM MODAL */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{editingId ? 'Editar Dirección' : 'Nueva Dirección'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Título (Ej. Mi Casa, Trabajo) *</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]} 
                value={titulo} 
                onChangeText={setTitulo} 
                placeholder="Identificador de la dirección"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Calle y número *</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]} 
                value={calle} 
                onChangeText={setCalle} 
                placeholder="Avenida Siempre Viva 742"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Ciudad / Municipio *</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]} 
                value={ciudad} 
                onChangeText={setCiudad} 
                placeholder="Springfield"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Código Postal (Opcional)</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]} 
                value={codigoPostal} 
                onChangeText={setCodigoPostal} 
                placeholder="110111"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono de contacto (Opcional)</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]} 
                value={telefono} 
                onChangeText={setTelefono} 
                placeholder="Quien reciba el pedido"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={saveAddress}>
                <Text style={styles.saveBtnText}>Guardar Dirección</Text>
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
  scroll: { padding: 20, paddingBottom: 40 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, marginBottom: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  emptySub: { fontSize: 14, textAlign: 'center' },
  
  card: { borderRadius: 16, padding: 18, marginBottom: 15, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  actionsRow: { flexDirection: 'row', gap: 15 },
  actionBtn: { padding: 5 },
  
  addressText: { fontSize: 15, lineHeight: 22 },
  phoneText: { fontSize: 13, marginTop: 8, fontWeight: '500' },
  
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginTop: 10, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, paddingBottom: 40, maxHeight: '90%', borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  closeBtn: { padding: 5 },
  
  label: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, fontSize: 15, marginBottom: 20 },
  
  saveBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
