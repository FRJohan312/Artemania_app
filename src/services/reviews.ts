import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebaseConnection';
import { fromCache, toCache, invalidateCache } from './cache';

// --- RESEÑAS --- //

export const addReview = async (productId: string, data: any) => {
  try {
    const reviewData = { ...data, productId, createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, 'resenas'), reviewData);
    invalidateCache('reviews');
    invalidateCache(`reviews:${productId}`); // Bug fix: invalida también el caché del producto específico
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getAllReviews = async () => {
  const cached = fromCache('reviews:all');
  if (cached) return cached;

  try {
    const querySnapshot = await getDocs(collection(db, 'resenas'));
    const resenas = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    const result = { data: resenas, error: null };
    toCache('reviews:all', result);
    return result;
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getReviews = async (productId: string) => {
  const cacheKey = `reviews:${productId}`;
  const cached = fromCache(cacheKey);
  if (cached) return cached;

  try {
    const q = query(collection(db, 'resenas'), where('productId', '==', productId));
    const querySnapshot = await getDocs(q);
    const resenas = querySnapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const result = { data: resenas, error: null };
    toCache(cacheKey, result);
    return result;
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const deleteReview = async (reviewId: string, productId?: string) => {
  try {
    await deleteDoc(doc(db, 'resenas', reviewId));
    invalidateCache('reviews');
    if (productId) invalidateCache(`reviews:${productId}`); // Bug fix
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateReview = async (reviewId: string, data: any, productId?: string) => {
  try {
    await updateDoc(doc(db, 'resenas', reviewId), {
      ...data,
      isEdited: true,
      updatedAt: new Date().toISOString(),
    });
    invalidateCache('reviews');
    if (productId) invalidateCache(`reviews:${productId}`); // Bug fix
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
