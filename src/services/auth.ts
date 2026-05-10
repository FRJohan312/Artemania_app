import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebaseConnection';
import { createUserProfile, getUserProfile, clearAllCache } from './db';

// registrarse() - Del diagrama de clases
export const registerUser = async (email: string, pass: string, nombre: string, tipo: 'Artesano' | 'Cliente', extraData?: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Guardar perfil en base de datos basado en el diagrama
    const profileData: any = {
      id: user.uid,
      nombre,
      email,
      tipo, // 'Artesano' o 'Cliente'
    };

    if (tipo === 'Artesano' && extraData?.descripcion) {
      profileData.descripcion = extraData.descripcion;
    }

    if (extraData?.isAdmin) {
      profileData.isAdmin = true;
    }

    if (extraData?.palabraClave) {
      profileData.palabraClave = extraData.palabraClave;
    }

    await createUserProfile(user.uid, profileData);
    return { user, profile: profileData, error: null };
  } catch (error: any) {
    return { user: null, profile: null, error: error.message };
  }
};

// iniciarSesion() - Del diagrama de clases
export const loginUser = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Obtener información extendida
    const profileRes = await getUserProfile(user.uid);
    if (!profileRes.data) {
      return { user: null, profile: null, error: profileRes.error ? `Error de Firestore: ${profileRes.error}` : 'Firebase Auth fue exitoso, pero el perfil no se encontró en la base de datos (Firestore).' };
    }
    return { user, profile: profileRes.data, error: null };
  } catch (error: any) {
    return { user: null, profile: null, error: error.message };
  }
};

export const logOut = async () => {
  try {
    const { updateDoc, doc } = require('firebase/firestore');
    const { db } = require('./firebaseConnection');
    const currentUser = auth.currentUser;

    if (currentUser) {
      // Limpiar el token de notificaciones de la base de datos al salir
      await updateDoc(doc(db, 'usuarios', currentUser.uid), {
        fcmToken: null
      });
      console.log("Token FCM eliminado con éxito al cerrar sesión.");
    }
  } catch (error) {
    console.error("Error al limpiar token FCM durante el logout:", error);
  }

  clearAllCache();
  await signOut(auth);
};

export const sendResetEmail = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
