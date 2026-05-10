// Funciones para subir y borrar fotos en la nube (usando Supabase)
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const uploadImageAsync = async (uri: string, path: string) => {
  try {
    const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const folder = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '';
    const storagePath = folder ? `${folder}/${uniqueName}` : uniqueName;

    const formData = new FormData();
    formData.append('file', { uri, name: uniqueName, type: 'image/jpeg' } as any);

    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/imagenes/${storagePath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'x-upsert': 'true',
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Supabase Upload Error]', response.status, errText);
      return { success: false, error: errText };
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/imagenes/${storagePath}`;
    console.log('[Supabase Upload OK]', publicUrl);
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('[Supabase Upload Exception]', error?.message);
    return { success: false, error: error.message };
  }
};

export const deleteImageAsync = async (publicUrl: string) => {
  try {
    const marker = 'supabase.co/storage/v1/object/public/imagenes/';
    if (!publicUrl || !publicUrl.includes(marker)) {
      return { success: true }; // No es una imagen de nuestro bucket
    }

    const baseUrl = `${SUPABASE_URL}/storage/v1/object/public/imagenes/`;
    const storagePath = publicUrl.substring(baseUrl.length);

    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/imagenes`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefixes: [storagePath] }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Supabase Delete Error]', response.status, errText);
      return { success: false, error: errText };
    }

    console.log('[Supabase Delete OK]', storagePath);
    return { success: true };
  } catch (error: any) {
    console.error('[Supabase Delete Exception]', error?.message);
    return { success: false, error: error.message };
  }
};
