import { useEffect, useState } from 'react';

export const ConnectionBadge = () => {
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <div className={`fixed top-3 right-3 z-50 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${online ? 'bg-primary text-primary-foreground border-transparent' : 'bg-destructive text-destructive-foreground'}`} aria-live="polite">
      {online ? 'Online' : 'Offline'}
    </div>
  );
};
