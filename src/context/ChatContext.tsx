/**
 * ChatContext.tsx
 *
 * Provee globalmente:
 *   - chats: Chat[]          → lista de conversaciones del usuario en tiempo real
 *   - totalUnread: number    → suma de mensajes no leídos en todos los chats
 *
 * Se suscribe automáticamente cuando hay sesión activa (profile !== null).
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { subscribeToChats, Chat } from '../services/chat';

interface ChatContextType {
  chats: Chat[];
  totalUnread: number;
}

const ChatContext = createContext<ChatContextType>({
  chats: [],
  totalUnread: 0,
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Limpiar suscripción anterior
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Solo suscribirse si hay usuario registrado (no anónimo)
    if (user && !user.isAnonymous && profile) {
      unsubscribeRef.current = subscribeToChats(user.uid, (updatedChats) => {
        setChats(updatedChats);
      });
    } else {
      setChats([]);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.uid, profile?.id]);

  const totalUnread = chats.reduce((sum, chat) => {
    const count = user ? (chat.unreadCount?.[user.uid] || 0) : 0;
    return sum + count;
  }, 0);

  return (
    <ChatContext.Provider value={{ chats, totalUnread }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
