import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Product } from '../types';
import { useTheme } from '../context/ConfigContext';

interface ProductOwnerControlsProps {
  product: Product;
  onEdit: () => void;
  onToggleVisibility: () => Promise<void>;
  onDelete: () => void;
}

export default function ProductOwnerControls({
  product,
  onEdit,
  onToggleVisibility,
  onDelete
}: ProductOwnerControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { colors } = useTheme();

  const handleToggle = async () => {
    setIsUpdating(true);
    await onToggleVisibility();
    setIsUpdating(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Gestionar mi Obra</Text>
      <View style={styles.ownerActionGrid}>
        <TouchableOpacity style={[styles.ownerActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onEdit}>
          <Icon name="create-outline" size={24} color={colors.primary} />
          <Text style={[styles.ownerActionLabel, { color: colors.textSecondary }]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.ownerActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleToggle}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Icon 
                name={product.estado === 'activo' ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color={colors.primary} 
              />
              <Text style={[styles.ownerActionLabel, { color: colors.textSecondary }]}>
                {product.estado === 'activo' ? 'Hacer Privado' : 'Hacer Público'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.ownerActionBtn, { backgroundColor: colors.surface, borderColor: '#fa5252' }]}
          onPress={onDelete}
        >
          <Icon name="trash-outline" size={24} color="#fa5252" />
          <Text style={[styles.ownerActionLabel, { color: '#fa5252' }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 30, paddingBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  ownerActionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  ownerActionBtn: { flex: 1, height: 80, borderWidth: 1.5, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 },
  ownerActionLabel: { fontSize: 12, fontWeight: '700', marginTop: 8 }
});
