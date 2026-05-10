import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { loginUser } from '../../services/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseConnection';
import { getUserProfile } from '../../services/db';
import { ENABLE_QUICK_TEST } from '../../config/developer';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ConfigContext';
import Icon from 'react-native-vector-icons/Ionicons';

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { colors } = useTheme();

  const redirectUser = (profileData: any) => {
    if (profileData.estado === 'suspendido') {
      const motivo = profileData.motivoSuspension || "Tu cuenta se encuentra temporalmente en pausa mientras nuestro equipo revisa una situación.";
      toast.confirm({
        type: 'warning',
        title: '🎨 Cuenta en Pausa',
        message: `${motivo}\n\nSi crees que esto es un error, contáctanos y lo resolveremos juntos.`,
        singleButton: true,
        confirmText: 'Entendido',
        onConfirm: () => auth.signOut(),
      });
      setLoading(false);
      return;
    }

    const routeParams = profileData.tipo === 'Cliente' 
      ? { profile: profileData, clienteId: profileData.id }
      : { profile: profileData, artesanoId: profileData.id };

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: routeParams }],
      })
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.isAnonymous) {
        const { data } = await getUserProfile(user.uid);
        if (data) {
          redirectUser(data);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.warn('Campos Vacíos', 'Necesitamos tu correo y contraseña para abrirte las puertas del taller. 🔑');
      return;
    }
    setLoading(true);
    const { user, profile, error } = await loginUser(email, password);
    setLoading(false);

    if (user && profile) {
      redirectUser(profile);
    } else {
      let errMsg = 'Verifica que tu correo y contraseña estén correctos e intenta de nuevo. ✨';
      if (error?.includes('auth/invalid-credential')) {
        errMsg = 'Las credenciales ingresadas son incorrectas (o la cuenta no existe).';
      } else if (error?.includes('auth/network-request-failed')) {
        errMsg = 'No hay conexión a internet para verificar tus credenciales.';
      }
      toast.error('No pudimos entrar', errMsg);
    }
  };

  const autoLogin = async (testEmail: string) => {
    setLoading(true);
    const { user, profile, error } = await loginUser(testEmail, '123456');
    setLoading(false);

    if (user && profile) {
      redirectUser(profile);
    } else {
      toast.error('Error de Acceso Rápido', `Error: ${error || 'No se pudo iniciar'}.`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Botón Cerrar X Premium */}
      <TouchableOpacity 
        style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
        onPress={() => navigation.navigate('MainTabs')}
      >
        <Icon name="close" size={24} color={colors.primary} />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={[styles.title, { color: colors.primary }]}>Artemania</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Conéctate con el arte auténtico</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Introduce tu correo"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Introduce tu contraseña"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#B96A4A" />
              <Text style={styles.loadingText}>Iniciando sesión...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.mainBtn} onPress={handleLogin}>
                <Text style={styles.mainBtnText}>Iniciar Sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.secondaryBtnText}>¿No tienes cuenta? <Text style={{ color: '#B96A4A', fontWeight: 'bold' }}>Regístrate</Text></Text>
              </TouchableOpacity>

              {ENABLE_QUICK_TEST && (
                <View style={{ marginTop: 20 }}>
                  <View style={styles.divider}>
                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                    <Text style={[styles.dividerText, { color: colors.textMuted }]}>Accesos Rápidos</Text>
                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                  </View>

                  <View style={styles.testBtnRow}>
                    <TouchableOpacity style={[styles.testBtn, { backgroundColor: '#E8E2D9' }]} onPress={() => autoLogin('cliente1@test.com')}>
                      <Text style={styles.testBtnText}>Cliente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.testBtn, { backgroundColor: '#fdede5' }]} onPress={() => autoLogin('artesano1@test.com')}>
                      <Text style={[styles.testBtnText, { color: '#B96A4A' }]}>Artesano</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.testBtn, { backgroundColor: '#2D2D2D' }]} onPress={() => autoLogin('admin@artemania.com')}>
                      <Text style={[styles.testBtnText, { color: '#fff' }]}>Admin</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'center', padding: 25 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 42, fontWeight: '800', color: '#B96A4A', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#868e96', marginTop: 5 },

  formContainer: { width: '100%' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  input: {
    width: '100%', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, fontSize: 16,
    marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1
  },

  mainBtn: { backgroundColor: '#B96A4A', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#B96A4A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 25, marginTop: -10, marginRight: 5 },
  forgotText: { color: '#B96A4A', fontSize: 14, fontWeight: '600' },

  secondaryBtn: { width: '100%', paddingVertical: 15, alignItems: 'center', marginTop: 5 },
  secondaryBtnText: { color: '#868e96', fontSize: 15 },

  loaderContainer: { alignItems: 'center', marginVertical: 30 },
  loadingText: { marginTop: 10, color: '#666', fontSize: 16 },

  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#E8E2D9' },
  dividerText: { marginHorizontal: 15, color: '#adb5bd', fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold' },

  testBtnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  testBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginHorizontal: 4 },
  testBtnText: { fontSize: 12, fontWeight: 'bold', color: '#495057' }
});
