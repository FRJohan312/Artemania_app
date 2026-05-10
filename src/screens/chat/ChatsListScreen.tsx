import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Chat } from '../../services/chat';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const formatRelativeTime = (isoString: string): string => {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const min  = Math.floor(diff / 60000);
    const hrs  = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (min < 1)   return 'ahora';
    if (min < 60)  return `hace ${min} min`;
    if (hrs < 24)  return `hace ${hrs} h`;
    if (days === 1) return 'ayer';
    return `hace ${days} días`;
  } catch {
    return '';
  }
};

// --------------------------------------------------------------------------
// ChatRow
// --------------------------------------------------------------------------

function ChatRow({
  chat,
  currentUid,
  onPress,
  colors,
}: {
  chat: Chat;
  currentUid: string;
  onPress: () => void;
  colors: any;
}) {
  const otherId   = chat.participants.find((p) => p !== currentUid) || '';
  const otherName = chat.participantNames?.[otherId] || 'Usuario';
  const otherPhoto = chat.participantPhotos?.[otherId] || '';
  const unread    = chat.unreadCount?.[currentUid] || 0;
  const isUnread  = unread > 0;

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.divider }]}>
        {otherPhoto ? (
          <Image source={{ uri: otherPhoto }} style={styles.avatarImg} />
        ) : (
          <Icon name="person" size={26} color={colors.textMuted} />
        )}
        {isUnread && <View style={styles.onlineDot} />}
      </View>

      {/* Contenido */}
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text
            style={[
              styles.rowName,
              { color: colors.textPrimary },
              isUnread && styles.rowNameBold,
            ]}
            numberOfLines={1}
          >
            {otherName}
          </Text>
          <Text style={[styles.rowTime, { color: colors.textMuted }]}>
            {formatRelativeTime(chat.lastMessageAt)}
          </Text>
        </View>

        <View style={styles.rowBottom}>
          <Text
            style={[
              styles.rowPreview,
              { color: isUnread ? colors.textSecondary : colors.textMuted },
              isUnread && { fontWeight: '600' },
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage || 'Inicia la conversación'}
          </Text>
          {isUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// --------------------------------------------------------------------------
// ChatsListScreen
// --------------------------------------------------------------------------

export default function ChatsListScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, profile } = useAuth();
  const { chats } = useChat();
  const insets = useSafeAreaInsets();

  const handleChatPress = useCallback(
    (chat: Chat) => {
      if (!user) return;
      const otherId    = chat.participants.find((p) => p !== user.uid) || '';
      const otherUser  = {
        id:     otherId,
        nombre: chat.participantNames?.[otherId]  || 'Usuario',
        foto:   chat.participantPhotos?.[otherId] || '',
      };
      navigation.navigate('Chat', {
        chatId: chat.id,
        otherUser,
      });
    },
    [user, navigation],
  );

  // Invitado
  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Icon name="lock-closed-outline" size={60} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Inicia sesión para ver tus mensajes
          </Text>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }, { borderBottomColor: colors.divider, paddingTop: Math.max(insets.top, 10) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Mensajes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Lista */}
      {chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="chatbubbles-outline" size={70} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Sin conversaciones aún
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Visita el perfil de un artesano y toca{'\n'}"Enviar Mensaje" para comenzar.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatRow
              chat={item}
              currentUid={user!.uid}
              onPress={() => handleChatPress(item)}
              colors={colors}
            />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// --------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  headerBack: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },

  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#B96A4A',
    borderWidth: 2,
    borderColor: '#fff',
  },

  rowBody: { flex: 1 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rowName: { fontSize: 15, fontWeight: '600', flex: 1 },
  rowNameBold: { fontWeight: '800' },
  rowTime: { fontSize: 12 },

  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowPreview: { fontSize: 13, flex: 1, marginRight: 8 },

  badge: {
    backgroundColor: '#B96A4A',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

  loginBtn: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
