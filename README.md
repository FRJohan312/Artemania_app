
# 📄 Documentación Técnica — Artemanía

---

## 1. Portada

| Campo | Detalle |
|---|---|
| **Nombre del Proyecto** | Artemanía — Marketplace y Red Social Artesanal |
| **Versión** | 0.0.1 (Beta) |
| **Descripción** | Plataforma móvil que conecta artesanos, artistas y compradores a través de un marketplace y una red social enfocada en el arte y la artesanía. |
| **Plataformas** | Android / iOS |
| **Fecha** | Mayo 2026 |
| **Tecnologías Principales** | React Native · TypeScript · Firebase · Supabase · Node.js · Express |

---

## 2. Introducción

### 2.1 Objetivo del Proyecto

Artemanía nace con el propósito de digitalizar y democratizar el mercado artesanal, brindando a artesanos y artistas una plataforma moderna donde puedan **exhibir, vender y difundir** sus obras, al mismo tiempo que los compradores pueden **descubrir, adquirir y conectar** con el talento local y regional.

### 2.2 Problema que Resuelve

El mercado artesanal tradicional enfrenta barreras significativas:

- **Alcance geográfico limitado**: los artesanos dependen de ferias físicas y mercados locales.
- **Falta de visibilidad digital**: la ausencia de una plataforma especializada obliga a usar redes generales (Instagram, Facebook) sin herramientas de venta integradas.
- **Fragmentación del ecosistema**: no existe un espacio unificado que combine red social, marketplace y gestión de ventas para el sector artesanal.

Artemanía resuelve estos problemas integrando en una sola aplicación la **venta de productos**, la **publicación de contenido educativo**, el **chat directo** entre usuarios, y un sistema de **moderación y confianza**.

### 2.3 Contexto de Uso

La aplicación está diseñada para ser usada desde dispositivos móviles (Android e iOS) por tres tipos de actores: artesanos que desean vender sus productos, clientes que desean comprar y descubrir arte, y administradores que moderan la plataforma.

---

## 3. Descripción General del Sistema

### 3.1 ¿Qué hace la aplicación?

Artemanía es una **plataforma móvil full-stack** que combina:

- 🛍️ **Marketplace**: catálogo de productos artesanales con búsqueda, categorías y detalle de obra.
- 📱 **Red Social**: feed de publicaciones, tutoriales, likes, comentarios anidados y compartidos.
- 💬 **Mensajería Directa**: chat en tiempo real entre usuarios con soporte de imágenes.
- 📦 **Gestión de Pedidos**: flujo completo de compra, carrito, pago simulado y seguimiento.
- 📊 **Panel del Artesano**: estadísticas de ventas, gestión de inventario y clases.
- 🔔 **Notificaciones Push**: alertas en tiempo real para mensajes, pedidos y actividad social.
- 🛡️ **Sistema de Moderación**: reportes, sanciones temporales o permanentes y panel de administración.

### 3.2 Cómo Funciona

El cliente móvil en React Native consume dos servicios en la nube:

1. **Firebase** (Firestore + Auth + FCM): manejo de datos, autenticación y notificaciones push.
2. **Supabase** (Storage): almacenamiento de imágenes (productos, avatares, chats, posts).

Un microservicio en **Node.js/Express** desplegado en **Render** actúa como intermediario para el envío de notificaciones push usando Firebase Admin SDK (privilegios de servidor).

### 3.3 Flujo General del Usuario

```
Splash Screen → [Anónimo] Feed / Marketplace
                     ↓
               [Registro / Login]
                     ↓
          ┌──────────────────────┐
          │     TABS PRINCIPALES │
          │  Feed | Marketplace  │
          │  Carrito | Perfil    │
          └──────────────────────┘
                     ↓
      [Cliente]              [Artesano]
     Ver productos          Publicar obras
     Comprar                Gestionar ventas
     Chatear                Ver estadísticas
     Guardar favoritos      Dar clases
```

### 3.4 Tipos de Usuarios

| Tipo | Descripción | Capacidades |
|---|---|---|
| **Invitado (Anónimo)** | Usuario no registrado con sesión Firebase anónima | Navegar feed y marketplace, ver productos |
| **Cliente** | Usuario registrado con rol comprador | Comprar, chatear, guardar favoritos, publicar en feed |
| **Artesano** | Usuario con rol vendedor (puede upgradear desde Cliente) | Todo lo anterior + publicar obras, ver estadísticas, gestionar ventas |
| **Administrador** | Usuario interno con flag `isAdmin: true` | Moderar contenido, gestionar reportes, suspender cuentas |

---

## 4. Objetivos

### 4.1 Objetivo General

Desarrollar una aplicación móvil multiplataforma que permita a artesanos y artistas colombianos comercializar sus obras y compartir su proceso creativo, mientras los compradores descubren y adquieren piezas únicas en un entorno seguro y confiable.

### 4.2 Objetivos Específicos

1. Implementar un sistema de autenticación seguro con sesiones persistentes y recuperación de cuenta mediante palabra secreta.
2. Construir un marketplace funcional con catálogo de productos, categorías, búsqueda y carrito de compras.
3. Desarrollar una red social con publicación de contenido multimedia, likes, comentarios anidados y sistema de guardado.
4. Integrar un sistema de mensajería directa en tiempo real con soporte de envío de imágenes.
5. Implementar notificaciones push mediante FCM para mantener a los usuarios informados de actividad relevante.
6. Crear un panel de artesano con estadísticas de ventas, gestión de inventario y clases.
7. Diseñar un sistema de moderación con reportes automáticos, sanciones y administración.
8. Garantizar una experiencia de usuario premium con soporte de modo oscuro y diseño adaptable al notch del dispositivo.

---

## 5. Alcance del Proyecto

### ✅ Lo que incluye

- Autenticación completa: registro, login, recuperación de contraseña por palabra secreta.
- Marketplace con catálogo, filtros por categoría, búsqueda, detalle de producto y galería de imágenes.
- Carrito de compras persistido en Firestore con proceso de pago simulado.
- Feed de comunidad con publicaciones multimedia, tutoriales, likes, comentarios (con respuestas anidadas) y compartidos.
- Sistema de mensajería directa 1-a-1 en tiempo real con imágenes.
- Panel completo para artesanos: mis obras, publicar obra, estadísticas, ventas, clases.
- Gestión de perfil: edición de datos, foto, dirección con selección en mapa, métodos de pago.
- Notificaciones push (FCM) individuales y masivas.
- Sistema de reportes y moderación con sanciones automáticas y manuales.
- Soporte de modo claro/oscuro persistido localmente.
- Textos y configuración remota gestionables desde Firebase sin actualizar la app (Remote Config vía Firestore).
- Sistema de caché en memoria con TTL diferenciado por tipo de dato.

### ❌ Lo que NO incluye (en esta versión)

- Pasarela de pago real (Stripe, PayU, Wompi, etc.) — el pago actual es simulado.
- Panel de administración web separado (la administración se hace desde la propia app con el flag `isAdmin`).
- Soporte de video en publicaciones o chats.
- Sistema de valoraciones de artesanos (existe valoración de productos).
- Múltiples idiomas (i18n) — el sistema de traducción existe pero solo en español.
- Tests unitarios/integración con cobertura significativa.

---

## 6. Tecnologías Utilizadas

### 6.1 Frontend / Aplicación Móvil

