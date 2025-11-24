import { useEffect, useRef, useState } from 'react';

interface UseSmartPollingOptions {
  enabled?: boolean;
  fastInterval?: number;
  slowInterval?: number;
  hasActivity?: boolean;
}

export const useSmartPolling = (
  callback: () => void | Promise<void>,
  {
    enabled = true,
    fastInterval = 3000,
    slowInterval = 10000,
    hasActivity = false,
  }: UseSmartPollingOptions = {}
) => {
  const [isPolling, setIsPolling] = useState(enabled);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisible = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
      if (isVisible.current && enabled) {
        callback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [callback, enabled]);

  useEffect(() => {
    if (!enabled || !isVisible.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const interval = hasActivity ? fastInterval : slowInterval;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(callback, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callback, enabled, fastInterval, slowInterval, hasActivity]);

  return { isPolling };
};
