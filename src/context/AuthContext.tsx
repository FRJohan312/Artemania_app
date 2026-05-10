import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../services/firebaseConnection';
import { getUserProfile } from '../services/db';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';

interface AuthContextType {
  user: any | null;
  profile: any | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const res = await getUserProfile(uid);
      if (res.data) {
        setProfile(res.data);
      }
    } catch (error) {
      console.error('Error fetching global profile:', error);
    }
  };

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (currentUser) {
        // Si es un usuario anónimo (invitado), no buscamos perfil
        if (currentUser.isAnonymous) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const { doc, onSnapshot } = require('firebase/firestore');
        const { db } = require('../services/firebaseConnection');
        
        // 1. Escuchar perfil en tiempo real (SIN configurar push aquí dentro)
        const docRef = doc(db, 'usuarios', currentUser.uid);
        profileUnsubscribe = onSnapshot(docRef, (docSnap: any) => {
          const profileData = docSnap.exists() ? docSnap.data() : null;
          setProfile(profileData);
        });

        // 2. Configurar Push Notificaciones UNA SOLA VEZ al iniciar sesión
        setupPushNotifications(currentUser.uid);
      } else {
        // SI NO HAY USUARIO (ej. app recién instalada), INICIAMOS COMO ANÓNIMO
        // Esto permite que el usuario pueda leer Firestore inmediatamente
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("Error al iniciar sesión anónima:", e);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const setupPushNotifications = async (uid: string) => {
    try {
      const { doc, updateDoc, getDoc } = require('firebase/firestore');
      const { db } = require('../services/firebaseConnection');

      // Permisos
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }

      const token = await messaging().getToken();
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      const storedToken = userDoc.exists() ? userDoc.data().fcmToken : null;

      if (token && token !== storedToken) {
        await updateDoc(doc(db, 'usuarios', uid), { 
          fcmToken: token,
          lastTokenUpdate: new Date().toISOString() 
        });
        console.log("✅ FCM Token actualizado");
      }

      // Listener de refresco de token (solo uno)
      messaging().onTokenRefresh(async (newToken) => {
        await updateDoc(doc(db, 'usuarios', uid), { fcmToken: newToken });
      });
    } catch (error) {
      console.warn("⚠️ Error configurando Push:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
