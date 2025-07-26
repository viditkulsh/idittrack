import React, { useState, useEffect } from 'react';
import { Shield, Clock, RefreshCw } from 'lucide-react';
import { checkSessionValidity, refreshSessionIfNeeded } from '../lib/supabase';

interface SessionMonitorProps {
  onSessionExpired?: () => void;
}

export const SessionMonitor: React.FC<SessionMonitorProps> = ({ onSessionExpired }) => {
  const [sessionInfo, setSessionInfo] = useState<{
    valid: boolean;
    timeUntilExpiry?: number;
    needsRefresh?: boolean;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const info = await checkSessionValidity();
      setSessionInfo(info);
      
      if (!info.valid && onSessionExpired) {
        onSessionExpired();
      }
    };

    // Check session immediately
    checkSession();

    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    
    return () => clearInterval(interval);
  }, [onSessionExpired]);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshSessionIfNeeded();
      if (result.success) {
        // Recheck session status
        const info = await checkSessionValidity();
        setSessionInfo(info);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimeRemaining = (milliseconds?: number) => {
    if (!milliseconds || milliseconds <= 0) return 'Expired';
    
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (!sessionInfo) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 text-sm">
        <Shield className="h-4 w-4" />
        <span>Checking session...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Shield className={`h-4 w-4 ${sessionInfo.valid ? 'text-green-500' : 'text-red-500'}`} />
      
      {sessionInfo.valid ? (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className={`${sessionInfo.needsRefresh ? 'text-orange-600' : 'text-gray-600'}`}>
            {formatTimeRemaining(sessionInfo.timeUntilExpiry)}
          </span>
          
          {sessionInfo.needsRefresh && (
            <button
              onClick={handleRefreshSession}
              disabled={isRefreshing}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      ) : (
        <span className="text-red-600">Session expired</span>
      )}
    </div>
  );
};

export default SessionMonitor;
