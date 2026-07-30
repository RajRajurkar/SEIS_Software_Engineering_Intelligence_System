import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentAnalysisId, setCurrentAnalysisId] = useState(
    () => localStorage.getItem('seis_current_analysis') || null,
  );

  const [backendOnline, setBackendOnline] = useState(true);

  const setAnalysis = useCallback((id) => {
    setCurrentAnalysisId(id);
    if (id) localStorage.setItem('seis_current_analysis', id);
    else     localStorage.removeItem('seis_current_analysis');
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentAnalysisId,
        setAnalysis,
        backendOnline,
        setBackendOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};