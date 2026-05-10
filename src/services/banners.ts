import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebaseConnection';

// --- BANNERS --- //

export interface Banner {
  id: string;
  targetUserId: string; // UID del usuario, o 'all' para global
  targetUserName?: string;
  titulo: string;
  subtitulo: string;
  color: string; // hex
  icono: string; // nombre de Ionicon
  activo: boolean;
  creadoEn: string;
  expiracion: string | null;
}

/**
 * Obtiene todos los banners activos para un usuario específico.
 * Incluye banners globales ('all') y los dirigidos al UID dado.
 */
export const getBannersForUser = async (uid: string): Promise<{ data: Banner[] | null; error: string | null }> => {
  try {
    const now = new Date().toISOString();

    // Banners globales activos
    const globalQuery = query(
      collection(db, 'banners'),
      where('activo', '==', true),
      where('targetUserId', '==', 'all'),
    );

    // Banners dirigidos a este usuario
    const userQuery = query(
      collection(db, 'banners'),
      where('activo', '==', true),
      where('targetUserId', '==', uid),
    );

    const [globalSnap, userSnap] = await Promise.all([getDocs(globalQuery), getDocs(userQuery)]);

    const allBanners: Banner[] = [
      ...globalSnap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)),
      ...userSnap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)),
    ];

    // Filtrar por expiración
    const activeBanners = allBanners.filter(b => !b.expiracion || b.expiracion > now);

    return { data: activeBanners, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Obtiene todos los banners (para el panel de admin).
 */
export const getAllBanners = async (): Promise<{ data: Banner[] | null; error: string | null }> => {
  try {
    const snap = await getDocs(query(collection(db, 'banners'), orderBy('creadoEn', 'desc')));
    const banners: Banner[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner));
    return { data: banners, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

/**
 * Crea un nuevo banner.
 */
export const createBanner = async (data: Omit<Banner, 'id' | 'creadoEn'>): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const docRef = await addDoc(collection(db, 'banners'), {
      ...data,
      creadoEn: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Actualiza los campos de un banner.
 */
export const updateBanner = async (id: string, data: Partial<Omit<Banner, 'id' | 'creadoEn'>>): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, 'banners', id), data as any);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Activa o desactiva un banner.
 */
export const toggleBanner = async (id: string, activo: boolean): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, 'banners', id), { activo });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Elimina un banner permanentemente.
 */
export const deleteBanner = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(db, 'banners', id));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
