/**
 * ChatScreen.tsx — Conversación 1-a-1 en tiempo real
 *
 * Funcionalidades:
 *   • Burbujas de mensajes propias/ajenas
 *   • Listener onSnapshot en tiempo real
 *   • Envío de imágenes → Supabase Storage (carpeta 'chats/')
 *   • Marca como leídos al entrar
 *   • FlatList invertida (último mensaje al fondo)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import {
  ChatMessage,
  subscribeToMessages,
  sendMessage as sendChatMessage,
  markChatAsRead,
  uploadChatImage,
} from '../../services/chat';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const formatTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
};

const isSameDay = (a: string, b: string): boolean => {
  try {
    const da = new Date(a);
    const db = new Date(b);
    return (
      da.getFullYear() === db.getFullYear() &&
      da.getMonth() === db.getMonth() &&
      da.getDate() === db.getDate()
    );
  } catch {
    return false;
  }
};

const formatDateLabel = (iso: string): string => {
  try {
    const d    = new Date(iso);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
  } catch {
    return '';
  }
};

// --------------------------------------------------------------------------
// Componentes de burbuja
// --------------------------------------------------------------------------

function DateDivider({ label, colors }: { label: string; colors: any }) {
  return (
    <View style={styles.dateDivider}>
      <View style={[styles.dateLine, { backgroundColor: colors.divider }]} />
      <Text style={[styles.dateLabel, { color: colors.textMuted, backgroundColor: colors.background }]}>
        {label}
      </Text>
      <View style={[styles.dateLine, { backgroundColor: colors.divider }]} />
    </View>
  );
}

function MessageBubble({
  msg,
  isOwn,
  colors,
  onImagePress,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  colors: any;
  onImagePress: (url: string) => void;
}) {
  return (
    <View style={[styles.bubbleRow, isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther]}>
      <View
        style={[
          styles.bubble,
          isOwn
            ? [styles.bubbleOwn, { backgroundColor: colors.primary }]
            : [styles.bubbleOther, { backgroundColor: colors.surface }],
        ]}
      >
        {/* Imagen adjunta */}
        {msg.imageUrl ? (
          <TouchableOpacity onPress={() => onImagePress(msg.imageUrl!)} activeOpacity={0.8}>
            <Image source={{ uri: msg.imageUrl }} style={styles.bubbleImage} resizeMode="cover" />
          </TouchableOpacity>
        ) : null}

        {/* Texto */}
        {msg.text ? (
          <Text
            style={[
              styles.bubbleText,
              { color: isOwn ? '#fff' : colors.textPrimary },
            ]}
          >
            {msg.text}
          </Text>
        ) : null}

        {/* Timestamp */}
        <Text
          style={[
            styles.bubbleTime,
            { color: isOwn ? 'rgba(255,255,255,0.7)' : colors.textMuted },
            styles.bubbleTimeRight,
          ]}
        >
          {formatTime(msg.createdAt)}
          {isOwn && (
            <Text>  {msg.read ? '✓✓' : '✓'}</Text>
          )}
        </Text>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// ChatScreen
// --------------------------------------------------------------------------

