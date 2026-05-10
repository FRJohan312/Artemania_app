import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth } from '../../services/firebaseConnection';
import { signOut } from 'firebase/auth';
import { Theme } from '../theme';

export default function SuspendedScreen({ profile }: { profile: any }) {
  const insets = useSafeAreaInsets();
  const handleSignOut = () => {
    signOut(auth);
  };

  const handleContact = () => {
    Linking.openURL('mailto:soporte@artemania.com?subject=Apelación de Suspensión - ' + profile.nombre);
  };

  const expiryDate = profile.fechaExpiracionSuspension ? new Date(profile.fechaExpiracionSuspension) : null;
  const isPermanent = !expiryDate;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="gavel" size={100} color="#FF5A5F" />
        </View>
        
        <Text style={styles.title}>Acceso Restringido</Text>
        <Text style={styles.subtitle}>
          Lo sentimos, {profile.nombre}. Tu cuenta ha sido suspendida temporalmente.
        </Text>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Motivo de la sanción:</Text>
          <Text style={styles.reasonText}>
            {profile.motivoSuspension || "Incumplimiento de las normas de la comunidad."}
          </Text>
          
          <View style={styles.statusRow}>
          <Ionicons 
              name={isPermanent ? "infinite-outline" : "timer-outline"} 
              size={18} 
              color={isPermanent ? "#ed4956" : "#f59e0b"} 
            />
            <Text style={[styles.statusText, isPermanent && { color: '#ed4956' }]}>
              {isPermanent 
                ? "Sanción Permanente" 
                : `Expira el: ${expiryDate.toLocaleString()}`
              }
            </Text>
          </View>

          <Text style={styles.dateText}>
            Fecha de aplicación: {profile.fechaSuspension ? new Date(profile.fechaSuspension).toLocaleDateString() : 'N/A'}
          </Text>
        </View>

        <Text style={styles.helpText}>
          Podrás volver a acceder a todas las funciones una vez que el tiempo de sanción haya transcurrido.
        </Text>

        <TouchableOpacity style={styles.contactBtn} onPress={handleContact}>
          <Ionicons name="mail-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.contactBtnText}>Apelar decisión</Text>
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
    backgroundColor: '#FFF1F1',
    width: 150,
    height: 150,
    borderRadius: 75,
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
  reasonBox: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 25,
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF5A5F',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reasonText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d97706',
    marginLeft: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  helpText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 15,
    lineHeight: 22,
  },
  contactBtn: {
    backgroundColor: '#262626',
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
    color: '#999',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
