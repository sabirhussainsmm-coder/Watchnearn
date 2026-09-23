import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-gray-950 shadow-xl border border-amber-400 animate-pulse">
      <WifiOff className="w-4 h-4" />
      <span>Offline Mode — Cached data is being used.</span>
    </div>
  );
};
