import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebaseConnection';
import { PUSH_BACKEND_URL } from '@env';

// Gestión de notificaciones internas y envíos push

export const createNotification = async (userId: string, data: any) => {
  try {
    const notifData = {
      ...data,
      userId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'notificaciones'), notifData);

    // Enviar push vía backend
    try {
      if (PUSH_BACKEND_URL) {
        const response = await fetch(`${PUSH_BACKEND_URL}/send-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: userId,
            title: data.title || 'Nueva Notificación',
            body: data.message || 'Tienes un nuevo mensaje en Artemanía.',
            data: { targetType: data.targetType || '', targetId: data.targetId || '' },
          }),
        });
        const resData = await response.json();
        console.log('[PUSH] Respuesta:', resData);
      }
    } catch (e: any) {
      console.warn('[PUSH] Error al enviar:', e.message);
    }

    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getNotifications = async (userId: string) => {
  try {
    const q = query(collection(db, 'notificaciones'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const notifs = querySnapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { data: notifs, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const deleteNotification = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'notificaciones', id));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    await updateDoc(doc(db, 'notificaciones', id), { read: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
