import { collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from './firebaseConnection';
import { createNotification } from './notifications';

// Herramientas de moderación, reportes y sanciones automáticas

export const getSystemConfig = async () => {
  try {
    const docSnap = await getDoc(doc(db, 'config', 'sistema'));
    return docSnap.exists()
      ? { data: docSnap.data(), error: null }
      : { data: { minReports: 1 }, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateSystemConfig = async (data: any) => {
  try {
    await setDoc(doc(db, 'config', 'sistema'), data, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const createReport = async (data: any) => {
  try {
    const reportData = { ...data, estado: 'pendiente', fecha: new Date().toISOString() };
    const docRef = await addDoc(collection(db, 'reportes'), reportData);

    // Suspensión automática si se supera el umbral de reportes
    const q = query(
      collection(db, 'reportes'),
      where('targetId', '==', data.targetId),
      where('estado', '==', 'pendiente')
    );
    const snap = await getDocs(q);
    const config = await getSystemConfig();
    const threshold = config.data?.minReports || 1;

    if (snap.size >= threshold) {
      if (data.targetType === 'producto') {
        await updateDoc(doc(db, 'productos', data.targetId), { estado: 'en_pausa' });
      } else {
        await updateDoc(doc(db, 'usuarios', data.targetId), { estado: 'en_pausa' });
        const pSnap = await getDocs(query(collection(db, 'productos'), where('artesanoId', '==', data.targetId)));
        pSnap.forEach(d => updateDoc(d.ref, { estado: 'en_pausa' }));
        const tSnap = await getDocs(query(collection(db, 'tutoriales'), where('autorId', '==', data.targetId)));
        tSnap.forEach(d => updateDoc(d.ref, { estado: 'en_pausa' }));
      }
    }

    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getReports = async () => {
  try {
    const q = query(collection(db, 'reportes'), where('estado', '==', 'pendiente'));
    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { data: reports, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateReportStatus = async (reportId: string, status: string) => {
  try {
    const reportRef = doc(db, 'reportes', reportId);
    await updateDoc(reportRef, { estado: status });

    if (status === 'desestimado') {
      const reportSnap = await getDoc(reportRef);
      if (reportSnap.exists()) {
        const { targetId, targetType } = reportSnap.data();
        const colName = targetType === 'producto' ? 'productos' : 'usuarios';
        const targetSnap = await getDoc(doc(db, colName, targetId));
        if (targetSnap.exists() && targetSnap.data().estado === 'en_pausa') {
          await updateDoc(doc(db, colName, targetId), { estado: 'activo' });
        }
      }
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const suspendEntity = async (
  id: string,
  type: 'producto' | 'usuario',
  reason: string,
  durationHours = -1
) => {
  try {
    const colName = type === 'producto' ? 'productos' : 'usuarios';
    const now = new Date();
    const expirationDate =
      durationHours > 0
        ? new Date(now.getTime() + durationHours * 3600000).toISOString()
        : null;

    await updateDoc(doc(db, colName, id), {
      estado: 'suspendido',
      motivoSuspension: reason,
      fechaSuspension: now.toISOString(),
      fechaExpiracionSuspension: expirationDate,
    });

    if (type === 'usuario') {
      const pSnap = await getDocs(query(collection(db, 'productos'), where('artesanoId', '==', id)));
      pSnap.forEach(d => updateDoc(d.ref, { estado: 'suspendido' }));
      const tSnap = await getDocs(query(collection(db, 'tutoriales'), where('autorId', '==', id)));
      tSnap.forEach(d => updateDoc(d.ref, { estado: 'suspendido' }));
    }

    try {
      const targetUserId =
        type === 'usuario' ? id : (await getDoc(doc(db, colName, id))).data()?.artesanoId;
      if (targetUserId) {
        await createNotification(targetUserId, {
          type: 'sancion',
          title: 'Aviso de Sanción ⚠️',
          message: `Tu ${type === 'usuario' ? 'cuenta ha' : 'producto ha'} sido suspendido. Motivo: ${reason}.${
            durationHours > 0 ? ` Expira en ${durationHours} horas.` : ' Es permanente.'
          }`,
          targetId: id,
          targetType: type,
        });
      }
    } catch (e) {
      console.warn('[suspendEntity] Error al notificar:', e);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const unsuspendEntity = async (id: string, type: 'producto' | 'usuario') => {
  try {
    const colName = type === 'producto' ? 'productos' : 'usuarios';
    await updateDoc(doc(db, colName, id), { estado: 'activo' });

    if (type === 'usuario') {
      const pSnap = await getDocs(query(collection(db, 'productos'), where('artesanoId', '==', id)));
      await Promise.all(pSnap.docs.map(d => updateDoc(d.ref, { estado: 'activo' })));
      const tSnap = await getDocs(query(collection(db, 'tutoriales'), where('autorId', '==', id)));
      await Promise.all(tSnap.docs.map(d => updateDoc(d.ref, { estado: 'activo' })));
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
