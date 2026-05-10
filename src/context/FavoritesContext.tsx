import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { updateFavorites, getFavorites } from '../services/db';
import { useAuth } from './AuthContext';

type FavoritesState = {
  productos: any[];
};

type FavoritesContextType = {
  favorites: FavoritesState;
  toggleFavorite: (product: any, userId: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoritesState>({ productos: [] });
  const { user, loading: authLoading } = useAuth();
  const loadedForRef = useRef<string | null>(null);

  // ✅ Auto-cargar favoritos cuando el usuario se autentica
  useEffect(() => {
    if (authLoading) return;

    if (user?.uid) {
      if (loadedForRef.current !== user.uid) {
        loadFavorites(user.uid);
      }
    } else {
      setFavorites({ productos: [] });
      loadedForRef.current = null;
    }
  }, [user?.uid, authLoading]);

  const loadFavorites = useCallback(async (userId: string) => {
    const { data } = await getFavorites(userId);
    if (data && data.productos) {
      setFavorites({ productos: data.productos });
    }
    loadedForRef.current = userId;
  }, []);

  const toggleFavorite = useCallback(async (product: any, userId: string) => {
    setFavorites(prev => {
      const isFav = prev.productos.some(p => p.id === product.id);
      let newProductos;
      
      if (isFav) {
        newProductos = prev.productos.filter(p => p.id !== product.id);
      } else {
        newProductos = [...prev.productos, product];
      }
      
      updateFavorites(userId, { productos: newProductos }).catch(err => console.error("Error updating favorites", err));
      return { productos: newProductos };
    });
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