export default function ChatScreen({ route, navigation }: any) {
  const { chatId, otherUser } = route.params as {
    chatId: string;
    otherUser: { id: string; nombre: string; foto?: string };
  };

  const { colors } = useTheme();
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
    });

    // Marcar como leídos al entrar
    if (user?.uid) {
      markChatAsRead(chatId, user.uid);
    }

    return () => unsubscribe();
  }, [chatId, user?.uid]);

  // Marcar como leídos cada vez que llegan mensajes nuevos
  useEffect(() => {
    if (messages.length > 0 && user?.uid) {
      markChatAsRead(chatId, user.uid);
    }
  }, [messages.length]);

  // --------------------------------------------------------------------------
  // Enviar mensaje de texto
  // --------------------------------------------------------------------------

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || !user || !profile) return;

    setSending(true);
    setText('');
    await sendChatMessage(
      chatId,
      { id: user.uid, nombre: profile.nombre },
      otherUser.id,
      trimmed,
    );
    setSending(false);
  }, [text, user, profile, chatId, otherUser.id]);

  // --------------------------------------------------------------------------
  // Adjuntar imagen
  // --------------------------------------------------------------------------

  const handlePickImage = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets?.length) return;
      const asset = result.assets[0];
      if (!asset.uri) return;

      setUploading(true);
      const { success, url, error } = await uploadChatImage(asset.uri);

      if (!success || !url) {
        Alert.alert('Error', error || 'No se pudo subir la imagen.');
        setUploading(false);
        return;
      }

      // Enviar mensaje solo con imagen (texto vacío)
      await sendChatMessage(
        chatId,
        { id: user!.uid, nombre: profile!.nombre },
        otherUser.id,
        text.trim(),  // puede haber texto junto a la imagen
        url,
      );
      setText('');
      setUploading(false);
    } catch (err: any) {
      console.error('[Chat] pick image error:', err.message);
      setUploading(false);
    }
  }, [user, profile, chatId, otherUser.id, text]);

  // --------------------------------------------------------------------------
  // Render items con divisores de fecha
  // --------------------------------------------------------------------------

  type ListItem =
    | { type: 'message'; data: ChatMessage }
    | { type: 'date'; label: string; key: string };

  const listItems: ListItem[] = [];
  messages.forEach((msg, idx) => {
    const prev = messages[idx - 1];
    if (!prev || !isSameDay(prev.createdAt, msg.createdAt)) {
      listItems.push({ type: 'date', label: formatDateLabel(msg.createdAt), key: `date_${msg.id}` });
    }
    listItems.push({ type: 'message', data: msg });
  });

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'date') {
      return <DateDivider label={item.label} colors={colors} />;
    }
    return (
      <MessageBubble
        msg={item.data}
        isOwn={item.data.senderId === user?.uid}
        colors={colors}
        onImagePress={setFullScreenImage}
      />
    );
  };

  // --------------------------------------------------------------------------
  // UI
  // --------------------------------------------------------------------------

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }, { backgroundColor: colors.surface, borderBottomColor: colors.divider, paddingTop: Math.max(insets.top, 10) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerUser}
          onPress={() => {
            const routes = navigation.getState()?.routes;
            const prevRoute = routes?.[routes?.length - 2];
            if (prevRoute?.name === 'ArtesanoProfile' && prevRoute.params?.artesano?.id === otherUser.id) {
              navigation.goBack();
            } else {
              navigation.navigate('ArtesanoProfile', {
                artesano: otherUser,
                profile,
              });
            }
          }}
        >
          <View style={[styles.headerAvatar, { backgroundColor: colors.divider }]}>
            {otherUser.foto ? (
              <Image source={{ uri: otherUser.foto }} style={styles.headerAvatarImg} />
            ) : (
              <Icon name="person" size={20} color={colors.textMuted} />
            )}
          </View>
          <View>
            <Text style={[styles.headerName, { color: colors.textPrimary }]} numberOfLines={1}>
              {otherUser.nombre}
            </Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>Toca para ver perfil</Text>
          </View>
        </TouchableOpacity>

        <View style={{ width: 40 }} />
      </View>

      {/* Mensajes */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={listItems}
          keyExtractor={(item) =>
            item.type === 'date' ? item.key : item.data.id
          }
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.divider }]}>
          {/* Botón adjuntar imagen */}
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.attachBtn}
            disabled={uploading || sending}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon name="image-outline" size={24} color={colors.textMuted} />
            )}
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />

          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendBtn,
              { backgroundColor: text.trim() ? colors.primary : colors.divider },
            ]}
            disabled={!text.trim() || sending || uploading}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="send" size={18} color={text.trim() ? '#fff' : colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal para ver imagen en pantalla completa */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade" onRequestClose={() => setFullScreenImage(null)}>
        <View style={styles.fullScreenImgContainer}>
          <TouchableOpacity style={styles.fullScreenCloseBtn} onPress={() => setFullScreenImage(null)}>
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {fullScreenImage && (
            <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImg} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    zIndex: 10,
  },
  headerBack: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerUser: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 10,
  },
  headerAvatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 11 },

  // Messages
  messageList: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 12 },

  // Date divider
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 4,
  },
  dateLine: { flex: 1, height: 0.5 },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginHorizontal: 10,
    paddingHorizontal: 6,
  },

  // Bubble
  bubbleRow: { marginBottom: 6 },
  bubbleRowOwn: { alignItems: 'flex-end' },
  bubbleRowOther: { alignItems: 'flex-start' },

  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleOwn: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  bubbleImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 6,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  bubbleTimeRight: { textAlign: 'right' },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 110,
    minHeight: 40,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal Full Screen Image
  fullScreenImgContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  fullScreenImg: {
    width: '100%',
    height: '100%',
  },
});
