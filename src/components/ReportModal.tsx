import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useToast } from '../context/ToastContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { createReport } from '../services/db';
import { auth } from '../services/firebaseConnection';
import { useTheme } from '../context/ConfigContext';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'producto' | 'usuario';
  targetName: string;
}

const REPORT_REASONS = [
  'Contenido Inapropiado',
  'Spam o Fraude',
  'Odio o Acoso',
  'Propiedad Intelectual',
  'Otro'
];

export default function ReportModal({ visible, onClose, targetId, targetType, targetName }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { colors } = useTheme();

  const handleSendReport = async () => {
    if (!selectedReason) {
      toast.warn('Selecciona un Motivo', 'Elige el motivo de tu reporte para que podamos revisarlo adecuadamente.');
      return;
    }

    const reporterId = auth.currentUser?.uid;
    if (!reporterId) {
      toast.error('Sesión Requerida', 'Inicia sesión para poder enviar un reporte a nuestro equipo.');
      return;
    }

    setLoading(true);
    const reportData = {
      targetId,
      targetType,
      targetName,
      reporterId,
      reason: selectedReason,
      description: description.trim(),
    };

    const res = await createReport(reportData);
    setLoading(false);

    if (res.success) {
      toast.confirm({
        type: 'info',
        title: '📬 Reporte Recibido',
        message: 'Gracias por cuidar nuestra comunidad artesanal. Nuestro equipo revisará tu reporte con atención.',
        singleButton: true,
        confirmText: 'Entendido',
        onConfirm: onClose,
      });
      // Reset form
      setSelectedReason('');
      setDescription('');
    } else {
      toast.error('No se pudo enviar', 'Ocurrió un inconveniente al enviar tu reporte. Inténtalo de nuevo en unos momentos.');
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.overlay}
      >
        <TouchableOpacity 
          style={styles.dismissArea} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.divider }]} />
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Reportar {targetType === 'producto' ? 'Obra' : 'Perfil'}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>¿Por qué quieres reportar "{targetName}"?</Text>
          </View>

          <View style={styles.reasonsGrid}>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity 
                key={reason}
                style={[
                  styles.reasonBtn, 
                  { borderColor: colors.border, backgroundColor: colors.background },
                  selectedReason === reason && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text style={[
                  styles.reasonText, 
                  { color: colors.textSecondary },
                  selectedReason === reason && { color: colors.primary, fontWeight: '700' }
                ]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.descriptionSection}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>Descripción adicional (opcional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Cuéntanos más detalles..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              maxLength={300}
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>{description.length}/300</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.cancelBtn, { backgroundColor: colors.background }]} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sendBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && { opacity: 0.7 }]} 
              onPress={handleSendReport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendBtnText}>Enviar Reporte</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  container: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 5 },
  subtitle: { fontSize: 14 },
  reasonsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  reasonBtn: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  reasonText: { fontSize: 14, fontWeight: '500' },
  descriptionSection: { marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  input: { borderRadius: 15, padding: 15, height: 100, textAlignVertical: 'top', borderWidth: 1, fontSize: 15 },
  charCount: { textAlign: 'right', fontSize: 12, marginTop: 5 },
  actions: { flexDirection: 'row', gap: 15 },
  cancelBtn: { flex: 1, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 15 },
  cancelBtnText: { fontWeight: 'bold', fontSize: 16 },
  sendBtn: { flex: 2, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 15, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
