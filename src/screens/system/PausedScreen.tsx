import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth } from '../../services/firebaseConnection';
import { signOut } from 'firebase/auth';
import { Theme } from '../theme';

export default function PausedScreen({ profile }: { profile: any }) {
  const insets = useSafeAreaInsets();
  const handleSignOut = () => {
    signOut(auth);
  };

  const handleContact = () => {
    Linking.openURL('mailto:soporte@artemania.com?subject=Cuenta en Pausa - ' + profile.nombre);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="pause-circle-outline" size={100} color="#F59E0B" />
        </View>
        
        <Text style={styles.title}>Cuenta en Pausa</Text>
        <Text style={styles.subtitle}>
          Hola {profile.nombre}, tu cuenta ha sido restringida temporalmente de forma automática.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>¿Por qué ha pasado esto?</Text>
          <Text style={styles.infoText}>
            Nuestros sistemas han detectado múltiples reportes de la comunidad sobre tu actividad reciente. 
          </Text>
          <Text style={styles.infoText}>
            Un administrador revisará tu caso en las próximas horas para decidir si se trata de un error o si se requiere una sanción definitiva.
          </Text>
        </View>

        <Text style={styles.waitText}>
          Por favor, espera a que el equipo de moderación tome una decisión. Te notificaremos pronto.
        </Text>

        <TouchableOpacity style={styles.contactBtn} onPress={handleContact}>
          <Icon name="help-circle-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.contactBtnText}>Soporte Técnico</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  iconContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFBEB',
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2D2D2D',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 25,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D97706',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 10,
  },
  waitText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  contactBtn: {
    backgroundColor: '#2D2D2D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 16,
    width: '100%',
    marginBottom: 15,
  },
  contactBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutBtn: {
    paddingVertical: 15,
  },
  signOutBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
