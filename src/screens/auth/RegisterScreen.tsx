import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { registerUser } from '../../services/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ConfigContext';
import { hashSecretWord } from '../../utils/crypto';

import SuccessRegistrationModal from '../../components/SuccessRegistrationModal';
import TermsModal from '../../components/TermsModal';

export default function RegisterScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { colors } = useTheme();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState<'Artesano' | 'Cliente'>('Cliente');
  const [descripcion, setDescripcion] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [palabraClave, setPalabraClave] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredProfile, setRegisteredProfile] = useState<any>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleRegister = async () => {
    if (!nombre.trim() || !email.trim() || !password.trim() || !palabraClave.trim()) {
      toast.warn('Faltan Datos', 'Completa todos los campos marcados con (*) para crear tu cuenta artesanal. 🎨');
      return;
    }

    if (!acceptedTerms) {
      toast.warn('Términos requeridos', 'Debes leer y aceptar los términos y condiciones para continuar.');
      return;
    }

    setLoading(true);
    const { user, profile, error } = await registerUser(email, password, nombre, tipo, {
      descripcion,
      palabraClave: hashSecretWord(palabraClave),
      isAdmin: adminCode === '1'
    });
    setLoading(false);

    if (user && profile) {
      setRegisteredProfile(profile);
      setShowSuccessModal(true);
    } else {
      toast.error('No pudimos registrarte', 'Algo salió mal al crear tu cuenta. Verifica tus datos e inténtalo de nuevo.');
    }
  };

  const handleFinishRegistration = () => {
    setShowSuccessModal(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { profile: registeredProfile } }],
      })
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface, shadowColor: colors.border }]} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={[styles.header, { paddingTop: insets.top }]}>
            <Text style={[styles.title, { color: colors.primary }]}>Crear Cuenta</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Únete a la mejor comunidad de arte</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>¿Qué tipo de usuario eres?</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleBtn, { backgroundColor: colors.surface, borderColor: colors.border }, tipo === 'Cliente' && [styles.roleBtnActive, { backgroundColor: colors.primary, borderColor: colors.primary }]]}
                onPress={() => setTipo('Cliente')}
              >
                <Icon name="person" size={24} color={tipo === 'Cliente' ? '#fff' : colors.textSecondary} />
                <Text style={[styles.roleText, { color: colors.textSecondary }, tipo === 'Cliente' && styles.roleTextActive]}>Comprar Arte</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, { backgroundColor: colors.surface, borderColor: colors.border }, tipo === 'Artesano' && [styles.roleBtnActiveAlt, { backgroundColor: colors.primary, borderColor: colors.primary }]]}
                onPress={() => setTipo('Artesano')}
              >
                <Icon name="color-palette" size={24} color={tipo === 'Artesano' ? '#fff' : colors.textSecondary} />
                <Text style={[styles.roleText, { color: colors.textSecondary }, tipo === 'Artesano' && styles.roleTextActive]}>Vender Arte</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre completo *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]} placeholder="Escribe tu nombre" placeholderTextColor={colors.textMuted} value={nombre} onChangeText={setNombre} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Correo electrónico *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]} placeholder="tucorreo@ejemplo.com" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]} placeholder="Máximo nivel de seguridad" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Palabra Secreta para Recuperación *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Ej. Mi primer mascota"
              placeholderTextColor={colors.textMuted}
              value={palabraClave}
              onChangeText={setPalabraClave}
              autoCapitalize="none"
            />

            {tipo === 'Artesano' && (
              <>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Descripción de tu trabajo (Opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="¿Qué te inspira a crear?"
                  placeholderTextColor={colors.textMuted}
                  value={descripcion}
                  onChangeText={setDescripcion}
                  multiline
                />
              </>
            )}

            {/* <Text style={styles.label}>Código Administrador (Secreto)</Text>
            <TextInput style={styles.input} placeholder="Solo para equipo interno" placeholderTextColor="#adb5bd" value={adminCode} onChangeText={setAdminCode} secureTextEntry /> */}

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={[styles.checkbox, acceptedTerms && { backgroundColor: colors.primary, borderColor: colors.primary }, !acceptedTerms && { borderColor: colors.border }]}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                {acceptedTerms && <Icon name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
              <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                He leído y acepto los{' '}
                <Text style={[styles.termsLink, { color: colors.primary }]} onPress={() => setShowTermsModal(true)}>
                  Términos y Condiciones
                </Text>
              </Text>
            </View>

            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Creando tu cuenta, un momento...</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.mainBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleRegister}>
                <Text style={[styles.mainBtnText, { color: '#fff' }]}>Registrarme</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
              <Text style={[styles.secondaryBtnText, { color: colors.textMuted }]}>¿Ya tienes cuenta? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Inicia sesión</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TermsModal 
        visible={showTermsModal} 
        onClose={(accepted) => {
          setAcceptedTerms(accepted);
          setShowTermsModal(false);
        }} 
      />

      <SuccessRegistrationModal
        visible={showSuccessModal}
        onClose={handleFinishRegistration}
        userName={nombre}
        isArtesano={tipo === 'Artesano'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scroll: { padding: 25, flexGrow: 1, paddingBottom: 50 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  header: { alignItems: 'center', marginTop: 15, marginBottom: 30 },
  title: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: 16, marginTop: 5 },

  formContainer: { width: '100%' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },

  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  roleBtn: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 15, alignItems: 'center', marginHorizontal: 5, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  roleBtnActive: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  roleBtnActiveAlt: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  roleText: { marginTop: 8, fontSize: 14, fontWeight: 'bold' },
  roleTextActive: { color: '#fff' },

  input: {
    width: '100%', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, fontSize: 16,
    marginBottom: 20, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  mainBtn: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  mainBtnText: { fontSize: 18, fontWeight: 'bold' },

  secondaryBtn: { width: '100%', paddingVertical: 15, alignItems: 'center', marginTop: 5 },
  secondaryBtnText: { fontSize: 15 },

  loaderContainer: { alignItems: 'center', marginVertical: 30 },
  loadingText: { marginTop: 10, fontSize: 16 },

  termsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  termsText: { fontSize: 14, flex: 1, lineHeight: 20 },
  termsLink: { fontWeight: 'bold', textDecorationLine: 'underline' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
});
