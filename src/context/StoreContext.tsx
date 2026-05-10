import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getProducts, getCategories, getArtisans } from '../services/db';

interface StoreContextType {
  products: any[];
  categories: string[];
  artisans: any[];
  loading: boolean;
  refreshStore: (force?: boolean) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // useRef: no provoca re-renders, evita el ciclo de dependencias en useCallback
  const hasLoadedOnce = useRef(false);

  const refreshStore = useCallback(async (force = false) => {
    if (!hasLoadedOnce.current || force) {
      setLoading(true);
    }

    const [prodRes, catRes, artRes] = await Promise.all([
      getProducts(undefined, false, force),
      getCategories(force),
      getArtisans(false, force)
    ]);

    if (catRes.data) {
      setCategories(['Todos', ...catRes.data.map((c: any) => c.nombre)]);
    }
    if (prodRes.data) {
      setProducts(prodRes.data);
    }
    if (artRes.data) {
      setArtisans(artRes.data);
    }

    hasLoadedOnce.current = true;
    setLoading(false);
  }, []); // sin dependencias: la función nunca se recrea

  return (
    <StoreContext.Provider value={{ products, categories, artisans, loading, refreshStore }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
