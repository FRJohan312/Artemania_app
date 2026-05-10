import { collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from './firebaseConnection';
import { getUserProfile } from './users';
import { fromCache, toCache, invalidateCache, CACHE_TIMES } from './cache';

// Gestión del carrito de compras

export const updateCart = async (clienteId: string, cartData: any) => {
  try {
    await setDoc(doc(db, 'carritos', clienteId), cartData, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCart = async (clienteId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'carritos', clienteId));
    return docSnap.exists()
      ? { data: docSnap.data(), error: null }
      : { data: { productos: [], total: 0 }, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Gestión de pedidos y ventas

export const createPedido = async (data: any) => {
  try {
    const docRef = await addDoc(collection(db, 'pedidos'), data);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getPedidos = async (clienteId: string) => {
  try {
    const q = query(collection(db, 'pedidos'), where('clienteId', '==', clienteId));
    const querySnapshot = await getDocs(q);
    const pedidos = querySnapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return { data: pedidos, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getVentas = async (artesanoId: string) => {
  try {
    const q = query(collection(db, 'pedidos'), where('artesanoId', '==', artesanoId));
    const querySnapshot = await getDocs(q);
    const ventas = querySnapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return { data: ventas, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getPedidoById = async (id: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'pedidos', id));
    if (docSnap.exists()) {
      return { data: docSnap.data(), error: null };
    }
    return { data: null, error: 'Pedido no encontrado' };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updatePedidoStatus = async (pedidoId: string, status: string) => {
  try {
    await updateDoc(doc(db, 'pedidos', pedidoId), { estado: status });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Gestión de obras favoritas

export const updateFavorites = async (userId: string, favoritesData: any) => {
  try {
    await setDoc(doc(db, 'favoritos', userId), favoritesData, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getFavorites = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'favoritos', userId));
    return docSnap.exists()
      ? { data: docSnap.data(), error: null }
      : { data: { productos: [] }, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Gestión de posts guardados y compartidos

export const updateLikedPosts = async (userId: string, likedData: any) => {
  try {
    await setDoc(doc(db, 'posts_guardados', userId), likedData, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getLikedPosts = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'posts_guardados', userId));
    return docSnap.exists()
      ? { data: docSnap.data(), error: null }
      : { data: { posts: [] }, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// Posts compartidos por el usuario

export const getSharedPosts = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'shared_posts', userId));
    return docSnap.exists()
      ? { data: docSnap.data(), error: null }
      : { data: { posts: [] }, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateSharedPosts = async (userId: string, sharedData: any) => {
  try {
    await setDoc(doc(db, 'shared_posts', userId), sharedData, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Gestión de categorías de productos

export const getCategories = async (refresh = false) => {
  const cached = fromCache('categories', refresh, CACHE_TIMES.LONG_LIFE);
  if (cached) return cached;

  try {
    const querySnapshot = await getDocs(collection(db, 'categorias'));
    const categorias = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    const result = { data: categorias, error: null };
    toCache('categories', result);
    return result;
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const createCategory = async (nombre: string) => {
  try {
    const docRef = await addDoc(collection(db, 'categorias'), {
      nombre,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Gestión de likes en los tutoriales

export const getPostLikers = async (postId: string) => {
  const cacheKey = `postLikers:${postId}`;
  const cached = fromCache(cacheKey, false, CACHE_TIMES.SHORT);
  if (cached) return cached;

  try {
    const q = query(collection(db, 'posts_guardados'), where('posts', 'array-contains', postId));
    const querySnapshot = await getDocs(q);
    const userIds = querySnapshot.docs.map(doc => doc.id);

    // getUserProfile ya tiene caché propio, así que los perfiles conocidos no generan lecturas
    const profiles = await Promise.all(
      userIds.map(async (uid) => {
        const res = await getUserProfile(uid);
        return res.data ? { id: uid, ...res.data } : null;
      })
    );

    const result = { data: profiles.filter(p => p !== null), error: null };
    toCache(cacheKey, result);
    return result;
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
