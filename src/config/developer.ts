/**
 * ARCHIVO DE CONFIGURACIÓN PARA DESARROLLADORES (DEV FLAGS)
 * 
 * Centraliza todos los "interruptores maestros" útiles para los entornos 
 * de desarrollo local y distribución a testers.
 * 
 * AUTOMATIZADO: Este archivo ahora utiliza la variable global __DEV__.
 * Las funciones de prueba se desactivarán automáticamente en la versión 
 * de producción (APK/AAB oficial).
 */

const isDev = __DEV__;

// 1. Mostrar Accesos Rápidos en el Login
// Habilita botones automáticos para entrar rápidamente como Cliente, Artesano o Admin.
export const ENABLE_QUICK_TEST = isDev;

// 2. Ahorro de Consultas (CMS)
// Desactiva la suscripción reactiva al documento `app_config` en Firebase.
export const LOCAL_DEV_MODE = isDev;

// 3. Evadir Pantalla de Mantenimiento
// Garantiza que como desarrollador nunca te bloquees afuera de la app.
export const BYPASS_MAINTENANCE = isDev;

if (isDev) {
  console.log("🛠️ Artemanía: Entorno de DESARROLLO activo");
}
