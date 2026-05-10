/**
 * chat.ts — Servicio de mensajería directa (1-a-1)
 *
 * Estructura Firestore:
 *   chats/{chatId}                        → metadatos del chat
 *   chats/{chatId}/messages/{messageId}   → mensajes individuales
 *
 * chatId determinista: [uid1, uid2].sort().join('_')
 * Imágenes de mensajes → Supabase Storage (bucket 'imagenes', carpeta 'chats/')
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConnection';
import { createNotification } from './notifications';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Tipos básicos para los chats
export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;        // Foto enviada (opcional)
  createdAt: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  lastMessage: string;
  lastMessageAt: string;
  lastSenderId: string;
  unreadCount: Record<string, number>;
  createdAt: string;
}

// Genera un ID único para el chat entre dos personas (siempre el mismo orden)
export const buildChatId = (uid1: string, uid2: string): string =>
  [uid1, uid2].sort().join('_');

// Pasa timestamps de Firebase a strings ISO normales
const toISO = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (val?.seconds) return new Date(val.seconds * 1000).toISOString();
  return String(val);
};

// Crea el chat si no existe o lo recupera si ya habían hablado
export const getOrCreateChat = async (
  currentUser: { id: string; nombre: string; foto?: string },
  otherUser:   { id: string; nombre: string; foto?: string },
): Promise<{ chatId: string; error?: string }> => {
  try {
    const chatId = buildChatId(currentUser.id, otherUser.id);
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        participants: [currentUser.id, otherUser.id],
        participantNames: {
          [currentUser.id]: currentUser.nombre,
          [otherUser.id]:   otherUser.nombre,
        },
        participantPhotos: {
          [currentUser.id]: currentUser.foto  || '',
          [otherUser.id]:   otherUser.foto    || '',
        },
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        lastSenderId: '',
        unreadCount: {
          [currentUser.id]: 0,
          [otherUser.id]:   0,
        },
        createdAt: new Date().toISOString(),
      });
    }

    return { chatId };
  } catch (error: any) {
    console.error('[Chat] Error al crear/recuperar chat:', error.message);
    return { chatId: '', error: error.message };
  }
};

// Envía un mensaje y avisa al otro usuario con una notificación push
export const sendMessage = async (
  chatId: string,
  sender: { id: string; nombre: string },
  receiverId: string,
  text: string,
  imageUrl?: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef     = doc(db, 'chats', chatId);

    const messageData: any = {
      senderId: sender.id,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    if (imageUrl) messageData.imageUrl = imageUrl;

    await addDoc(messagesRef, messageData);

    // Actualizamos la vista previa del último mensaje en la lista de chats
    const preview = imageUrl && !text ? '📷 Imagen' : text.substring(0, 120);
    await updateDoc(chatRef, {
      lastMessage:    preview,
      lastMessageAt:  new Date().toISOString(),
      lastSenderId:   sender.id,
      [`unreadCount.${receiverId}`]: increment(1),
    });

    // Mandamos la notificación push para que el otro se entere
    try {
      await createNotification(receiverId, {
        title:      `💬 ${sender.nombre}`,
        message:    preview,
        type:       'mensaje',
        targetType: 'mensaje',
        targetId:   chatId,
        icon:       'chatbubble-ellipses',
        extraData: {
          otherUserId:    sender.id,
          otherUserName:  sender.nombre,
        },
      });
    } catch (notifErr: any) {
      console.warn('[Chat] Falló el envío de la push, pero el mensaje se mandó:', notifErr.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Chat] Error al enviar mensaje:', error.message);
    return { success: false, error: error.message };
  }
};

// Escucha mensajes nuevos de un chat específico
export const subscribeToMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
): (() => void) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ChatMessage, 'id'>),
    }));
    callback(messages);
  });
};

// Escucha la lista de todos mis chats activos
export const subscribeToChats = (
  uid: string,
  callback: (chats: Chat[]) => void,
): (() => void) => {
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', uid));

  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = snapshot.docs
      .map((d) => {
        const data = d.data();
        return {
          id:              d.id,
          participants:    data.participants || [],
          participantNames: data.participantNames || {},
          participantPhotos: data.participantPhotos || {},
          lastMessage:     data.lastMessage || '',
          lastMessageAt:   toISO(data.lastMessageAt),
          lastSenderId:    data.lastSenderId || '',
          unreadCount:     data.unreadCount || {},
          createdAt:       toISO(data.createdAt),
        } as Chat;
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    callback(chats);
  });
};

// Borra el contador de "no leídos" cuando entro al chat
export const markChatAsRead = async (
  chatId: string,
  uid: string,
): Promise<void> => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, { [`unreadCount.${uid}`]: 0 });
  } catch (error: any) {
    console.warn('[Chat] No se pudo marcar como leído:', error.message);
  }
};


// --------------------------------------------------------------------------
// uploadChatImage — Supabase Storage (misma lógica que storage.ts)
// --------------------------------------------------------------------------

export const uploadChatImage = async (
  uri: string,
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const ext        = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const storagePath = `chats/${uniqueName}`;

    const formData = new FormData();
    formData.append('file', { uri, name: uniqueName, type: 'image/jpeg' } as any);

    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/imagenes/${storagePath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'x-upsert': 'true',
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Chat Upload Error]', response.status, errText);
      return { success: false, error: errText };
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/imagenes/${storagePath}`;
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('[Chat Upload Exception]', error?.message);
    return { success: false, error: error.message };
  }
};
