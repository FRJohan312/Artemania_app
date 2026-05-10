import { collection, doc, setDoc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConnection';
import { fromCache, toCache, invalidateCache } from './cache';

// Gestión de perfiles de usuario y artesanos

export const createUserProfile = async (uid: string, data: any) => {
  try {
    await setDoc(doc(db, 'usuarios', uid), { ...data, estado: 'activo' });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid: string, refresh = false) => {
  const cacheKey = `user:${uid}`;
  const cached = fromCache(cacheKey, refresh);
  if (cached) return cached;

  try {
    const docSnap = await getDoc(doc(db, 'usuarios', uid));
    if (docSnap.exists()) {
      const result = { data: docSnap.data(), error: null };
      toCache(cacheKey, result);
      return result;
    }
    return { data: null, error: 'Usuario no encontrado' };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getUserProfileByEmail = async (email: string) => {
  try {
    const q = query(collection(db, 'usuarios'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    }
    return { data: null, error: 'Correo no registrado' };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateUserProfile = async (uid: string, data: any) => {
  try {
    if (!uid) throw new Error('UID de usuario inválido');

    const batch = writeBatch(db);

    // Actualizamos los datos básicos del perfil
    const userRef = doc(db, 'usuarios', uid);
    batch.set(userRef, data, { merge: true });

    // Si cambió la foto o el nombre, lo actualizamos también en sus posts y comentarios antiguos
    if (data.foto !== undefined || data.nombre !== undefined) {
      const updatePayload: any = {};
      if (data.foto !== undefined) updatePayload.autorFoto = data.foto;
      if (data.nombre !== undefined) updatePayload.autorNombre = data.nombre;

      const qPosts = query(collection(db, 'tutoriales'), where('autorId', '==', uid));
      const postSnaps = await getDocs(qPosts);
      postSnaps.forEach(s => batch.update(s.ref, updatePayload));

      const qComments = query(collection(db, 'comentarios_posts'), where('autorId', '==', uid));
      const commentSnaps = await getDocs(qComments);
      commentSnaps.forEach(s => batch.update(s.ref, updatePayload));
    }

    await batch.commit();
    invalidateCache(`user:${uid}`);
    invalidateCache('artisans');
    return { success: true };
  } catch (error: any) {
    console.error('[UpdateUserProfile Error]', error);
    return { success: false, error: error.message };
  }
};

export const getArtisans = async (includeSuspended = false, refresh = false) => {
  const cacheKey = `artisans:${includeSuspended}`;
  const cached = fromCache(cacheKey, refresh);
  if (cached) return cached;

  try {
    const q = query(collection(db, 'usuarios'), where('tipo', '==', 'Artesano'));
    const querySnapshot = await getDocs(q);
    let artisans = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (!includeSuspended) {
      artisans = artisans.filter((a: any) => a.estado !== 'suspendido');
    }

    const result = { data: artisans, error: null };
    toCache(cacheKey, result);
    return result;
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
