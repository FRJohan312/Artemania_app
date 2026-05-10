import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getTutorials } from '../services/db';

interface CommunityContextType {
  tutorials: any[];
  loading: boolean;
  refreshTutorials: (force?: boolean) => Promise<void>;
  setTutorials: React.Dispatch<React.SetStateAction<any[]>>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // useRef: no provoca re-renders, mantiene el valor entre renders sin crear ciclos de dependencia
  const hasLoadedOnce = useRef(false);

  const refreshTutorials = useCallback(async (force = false) => {
    // Si ya tenemos datos y no es un refresco forzado, no mostramos loading
    if (!hasLoadedOnce.current || force) {
      setLoading(true);
    }

    const { data } = await getTutorials(force);
    if (data) {
      setTutorials(data);
      hasLoadedOnce.current = true;
    }
    setLoading(false);
  }, []); // sin dependencias: la función nunca se recrea innecesariamente

  return (
    <CommunityContext.Provider value={{ tutorials, loading, refreshTutorials, setTutorials }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
