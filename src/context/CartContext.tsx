import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { updateCart, getCart } from '../services/db';
import { useAuth } from './AuthContext';

export type ProductCartItem = {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  artesanoId?: string;
  imagen?: string;
  autorNombre?: string;
  cantidad: number;
};

type CartState = {
  productos: ProductCartItem[];
  total: number;
};

type CartContextType = {
  cart: CartState;
  loading: boolean;
  addToCart: (product: any, quantity: number, clienteId: string) => Promise<void>;
  removeFromCart: (productId: string, clienteId: string) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number, clienteId: string) => Promise<void>;
  clearCart: (clienteId: string) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartState>({ productos: [], total: 0 });
  const [loading, setLoading] = useState<boolean>(false);
  const { user, loading: authLoading } = useAuth();
  const loadedForRef = useRef<string | null>(null);

  // ✅ Auto-cargar el carrito cuando el usuario se autentica
  useEffect(() => {
    if (authLoading) return;

    if (user?.uid) {
      // Solo cargar si no se ha cargado ya para este usuario
      if (loadedForRef.current !== user.uid) {
        loadCartForUser(user.uid);
      }
    } else {
      // Limpiar al cerrar sesión
      setCart({ productos: [], total: 0 });
      loadedForRef.current = null;
    }
  }, [user?.uid, authLoading]);

  // Sync to db utility
  const syncCartToDb = useCallback(async (newCart: CartState, clienteId: string) => {
    setCart(newCart);
    await updateCart(clienteId, newCart);
  }, []);

  const calculateTotal = useCallback((productos: ProductCartItem[]) => {
    return productos.reduce((sum, item) => sum + (Number(item.precio) * item.cantidad), 0);
  }, []);

  const loadCartForUser = useCallback(async (clienteId: string) => {
    setLoading(true);
    const { data } = await getCart(clienteId);
    if (data && data.productos) {
      setCart({
        productos: data.productos,
        total: calculateTotal(data.productos)
      });
    } else {
      setCart({ productos: [], total: 0 });
    }
    loadedForRef.current = clienteId;
    setLoading(false);
  }, [calculateTotal]);

  const addToCart = useCallback(async (product: any, quantity: number, clienteId: string) => {
    setCart(prev => {
      const newProductos = [...prev.productos];
      const existingIndex = newProductos.findIndex(p => p.id === product.id);

      if (existingIndex >= 0) {
        newProductos[existingIndex] = { ...newProductos[existingIndex], cantidad: newProductos[existingIndex].cantidad + quantity };
      } else {
        newProductos.push({
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          descripcion: product.descripcion,
          artesanoId: product.artesanoId,
          imagen: product.imagen,
          autorNombre: product.autorNombre,
          cantidad: quantity
        });
      }

      const newCart = { productos: newProductos, total: calculateTotal(newProductos) };
      syncCartToDb(newCart, clienteId).catch(err => console.error(err));
      return newCart;
    });
  }, [calculateTotal, syncCartToDb]);

  const removeFromCart = useCallback(async (productId: string, clienteId: string) => {
    setCart(prev => {
      const newProductos = prev.productos.filter(p => p.id !== productId);
      const newCart = { productos: newProductos, total: calculateTotal(newProductos) };
      syncCartToDb(newCart, clienteId).catch(err => console.error(err));
      return newCart;
    });
  }, [calculateTotal, syncCartToDb]);

  const updateQuantity = useCallback(async (productId: string, newQuantity: number, clienteId: string) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, clienteId);
      return;
    }

    setCart(prev => {
      const newProductos = prev.productos.map(p => 
        p.id === productId ? { ...p, cantidad: newQuantity } : p
      );
      const newCart = { productos: newProductos, total: calculateTotal(newProductos) };
      syncCartToDb(newCart, clienteId).catch(err => console.error(err));
      return newCart;
    });
  }, [removeFromCart, calculateTotal, syncCartToDb]);

  const clearCart = useCallback(async (clienteId: string) => {
    const newCart = { productos: [], total: 0 };
    setCart(newCart);
    await syncCartToDb(newCart, clienteId);
  }, [syncCartToDb]);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