| Tecnología | Versión | Uso | Ventaja en el proyecto |
|---|---|---|---|
| **React Native** | 0.84.1 | Framework base de la app móvil | Código compartido Android/iOS, comunidad amplia |
| **TypeScript** | 5.8.3 | Tipado estático en toda la app | Reduce errores en tiempo de desarrollo, autocompletado |
| **React 19** | 19.2.3 | Librería de UI | Concurrent features, rendimiento mejorado |
| **React Navigation** | 7.x | Enrutamiento y navegación | Stack, Tab y navegación anidada fluida |
| **React Native Safe Area Context** | 5.5.2 | Adaptación al notch y áreas seguras | Soporte universal para muescas y barras de sistema |
| **React Native Vector Icons** | 10.x | Iconografía (Ionicons) | Biblioteca completa, consistente y ligera |
| **React Native Image Picker** | 8.2.1 | Selección de fotos de galería/cámara | Interfaz nativa del dispositivo |
| **React Native WebView** | 13.x | Renderizar mapa Leaflet (OSM) | Integración de mapas sin API key de pago |
| **AsyncStorage** | 2.x | Persistencia local de sesión y preferencias | Almacenamiento clave-valor nativo asíncrono |
| **CryptoJS** | 4.2 | Hash SHA-256 para palabra secreta | Seguridad sin backend adicional |
| **TanStack Query** | 5.x | Gestión de estado asíncrono | Cache de queries, revalidación automática |

### 6.2 Backend y Servicios en la Nube

| Tecnología | Uso | Ventaja en el proyecto |
|---|---|---|
| **Firebase Authentication** | Autenticación de usuarios (Email/Password + Anónimo) | Manejo de sesiones, persistencia, seguridad robusta out-of-the-box |
| **Cloud Firestore** | Base de datos NoSQL en tiempo real | Listeners en vivo, escala automáticamente, sin gestión de servidor |
| **Firebase Cloud Messaging (FCM)** | Notificaciones push a dispositivos | Integración nativa con Android/iOS, gratuito para volúmenes medios |
| **Supabase Storage** | Almacenamiento de imágenes (productos, avatares, chat, posts) | S3-compatible, generoso tier gratuito, URLs públicas CDN |
| **Node.js + Express** | Microservicio para envío de push con Firebase Admin SDK | Los clientes no pueden enviar push directamente; el servidor tiene privilegios elevados |

### 6.3 Despliegue

| Plataforma | Uso |
|---|---|
| **Render** | Hosting del servidor Node.js de notificaciones push |
| **Firebase Console** | Administración de Firestore, Auth, FCM y configuración remota |
| **Supabase Dashboard** | Administración del bucket de imágenes |

### 6.4 Herramientas de Desarrollo

| Herramienta | Uso |
|---|---|
| **Metro Bundler** | Empaquetador de JavaScript para React Native |
| **Babel** | Transpilación de TypeScript/JSX |
| **ESLint + Prettier** | Calidad y formato de código |
| **Jest** | Framework de testing (configurado, cobertura mínima en esta versión) |
| **react-native-dotenv** | Variables de entorno en el bundle |

---

## 7. Arquitectura del Proyecto

### 7.1 Visión General

Artemanía sigue una **arquitectura cliente-servidor desacoplada** con servicios BaaS (Backend-as-a-Service):

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENTE MÓVIL                         │
│              React Native + TypeScript                  │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Screens │  │Components│  │ Contexts │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
│  ┌────▼──────────────▼──────────────▼────┐              │
│  │           CAPA DE SERVICIOS            │              │
│  │  auth.ts · users.ts · products.ts     │              │
│  │  posts.ts · commerce.ts · chat.ts     │              │
│  │  notifications.ts · moderation.ts     │              │
│  │  storage.ts · cache.ts                │              │
│  └──────────┬───────────────┬────────────┘              │
└─────────────┼───────────────┼────────────────────────── ┘
              │               │
     ┌────────▼───┐   ┌────────▼──────────┐
     │  FIREBASE  │   │     SUPABASE      │
     │ Auth       │   │   Storage         │
     │ Firestore  │   │   (imágenes)      │
     │ FCM        │   └───────────────────┘
     └─────┬──────┘
           │ Firebase Admin SDK
     ┌─────▼──────────────┐
     │  SERVIDOR NODE.JS  │
     │  Express/Render    │
     │  POST /send-push   │
     └────────────────────┘
