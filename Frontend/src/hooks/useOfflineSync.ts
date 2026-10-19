import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useOfflineSync() {
  const [isOffline, setIsOffline] = useState<boolean>(api.getSimulatedOffline());
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const refreshCount = () => {
    setOfflineQueueCount(api.getOfflineQueue().length);
  };

  useEffect(() => {
    refreshCount();
    const handleUpdate = () => refreshCount();
    window.addEventListener('urbanico_queue_updated', handleUpdate);
    return () => window.removeEventListener('urbanico_queue_updated', handleUpdate);
  }, []);

  const toggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    api.setSimulatedOffline(nextState);
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    setSyncResult('Saving offline work...');
    const res = await api.syncOfflineQueue();
    setIsSyncing(false);
    refreshCount();
    setSyncResult(res.message);
    setTimeout(() => setSyncResult(null), 3000);
  };

  return {
    isOffline,
    toggleOffline,
    offlineQueueCount,
    isSyncing,
    syncResult,
    triggerSync
  };
}
