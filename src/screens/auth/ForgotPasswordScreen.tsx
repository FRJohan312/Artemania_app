import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../context/ToastContext';
import { getUserProfileByEmail } from '../../services/db';
import { sendResetEmail } from '../../services/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { verifySecretWord } from '../../utils/crypto';
import { useTheme } from '../../context/ConfigContext';

export default function ForgotPasswordScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [palabraClave, setPalabraClave] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const handleVerifyAndReset = async () => {
    if (!email.trim() || !palabraClave.trim()) {
      toast.warn('Campos Incompletos', 'Necesitamos tu correo y tu palabra secreta para verificar tu identidad. 🔑');
      return;
    }

    setLoading(true);
    try {
      // 1. Verificar si el usuario existe y su palabra clave coincide
      const { data, error: dbError } = await getUserProfileByEmail(email.trim());
      const profile = data as any;
      
      if (dbError || !profile) {
        toast.error('Cuenta no encontrada', 'No encontramos una cuenta vinculada a ese correo. Verifica que esté escrito correctamente.');
        setLoading(false);
        return;
      }

      const keywordStored = profile.palabraClave || '';
      
      const isMatch = verifySecretWord(palabraClave, keywordStored);

      if (!isMatch) {
        toast.error('Verificación Fallida', 'La palabra secreta no coincide con la que tenemos registrada. Intenta recordar la que elegiste al crear tu cuenta. 🤔');
        setLoading(false);
        return;
      }

      // 2. Si coincide, enviar el correo de recuperación oficial de Firebase
      const { success, error: authError } = await sendResetEmail(email.trim());
      
      if (success) {
        toast.confirm({
          type: 'info',
          title: '✉️ ¡Correo Enviado!',
          message: 'Verificamos tu identidad con éxito. Revisa tu bandeja de entrada para restablecer tu contraseña y volver al taller.',
          singleButton: true,
          confirmText: 'Entendido',
          onConfirm: () => navigation.navigate('Login'),
        });
      } else {
        toast.error('Correo no enviado', 'No pudimos enviar el enlace de recuperación. Inténtalo más tarde.');
      }
    } catch (err: any) {
      toast.error('Algo salió mal', 'Ocurrió un inconveniente inesperado. Inténtalo de nuevo en unos momentos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface, shadowColor: colors.border }]} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={[styles.header, { paddingTop: insets.top }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <Icon name="lock-open-outline" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>Recuperar Cuenta</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Verifica tu identidad con tu palabra secreta</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Correo Electrónico</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="tucorreo@ejemplo.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Tu Palabra Secreta</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="La palabra que elegiste al registrarte"
              placeholderTextColor={colors.textMuted}
              value={palabraClave}
              onChangeText={setPalabraClave}
              autoCapitalize="none"
              secureTextEntry // Por seguridad al escribirla
            />

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              <TouchableOpacity style={[styles.resetBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleVerifyAndReset}>
                <Text style={[styles.resetBtnText, { color: colors.surface }]}>Verificar y Resetear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
            <Icon name="information-circle-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textMuted }]}>
              Si los datos coinciden, enviaremos un enlace seguro a tu correo oficial para cambiar la contraseña.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 25, flexGrow: 1, paddingBottom: 50 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  
  header: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 15, marginTop: 8, textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },
  
  card: { borderRadius: 20, padding: 20, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, borderWidth: 1 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, fontSize: 16, marginBottom: 20 },
  
  resetBtn: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  resetBtnText: { fontSize: 16, fontWeight: 'bold' },
  
  infoBox: { flexDirection: 'row', alignItems: 'center', marginTop: 30, padding: 15, borderRadius: 12, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13, marginLeft: 10, lineHeight: 18 }
});
