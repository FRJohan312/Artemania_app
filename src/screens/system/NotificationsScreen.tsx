import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useToast } from '../../context/ToastContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { getProduct } from '../../services/db';
import { useNotifications } from '../../context/NotificationsContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ConfigContext';
import { Theme } from '../theme';

const NotificationsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { 
    notifications, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    removeNotification,
    markAllAsRead,
    markMultipleAsRead,
    removeMultipleNotifications
  } = useNotifications();

  const { profile } = useAuth();
  const { colors, themeMode } = useTheme();
  const [navigating, setNavigating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const toast = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  const handleMarkAllRead = async () => {
    toast.confirm({
      title: 'Marcar todo',
      message: '¿Quieres marcar todas las notificaciones como leídas?',
      confirmText: 'Sí, todas',
      onConfirm: async () => {
        await markAllAsRead();
        toast.success('Hecho', 'Bandeja actualizada.');
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    toast.confirm({
      type: 'danger',
      title: 'Eliminar',
      message: `¿Eliminar ${selectedIds.length} ${selectedIds.length === 1 ? 'notificación' : 'notificaciones'}?`,
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: async () => {
        await removeMultipleNotifications(selectedIds);
        setIsEditMode(false);
        setSelectedIds([]);
        toast.success('Eliminado', 'Bandeja de entrada actualizada.');
      }
    });
  };

  const handleMarkSelectedRead = async () => {
    if (selectedIds.length === 0) return;
    await markMultipleAsRead(selectedIds);
    setIsEditMode(false);
    setSelectedIds([]);
    toast.success('Leídas', 'Notificaciones actualizadas.');
  };

  const handlePress = async (item: any) => {
    if (isEditMode) {
      toggleSelect(item.id);
      return;
    }

    if (!item.read) await markAsRead(item.id);

    try {
      if (item.targetType === 'post' || item.type === 'like' || item.type === 'comentario' || item.type === 'respuesta_comentario') {
        if (item.targetId) {
          navigation.navigate('PostDetail', { postId: item.targetId, profile });
        } else {
          navigation.navigate('Tutorials');
        }
      } else if (item.targetType === 'producto' || item.targetType === 'product') {
        if (item.targetId) {
          setNavigating(true);
          const { data } = await getProduct(item.targetId);
          setNavigating(false);
          if (data) {
            navigation.navigate('ProductDetail', { product: data, profile, isCliente: true });
          } else {
            toast.info('Info', 'Contenido no disponible.');
          }
        }
      }
    } catch (err) {
      toast.error('Error', 'No se pudo abrir.');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[
          styles.notifCard, 
          { backgroundColor: colors.surface, borderColor: colors.border },
          !item.read && { backgroundColor: themeMode === 'dark' ? '#1a2635' : '#FCFDFF', borderColor: themeMode === 'dark' ? '#1e3a52' : '#E8F4FD' },
          isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
        ]}
        onPress={() => handlePress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardMain}>
          {isEditMode && (
            <View style={styles.checkboxWrapper}>
              <Icon 
                name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={isSelected ? colors.primary : colors.textMuted} 
              />
            </View>
          )}
          <View style={[styles.iconBox, { backgroundColor: getIconBg(item.type) }]}>
            <Icon name={getIconName(item.type)} size={22} color={getIconColor(item.type)} />
          </View>
          <View style={styles.textColumn}>
            <View style={styles.titleRow}>
              <Text style={[styles.notifTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.notifDate, { color: colors.textMuted }]}>
                {item.createdAt ? formatTime(item.createdAt) : 'Ahora'}
              </Text>
            </View>
            <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>{item.message}</Text>
          </View>
          {!item.read && !isEditMode && <View style={[styles.unreadPulse, { backgroundColor: colors.primary }]} />}
        </View>
      </TouchableOpacity>
    );
  };

  const getIconName = (type: string) => {
    switch(type) {
      case 'sancion': return 'alert-circle';
      case 'like': return 'heart';
      case 'comentario':
      case 'respuesta_comentario': return 'chatbubble-ellipses';
      default: return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch(type) {
      case 'sancion': return '#e8590c';
      case 'like': return '#e03131';
      case 'comentario':
      case 'respuesta_comentario': return colors.primary;
      default: return '#f59f00';
    }
  };

  const getIconBg = (type: string) => {
    switch(type) {
      case 'sancion': return '#fff5f5';
      case 'like': return '#fff5f5';
      case 'comentario':
      case 'respuesta_comentario': return '#f0f7ff';
      default: return '#fff9db';
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerActions, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        {isEditMode ? (
          <TouchableOpacity style={styles.headerBtn} onPress={handleSelectAll}>
            <Icon name={selectedIds.length === notifications.length ? "close-circle" : "checkmark-done"} size={20} color={colors.primary} />
            <Text style={[styles.headerBtnText, { color: colors.primary }]}>
              {selectedIds.length === notifications.length ? 'Desmarcar todo' : 'Seleccionar todo'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.headerBtn} onPress={handleMarkAllRead}>
            <Icon name="mail-open-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.headerBtnText, { color: colors.textMuted }]}>Leer todas</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.editToggle, { backgroundColor: colors.divider }, isEditMode && styles.editToggleActive]} 
          onPress={toggleEditMode}
        >
          <Text style={[styles.editToggleText, { color: colors.textSecondary }, isEditMode && { color: '#FFF' }]}>
            {isEditMode ? 'Listo' : 'Gestionar'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.divider }]}>
            <Icon name="notifications-off-outline" size={50} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Bandeja vacía</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>Te avisaremos cuando pase algo interesante.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={fetchNotifications}
            showsVerticalScrollIndicator={false}
          />

          {isEditMode && selectedIds.length > 0 && (
              <View style={[styles.floatingBar, { backgroundColor: themeMode === 'dark' ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)', borderColor: colors.divider }]}>
                <View style={styles.floatingInfo}>
                  <Text style={[styles.floatingCount, { backgroundColor: colors.primary }]}>{selectedIds.length}</Text>
                  <Text style={[styles.floatingLabel, { color: colors.textPrimary }]}>Seleccionadas</Text>
                </View>
              
              <View style={styles.floatingActions}>
                <TouchableOpacity style={[styles.actionCircle, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]} onPress={handleMarkSelectedRead}>
                  <Icon name="eye-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionCircle, styles.actionDelete]} onPress={handleDeleteSelected}>
                  <Icon name="trash-outline" size={22} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerBtnText: { fontWeight: '700', fontSize: 14 },
  editToggle: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
  },
  editToggleActive: { backgroundColor: '#2D2D2D' },
  editToggleText: { fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  listContent: { padding: 15, paddingBottom: 120 },
  
  notifCard: {
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  notifUnread: {},
  notifSelected: {},
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkboxWrapper: { marginRight: 12 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textColumn: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '800', flex: 1, marginRight: 10 },
  notifDate: { fontSize: 11, fontWeight: '600' },
  notifMessage: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  
  unreadPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 10,
  },

  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800' },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },

  floatingBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    borderRadius: 30,
    padding: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  floatingInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  floatingCount: { 
    color: '#FFF', 
    paddingHorizontal: 10, 
    paddingVertical: 2, 
    borderRadius: 10, 
    fontWeight: '900',
    fontSize: 14,
  },
  floatingLabel: { fontWeight: '700', fontSize: 14 },
  floatingActions: { flexDirection: 'row', gap: 12 },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDelete: { backgroundColor: '#FF5A5F', borderWidth: 0 }
});

export default NotificationsScreen;
