# Estructura del Proyecto - Artemanía Mobile

Este documento describe la organización del código y la arquitectura del proyecto Artemanía para facilitar el trabajo en equipo y el mantenimiento del sistema.

## 📂 Organización de Directorios

El proyecto sigue una estructura modular basada en **React Native + TypeScript**, separando la lógica de negocio de la interfaz de usuario.

### 1. `/src` (Código Fuente)
Es el núcleo de la aplicación.
- **`/components`**: Componentes de UI reutilizables (Botones, Modales, Cards, Headers, etc.).
- **`/context`**: Proveedores de estado global (Context API). Aquí se gestiona la sesión (`AuthContext`), el carrito (`CartContext`), el chat, favoritos y notificaciones.
- **`/hooks`**: Hooks personalizados para encapsular lógica repetitiva (ej. `useProductDetail`).
- **`/navigation`**: Configuración de rutas y navegadores (Stack, Tabs). El archivo principal es `AppNavigator.tsx`.
- **`/screens`**: Vistas completas de la aplicación, organizadas por módulos:
  - `artisan/`: Gestión para artesanos (Publicar productos, estadísticas, ventas).
  - `auth/`: Flujo de inicio de sesión, registro y recuperación de contraseña.
  - `chat/`: Interfaz de mensajería en tiempo real.
  - `community/`: Feed social, publicaciones, tutoriales y likes.
  - `orders/`: Gestión de compras, detalles de pedidos y facturación.
  - `shop/`: Marketplace, detalle de productos, carrito y favoritos.
  - `system/`: Pantallas técnicas (Mantenimiento, Notificaciones, Errores).
- **`/services`**: Capa de comunicación con servicios externos (Supabase, Firebase). Contiene la lógica de base de datos, autenticación, almacenamiento de imágenes y mensajería.
- **`/theme`**: Sistema de diseño global (Colores, tipografía y estilos base).
- **`/types`**: Definiciones de interfaces y tipos de TypeScript para asegurar la integridad de los datos.
- **`/utils`**: Funciones de ayuda generales (criptografía, formateo de fechas, etc.).

### 2. `/server`
Contiene la lógica del lado del servidor o middlewares necesarios para complementar las funciones de la app móvil.

### 3. `/android` & `/ios`
Carpetas nativas que contienen la configuración específica para cada plataforma (permisos, iconos, splash screens y dependencias nativas).

### 4. Archivos de Configuración (Raíz)
- `App.tsx`: Punto de entrada principal de React Native.
- `index.js`: Punto de registro de la aplicación.
- `package.json`: Listado de dependencias y scripts de ejecución.
- `tsconfig.json`: Configuración de TypeScript.
- `.env`: Variables de entorno (claves de API, URLs de servidores).

---

## 🛠 Tecnologías Principales
- **Framework**: React Native (0.74+)
- **Lenguaje**: TypeScript
- **Base de Datos & Auth**: Supabase
- **Notificaciones & Chat**: Firebase
- **Estilos**: StyleSheet (Vanilla CSS-in-JS) con soporte para Notch (scripts de padding).

## 💡 Guía para Desarrolladores
1. **Nuevos Componentes**: Si el componente se usará en más de una pantalla, créalo en `/src/components`.
2. **Lógica de API**: No realices llamadas a Supabase/Firebase directamente en las pantallas. Usa o crea un servicio en `/src/services`.
3. **Estado Global**: Para datos que deban persistir entre pantallas (como el usuario logueado), usa los contextos en `/src/context`.
4. **Estilos**: Mantén la consistencia visual usando los tokens definidos en `/src/theme`.

---

