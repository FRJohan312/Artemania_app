import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConnection';
import { LOCAL_DEV_MODE, BYPASS_MAINTENANCE } from '../config/developer';
import { LightTheme, DarkTheme } from '../theme';

interface AppConfig {
  isUnderMaintenance: boolean;
  texts: {
    welcomeBannerTitle?: string;
    welcomeBannerSubtitle?: string;
    [key: string]: any;
  };
}

const DEFAULT_CONFIG: AppConfig = {
  isUnderMaintenance: false,
  texts: {
    welcomeBannerTitle: "Artistas y Obras",
    welcomeBannerSubtitle: "Descubre talento oculto y apoya el arte auténtico."
  }
};

interface ConfigContextProps {
  config: AppConfig;
  isLoadingConfig: boolean;
  refreshConfig: () => Promise<void>;
  themeMode: 'light' | 'dark';
  toggleThemeMode: () => void;
  colors: typeof LightTheme.colors;
}

const ConfigContext = createContext<ConfigContextProps>({
  config: DEFAULT_CONFIG,
  isLoadingConfig: true,
  refreshConfig: async () => { },
  themeMode: 'light',
  toggleThemeMode: () => { },
  colors: LightTheme.colors,
});

const CACHE_KEY = '@artemania_app_config';

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const THEME_CACHE_KEY = '@artemania_theme_mode';

  useEffect(() => {
    let unsubscribe: () => void;

    const initializeConfig = async () => {
      // Cargamos la última configuración guardada para que la app no tarde en mostrar textos
      try {
        const cachedStr = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          setConfig(JSON.parse(cachedStr));
        }

        const cachedTheme = await AsyncStorage.getItem(THEME_CACHE_KEY);
        if (cachedTheme === 'light' || cachedTheme === 'dark') {
          setThemeMode(cachedTheme);
        }
      } catch (err) {
        console.warn('Failed to read cache:', err);
      }

      // Nos conectamos a Firebase para recibir cambios en vivo (mantenimiento, textos del banner, etc)
      if (LOCAL_DEV_MODE) {
        console.log("⚡ LOCAL_DEV_MODE ACTIVE: Se detuvo la sincronización visual con Firebase para ahorrar consultas. La app funcionará con caché/textos estáticos.");
        setIsLoadingConfig(false);
        return;
      }

      try {
        const docRef = doc(db, 'app_config', 'main');
        console.log("📡 ConfigContext: Conectando con Firebase...");
        
        unsubscribe = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            const remoteConfig = docSnap.data() as Partial<AppConfig>;
            console.log("✅ ConfigContext: Datos recibidos:", remoteConfig);

            // Bypass maintenance if active
            if (BYPASS_MAINTENANCE && remoteConfig.isUnderMaintenance) {
              remoteConfig.isUnderMaintenance = false;
              console.log("⚠️ MODO DESARROLLADOR: El mantenimiento está ACTIVO en la base de datos, pero se está ignorando por BYPASS_MAINTENANCE.");
            }
            
            const mergedConfig = {
              ...DEFAULT_CONFIG,
              ...remoteConfig,
              texts: { ...DEFAULT_CONFIG.texts, ...remoteConfig.texts },
            };
            setConfig(mergedConfig);
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mergedConfig));
          } else {
            console.warn("❌ ConfigContext: El documento 'app_config/main' no existe en Firebase.");
          }
          setIsLoadingConfig(false);
        }, (error) => {
          console.error('❌ ConfigContext Error (Firestore):', error.code, error.message);
          setIsLoadingConfig(false);
        });
      } catch (error) {
        console.error('❌ ConfigContext Fatal Error:', error);
        setIsLoadingConfig(false);
      }
    };

    initializeConfig();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // useMemo: colors solo se recalcula cuando cambia themeMode, no en cada render del contexto
  const colors = useMemo(
    () => themeMode === 'light' ? LightTheme.colors : DarkTheme.colors,
    [themeMode]
  );

  const toggleThemeMode = useCallback(async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_CACHE_KEY, newMode);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  }, [themeMode]);

  const refreshConfig = useCallback(async () => {
    // Función requerida por la interfaz
  }, []);

  return (
    <ConfigContext.Provider value={{
      config,
      isLoadingConfig,
      refreshConfig,
      themeMode,
      toggleThemeMode,
      colors
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);

// Hook conveniente para acceder solo a los colores y modo
export const useTheme = () => {
  const { colors, themeMode, toggleThemeMode } = useConfig();
  return { colors, themeMode, toggleThemeMode };
};

// Hook para traducir textos dinámicos desde el panel (CMS)
export const useTranslation = () => {
  const { config } = useConfig();

  const t = (key: string, defaultText: string) => {
    if (config?.texts && config.texts[key] !== undefined && config.texts[key] !== null && config.texts[key] !== '') {
      return config.texts[key];
    }
    return defaultText;
  };

  return { t };
};
