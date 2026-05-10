import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Cliente de Supabase — usado exclusivamente para Storage de imágenes.
// La base de datos, autenticación y lógica de negocio siguen en Firebase.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
