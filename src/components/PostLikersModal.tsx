import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getPostLikers } from '../services/db';
import { useTheme } from '../context/ConfigContext';
import { useNavigation } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PostLikersModal({ visible, onClose, postId, currentUserProfile }: any) {
  const [likers, setLikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  useEffect(() => {
    if (visible && postId) {
      fetchLikers();
    }
  }, [visible, postId]);

  const fetchLikers = async () => {
    setLoading(true);
    const res = await getPostLikers(postId);
    if (res.data) {
      setLikers(res.data);
    }
    setLoading(false);
  };

  const renderLiker = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.likerItem}
      onPress={() => {
        onClose();
        navigation.navigate('ArtesanoProfile', { 
          artesano: item,
          profile: currentUserProfile 
        });
      }}
    >
      <View style={[styles.avatarContainer, { borderColor: colors.border }]}>
        {item.foto ? (
          <Image source={{ uri: item.foto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight }]}>
            <Icon name="person" size={20} color={colors.primary} />
          </View>
        )}
      </View>
      <View style={styles.likerInfo}>
        <Text style={[styles.likerName, { color: colors.textPrimary }]}>{item.nombre || 'Artesano'}</Text>
        <Text style={[styles.likerType, { color: colors.textMuted }]}>{item.tipo || 'Usuario'}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <View style={[styles.headerBar, { backgroundColor: colors.divider }]} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Personas a las que les gusta</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close-circle" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={likers}
              keyExtractor={(item) => item.id}
              renderItem={renderLiker}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="heart-dislike-outline" size={60} color={colors.border} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aún no hay reacciones</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: SCREEN_HEIGHT * 0.7,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  likerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likerInfo: {
    flex: 1,
  },
  likerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  likerType: {
    fontSize: 13,
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
  }
});