```

### 7.2 Arquitectura en Capas

| Capa | Responsabilidad | Archivos |
|---|---|---|
| **Presentación** | Interfaz de usuario, interacción | `screens/`, `components/` |
| **Estado Global** | Contextos de React, datos compartidos entre pantallas | `context/` |
| **Lógica de Negocio** | Servicios, reglas de negocio, llamadas a APIs | `services/` |
| **Datos** | Firestore (colecciones), Supabase (bucket imágenes) | Cloud |
| **Utilidades** | Funciones auxiliares, crypto, caché | `utils/`, `services/cache.ts` |
| **Navegación** | Configuración de rutas y stacks | `navigation/AppNavigator.tsx` |
| **Tema** | Sistema de diseño: colores, tipografía, modo oscuro | `theme/`, `context/ConfigContext.tsx` |

### 7.3 Patrones de Diseño Utilizados

| Patrón | Implementación |
|---|---|
| **Context + Provider** | Toda la gestión de estado global: Auth, Cart, Chat, Favorites, Notifications, Theme |
| **Repository / Service Layer** | Cada `service/*.ts` encapsula todas las operaciones Firestore del dominio correspondiente |
| **Observer** | `onSnapshot` de Firestore para escuchar cambios en tiempo real en perfil, chat y configuración |
| **Cache-Aside** | `services/cache.ts` implementa un caché en memoria con TTL para reducir lecturas a Firestore |
| **Compound Component** | Modales reutilizables (`BecomeArtisanModal`, `PaymentModal`, etc.) que encapsulan UI y lógica propia |
| **Anonymous Session** | La app inicia sesión anónima automáticamente si no hay usuario, permitiendo lectura de datos sin registro |

### 7.4 Navegación

La navegación está organizada en dos niveles anidados:

```
AppNavigator (Stack Principal)
├── Login (sin header)
├── Register (sin header)
├── ForgotPassword (sin header)
└── MainTabs (Tab Navigator Material Top) ← pantalla inicial
│   ├── Tutorials (Feed Comunidad)
│   ├── Marketplace
│   ├── Cart (Carrito)
│   └── Home (Perfil)
│
├── ProductDetail
├── ArtesanoProfile
├── PublishProduct
├── PublishPost
├── PostDetail
├── Products (Mis Obras)
├── Sales (Mis Ventas)
├── Purchases (Mis Compras)
├── OrderDetails
├── Invoice
├── Favorites
├── LikedPosts
├── AccountSettings
├── Addresses
├── PaymentMethods
├── Notifications
├── ArtisanStats
├── ArtisanClasses
├── Support
├── Privacy
├── Chats
├── Chat
├── Terror (pantalla de cuenta suspendida)
└── [Suspended / Paused / Maintenance / Splash] ← pantallas de sistema
```

---

## 8. Estructura de Carpetas

```
mobile/
├── android/                  # Proyecto nativo Android (Gradle, manifests)
├── ios/                      # Proyecto nativo iOS (Xcode)
├── server/                   # Microservicio Node.js para push notifications
│   ├── index.js              # Servidor Express + Firebase Admin
│   └── package.json
├── src/
│   ├── assets/               # Imágenes, íconos y recursos estáticos locales
│   ├── components/           # Componentes reutilizables de UI
│   │   ├── AddressModal.tsx           # Modal de dirección de entrega + mapa
│   │   ├── BannerCard.tsx             # Tarjeta de banner publicitario
│   │   ├── BecomeArtisanModal.tsx     # Modal para upgrade a artesano
│   │   ├── BottomNav.tsx              # Barra de navegación inferior personalizada
│   │   ├── MainHeader.tsx             # Header superior reutilizable
│   │   ├── MapPickerModal.tsx         # Mapa Leaflet/OSM para seleccionar ubicación
│   │   ├── PaymentModal.tsx           # Modal de pago (simulado)
│   │   ├── PostCard.tsx               # Tarjeta de publicación del feed
│   │   ├── PostCommentsModal.tsx      # Modal de comentarios con respuestas anidadas
│   │   ├── PostLikersModal.tsx        # Lista de usuarios que dieron like
│   │   ├── ProductOwnerControls.tsx   # Controles del artesano sobre su producto
│   │   ├── ProductReviews.tsx         # Sección de reseñas de producto
│   │   ├── ReportModal.tsx            # Modal para reportar contenido
│   │   ├── SuccessRegistrationModal.tsx # Modal de bienvenida post-registro
│   │   ├── TermsModal.tsx             # Términos y condiciones
│   │   └── WelcomeModal.tsx           # Modal de bienvenida primer lanzamiento
│   ├── config/
│   │   └── developer.ts      # Flags de desarrollo (LOCAL_DEV_MODE, BYPASS_MAINTENANCE)
│   ├── context/              # Contextos de React (estado global)
│   │   ├── AuthContext.tsx            # Sesión, perfil y tokens FCM
│   │   ├── CartContext.tsx            # Carrito de compras
│   │   ├── ChatContext.tsx            # Lista de chats activos
│   │   ├── CommunityContext.tsx       # Feed de tutoriales/posts
│   │   ├── ConfigContext.tsx          # Tema, traducciones, configuración remota
│   │   ├── FavoritesContext.tsx       # Productos favoritos
│   │   ├── LikedPostsContext.tsx      # Posts guardados/likados
│   │   ├── NotificationsContext.tsx   # Contador de notificaciones no leídas
│   │   ├── StoreContext.tsx           # Productos y categorías del marketplace
│   │   └── ToastContext.tsx           # Sistema de notificaciones in-app (toasts)
│   ├── hooks/                # Custom hooks (actualmente mínimos)
│   ├── navigation/
│   │   └── AppNavigator.tsx  # Configuración completa de rutas y providers globales
│   ├── screens/              # Pantallas organizadas por módulo
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── artisan/
│   │   │   ├── ProductsScreen.tsx         # Mis obras
│   │   │   ├── PublishProductScreen.tsx   # Crear/editar obra
│   │   │   ├── ArtisanStatsScreen.tsx     # Dashboard de estadísticas
│   │   │   ├── ArtisanClassesScreen.tsx   # Gestión de clases
│   │   │   └── SalesScreen.tsx            # Mis ventas
│   │   ├── chat/
│   │   │   ├── ChatsListScreen.tsx
│   │   │   └── ChatScreen.tsx
│   │   ├── community/
│   │   │   ├── TutorialsScreen.tsx        # Feed principal
│   │   │   ├── PublishPostScreen.tsx      # Crear publicación
│   │   │   ├── PostDetailScreen.tsx
│   │   │   └── LikedPostsScreen.tsx
│   │   ├── orders/
│   │   │   ├── PurchasesScreen.tsx
│   │   │   ├── OrderDetailsScreen.tsx
│   │   │   └── InvoiceScreen.tsx
│   │   ├── profile/
│   │   │   ├── AccountSettingsScreen.tsx
│   │   │   ├── AddressesScreen.tsx
│   │   │   ├── PaymentMethodsScreen.tsx
│   │   │   ├── SupportScreen.tsx
│   │   │   └── PrivacyScreen.tsx
│   │   ├── shop/
│   │   │   ├── MarketplaceScreen.tsx
│   │   │   ├── ProductDetailScreen.tsx
│   │   │   ├── CartScreen.tsx
│   │   │   ├── FavoritesScreen.tsx
│   │   │   └── ArtesanoProfileScreen.tsx
│   │   └── system/
│   │       ├── HomeScreen.tsx             # Pantalla de perfil/menú
│   │       ├── SplashScreen.tsx
│   │       ├── NotificationsScreen.tsx
│   │       ├── SuspendedScreen.tsx
│   │       ├── PausedScreen.tsx
│   │       ├── MaintenanceScreen.tsx
│   │       └── TerrorScreen.tsx           # Pantalla de cuenta suspendida permanentemente
│   ├── services/             # Capa de acceso a datos y APIs
│   │   ├── auth.ts                    # Registro, login, logout
│   │   ├── cache.ts                   # Sistema de caché en memoria con TTL
│   │   ├── chat.ts                    # Mensajería en tiempo real
│   │   ├── commerce.ts                # Carrito, pedidos, favoritos, categorías
│   │   ├── db.ts                      # Re-exportaciones centralizadas de servicios
│   │   ├── firebaseConnection.js      # Inicialización Firebase (auth, db, storage)
│   │   ├── moderation.ts              # Reportes, suspensiones, sistema de sanción
│   │   ├── notifications.ts           # Creación y lectura de notificaciones
│   │   ├── posts.ts                   # CRUD de tutoriales y comentarios
│   │   ├── products.ts                # CRUD de productos artesanales
│   │   ├── reviews.ts                 # Reseñas de productos
│   │   ├── storage.ts                 # Upload/delete imágenes en Supabase
│   │   ├── supabaseConnection.ts      # Inicialización cliente Supabase
│   │   └── users.ts                   # Perfiles de usuario y artesanos
│   ├── theme/                # Sistema de diseño (colores light/dark)
│   ├── types/                # Definiciones de tipos TypeScript globales
│   └── utils/
│       └── crypto.ts         # Hash SHA-256 para palabra secreta
├── .env                      # Variables de entorno (no versionado)
├── .env.template             # Plantilla de variables de entorno
├── App.tsx                   # Punto de entrada — monta AppNavigator + ConfigProvider
├── index.js                  # Punto de entrada nativo React Native
├── package.json
└── tsconfig.json
```

---

## 9. Base de Datos

### 9.1 Motor de Base de Datos

**Cloud Firestore** (Firebase) — Base de datos NoSQL orientada a documentos, organizada en colecciones y subcolecciones.

### 9.2 Colecciones Principales

#### `usuarios`
Perfil completo de cada usuario registrado.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | UID de Firebase Auth |
| `nombre` | string | Nombre completo |
| `email` | string | Correo electrónico |
| `tipo` | `'Cliente'` \| `'Artesano'` | Rol del usuario |
| `foto` | string (URL) | Avatar del perfil |
| `bio` | string | Biografía artística |
| `estado` | `'activo'` \| `'suspendido'` \| `'en_pausa'` | Estado de la cuenta |
| `isAdmin` | boolean | Flag de administrador |
| `fcmToken` | string | Token para push notifications |
| `palabraClave` | string (SHA-256) | Hash de la palabra de recuperación |
| `direccion` | string | Dirección principal de entrega |
| `direcciones` | array | Lista de direcciones guardadas |
| `metodosPago` | array | Métodos de pago registrados |
| `fechaConversion` | string (ISO) | Fecha en que se volvió artesano |
| `motivoSuspension` | string | Razón de suspensión |
| `fechaExpiracionSuspension` | string (ISO) | Cuándo expira la sanción |

#### `productos`
Obras artesanales publicadas.

| Campo | Tipo | Descripción |
|---|---|---|
| `artesanoId` | string | UID del artesano dueño |
| `nombre` | string | Nombre de la obra |
| `descripcion` | string | Descripción detallada |
| `precio` | number | Precio en moneda local |
| `categoria` | string | Categoría del producto |
| `imagen` | string (URL) | Imagen principal |
| `imagenes` | array (URLs) | Galería de imágenes adicionales |
| `estado` | `'activo'` \| `'suspendido'` \| `'en_pausa'` | Visibilidad del producto |
| `ocultoPorArtesano` | boolean | El artesano lo ocultó manualmente |
| `calificacion` | number | Promedio de reseñas |

#### `tutoriales`
Publicaciones del feed de la comunidad.

| Campo | Tipo | Descripción |
|---|---|---|
| `autorId` | string | UID del autor |
| `autorNombre` | string | Nombre del autor |
| `autorFoto` | string (URL) | Foto del autor |
| `titulo` | string | Título del post |
| `descripcion` | string | Contenido del post |
| `imagenes` | array (URLs) | Imágenes adjuntas |
| `linkUrl` | string | Enlace externo (opcional) |
| `estado` | string | Estado de moderación |
| `likesCount` | number | Contador de likes |
| `commentsCount` | number | Contador de comentarios |
| `sharesCount` | number | Contador de compartidos |
| `createdAt` | string (ISO) | Fecha de publicación |

#### `comentarios_posts`
Comentarios y respuestas anidadas del feed.

| Campo | Tipo | Descripción |
|---|---|---|
| `postId` | string | ID del tutorial al que pertenece |
| `autorId` | string | UID del autor del comentario |
| `texto` | string | Contenido del comentario |
| `replyToId` | string | ID del comentario padre (si es respuesta) |
| `rootCommentId` | string | ID del comentario raíz del hilo |
| `isEdited` | boolean | Si fue modificado |
| `createdAt` | string (ISO) | Fecha de creación |

#### `pedidos`
Órdenes de compra generadas.

| Campo | Tipo | Descripción |
|---|---|---|
| `clienteId` | string | UID del comprador |
| `artesanoId` | string | UID del vendedor |
| `productos` | array | Lista de productos comprados |
| `total` | number | Monto total del pedido |
| `estado` | string | `'pendiente'`, `'en_proceso'`, `'completado'`, `'cancelado'` |
| `direccionEntrega` | string | Dirección de entrega |
| `fecha` | string (ISO) | Fecha del pedido |

#### `carritos`
Carrito de compras por usuario (ID = UID del cliente).

| Campo | Tipo | Descripción |
|---|---|---|
| `productos` | array | Items del carrito con cantidad |
| `total` | number | Total acumulado |

#### `favoritos`
Productos guardados por usuario (ID = UID del usuario).

| Campo | Tipo | Descripción |
|---|---|---|
| `productos` | array | Lista de objetos de producto favorito |

#### `posts_guardados`
Posts guardados/likeados por usuario (ID = UID del usuario).

| Campo | Tipo | Descripción |
|---|---|---|
| `posts` | array | IDs de posts guardados |

#### `chats`
Conversaciones directas entre dos usuarios.

| Campo | Tipo | Descripción |
|---|---|---|
| `participants` | array | UIDs de los dos participantes |
| `participantNames` | map | `{uid: nombre}` de cada participante |
| `participantPhotos` | map | `{uid: url_foto}` de cada participante |
| `lastMessage` | string | Vista previa del último mensaje |
| `lastMessageAt` | string (ISO) | Timestamp del último mensaje |
| `unreadCount` | map | `{uid: cantidad}` de mensajes no leídos |

**Subcolección:** `chats/{chatId}/messages`

| Campo | Tipo | Descripción |
|---|---|---|
| `senderId` | string | UID del emisor |
| `text` | string | Contenido del mensaje |
| `imageUrl` | string (URL) | Imagen adjunta (opcional) |
| `createdAt` | string (ISO) | Timestamp de envío |
| `read` | boolean | Si fue leído |

#### `notificaciones`
Notificaciones internas del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `userId` | string | UID del destinatario |
| `title` | string | Título de la notificación |
| `message` | string | Cuerpo del mensaje |
| `type` | string | Tipo: `'comentario'`, `'pedido'`, `'mensaje'`, `'sancion'`, etc. |
| `targetId` | string | ID del recurso relacionado |
| `read` | boolean | Estado de lectura |
| `createdAt` | string (ISO) | Fecha de creación |

#### `reportes`
Reportes de contenido inapropiado.

| Campo | Tipo | Descripción |
|---|---|---|
| `targetId` | string | ID del elemento reportado |
| `targetType` | string | `'usuario'` o `'producto'` |
| `reporterId` | string | UID del reportante |
| `motivo` | string | Razón del reporte |
| `estado` | `'pendiente'` \| `'resuelto'` \| `'desestimado'` | Estado del reporte |
| `fecha` | string (ISO) | Fecha del reporte |

#### `app_config/main`
Configuración remota de la aplicación.

| Campo | Tipo | Descripción |
|---|---|---|
| `isUnderMaintenance` | boolean | Activa pantalla de mantenimiento |
| `texts` | map | Textos dinámicos del banner y UI |

#### `categorias`
Categorías de productos del marketplace.

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | string | Nombre de la categoría |
| `createdAt` | string (ISO) | Fecha de creación |

### 9.3 Almacenamiento de Imágenes (Supabase)

**Bucket:** `imagenes`

| Carpeta | Contenido |
|---|---|
| `productos/` | Imágenes de obras artesanales |
| `perfiles/` | Avatares de usuario |
| `posts/` | Imágenes de publicaciones |
| `chats/` | Imágenes enviadas en mensajes directos |

---

## 10. Funcionalidades del Sistema

### 10.1 Módulo de Autenticación

**Objetivo:** Gestionar el acceso seguro y la identidad de los usuarios.

**Pantallas:** `LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`

**Funcionamiento:**

- Al abrir la app sin usuario, Firebase inicia automáticamente una **sesión anónima** que permite lectura de datos sin necesidad de registro.
- Al registrarse, el usuario elige su rol (`Cliente` o `Artesano`), completa sus datos y acepta los Términos y Condiciones.
- La **palabra secreta** es hasheada con SHA-256 antes de guardarse en Firestore. Se usa para verificar identidad al recuperar contraseña.
- La sesión persiste en el dispositivo vía `AsyncStorage` (no se cierra al cerrar la app).

**Flujo interno del registro:**
```
[Usuario completa formulario]
     → Validación local (campos vacíos, términos)
     → createUserWithEmailAndPassword(Firebase Auth)
     → createUserProfile(Firestore) con estado: 'activo'
     → SuccessRegistrationModal
     → Navigate MainTabs
```

**Validaciones:**
- Todos los campos marcados con `*` son obligatorios.
- La contraseña y la palabra secreta son validadas localmente (longitud mínima).
- El correo debe tener formato válido (validado por Firebase Auth).

---

### 10.2 Módulo de Marketplace

**Objetivo:** Permitir el descubrimiento y compra de obras artesanales.

**Pantallas:** `MarketplaceScreen`, `ProductDetailScreen`, `ArtesanoProfileScreen`, `FavoritesScreen`

**Funcionamiento:**

- El marketplace muestra todos los productos activos con imagen, nombre, artesano y precio.
- Soporta **filtrado por categoría** y **búsqueda por texto** en tiempo real (filtrado local sobre datos cargados).
- Cada tarjeta tiene un botón de favorito que actualiza Firestore instantáneamente.
- La pantalla de detalle muestra galería de imágenes, descripción completa, reseñas y botón de compra.
- Los artesanos tienen un perfil público con sus obras y publicaciones de la comunidad.

**Reglas de negocio:**
- Solo se muestran productos con `estado === 'activo'`.
- Los usuarios anónimos pueden ver el marketplace pero no comprar ni guardar favoritos.
- El banner "¿Haces algo parecido?" solo se muestra a usuarios con tipo `Cliente` (no a artesanos).

---

### 10.3 Módulo de Carrito y Compras

**Objetivo:** Gestionar el proceso de compra de productos.

**Pantallas:** `CartScreen`, `PurchasesScreen`, `OrderDetailsScreen`, `InvoiceScreen`

**Funcionamiento:**

- El carrito se persiste en Firestore en la colección `carritos` con el UID del usuario como ID de documento.
- Al confirmar la compra, se abre `PaymentModal` donde el usuario ingresa datos de tarjeta simulados.
- Se genera un documento en `pedidos` y se notifica al artesano vía push.
- La pantalla de mis compras muestra el historial de pedidos con estado y detalle.
- Se puede generar una factura básica (InvoiceScreen).

**Reglas de negocio:**
- El carrito requiere sesión autenticada (no anónima).
- Si un producto es eliminado, se retira automáticamente del carrito de todos los usuarios.

---

### 10.4 Módulo de Comunidad (Feed)

**Objetivo:** Crear un espacio social de contenido artístico.

**Pantallas:** `TutorialsScreen`, `PublishPostScreen`, `PostDetailScreen`, `LikedPostsScreen`

**Funcionamiento:**

- El feed principal (`TutorialsScreen`) muestra publicaciones de todos los usuarios ordenadas por fecha.
- Los posts pueden incluir texto, imágenes múltiples y enlaces externos.
- El sistema de likes actualiza el contador atómicamente con `increment()` de Firestore.
- Los comentarios soportan respuestas anidadas (un nivel de profundidad).
- Los posts guardados se listan en `LikedPostsScreen`.

**Reglas de negocio:**
- Solo se muestran posts con `estado === 'activo'`.
- Los comentarios se pueden editar y eliminar por el autor o un administrador.

---

### 10.5 Módulo de Mensajería Directa

**Objetivo:** Comunicación 1-a-1 entre usuarios en tiempo real.

**Pantallas:** `ChatsListScreen`, `ChatScreen`

**Funcionamiento:**

- El `chatId` es determinista: `[uid1, uid2].sort().join('_')`, garantizando un único chat por par de usuarios.
- Los mensajes se escuchan en tiempo real con `onSnapshot` de Firestore.
- Al enviar un mensaje, se actualiza el preview del chat y se incrementa el contador de no leídos del receptor.
- Se envía una notificación push al receptor automáticamente.
- Se soporta el envío de imágenes (subidas a Supabase Storage, carpeta `chats/`).
- Al entrar a un chat, el contador de mensajes no leídos se resetea a 0.

---

### 10.6 Módulo del Artesano

**Objetivo:** Dar a los artesanos herramientas de gestión y análisis de su actividad.

**Pantallas:** `ProductsScreen`, `PublishProductScreen`, `ArtisanStatsScreen`, `ArtisanClassesScreen`, `SalesScreen`

**Funcionamiento:**

- **Mis Obras**: lista de todos sus productos con opciones de edición y eliminación.
- **Publicar Obra**: formulario con nombre, descripción, precio, categoría y hasta múltiples imágenes.
- **Estadísticas**: dashboard con gráficos de ventas por período, productos más vendidos, ingresos totales.
- **Mis Ventas**: historial de pedidos recibidos con estado actualizable.
- **Mis Clases**: módulo de gestión de clases o talleres (en desarrollo).

**Reglas de negocio:**
- Solo usuarios con `tipo === 'Artesano'` pueden acceder a este módulo.
- Al eliminar un producto, se borran sus reseñas, se retira de favoritos y carritos, y se eliminan las imágenes físicas de Supabase (en cascada).

---

### 10.7 Módulo de Notificaciones

**Objetivo:** Mantener a los usuarios informados de actividad relevante.

**Pantallas:** `NotificationsScreen`

**Funcionamiento:**

1. **Push Notifications (FCM)**: cuando ocurre un evento (mensaje, comentario, pedido), el cliente llama a `createNotification()` que guarda en Firestore Y llama al servidor Node.js `/send-push`.
2. El servidor Node.js usa Firebase Admin SDK para enviar la notificación FCM al token del dispositivo destinatario.
3. **In-App Toasts**: notificaciones visuales dentro de la app mientras está abierta (sistema propio con `ToastContext`).
4. **Centro de Notificaciones**: historial de notificaciones con lectura individual o masiva.

**Tipos de notificaciones:**

| Tipo | Evento |
|---|---|
| `comentario` | Alguien comentó en tu publicación |
| `respuesta_comentario` | Alguien respondió tu comentario |
| `pedido` | Nuevo pedido o cambio de estado |
| `mensaje` | Nuevo mensaje en chat directo |
| `sancion` | Cuenta o producto suspendido |

---

### 10.8 Módulo de Moderación

**Objetivo:** Mantener la comunidad segura y el contenido apropiado.

**Funcionamiento:**

- Cualquier usuario puede reportar un producto o usuario con un motivo.
- Si el número de reportes pendientes supera el umbral configurable (`config/sistema`), la entidad se pone automáticamente en estado `en_pausa`.
- Los administradores (`isAdmin: true`) pueden:
  - Revisar reportes pendientes.
  - Suspender/levantar suspensiones con duración (horas) o permanentes.
  - Desestimar reportes.
- Al suspender un usuario, todos sus productos y tutoriales también son suspendidos en cascada.
- Al levantar la suspensión, todos vuelven a `activo` automáticamente.
- El sistema verifica al iniciar si una suspensión temporal expiró y la levanta automáticamente.

---

### 10.9 Módulo de Perfil

**Objetivo:** Gestión de datos personales y configuración de la cuenta.

**Pantallas:** `HomeScreen`, `AccountSettingsScreen`, `AddressesScreen`, `PaymentMethodsScreen`, `SupportScreen`, `PrivacyScreen`

**Funcionamiento:**

- `HomeScreen` actúa como menú de perfil con accesos a todas las funciones de cuenta.
- `AccountSettingsScreen` permite editar nombre, foto de perfil, bio y pronombres.
- `AddressesScreen` permite gestionar múltiples direcciones con selección visual en mapa (OpenStreetMap/Nominatim).
- Al actualizar foto o nombre, los cambios se propagan en cascada a todos los posts y comentarios del usuario (batch update de Firestore).

---

### 10.10 Sistema de Configuración Remota

**Objetivo:** Modificar textos y comportamiento de la app sin publicar una nueva versión.

**Funcionamiento:**

- `ConfigContext` escucha en tiempo real el documento `app_config/main` de Firestore.
- Si `isUnderMaintenance: true`, toda la app muestra `MaintenanceScreen`.
- Los textos del banner y otras cadenas son editables desde Firebase Console.
- Los desarrolladores pueden usar `BYPASS_MAINTENANCE` para ignorar el modo mantenimiento en desarrollo.

---

## 11. Flujo de la Aplicación

```
1. INICIO
   └─ App.tsx monta ConfigProvider + AppNavigator
      └─ AuthContext inicia: espera onAuthStateChanged
         ├─ [Sin usuario] → signInAnonymously (invitado)
         └─ [Con usuario] → carga perfil via onSnapshot (tiempo real)

2. SPLASH SCREEN
   └─ Se muestra mientras: authLoading=true OR datos no cargados
   └─ En paralelo carga tutoriales y productos del marketplace

3. RESOLUCIÓN DE ESTADO
   ├─ profile.estado = 'suspendido' → SuspendedScreen / TerrorScreen
   ├─ profile.estado = 'en_pausa' → PausedScreen
   ├─ config.isUnderMaintenance → MaintenanceScreen
   └─ Todo OK → MainTabs

4. PRIMERA VEZ
   └─ WelcomeModal (AsyncStorage 'hasSeenWelcome_v1')
   └─ NotificationPermissionModal (3 segundos después)

5. NAVEGACIÓN PRINCIPAL (TABS)
   ├─ [Tutorials] → Feed de posts, likes, comentarios, compartidos
   ├─ [Marketplace] → Catálogo, búsqueda, favoritos, detalle de producto
   ├─ [Cart] → Carrito, checkout con PaymentModal, historial de compras
   └─ [Home] → Perfil, menú de cuenta, ajustes, logout

6. ACCIONES AUTENTICADAS
   ├─ Comprar → Requiere sesión real (no anónima) → redirige a Login
   ├─ Comentar → Requiere sesión real → Toast informativo si es anónimo
   ├─ Chatear → Requiere sesión real
   └─ Publicar → Requiere rol Artesano

7. CIERRE DE SESIÓN
   └─ Limpia token FCM en Firestore
   └─ Limpia caché en memoria (cache.ts)
   └─ Firebase signOut → onAuthStateChanged → signInAnonymously (vuelve a invitado)
```

---

## 12. Interfaces y Diseño UI/UX

### 12.1 Sistema de Diseño

La aplicación implementa un **sistema de diseño basado en tokens** definido en `src/theme/`. Los colores, espaciados y tipografías se consumen a través del hook `useTheme()` disponible en toda la app.

### 12.2 Paleta de Colores

| Rol | Light Mode | Dark Mode |
|---|---|---|
| **Primary** | `#B96A4A` (terracota artesanal) | `#D4876A` |
| **Background** | `#F9F6F1` (crema cálida) | `#121212` |
| **Surface** | `#FFFFFF` | `#1E1E1E` |
| **Text Primary** | `#2D2D2D` | `#F0F0F0` |
| **Text Secondary** | `#6B6B6B` | `#A0A0A0` |
| **Border** | `#E8E0D6` | `#2A2A2A` |

### 12.3 Tipografía

Se utiliza la tipografía del sistema operativo (San Francisco en iOS, Roboto en Android) con jerarquías definidas:

- **H1**: 32px, weight 800
- **H2**: 22-24px, weight 800
- **Body**: 15-16px, weight normal
- **Caption**: 11-13px, weight 600

### 12.4 Adaptación al Notch (Safe Area)

Todas las pantallas utilizan `react-native-safe-area-context` con la estrategia `edges={['bottom', 'left', 'right']}` + `paddingTop: insets.top` en el contenedor principal, garantizando que el contenido no quede tapado por la muesca de la cámara, la isla dinámica ni las barras de sistema.

### 12.5 Componentes Reutilizables Clave

| Componente | Función |
|---|---|
| `BottomNav` | Tab bar personalizada con íconos e indicadores de no leídos |
| `MainHeader` | Header superior con botón de volver, título y acciones contextuales |
| `PostCard` | Tarjeta compleja del feed con imagen, acciones sociales y menú contextual |
| `ProductReviews` | Sección de reseñas con formulario inline y calificación por estrellas |
| `PaymentModal` | Bottom sheet de pago simulado con validación de tarjeta |
| `MapPickerModal` | Mapa OSM completo con búsqueda de dirección y geocodificación inversa |
| `ToastContext` | Sistema de notificaciones in-app con soporte de confirmación y acciones |

### 12.6 Experiencia de Usuario

- **Swipe entre tabs**: la navegación principal permite deslizar entre pantallas.
- **Pull to refresh**: las pantallas principales soportan actualización jalando hacia abajo.
- **Caché inteligente**: los datos se muestran instantáneamente desde caché mientras se actualiza en segundo plano.
- **Feedback inmediato**: toasts informan de éxito/error en todas las acciones.
- **Estados de carga**: indicadores de actividad en operaciones asíncronas.
- **Modo oscuro**: persistido en AsyncStorage, respetado en toda la UI.

---

## 13. Seguridad

### 13.1 Autenticación

- **Firebase Authentication** maneja el ciclo de vida de sesiones con tokens JWT de corta duración, renovados automáticamente.
- Las sesiones persisten en el dispositivo con `AsyncStorage` usando `getReactNativePersistence`.
- Al cerrar sesión, el token FCM se elimina de Firestore para evitar que el dispositivo reciba notificaciones de otro usuario.

### 13.2 Recuperación de Cuenta

- La recuperación de contraseña por email usa el sistema nativo de Firebase (`sendPasswordResetEmail`).
- La **palabra secreta** es un mecanismo adicional de verificación de identidad.
- Antes de guardarla, se normaliza (minúsculas, sin espacios) y se aplica **SHA-256** con la librería `crypto-js`.
- Solo el hash se almacena en Firestore; la palabra original nunca se transmite ni persiste.

### 13.3 Protección de Datos

- Las variables de entorno (API Keys) no se incluyen en el repositorio; se usan mediante `react-native-dotenv` en tiempo de build.
- El archivo `.env` está incluido en `.gitignore`.
- Las imágenes en Supabase son de acceso público (URLs firmadas no implementadas en esta versión).

### 13.4 Roles y Permisos

El control de acceso se hace a nivel de cliente (UI) con el campo `profile.tipo` e `isAdmin`. **No se implementan Firestore Security Rules estrictas en esta versión** (área de mejora identificada).

| Acción | Invitado | Cliente | Artesano | Admin |
|---|---|---|---|---|
| Ver marketplace | ✅ | ✅ | ✅ | ✅ |
| Comprar | ❌ | ✅ | ✅ | ✅ |
| Publicar posts | ❌ | ✅ | ✅ | ✅ |
| Publicar productos | ❌ | ❌ | ✅ | ✅ |
| Moderar reportes | ❌ | ❌ | ❌ | ✅ |
| Suspender cuentas | ❌ | ❌ | ❌ | ✅ |

### 13.5 Moderación Automática

El sistema implementa una **suspensión automática basada en umbral de reportes** configurable desde Firestore (`config/sistema.minReports`). Cuando una entidad acumula reportes pendientes ≥ al umbral, se suspende sin intervención humana.

---

## 14. APIs y Endpoints

El único servicio backend propio de Artemanía es el **servidor de notificaciones push** en Node.js.

### `POST /send-push`

Envía una notificación push FCM a uno o todos los usuarios.

**Base URL:** `PUSH_BACKEND_URL` (variable de entorno)

**Request Body:**
```json
{
  "targetUserId": "uid_del_usuario | 'all'",
  "title": "Título de la notificación",
  "body": "Cuerpo del mensaje",
  "data": {
    "targetType": "post | pedido | mensaje | comentario",
    "targetId": "id_del_recurso"
  }
}
```

**Responses:**

| Código | Descripción |
|---|---|
| `200` | Notificación enviada exitosamente |
| `200` (success: false) | Usuario sin token FCM registrado |
| `400` | Faltan campos requeridos |
| `404` | Usuario no encontrado en Firestore |
| `500` | Error interno o Firebase Admin no inicializado |

**Envío individual:**
```json
{ "success": true, "messageId": "projects/.../messages/..." }
```

**Envío masivo (`targetUserId: 'all'`):**
```json
{ "success": true, "successCount": 45, "failureCount": 2 }
```

### `GET /ping`

Health check del servidor.

**Response:** `200 OK` — `"pong"`

> **Nota:** El servidor implementa un mecanismo de **auto-ping cada 14 minutos** para evitar que Render apague la instancia por inactividad en el plan gratuito.

---

## 15. Instalación y Configuración

### 15.1 Requisitos Previos

| Herramienta | Versión Mínima | Uso |
|---|---|---|
| Node.js | >= 22.11.0 | Runtime y gestor de paquetes |
| npm | Incluido con Node.js | Instalación de dependencias |
| Java Development Kit (JDK) | 17 | Compilación de Android |
| Android Studio | Cualquier versión reciente | Emulador y SDK Android |
| Xcode (solo macOS) | 14+ | Compilación iOS |
| React Native CLI | Instalado globalmente o npx | Ejecución de la app |

### 15.2 Configuración de Variables de Entorno

1. Copia el archivo de plantilla:
```bash
cp .env.template .env
```

2. Edita `.env` con tus credenciales reales:
```env
# Firebase
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:android:abc123

# Supabase (solo Storage)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhb...

# Backend de notificaciones
PUSH_BACKEND_URL=https://tu-servidor.onrender.com
```

### 15.3 Instalación del Cliente Móvil

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd Artemania-app/mobile

# 2. Instalar dependencias
npm install

# 3. (Solo iOS) Instalar pods de CocoaPods
cd ios && pod install && cd ..
```

### 15.4 Configuración de Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Agregar una app Android con el package name `com.mobile`.
3. Descargar `google-services.json` y colocarlo en `android/app/`.
4. (iOS) Descargar `GoogleService-Info.plist` y colocarlo en `ios/mobile/`.
5. Habilitar **Authentication** → Proveedores: **Email/Password** y **Anónimo**.
6. Crear la base de datos **Firestore** en modo de prueba.
7. Habilitar **Cloud Messaging** en la consola.

### 15.5 Configuración de Supabase

1. Crear un proyecto en [Supabase](https://supabase.com).
2. Ir a **Storage** → Crear un bucket llamado `imagenes` con acceso **público**.
3. Copiar la **URL del proyecto** y la **Anon Key** al archivo `.env`.

### 15.6 Ejecución del Cliente Móvil

```bash
# Iniciar Metro Bundler
npm start

# Android (en otra terminal)
npm run android

# iOS (solo macOS)
npm run ios
```

### 15.7 Instalación y Ejecución del Servidor

```bash
cd server

# Instalar dependencias
npm install

# Variables de entorno del servidor
# Crear archivo .env con:
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...} (JSON completo en una línea)
# PORT=3000

# Ejecutar en desarrollo
node index.js
```

Para obtener `FIREBASE_SERVICE_ACCOUNT`, ir a Firebase Console → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada.

---

## 16. Despliegue

### 16.1 Servidor de Notificaciones (Render)

1. Subir la carpeta `server/` a un repositorio Git separado (o raíz del repo).
2. Crear un nuevo **Web Service** en [Render](https://render.com).
3. Configurar:
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
4. Agregar variables de entorno en el panel de Render:
   - `FIREBASE_SERVICE_ACCOUNT`: JSON completo de la clave de servicio.
   - `RENDER_EXTERNAL_URL`: URL pública del servicio (para auto-ping).
5. Desplegar y copiar la URL generada al `.env` de la app móvil como `PUSH_BACKEND_URL`.

### 16.2 Aplicación Android

```bash
# Generar APK de debug
cd android
./gradlew assembleDebug

# Generar AAB para Google Play
./gradlew bundleRelease
```

> Para la distribución en Google Play, se requiere firmar el APK/AAB con un **keystore** de producción y configurar `android/app/build.gradle` con los datos de firma.

### 16.3 Aplicación iOS

Se requiere una cuenta de **Apple Developer** ($99/año). El proceso de distribución se realiza a través de **Xcode** → **Archive** → **Distribute App**.

### 16.4 Configuración de Producción Recomendada

- Activar **Firestore Security Rules** para restringir lectura/escritura por UID y rol.
- Cambiar el **modo Firestore** de prueba a producción.
- Implementar **App Check** de Firebase para prevenir abuso de la API.
- Configurar **índices compuestos** en Firestore para las queries con múltiples filtros.
- Migrar el servidor a un plan de pago en Render para eliminar el auto-sleep.

---

## 17. Problemas Encontrados y Soluciones

| Problema | Causa | Solución Implementada |
|---|---|---|
| **Doble navegación al iniciar sesión** | Un `useEffect` con `onAuthStateChanged` en `LoginScreen` y el `handleLogin` navegaban simultáneamente al detectar la autenticación | Se eliminó el `onAuthStateChanged` local de `LoginScreen`; el manejo del estado global lo hace `AuthContext` |
| **Navbar fija en algunas pantallas** | El `SafeAreaView` incluía `edges=['top']`, añadiendo padding fijo que no se adaptaba al notch | Se cambió a `edges={['bottom', 'left', 'right']}` con `paddingTop: insets.top` en el contenedor |
| **Modales no visibles en Android** | El motor nativo de React Native en Android falló al abrir ventanas de sistema (`Modal`) tras múltiples Hot Reloads que saturaron la memoria | Se resolvió reiniciando completamente la app del emulador; a nivel de código se adoptó la estructura `animationType="slide"` más estable |
| **Botones dentro de Modal no respondían al primer tap** | Con el teclado virtual abierto, el primer tap solo cerraba el teclado | Se agregó `keyboardShouldPersistTaps="handled"` en el `ScrollView` interno de los modales |
| **Barra de scroll visible en el modal de términos** | El contenido largo sin indicador de scroll dificultaba la lectura | `showsVerticalScrollIndicator={true}` y `maxHeight: '85%'` en el contenedor |
| **`ScrollView` no reconocido** | Importación de `ScrollView` faltante en un componente | Se añadió `ScrollView` a los imports de `react-native` |
| **Módulo `Modal` nativo no activo tras HMR** | El Hot Module Replacement no reconstruye el motor de ventanas nativo de Android correctamente | Se documentó que ante este síntoma se debe cerrar y reabrir la app (no solo recargar el bundle) |
| **Imágenes del chat no se borraban** | La función de eliminación comparaba URLs incorrectamente | Se corrigió el extractor del `storagePath` basado en la URL base de Supabase |

---

## 18. Mejoras Futuras

### 18.1 Seguridad (Alta Prioridad)

- **Implementar Firestore Security Rules** completas para validar operaciones por servidor, no solo en el cliente.
- **Firebase App Check** para prevenir accesos no autorizados a la API.
- **Rate limiting** en el servidor de notificaciones.
- Migrar la validación de roles a Cloud Functions en lugar de confiar en el flag `isAdmin` del cliente.

### 18.2 Funcionalidad

- **Pasarela de pago real**: integración con Stripe, PayU o Wompi para Colombia.
- **Sistema de seguimiento de pedidos**: estados más granulares con ubicación de envío.
- **Valoraciones de artesanos**: sistema de puntuación global del vendedor.
- **Suscripciones / artesanos premium**: planes de membresía con más visibilidad.
- **Videos en publicaciones**: soporte de clips cortos en el feed.
- **Filtros avanzados en marketplace**: precio mín/máx, calificación, distancia.
- **Panel de administración web**: reemplazar la administración in-app por un dashboard web dedicado.

### 18.3 Técnico

- **Firestore Security Rules**: como se mencionó, es la mejora técnica más urgente.
- **Testing**: aumentar la cobertura con tests unitarios de servicios y tests de integración de pantallas clave.
- **Optimización de imágenes**: compresión del lado del cliente antes de subir a Supabase, y uso de WebP.
- **Paginación**: implementar paginación cursor-based en Firestore para el feed y el marketplace (actualmente carga todos los documentos).
- **Internacionalización (i18n)**: el sistema de traducción existe (`useTranslation`); expandir a inglés y portugués.
- **Offline Support**: aprovechar la persistencia offline de Firestore para funcionalidad sin conexión.
- **CI/CD**: configurar GitHub Actions para linting, testing y generación automática de builds.

---

## 19. Conclusión

Artemanía es una aplicación móvil **full-featured** que demuestra la integración cohesiva de múltiples servicios en la nube dentro de un ecosistema React Native. 

El proyecto destaca por su **arquitectura modular** (separación clara de capas: pantallas, contextos, servicios y utilidades), el **sistema de caché en memoria** con TTL diferenciado que optimiza significativamente las lecturas a Firestore, y el **modelo de sesión anónima** que garantiza una experiencia fluida desde el primer uso sin fricción de registro.

La decisión de usar **Firebase para lógica de negocio y datos** y **Supabase exclusivamente para storage** representa una solución pragmática que aprovecha el generoso tier gratuito de ambas plataformas, minimizando costos en etapa de desarrollo.

Las áreas de mejora más críticas identificadas son la implementación de **Firestore Security Rules** para robustecer la seguridad en producción, la **pasarela de pago real**, y la **paginación** en las consultas de datos masivos para escalar correctamente a miles de usuarios.

En su estado actual, Artemanía es una plataforma funcional y visualmente cuidada que sienta bases sólidas para convertirse en el marketplace de referencia del ecosistema artesanal hispanohablante.

---

## 20. Anexos

### A. Fragmentos de Código Clave

#### A.1 Sistema de Caché en Memoria con TTL

```typescript
// src/services/cache.ts
const _cache = new Map<string, { data: any; ts: number }>();

export const CACHE_TIMES = {
  SHORT:     5 * 60 * 1000,        //  5 min — posts (cambian frecuentemente)
  MEDIUM:    60 * 60 * 1000,       //  1 hora — productos del marketplace
  LONG_LIFE: 24 * 60 * 60 * 1000, // 24 horas — categorías, artesanos
};

export function fromCache(key: string, forceRefresh = false, ttl = CACHE_TIMES.LONG_LIFE) {
  if (forceRefresh) { _cache.delete(key); return null; }
  const entry = _cache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data;
  if (entry) _cache.delete(key);
  return null;
}
```

#### A.2 Hash SHA-256 de la Palabra Secreta

```typescript
// src/utils/crypto.ts
import CryptoJS from 'crypto-js';

export const hashSecretWord = (word: string): string => {
  const normalized = word.trim().toLowerCase();
  return CryptoJS.SHA256(normalized).toString(CryptoJS.enc.Hex);
};
```

#### A.3 Chat ID Determinista

```typescript
// src/services/chat.ts
// Garantiza que el chat entre los mismos dos usuarios sea siempre el mismo documento
export const buildChatId = (uid1: string, uid2: string): string =>
  [uid1, uid2].sort().join('_');
```

#### A.4 Actualización en Cascada al Editar Perfil

```typescript
// src/services/users.ts — al actualizar foto o nombre, 
// se propaga automáticamente a posts y comentarios del usuario
if (data.foto !== undefined || data.nombre !== undefined) {
  const qPosts = query(collection(db, 'tutoriales'), where('autorId', '==', uid));
  const postSnaps = await getDocs(qPosts);
  postSnaps.forEach(s => batch.update(s.ref, updatePayload));

  const qComments = query(collection(db, 'comentarios_posts'), where('autorId', '==', uid));
  const commentSnaps = await getDocs(qComments);
  commentSnaps.forEach(s => batch.update(s.ref, updatePayload));
}
await batch.commit();
```

#### A.5 Suspensión Automática por Umbral de Reportes

```typescript
// src/services/moderation.ts
const snap = await getDocs(q); // reportes pendientes del mismo targetId
const config = await getSystemConfig();
const threshold = config.data?.minReports || 1;

if (snap.size >= threshold) {
  // Suspender automáticamente la entidad sin intervención humana
  await updateDoc(doc(db, colName, data.targetId), { estado: 'en_pausa' });
}
```

#### A.6 Estructura de Providers en AppNavigator

```tsx
// Árbol de contextos global — el orden importa para las dependencias
<ToastProvider>
  <AuthProvider>
    <StoreProvider>
      <CommunityProvider>
        <NotificationsProvider>
          <ChatProvider>
            <FavoritesProvider>
              <LikedPostsProvider>
                <CartProvider>
                  <AppContent />
                </CartProvider>
              </LikedPostsProvider>
            </FavoritesProvider>
          </ChatProvider>
        </NotificationsProvider>
      </CommunityProvider>
    </StoreProvider>
  </AuthProvider>
</ToastProvider>
```

### B. Colecciones de Firestore — Resumen

```
firestore/
├── usuarios/{uid}
├── productos/{productId}
├── tutoriales/{postId}
├── comentarios_posts/{commentId}
├── pedidos/{pedidoId}
├── carritos/{clienteId}
├── favoritos/{userId}
├── posts_guardados/{userId}
├── shared_posts/{userId}
├── chats/{chatId}
│   └── messages/{messageId}
├── notificaciones/{notifId}
├── reportes/{reportId}
├── categorias/{categoryId}
├── resenas/{reviewId}
├── app_config/main
└── config/sistema
```

### C. Variables de Entorno Requeridas

| Variable | Servicio | Descripción |
|---|---|---|
| `FIREBASE_API_KEY` | Firebase | Clave pública del proyecto |
| `FIREBASE_AUTH_DOMAIN` | Firebase | Dominio de autenticación |
| `FIREBASE_PROJECT_ID` | Firebase | ID del proyecto |
| `FIREBASE_STORAGE_BUCKET` | Firebase | Bucket de Firebase Storage |
| `FIREBASE_MESSAGING_SENDER_ID` | FCM | ID del remitente para push |
| `FIREBASE_APP_ID` | Firebase | ID de la app registrada |
| `SUPABASE_URL` | Supabase | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Supabase | Clave anónima pública |
| `PUSH_BACKEND_URL` | Render | URL del servidor de notificaciones |

---

*Documentación generada para fines académicos, de portafolio y presentación empresarial.*
*Versión del documento: 1.0 — Mayo 2026*
