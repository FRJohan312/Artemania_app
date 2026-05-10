// Tipos para React Navigation
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: { profile?: UserProfile };
  Products: undefined;
  Marketplace: undefined;
  ProductDetail: { product: Product; isCliente: boolean; profile?: UserProfile };
  PublishProduct: { artesanoId: string; profile?: UserProfile; productToEdit?: Product };
  Cart: undefined;
  Favorites: undefined;
  Invoice: undefined;
  Tutorials: undefined;
  Discover: undefined;
  ArtesanoProfile: { artesano: UserProfile; profile?: UserProfile };
  Purchases: undefined;
  Sales: undefined;
  OrderDetails: undefined;
  ForgotPassword: undefined;
  AccountSettings: { profile?: UserProfile };
  Notifications: undefined;
  Addresses: { profile?: UserProfile };
  PaymentMethods: { profile?: UserProfile };
};

// Entidades de Dominio
export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  tipo: 'Artesano' | 'Cliente';
  isAdmin?: boolean;
  descripcion?: string;
  pronombres?: string;
  bio?: string;
  foto?: string;
  palabraClave?: string;
  direcciones?: Direccion[];
  metodosPago?: MetodoPago[];
}

export interface Direccion {
  id: string;
  titulo: string;
  calle: string;
  ciudad: string;
  codigoPostal?: string;
  telefono?: string;
}

export interface MetodoPago {
  id: string;
  titular: string;
  numero: string; // Enmascarado, ej: **** **** **** 1234
  expiracion: string;
  franquicia: 'Visa' | 'MasterCard' | 'Amex' | 'Otro';
}

export interface Product {
  id: string;
  artesanoId: string;
  autorNombre?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  categoria?: string;
  estado: 'activo' | 'privado'; // o cualquier otro estado
}

export interface Review {
  id?: string;
  userId: string;
  userName?: string;
  userFoto?: string;
  rating: number;
  comment: string;
  fotos?: string[];
  isEdited?: boolean;
  createdAt?: string | number;
}
