import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, writeBatch, increment } from 'firebase/firestore';
import { db, auth } from './firebaseConnection';
import { fromCache, toCache, invalidateCache, CACHE_TIMES } from './cache';
import { deleteImageAsync } from './storage';

// Gestión de publicaciones, tutoriales y comentarios en la comunidad

export const createTutorial = async (data: any) => {
  try {
    const docRef = await addDoc(collection(db, 'tutoriales'), data);
    invalidateCache('tutorials');
    if (data.autorId) invalidateCache(`tutorials:${data.autorId}`);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getTutorial = async (id: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'tutoriales', id));
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    }
    return { data: null, error: 'Publicación no encontrada' };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getTutorials = async (refresh = false) => {
  // TTL corto: el feed de la comunidad cambia frecuentemente
  const cached = fromCache('tutorials', refresh, CACHE_TIMES.SHORT);
  if (cached) return cached;

  try {
    const querySnapshot = await getDocs(collection(db, 'tutoriales'));
    let tutorials = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    tutorials = tutorials.filter((t: any) => !t.estado || t.estado === 'activo');
    const result = { data: tutorials, error: null };
    toCache('tutorials', result);
    return result;
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getTutorialsByUser = async (userId: string, refresh = false) => {
  const cacheKey = `tutorials:${userId}`;
  const cached = fromCache(cacheKey, refresh);
  if (cached) return cached;

  try {
    const q = query(collection(db, 'tutoriales'), where('autorId', '==', userId));
    const querySnapshot = await getDocs(q);
    let tutorials = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Ocultar contenido inactivo si no es el perfil propio
    const currentUserId = auth.currentUser?.uid;
    if (userId !== currentUserId) {
      tutorials = tutorials.filter((t: any) => !t.estado || t.estado === 'activo');
    }

    const result = { data: tutorials, error: null };
    toCache(cacheKey, result);
    return result;
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateTutorial = async (id: string, data: any) => {
  try {
    await updateDoc(doc(db, 'tutoriales', id), data);
    invalidateCache('tutorials');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteTutorial = async (id: string) => {
  try {
    const tutorialRef = doc(db, 'tutoriales', id);
    const tutorialSnap = await getDoc(tutorialRef);
    const tutorialData = tutorialSnap.data();

    // Limpiamos el post y todo su rastro social (comentarios, likes y compartidos)
    await batch.commit();

    if (tutorialData?.imagen) await deleteImageAsync(tutorialData.imagen);

    invalidateCache('tutorials');
    invalidateCache(`tutorials:${tutorialData?.autorId}`);
    invalidateCache(`postComments:${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Manejo de la interacción social (likes, comentarios, etc)

export const incrementPostCounter = async (
  postId: string,
  field: 'likesCount' | 'commentsCount' | 'sharesCount',
  amount: number
) => {
  try {
    await updateDoc(doc(db, 'tutoriales', postId), { [field]: increment(amount) });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const addPostComment = async (postId: string, data: any) => {
  try {
    const commentData = { ...data, postId, createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, 'comentarios_posts'), commentData);
    await incrementPostCounter(postId, 'commentsCount', 1);
    invalidateCache(`postComments:${postId}`);
    invalidateCache('tutorials');
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getPostComments = async (postId: string) => {
  const cacheKey = `postComments:${postId}`;
  const cached = fromCache(cacheKey);
  if (cached) return cached;

  try {
    const q = query(collection(db, 'comentarios_posts'), where('postId', '==', postId));
    const querySnapshot = await getDocs(q);
    const comments = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    comments.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const result = { data: comments, error: null };
    toCache(cacheKey, result);
    return result;
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updatePostComment = async (commentId: string, postId: string, texto: string) => {
  try {
    await updateDoc(doc(db, 'comentarios_posts', commentId), {
      texto,
      isEdited: true,
      updatedAt: new Date().toISOString(),
    });
    invalidateCache(`postComments:${postId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deletePostComment = async (commentId: string, postId: string) => {
  try {
    await deleteDoc(doc(db, 'comentarios_posts', commentId));
    invalidateCache(`postComments:${postId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
