/**
 * Sistema de Caché en Memoria
 * Evita consultas redundantes a Firestore almacenando resultados
 * por un tiempo configurable (TTL). Las escrituras invalidan su caché.
 */

const _cache = new Map<string, { data: any; ts: number }>();

export const CACHE_TIMES = {
  SHORT:     5 * 60 * 1000,        //  5 minutos  — posts/tutoriales (cambian frecuentemente)
  MEDIUM:    60 * 60 * 1000,       //  1 hora     — productos del marketplace
  LONG_LIFE: 24 * 60 * 60 * 1000, // 24 horas    — categorías, artesanos (datos casi estáticos)
};

export function fromCache(key: string, forceRefresh = false, ttl = CACHE_TIMES.LONG_LIFE): any | null {
  if (forceRefresh) {
    _cache.delete(key);
    return null;
  }
  const entry = _cache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data;
  if (entry) _cache.delete(key);
  return null;
}

export function toCache(key: string, data: any) {
  _cache.set(key, { data, ts: Date.now() });
}

export function invalidateCache(prefix: string) {
  for (const key of Array.from(_cache.keys())) {
    if (key.startsWith(prefix)) _cache.delete(key);
  }
}

/** Limpia todo el caché — útil al cerrar sesión */
export const clearAllCache = () => _cache.clear();
