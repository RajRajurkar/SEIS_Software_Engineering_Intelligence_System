import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import api from '../services/api';

const BackendStatus = () => {
  const [online, setOnline]     = useState(null); 
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    try {
      await api.get('/health');
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  if (online === null) return null;

  if (online) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
        <Wifi className="h-3 w-3" />
        <span className="hidden sm:inline">Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10
      border border-red-500/30 rounded-lg text-xs text-red-400">
      <WifiOff className="h-3.5 w-3.5 flex-shrink-0" />
      <span>Backend offline</span>
      <button
        onClick={check}
        disabled={checking}
        className="ml-1 hover:text-red-300 transition-colors"
      >
        <RefreshCw className={`h-3 w-3 ${checking ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default BackendStatus;